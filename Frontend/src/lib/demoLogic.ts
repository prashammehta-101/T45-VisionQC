import type { Inspection, Outcome } from '../data/demoData'

export type HistoryFilter = 'All' | 'Passed' | 'Anomalies' | 'Needs Review'
export function filterHistory(rows: Inspection[], filter: HistoryFilter, query: string) {
  const search = query.trim().toLowerCase()
  return rows.filter(row =>
    (filter === 'All' || row.result === (filter === 'Passed' ? 'PASS' : 'REVIEW')) &&
    (row.product.toLowerCase().includes(search) || row.id.includes(search)))
}
export function demoMetrics(outcome: Outcome) {
  return outcome === 'PASS' ? { score: 0.08, confidence: 97 } : { score: 0.87, confidence: 92 }
}
export function summarize(rows: Inspection[], seedCount: number) {
  const extra = rows.slice(0, Math.max(0, rows.length - seedCount))
  const total = 1248 + extra.length
  const passed = 1103 + extra.filter(row => row.result === 'PASS').length
  return { total, passed, anomalies: total - passed, rate: passed / total * 100, extra }
}
export function validateImage(file: File) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return 'Use a JPG, PNG, or WebP image.'
  if (file.size > 10 * 1024 * 1024) return 'Each image must be smaller than 10 MB.'
  if (!file.size) return 'This file is empty. Choose another image.'
  return null
}
