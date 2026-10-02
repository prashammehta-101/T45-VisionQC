import { Injectable, HttpException, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import mongoose, { Schema } from 'mongoose';
import { mkdir, readdir, readFile, writeFile, rename, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';

export interface Prediction {
  inspectionId: string; product_id: string; score: number; threshold: number;
  prediction: 'PASS' | 'FAIL'; processing_time_ms: number;
  image_url: string; original_url: string; heatmap_url: string; comparison_url: string; device: string;
}
const schema = new Schema({
  inspectionId: { type: String, required: true, unique: true }, productId: { type: String, required: true },
  timestamp: { type: Date, required: true, index: true }, anomalyScore: Number, threshold: Number,
  prediction: { type: String, enum: ['PASS', 'FAIL'] }, processingTime: Number,
  imageUrl: String, originalUrl: String, heatmapUrl: String, comparisonUrl: String,
}, { versionKey: false });
schema.index({ productId: 1, prediction: 1, timestamp: -1 });
export function validPrediction(value: Prediction): boolean {
  return value?.product_id === 'product-001' && /^[a-f0-9]{32}$/.test(value.inspectionId) &&
    [value.score, value.threshold, value.processing_time_ms].every(Number.isFinite) &&
    value.prediction === (value.score > value.threshold ? 'FAIL' : 'PASS') &&
    [value.image_url, value.original_url, value.heatmap_url, value.comparison_url].every(url =>
      typeof url === 'string' && /^\/outputs\/product-001\/(inspections|heatmaps)\/[a-f0-9]{32}(?:_original|_heatmap|_heatmap_map)?\.(png|jpg)$/.test(url));
}
@Injectable()
export class InspectionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(InspectionService.name);
  private readonly connection = mongoose.createConnection();
  private readonly records = this.connection.model('Inspection', schema);
  private readonly outbox = resolve('storage/outbox');
  private timer?: NodeJS.Timeout;
  private flushing = false;
  private busy = false;
  private readonly ai = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
  async onModuleInit() {
    await mkdir(this.outbox, { recursive: true });
    this.connection.on('error', () => this.logger.warn('MongoDB unavailable; inspections require durable logging.'));
    void this.connect();
    this.timer = setInterval(() => { void this.connect(); void this.flush(); }, 10000);
  }
  private async connect() {
    if (this.connection.readyState !== 0) return;
    try { await this.connection.openUri(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/visionqc', { serverSelectionTimeoutMS: 3000, bufferCommands: false }); }
    catch { /* Health endpoint reports unavailable; retry without logging credentials. */ }
  }
  async onModuleDestroy() { clearInterval(this.timer); await this.connection.close(); }
  product(id: string) { if (id !== 'product-001') throw new HttpException('No trained model is configured for this product.', 404); }
  async request(path: string, init: RequestInit = {}) {
    let response: Response;
    try { response = await fetch(this.ai + path, { ...init, headers: { ...init.headers, 'X-Service-Key': process.env.AI_SERVICE_KEY || '' }, signal: AbortSignal.timeout(120000) }); }
    catch (error) { throw new HttpException(error instanceof Error && /Timeout|Abort/.test(error.name) ? 'AI inference timed out. Check history before retrying.' : 'AI service unavailable. Start the CUDA service and try again.', 503); }
    if (!response.ok) {
      const body = await response.json().catch(() => ({})) as { detail?: unknown };
      throw new HttpException(typeof body.detail === 'string' ? body.detail : 'AI service rejected the request.', response.status);
    }
    return response;
  }
  async health() {
    let ai: unknown = null;
    try { ai = await (await this.request('/health')).json(); } catch { /* Explicit null, never invented device status. */ }
    return { databaseReady: this.connection.readyState === 1, ai, timezone: process.env.INSPECTION_TIMEZONE || 'Asia/Kolkata' };
  }
  private requireDatabase() { if (this.connection.readyState !== 1) throw new HttpException('MongoDB is unavailable. Start the database before inspecting so results can be saved.', 503); }
  private async flush() {
    if (this.flushing || this.connection.readyState !== 1) return;
    this.flushing = true;
    try {
      for (const filename of await readdir(this.outbox)) {
        if (!/^[a-f0-9]{32}\.json$/.test(filename)) continue;
        const path = resolve(this.outbox, filename);
        const row = JSON.parse(await readFile(path, 'utf8'));
        await this.records.updateOne({ inspectionId: row.inspectionId }, { $setOnInsert: row }, { upsert: true });
        await unlink(path);
      }
    } catch { this.logger.warn('An inspection awaits MongoDB synchronization in the durable outbox.'); }
    finally { this.flushing = false; }
  }
  async inspect(file: Express.Multer.File | undefined, productId: string) {
    this.product(productId); this.requireDatabase();
    if (!file || !['image/jpeg', 'image/png'].includes(file.mimetype) || !file.size) throw new HttpException('Upload a nonempty JPEG or PNG image.', 415);
    if (this.busy) throw new HttpException('An inspection is already running. Please wait.', 429);
    this.busy = true;
    try {
      const form = new FormData();
      form.append('product_id', productId);
      form.append('image', new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }), 'capture');
      const result = await (await this.request('/predict', { method: 'POST', body: form })).json() as Prediction;
      if (!validPrediction(result)) throw new HttpException('AI service returned an invalid inspection result.', 502);
      const ref = (url: string) => '/api' + url;
      const row = { inspectionId: result.inspectionId, productId, timestamp: new Date().toISOString(),
        anomalyScore: result.score, threshold: result.threshold, prediction: result.prediction,
        processingTime: result.processing_time_ms, imageUrl: ref(result.image_url), originalUrl: ref(result.original_url),
        heatmapUrl: ref(result.heatmap_url), comparisonUrl: ref(result.comparison_url) };
      const path = resolve(this.outbox, row.inspectionId + '.json');
      await writeFile(path + '.tmp', JSON.stringify(row)); await rename(path + '.tmp', path);
      await this.flush();
      const saved = await this.records.exists({ inspectionId: row.inspectionId }).catch(() => null);
      return { ...row, loggingStatus: saved ? 'saved' : 'pending', device: result.device };
    } finally { this.busy = false; }
  }
  async history(productId: string, prediction?: string, page = '1') {
    this.product(productId); this.requireDatabase();
    if (prediction && !['PASS', 'FAIL'].includes(prediction)) throw new HttpException('Filter must be PASS or FAIL.', 400);
    const number = Number(page);
    if (!Number.isInteger(number) || number < 1 || number > 100000) throw new HttpException('Invalid page.', 400);
    const filter = { productId, ...(prediction ? { prediction } : {}) };
    const [items, total] = await Promise.all([this.records.find(filter).sort({ timestamp: -1, _id: -1 }).skip((number - 1) * 20).limit(20).lean(), this.records.countDocuments(filter)]);
    return { items, total, page: number, pageSize: 20 };
  }
  async today(productId: string) {
    this.product(productId); this.requireDatabase();
    const timezone = process.env.INSPECTION_TIMEZONE || 'Asia/Kolkata';
    const [counts] = await this.records.aggregate([
      { $match: { productId, $expr: { $eq: [
        { $dateToString: { date: '$timestamp', format: '%Y-%m-%d', timezone } },
        { $dateToString: { date: '$$NOW', format: '%Y-%m-%d', timezone } },
      ] } } },
      { $group: { _id: null, total: { $sum: 1 }, rejected: { $sum: { $cond: [{ $eq: ['$prediction', 'FAIL'] }, 1, 0] } } } },
    ]);
    const total = counts?.total || 0, rejected = counts?.rejected || 0;
    return { total, rejected, passed: total - rejected, rejectionRate: total ? rejected / total : null, timezone };
  }
}
