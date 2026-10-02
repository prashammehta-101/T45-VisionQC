// End-to-end checks use real dataset images, actual CUDA inference, and real MongoDB.
// This creates real inspection records, and restores the original decision threshold.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import mongoose from 'mongoose';
const base = process.env.TEST_API_URL || 'http://127.0.0.1:5173/api';
async function request(path, init = {}) {
  const response = await fetch(base + path, { ...init, signal: AbortSignal.timeout(130000) });
  const value = await response.json();
  assert.ok(response.ok, JSON.stringify(value)); return value;
}
const source = JSON.parse(await readFile('../ai-service/outputs/product-001/evaluation.json', 'utf8'));
const good = source.good_results.filter(r => r.evaluation_role === 'held_out_evaluation').sort((a, b) => a.anomaly_score - b.anomaly_score)[0];
const defect = source.defect_results[0];
assert.ok(good && defect, 'Need actual GOOD and DEFECT images');
const original = await request('/model/threshold/product-001');
const before = await request('/inspections?product_id=product-001');
async function inspect(row) {
  const form = new FormData();
  form.append('product_id', 'product-001');
  form.append('image', new Blob([await readFile(resolve('../ai-service', row.image))], { type: 'image/jpeg' }), 'test.jpeg');
  const result = await request('/inspections', { method: 'POST', body: form });
  assert.equal(result.prediction, result.anomalyScore > result.threshold ? 'FAIL' : 'PASS');
  assert.equal(result.loggingStatus, 'saved');
  for (const path of [result.imageUrl, result.heatmapUrl, result.originalUrl, result.comparisonUrl]) {
    const response = await fetch(new URL(base).origin + path);
    assert.equal(response.status, 200); assert.match(response.headers.get('content-type'), /^image\//);
    assert.ok((await response.arrayBuffer()).byteLength > 100);
  }
  console.log(JSON.stringify({ image: row.image, score: result.anomalyScore, threshold: result.threshold, prediction: result.prediction, id: result.inspectionId }));
  return result;
}
const results = [await inspect(good), await inspect(defect)];
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/visionqc');
for (const result of results) {
  const stored = await mongoose.connection.db.collection('inspections').findOne({ inspectionId: result.inspectionId });
  assert.equal(stored.anomalyScore, result.anomalyScore); assert.equal(stored.heatmapUrl, result.heatmapUrl);
}
await mongoose.disconnect();
const history = await request('/inspections?product_id=product-001');
assert.ok(history.total >= before.total + 2);
const today = await request('/inspections/today?product_id=product-001');
assert.equal(today.total, today.passed + today.rejected);
assert.equal(today.rejectionRate, today.rejected / today.total);
for (const prediction of ['PASS', 'FAIL']) {
  const filtered = await request('/inspections?product_id=product-001&prediction=' + prediction);
  assert.ok(filtered.items.every(r => r.prediction === prediction));
}
const evaluation = await request('/model/evaluation/product-001');
const rows = [...source.good_results, ...source.defect_results].filter(r => r.evaluation_role === 'held_out_evaluation');
const counts = { trueNegative: 0, falsePositive: 0, falseNegative: 0, truePositive: 0 };
for (const row of rows) { const fail = row.anomaly_score > evaluation.threshold; counts[row.expected === 'PASS' ? (fail ? 'falsePositive' : 'trueNegative') : (fail ? 'truePositive' : 'falseNegative')]++; }
assert.deepEqual(evaluation.confusionMatrix, counts);
const unauthorized = await fetch(base + '/model/threshold/product-001', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ threshold: 0 }) });
assert.equal(unauthorized.status, 403);
assert.ok(process.env.SUPERVISOR_TOKEN, 'Set the supervisor token for threshold verification');
async function threshold(value) { return request('/model/threshold/product-001', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Supervisor-Token': process.env.SUPERVISOR_TOKEN }, body: JSON.stringify({ threshold: value }) }); }
try {
  await threshold(0);
  const zero = await request('/model/evaluation/product-001');
  assert.equal(zero.threshold, 0); assert.equal(zero.confusionMatrix.trueNegative, 0);
  const changed = await inspect(good); assert.equal(changed.prediction, 'FAIL'); assert.equal(changed.threshold, 0);
  await threshold(Math.max(...evaluation.samples.map(r => r.score)) + 100);
  const high = await request('/model/evaluation/product-001');
  assert.equal(high.confusionMatrix.truePositive, 0); assert.equal(high.confusionMatrix.falsePositive, 0);
} finally { await threshold(original.threshold); }
console.log('PASS: real-image upload → Vite → NestJS → CUDA → heatmaps → MongoDB; history, daily counts, evaluation, and threshold changes verified.');
