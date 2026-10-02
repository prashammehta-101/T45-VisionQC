import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowDown, ArrowRight, ArrowUpRight, Camera, Check, Circle, Crosshair, ImagePlus, Play, RotateCcw, ScanLine, Search, X } from 'lucide-react'
import { analysisSteps, pipeline, type Outcome } from '../../data/demoData'
import type { VisionDemo } from '../../hooks/useVisionDemo'
import { filterHistory, type HistoryFilter } from '../../lib/demoLogic'
import { Badge, CameraCapture, DemoLabel, JumpLink, ProductImage, Section, UploadZone } from './Primitives'

export function ProductSetup({ demo }: { demo: VisionDemo }) {
  const { product } = demo
  return <Section id="product-setup" number="04" label="Your inspection workspace" title="Start With One Product."
    intro="Choose a product, give it a normal profile, and keep every inspection connected to that reference.">
    <div className="vqc-panel vqc-product-setup">
      <ProductImage src={product.image} name={'Illustrative ' + product.name} />
      <div className="vqc-product-details"><DemoLabel /><span className="vqc-kicker">PRODUCT / {product.kind}</span><h3>{product.name}</h3>
        <dl className="vqc-product-stats"><div><dt>Training images</dt><dd>{product.sampleCount}</dd></div><div><dt>Model status</dt><dd className={product.ready ? 'vqc-good' : 'vqc-accent'}><span className="vqc-status-dot" />{product.ready ? 'READY' : 'TRAINING REQUIRED'}</dd></div><div><dt>Last updated</dt><dd>{product.updated}</dd></div></dl>
        <div className="vqc-actions"><JumpLink to={product.ready ? '#inspection' : '#training'} primary>{product.ready ? 'Inspect Product' : 'Build Normal Profile'}</JumpLink><JumpLink to="#products">Change Product</JumpLink></div>
      </div>
    </div>
  </Section>
}
export function TrainingSection({ demo }: { demo: VisionDemo }) {
  const progress = demo.training?.progress ?? (demo.product.ready ? 100 : 0)
  const disabled = !!demo.training || demo.analyzing || demo.loadingFiles
  const seedCount = demo.product.sampleCount - demo.samples.length
  return <Section id="training" number="05" label="Teach the expected" title="Build Your Normal Profile."
    intro="Good samples should represent normal variation, with consistent lighting, orientation, and camera position.">
    <div className="vqc-panel">
      <div className="vqc-panel-head"><span><span className="vqc-status-dot" /> DATASET / {demo.product.name}</span><DemoLabel>Simulated learning</DemoLabel></div>
      <div className="vqc-training-layout"><UploadZone title="Drag & Drop Good Product Images" multiple disabled={disabled} onFiles={files => { void demo.addSamples(files) }} />
        <div className="vqc-dataset"><div className="vqc-row"><h3>Accepted samples</h3><span className="vqc-mono">{demo.product.sampleCount} IMAGES</span></div>
          <div className="vqc-sample-grid">
            {Array.from({ length: Math.min(4, seedCount) }, (_, i) => <figure key={'seed' + i}><img src={demo.product.image} alt={'Illustrative good sample ' + (i + 1)} loading="lazy" /><figcaption><Check size={11} />Example {String(i + 1).padStart(2, '0')}</figcaption></figure>)}
            {demo.samples.slice(-4).map(sample => <figure key={sample.id}><img src={sample.url} alt={sample.name} /><figcaption><Check size={11} />Accepted</figcaption></figure>)}
          </div><p className="vqc-fine">{seedCount} example references · {demo.samples.length} local uploads. “Accepted” means the image file is readable, not that its product quality was assessed.</p>
          <button className="vqc-text-button" onClick={demo.resetSamples} disabled={disabled}><RotateCcw size={13} />Reset to example dataset</button>
        </div>
      </div>
      <div className="vqc-training-progress"><div className="vqc-pipeline">{pipeline.map((step, i) => <span key={step} className={progress >= i * 25 ? 'is-active' : ''}>{progress >= (i + 1) * 20 ? <Check size={12} /> : <Circle size={9} />}{step}{i < 4 && <ArrowRight size={12} />}</span>)}</div>
        <div className="vqc-row"><span aria-live="polite">{demo.training ? 'Learning normal appearance…' : demo.product.ready ? 'Normal profile successfully created' : 'Ready to learn from your samples'}</span><strong className="vqc-mono">{progress}%</strong></div>
        <progress max="100" value={progress} aria-label="Training progress" />
        <div className="vqc-row"><span className="vqc-fine">{Math.floor(demo.product.sampleCount * progress / 100)} / {demo.product.sampleCount} samples processed · demo simulation</span>
          <button className="vqc-button is-primary" disabled={disabled} onClick={demo.train}>{demo.training ? 'Learning…' : demo.product.ready ? 'Rebuild Profile' : 'Learn Normal'}<ArrowRight size={15} /></button></div>
      </div>
    </div>
  </Section>
}
export function InspectionSection({ demo }: { demo: VisionDemo }) {
  const [cameraOpen, setCameraOpen] = useState(false)
  const disabled = demo.analyzing || !!demo.training || demo.loadingFiles
  return <Section id="inspection" number="06" label="The next product" title="Inspect a New Product."
    intro="Choose an image, select a simulated outcome, and watch the inspection pipeline. Uploaded images are previews; no model is analyzing them.">
    <div className="vqc-panel">
      <div className="vqc-panel-head"><span><ScanLine size={15} />NEW INSPECTION / {demo.product.name}</span><DemoLabel /></div>
      <div className="vqc-inspect-layout"><div className="vqc-inspect-preview"><ProductImage src={demo.inspectionImage} name={'Selected inspection image for ' + demo.product.name} scanning={demo.analyzing} />
        <div className="vqc-image-caption"><span>{demo.imageSource === 'demo' ? 'ILLUSTRATIVE EXAMPLE' : demo.imageSource === 'camera' ? 'LOCAL CAMERA CAPTURE' : 'YOUR LOCAL IMAGE'}</span><button className="vqc-text-button" onClick={demo.useDemoImage} disabled={disabled}>Use demo image</button></div></div>
        <div className="vqc-inspect-controls"><UploadZone title="Drop Product Image" disabled={disabled} onFiles={files => { if (files[0]) void demo.uploadInspection(files[0]) }} />
          <button className="vqc-button" disabled={disabled} onClick={() => setCameraOpen(true)}><Camera size={16} />Capture Image</button>
          <fieldset className="vqc-fieldset"><legend>Simulated outcome</legend><div className="vqc-segmented">{(['PASS', 'REVIEW'] as Outcome[]).map(value => <button key={value} aria-pressed={demo.scenario === value} disabled={disabled} onClick={() => demo.setScenario(value)}>{value === 'PASS' ? 'Pass example' : 'Anomaly example'}</button>)}</div></fieldset>
          {!demo.product.ready && <p className="vqc-fine">This product needs a normal profile. <a href="#training">Train it first <ArrowUpRight size={12} /></a></p>}
          <button className="vqc-button is-primary vqc-run-button" disabled={disabled || !demo.product.ready} onClick={demo.inspect}><Play size={15} />{demo.analyzing ? 'Analyzing Product…' : 'Run Demo Inspection'}</button>
        </div>
      </div>
    </div>
    {cameraOpen && <CameraCapture onClose={() => setCameraOpen(false)} onCapture={file => { void demo.uploadInspection(file, 'camera') }} />}
  </Section>
}
export function AnalysisAnimation({ demo }: { demo: VisionDemo }) {
  const reduced = useReducedMotion()
  return <Section id="analysis" number="07" label="From pixels to a signal" title={demo.analyzing ? 'Analyzing Product.' : demo.analysis === 5 ? 'Inspection Complete.' : 'Watch the Analysis Unfold.'}>
    <div className="vqc-analysis-track" aria-live="polite">{analysisSteps.map((label, i) => {
      const complete = demo.analysis > i
      const active = demo.analysis === i
      return <motion.div key={label} className={complete ? 'is-complete' : active ? 'is-active' : ''}
        animate={{ opacity: demo.analysis < 0 || complete || active ? 1 : .5 }} transition={{ duration: reduced ? 0 : .3 }}>
        <span className="vqc-analysis-icon">{complete ? <Check size={18} /> : active ? <ScanLine size={18} /> : <Circle size={14} />}</span>
        <span className="vqc-mono">0{i + 1}</span><strong>{label}</strong><span>{complete ? 'Complete' : active ? 'Processing…' : 'Awaiting image'}</span>
      </motion.div>
    })}</div>
    <p className="vqc-footnote">{demo.analysis < 0 ? 'Run an inspection above to follow each simulated stage.' : demo.analysis === 5 ? 'Result ready. Review the original image, score, and illustrative anomaly map below.' : 'Simulating the inspection pipeline. No real model inference is running.'}</p>
  </Section>
}
export function InspectionResults({ demo }: { demo: VisionDemo }) {
  const reduced = useReducedMotion()
  const review = demo.result.result === 'REVIEW'
  return <Section id="results" number="08" label="The decision surface" title="Inspection Result.">
    <div className="vqc-row vqc-result-toolbar"><DemoLabel>Example outputs · confidence is not calibrated</DemoLabel><div className="vqc-segmented" aria-label="Preview result states">
      {(['PASS', 'REVIEW'] as Outcome[]).map(outcome => <button key={outcome} disabled={demo.analyzing} aria-pressed={demo.result.result === outcome} onClick={() => demo.previewResult(outcome)}>{outcome === 'PASS' ? 'Pass' : 'Anomaly'}</button>)}
    </div></div>
    <div className="vqc-panel vqc-result-layout"><ProductImage src={demo.result.image} name={'Inspection result for ' + demo.result.product} mode="overlay" anomaly={review} />
      <AnimatePresence mode="wait" initial={false}><motion.div className="vqc-result-summary" key={demo.result.result + demo.result.id}
        initial={{ opacity: 0, y: reduced ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .2 }}>
        <span className="vqc-kicker">RECORD #{demo.result.id} / {demo.result.product}</span><Badge outcome={demo.result.result} />
        <h3>{review ? 'A difference worth a closer look.' : 'Consistent with normal.'}</h3>
        <p>{review ? 'The example surface appearance differs from the learned normal profile. An operator should review the detected region.' : 'No significant visual anomalies detected in this simulated example.'}</p>
        <dl className="vqc-result-numbers"><div><dt>Demo confidence</dt><dd>{demo.result.confidence}<span>%</span></dd></div><div><dt>Anomaly score</dt><dd className={review ? 'vqc-accent' : 'vqc-good'}>{demo.result.score.toFixed(2)}</dd></div></dl>
        <p className="vqc-fine">Illustrative result and map. Values are selected by the demo scenario, including for uploaded images.</p>
        <JumpLink to="#heatmap">Explore Detected Region</JumpLink>
      </motion.div></AnimatePresence>
    </div>
  </Section>
}
export function AnomalyHeatmap({ demo }: { demo: VisionDemo }) {
  const [mode, setMode] = useState<'original' | 'heatmap' | 'overlay'>('overlay')
  const reduced = useReducedMotion()
  const review = demo.result.result === 'REVIEW'
  return <Section id="heatmap" number="09" label="See where it differs" title="The Difference, Made Visible."
    intro="Compare the original with an illustrative heatmap. Warmer regions represent larger visual differences in the demo.">
    <div className="vqc-panel">
      <div className="vqc-panel-head"><span><Crosshair size={15} />VISUAL COMPARISON</span><div className="vqc-segmented" aria-label="Image comparison mode">{(['original', 'heatmap', 'overlay'] as const).map(value => <button key={value} onClick={() => setMode(value)} aria-pressed={mode === value}>{value[0].toUpperCase() + value.slice(1)}</button>)}</div></div>
      <div className="vqc-heatmap-layout"><motion.div key={mode} initial={{ opacity: reduced ? 1 : .55 }} animate={{ opacity: 1 }} transition={{ duration: .35 }} className="vqc-map-transition"><ProductImage src={demo.result.image} name={mode + ' view of ' + demo.result.product + ', illustrative map'} mode={mode} anomaly={review} /><span className="vqc-view-scan" aria-hidden="true" /></motion.div>
        <aside className="vqc-region-details"><span className="vqc-kicker">{review ? 'ANOMALY REGION' : 'NORMAL APPEARANCE'}</span><h3>{review ? 'Look a little closer.' : 'Within the reference.'}</h3>
          <dl><div><dt>Location</dt><dd>{review ? 'Upper-right surface (illustrative)' : 'No region flagged'}</dd></div><div><dt>Anomaly score</dt><dd>{demo.result.score.toFixed(2)}</dd></div><div><dt>Severity</dt><dd>{review ? 'High — demo threshold' : 'Low'}</dd></div><div><dt>Detected difference</dt><dd>{review ? 'Surface appearance differs significantly from the learned normal profile.' : 'No significant difference in this simulated example.'}</dd></div></dl>
          <div className="vqc-score-scale"><span style={{ left: (demo.result.score * 100) + '%' }} /><div /><p><span>Low</span><strong>{demo.result.score.toFixed(2)}</strong><span>High</span></p></div>
          <p className="vqc-fine">This highlights a visual difference. It does not classify a specific defect.</p>
        </aside>
      </div>
    </div>
  </Section>
}
export function InspectionHistory({ demo }: { demo: VisionDemo }) {
  const [filter, setFilter] = useState<HistoryFilter>('All')
  const [query, setQuery] = useState('')
  const rows = filterHistory(demo.history, filter, query)
  function view(id: string) {
    const record = demo.history.find(row => row.id === id)
    if (record) { demo.setResult(record); document.getElementById('results')?.scrollIntoView({ behavior: 'auto' }) }
  }
  return <Section id="history" number="10" label="A traceable process" title="Every Inspection, In One Place."
    intro="Keep the image, score, and decision together. New simulated inspections appear here for this session.">
    <div className="vqc-panel">
      <div className="vqc-history-toolbar"><div className="vqc-segmented" aria-label="Filter inspections">{(['All', 'Passed', 'Anomalies', 'Needs Review'] as HistoryFilter[]).map(value => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value}</button>)}</div>
        <label className="vqc-search"><Search size={15} /><input aria-label="Search inspection ID or product" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search ID or product" /></label></div>
      <table className="vqc-history-table"><caption className="vqc-sr-only">Demo inspection history. Select a record to view its result.</caption>
        <thead><tr><th scope="col">Inspection</th><th scope="col">Product</th><th scope="col">Date</th><th scope="col">Anomaly score</th><th scope="col">Result</th><th scope="col"><span className="vqc-sr-only">View result</span></th></tr></thead>
        <tbody>{rows.map(row => <tr key={row.id}><td data-label="Inspection" className="vqc-mono">#{row.id}</td><td data-label="Product">{row.product}</td><td data-label="Date">{row.date}</td><td data-label="Score" className="vqc-mono">{row.score.toFixed(2)}</td><td data-label="Result"><Badge outcome={row.result} /></td><td><button className="vqc-icon-button" aria-label={'View inspection ' + row.id} onClick={() => view(row.id)}><ArrowUpRight size={17} /></button></td></tr>)}</tbody>
      </table>
      {!rows.length && <div className="vqc-empty"><Search size={24} /><h3>No matching inspections</h3><p>Try another product name, inspection ID, or filter.</p><button className="vqc-button" onClick={() => { setFilter('All'); setQuery('') }}>Clear filters</button></div>}
      <div className="vqc-table-footer"><span aria-live="polite">{rows.length} of {demo.history.length} recent records</span><span>Demo history · session only</span></div>
    </div>
  </Section>
}
export function ProductManagement({ demo }: { demo: VisionDemo }) {
  function open(id: string) { demo.selectProduct(id); document.getElementById('product-setup')?.scrollIntoView({ behavior: 'auto' }) }
  return <Section id="products" number="12" label="One reference per product" title="Manage Your Inspection Profiles.">
    <div className="vqc-three vqc-profile-grid">{demo.products.map(product => <article key={product.id} className={'vqc-profile ' + (demo.selectedId === product.id ? 'is-selected' : '')}>
      <ProductImage src={product.image} name={'Illustrative ' + product.name} /><div><span className="vqc-kicker">{product.kind}{demo.selectedId === product.id ? ' / SELECTED' : ''}</span><h3>{product.name}</h3>
        <p>{product.sampleCount} training images</p><span className={product.ready ? 'vqc-good' : 'vqc-accent'}><span className="vqc-status-dot" />{product.ready ? 'Model Ready' : 'Training Required'}</span>
        <button className="vqc-button" disabled={!!demo.training || demo.analyzing || demo.loadingFiles} onClick={() => open(product.id)}>Open Profile<ArrowUpRight size={15} /></button>
      </div></article>)}</div>
  </Section>
}
export function WorkflowStatus({ demo, visible }: { demo: VisionDemo; visible: boolean }) {
  return <div className="vqc-workflow-status" hidden={!visible}>
    {(demo.message || demo.error) && !demo.loadingFiles && <button className="vqc-icon-button" aria-label="Dismiss notification" onClick={demo.clearFeedback}><X size={15} /></button>}
    <p role="status" aria-live="polite">{demo.loadingFiles ? 'Reading image files…' : demo.message}</p>
    {demo.error && <p role="alert" className="vqc-error">{demo.error}</p>}
  </div>
}
export function WorkspaceHeader() {
  return <header className="vqc-workspace-header"><a href="/" className="vqc-text-button"><ArrowRight className="vqc-back-arrow" size={16} />Back to overview</a>
    <DemoLabel>VisionQC / Interactive workspace</DemoLabel><h1>Teach. Inspect.<br /><span>See the difference.</span></h1><p>A complete frontend walkthrough, from good samples to reviewable results.</p>
    <div className="vqc-actions"><JumpLink to="#training">Build a Profile<ImagePlus size={16} /></JumpLink><JumpLink to="#inspection" primary>Start Inspection</JumpLink></div><ArrowDown className="vqc-workspace-arrow" size={28} /></header>
}
