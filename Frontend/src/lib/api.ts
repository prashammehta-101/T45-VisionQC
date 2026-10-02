export const PRODUCT = 'product-001'
export interface Inspection { inspectionId: string; productId: string; timestamp: string; anomalyScore: number; threshold: number; prediction: 'PASS' | 'FAIL'; processingTime: number; imageUrl: string; originalUrl: string; heatmapUrl: string; comparisonUrl: string; loggingStatus?: 'saved' | 'pending' }
export interface Threshold { threshold: number; calibratedThreshold: number; method: string; calibrationSamples: number; caveat: string; overridden: boolean }
export interface Evaluation { productId: string; threshold: number; totalSamples: number; accuracy: number | null; precision: number | null; recall: number | null; f1: number | null; falsePositiveRate: number | null; goodPassRate: number | null; defectDetectionRate: number | null; confusionMatrix: { trueNegative: number; falsePositive: number; falseNegative: number; truePositive: number }; samples: { image: string; label: 'GOOD' | 'DEFECT'; score: number; prediction: string }[]; thresholdInfo: Threshold; calibrationExcluded: number; datasetLimitation: string; gpu: string; generatedAt: string | null; population: string }
export interface Today { total: number; passed: number; rejected: number; rejectionRate: number | null; timezone: string }
export interface History { items: Inspection[]; total: number; page: number; pageSize: number }
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response
  try { response = await fetch('/api' + path, { ...options, signal: options.signal ?? AbortSignal.timeout(130000) }) }
  catch (error) { throw new Error(error instanceof Error && /Timeout|Abort/.test(error.name) ? 'Inspection timed out. Check history before retrying.' : 'Backend unavailable. Start the VisionQC API and try again.') }
  const value = await response.json().catch(() => null)
  if (!response.ok) throw new Error(typeof value?.message === 'string' ? value.message : 'The server could not complete this request.')
  if (!value) throw new Error('Invalid API response. Check the backend connection.')
  return value as T
}
export const score = (value: number) => value.toFixed(6)
export const percent = (value: number | null | undefined) => value == null ? 'N/A' : (value * 100).toFixed(2) + '%'
