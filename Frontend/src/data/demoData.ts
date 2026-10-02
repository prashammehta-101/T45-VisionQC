export type Outcome = 'PASS' | 'REVIEW'
export type Product = { id: string; name: string; kind: string; sampleCount: number; ready: boolean; updated: string; image: string }
export type Sample = { id: string; name: string; url: string }
export type Inspection = { id: string; productId: string; product: string; date: string; score: number; result: Outcome; confidence: number; image: string; source: 'demo' | 'upload' | 'camera' }
export const asset = (name: string) => import.meta.env.BASE_URL + 'demo/' + name + '.svg'
export const products: Product[] = [
  { id: 'cap', name: 'Metal Bottle Cap', kind: 'Surface quality', sampleCount: 28, ready: true, updated: 'Oct 2, 10:42 AM', image: asset('cap') },
  { id: 'housing', name: 'Plastic Housing', kind: 'Surface appearance', sampleCount: 24, ready: true, updated: 'Oct 2, 9:18 AM', image: asset('housing') },
  { id: 'cover', name: 'Circuit Cover', kind: 'Visible surface', sampleCount: 21, ready: false, updated: 'Oct 1, 4:36 PM', image: asset('cover') },
]
export const inspectionHistory: Inspection[] = [
  ['1048', 0.08, 'PASS', 97], ['1047', 0.87, 'REVIEW', 92],
  ['1046', 0.12, 'PASS', 96], ['1045', 0.91, 'REVIEW', 94],
  ['1044', 0.06, 'PASS', 98], ['1043', 0.15, 'PASS', 95],
  ['1042', 0.76, 'REVIEW', 89], ['1041', 0.09, 'PASS', 97],
].map(([id, score, result, confidence]) => ({
  id: String(id), productId: 'cap', product: 'Metal Bottle Cap', date: 'Oct 2, 2026',
  score: Number(score), result: result as Outcome, confidence: Number(confidence), image: asset(result === 'REVIEW' ? 'cap-review' : 'cap'), source: 'demo',
}))
export const trend = [
  { day: 'Sep 26', total: 140, passed: 126 }, { day: '27', total: 163, passed: 144 },
  { day: '28', total: 172, passed: 151 }, { day: '29', total: 191, passed: 170 },
  { day: '30', total: 180, passed: 158 }, { day: 'Oct 1', total: 195, passed: 171 },
  { day: '2', total: 207, passed: 183 },
]
export const distribution = [
  { label: '0–.1', count: 520, review: false }, { label: '.1–.2', count: 370, review: false },
  { label: '.2–.5', count: 213, review: false }, { label: '.5–.7', count: 70, review: true },
  { label: '.7–.9', count: 45, review: true }, { label: '.9–1', count: 30, review: true },
]
export const analysisSteps = ['Image received', 'Image preprocessing', 'Feature extraction', 'Comparing against normal profile', 'Generating anomaly map']
export const pipeline = ['Dataset', 'Preprocessing', 'Feature extraction', 'Normality model', 'Ready']
export const processSteps = [
  { title: 'Create Your Product', text: 'One profile for one product. Define the part and the surface you want to inspect.', detail: 'Metal Bottle Cap / Surface Quality' },
  { title: 'Capture Good Samples', text: 'Collect 20–30 good images that represent the normal variation of your product.', detail: '28 accepted reference samples' },
  { title: 'Learn Normal', text: 'Create a visual reference for what belongs. No catalogue of every possible defect required.', detail: 'Normal visual profile created' },
  { title: 'Inspect New Products', text: 'Upload an image or capture one with a camera under the same inspection conditions.', detail: 'New inspection / Product #1048' },
  { title: 'Detect Anomalies', text: 'Compare a new image with the normal profile. Review the score and highlighted regions.', detail: 'Original + Anomaly map → Result' },
]
export const benefits = [
  ['01', 'Small Dataset', 'Start with approximately 20–30 good samples that represent your product.'],
  ['02', 'No Defect Catalogue', 'Learn normality without manually labelling every possible defect category.'],
  ['03', 'Faster Setup', 'Build a focused product profile with a small set of representative examples.'],
  ['04', 'Visual Results', 'Review the original image, detected regions, anomaly score, and inspection status.'],
]
export const useCases = [
  ['Metal Components', 'Compare the visible surfaces of manufactured metal components.', '01 / MACHINED'],
  ['Packaging', 'Explore abnormal appearance and visual inconsistencies.', '02 / PACKED'],
  ['Plastic Parts', 'Inspect molded components for unexpected visual differences.', '03 / MOLDED'],
  ['Electronics', 'Inspect visible housings and component surfaces.', '04 / ASSEMBLED'],
  ['Mechanical Parts', 'Compare components against their normal visual appearance.', '05 / PRECISION'],
  ['Small-Batch Manufacturing', 'Explore inspection where large systems are difficult to justify.', '06 / SMALL SERIES'],
]
export const conditions = ['Product orientation is reasonably consistent', 'Lighting is controlled', 'Camera position is stable', 'Training samples represent normal variation', 'The inspected product matches the trained product']
