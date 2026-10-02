import { Body, Controller, Get, Headers, HttpException, Param, Post, Put, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { timingSafeEqual } from 'node:crypto';
import type { Response } from 'express';
import { InspectionService } from './inspection.service';
@Controller()
export class InspectionController {
  constructor(private readonly service: InspectionService) {}
  @Get('health') health() { return this.service.health(); }
  @Post('inspections')
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage(), limits: { fileSize: 12 * 1024 * 1024, files: 1, fields: 1 } }))
  inspect(@UploadedFile() file: Express.Multer.File, @Body('product_id') id: string) { return this.service.inspect(file, id); }
  @Get('inspections') history(@Query('product_id') id: string, @Query('prediction') prediction?: string, @Query('page') page?: string) { return this.service.history(id, prediction, page); }
  @Get('inspections/today') today(@Query('product_id') id: string) { return this.service.today(id); }
  @Get('model/evaluation/:id') async evaluation(@Param('id') id: string) { this.service.product(id); return (await this.service.request('/model/evaluation/' + id)).json(); }
  @Get('model/threshold/:id') async threshold(@Param('id') id: string) { this.service.product(id); return (await this.service.request('/model/threshold/' + id)).json(); }
  @Put('model/threshold/:id') async update(@Param('id') id: string, @Body() body: { threshold?: unknown }, @Headers('x-supervisor-token') token = '') {
    this.service.product(id);
    const expected = process.env.SUPERVISOR_TOKEN;
    if (!expected) throw new HttpException('Supervisor control is disabled. Configure SUPERVISOR_TOKEN on the backend.', 403);
    const a = Buffer.from(token), b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) throw new HttpException('A valid supervisor token is required.', 403);
    if (typeof body?.threshold !== 'number' || !Number.isFinite(body.threshold) || body.threshold < 0) throw new HttpException('Threshold must be a finite nonnegative number.', 400);
    return (await this.service.request('/model/threshold/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ threshold: body.threshold }) })).json();
  }
  @Get('outputs/:id/:kind/:filename') async output(@Param('id') id: string, @Param('kind') kind: string, @Param('filename') filename: string, @Res() res: Response) {
    this.service.product(id);
    if (!['inspections', 'heatmaps'].includes(kind) || !/^[a-f0-9]{32}(?:_original|_heatmap|_heatmap_map)?\.(png|jpg)$/.test(filename)) throw new HttpException('Image unavailable.', 404);
    const upstream = await this.service.request('/outputs/' + id + '/' + kind + '/' + filename);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'image/png');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, max-age=86400');
    res.send(Buffer.from(await upstream.arrayBuffer()));
  }
}
