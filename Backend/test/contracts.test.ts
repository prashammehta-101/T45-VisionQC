import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validPrediction, type Prediction } from '../src/inspection.service';
// Synthetic contract fixtures exercise validation only, never exposed as inspection data.
const id = 'a'.repeat(32);
const sample: Prediction = { inspectionId: id, product_id: 'product-001', score: 2, threshold: 2, prediction: 'PASS', processing_time_ms: 1, device: 'cuda', image_url: '/outputs/product-001/inspections/' + id + '.png', original_url: '/outputs/product-001/inspections/' + id + '_original.jpg', heatmap_url: '/outputs/product-001/heatmaps/' + id + '_heatmap_map.png', comparison_url: '/outputs/product-001/heatmaps/' + id + '_heatmap.png' };
test('accepts threshold equality as PASS', () => assert.equal(validPrediction(sample), true));
test('rejects inconsistent decisions and nonfinite scores', () => { assert.equal(validPrediction({ ...sample, prediction: 'FAIL' }), false); assert.equal(validPrediction({ ...sample, score: NaN }), false); });
test('rejects external and arbitrary file references', () => { assert.equal(validPrediction({ ...sample, heatmap_url: 'https://example.com/fake.png' }), false); assert.equal(validPrediction({ ...sample, image_url: '/outputs/product-001/inspections/../../secret.png' }), false); });
