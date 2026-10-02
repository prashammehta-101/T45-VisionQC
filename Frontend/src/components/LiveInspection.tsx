import { useRef, useState } from 'react'
import { Camera, ScanLine, Upload, LoaderCircle } from 'lucide-react'
import { api, PRODUCT, score, type Inspection, type Threshold } from '../lib/api'
import { useInspectionCamera } from '../hooks/useInspectionCamera'

export function LiveInspection({ threshold, onInspect }: { threshold: Threshold | null; onInspect: () => void }) {
  const { videoRef, devices, device, select, state: cameraState, error: cameraError, start, stop, capture } = useInspectionCamera()
  const [mode, setMode] = useState<'camera' | 'upload'>('camera')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [busy, setBusy] = useState(false)
  const inFlight = useRef(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<Inspection | null>(null)
  const [opacity, setOpacity] = useState(0.45)
  const [missing, setMissing] = useState(false)
  async function chooseFile(next?: File) {
    setError(''); setResult(null); setFile(null); setPreview('')
    if (!next) return
    if (!['image/png', 'image/jpeg'].includes(next.type) || !next.size || next.size > 12 * 1024 * 1024) { setError('Choose a JPEG or PNG image up to 12 MB.'); return }
    const reader = new FileReader()
    reader.onload = () => { setFile(next); setPreview(String(reader.result)) }
    reader.onerror = () => setError('The selected image could not be read.')
    reader.readAsDataURL(next)
  }
  async function inspect() {
    if (inFlight.current) return
    inFlight.current = true; setBusy(true); setError(''); setResult(null); setMissing(false)
    try {
      const image = mode === 'camera' ? await capture() : file
      if (!image) throw new Error('Choose an image before inspecting.')
      const form = new FormData(); form.append('image', image, mode === 'camera' ? 'capture.png' : 'upload'); form.append('product_id', PRODUCT)
      const response = await api<Inspection>('/inspections', { method: 'POST', body: form })
      setResult(response); onInspect()
    } catch (e) { setError(e instanceof Error ? e.message : 'Inspection failed.') }
    finally { inFlight.current = false; setBusy(false) }
  }
  const status = busy ? 'Analyzing product…' : cameraState === 'loading' && mode === 'camera' ? 'Initializing camera…' : (mode === 'camera' ? cameraState === 'ready' : !!file) ? 'Ready for inspection' : 'Idle'
  return <section id="inspection" className="vqc-section">
    <div className="vqc-section-heading"><span className="vqc-kicker">01 / LIVE INSPECTION</span><h2>See it. Inspect it.<br />Know the result.</h2><p>Center your product, keep lighting consistent, then capture one frame for CUDA PatchCore inspection.</p></div>
    <div className="live-grid"><div className="vqc-panel">
      <div className="vqc-panel-head"><span><Camera size={16} /> {PRODUCT}</span><div className="vqc-actions">{(['camera', 'upload'] as const).map(value => <button key={value} className="vqc-button" aria-pressed={mode === value} disabled={busy} onClick={() => { stop(); setMode(value); setError('') }}>{value === 'camera' ? 'Live camera' : 'Manual image'}</button>)}</div></div>
      <div className="live-preview">
        <video ref={videoRef} muted playsInline className={mode === 'camera' && cameraState === 'ready' ? '' : 'live-hidden'} />
        {mode === 'upload' && preview && <img src={preview} alt="Selected inspection image" />}
        {mode === 'camera' && cameraState === 'ready' && <div className="live-guide"><span>Center product · framing guide only</span></div>}
        {((mode === 'camera' && cameraState !== 'ready') || (mode === 'upload' && !preview)) && <div className="live-placeholder">{cameraState === 'loading' && mode === 'camera' ? <LoaderCircle className="live-spinner" size={32} /> : <ScanLine size={40} />}<p>{mode === 'camera' ? 'Your camera feed appears here' : 'Select an original product image'}</p></div>}
      </div>
      <div className="live-controls">
        {mode === 'camera' ? <><label>Camera<select value={device} disabled={busy || cameraState === 'loading'} onChange={e => select(e.target.value)}><option value="">Default camera</option>{devices.map((d, i) => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Camera ' + (i + 1)}</option>)}</select></label><div className="vqc-actions"><button className="vqc-button" onClick={() => { void start() }} disabled={busy || cameraState !== 'idle'}>Start camera</button><button className="vqc-button" onClick={stop} disabled={cameraState === 'idle'}>Stop camera</button></div></> : <label className="live-file"><Upload size={16} /> Choose image<input type="file" accept="image/jpeg,image/png" disabled={busy} onChange={e => { void chooseFile(e.target.files?.[0]) }} /></label>}
        <button className="vqc-button is-primary" onClick={() => { void inspect() }} disabled={busy || (mode === 'camera' ? cameraState !== 'ready' : !file)}>{busy ? <LoaderCircle size={16} className="live-spinner" /> : <ScanLine size={16} />} {mode === 'camera' ? 'Capture & Inspect' : 'Inspect image'}</button>
        <p className="vqc-fine">Full captured frame is inspected. Automatic product detection and cropping are not enabled.</p>
      </div>
    </div><div className="vqc-panel live-result" aria-live="polite" aria-busy={busy}>
      <span className="vqc-kicker">INSPECTION RESULT</span><p>{status}</p>
      {result ? <><strong className={'live-verdict ' + (result.prediction === 'PASS' ? 'vqc-good' : 'vqc-accent')}>{result.prediction}</strong><dl className="live-readings"><div><dt>Anomaly score</dt><dd>{score(result.anomalyScore)}</dd></div><div><dt>Decision threshold</dt><dd>{score(result.threshold)}</dd></div></dl><p className="vqc-mono">{score(result.anomalyScore)} {result.anomalyScore > result.threshold ? '>' : result.anomalyScore === result.threshold ? '=' : '<'} {score(result.threshold)} → {result.prediction}</p><p>{result.processingTime.toLocaleString()} ms · CUDA</p><p className="vqc-fine">{result.loggingStatus === 'pending' ? 'Result queued locally; MongoDB synchronization is pending.' : 'Inspection saved in MongoDB.'}</p>
      {threshold && threshold.threshold !== result.threshold && <div className="live-notice">At current threshold {score(threshold.threshold)}: <strong>{result.anomalyScore > threshold.threshold ? 'FAIL' : 'PASS'}</strong>. This is a reassessment of the same score; the recorded inspection stays unchanged.</div>}</> : <><strong className="live-verdict vqc-muted">—</strong><p>Capture a frame or upload an image to get a real model result.</p>{threshold && <p>Current threshold: {score(threshold.threshold)}</p>}</>}
      <p className="vqc-fine">PatchCore scores measure visual deviation. They are not probabilities or calibrated confidence values. Equality with the threshold is PASS.</p>
    </div></div>
    {(error || (mode === 'camera' && cameraError)) && <p className="live-error" role="alert">{error || cameraError}</p>}
    {result && <div className="live-heatmaps"><div className="vqc-row"><h3>Original & anomaly response</h3><a className="vqc-button" href={result.originalUrl} target="_blank" rel="noreferrer">View original upload</a></div><div className="live-grid"><figure className="vqc-panel"><img src={result.imageUrl} alt="Inspected full product image" /><figcaption>Original · orientation normalized for inspection</figcaption></figure><figure className="vqc-panel"><div className="live-overlay"><img src={result.imageUrl} alt="Inspected product beneath anomaly overlay" />{!missing && <img className="live-map" src={result.heatmapUrl} style={{ opacity }} alt="Actual PatchCore anomaly response" onError={() => setMissing(true)} />}</div><figcaption>{missing ? 'Heatmap unavailable. Check the AI image service.' : 'Actual PatchCore response · per-image intensity scale'}</figcaption></figure></div><label className="live-opacity">Heatmap opacity <input type="range" min="0" max="1" step="0.05" value={opacity} onChange={e => setOpacity(Number(e.target.value))} />{Math.round(opacity * 100)}%</label><p className="vqc-fine">Brighter areas indicate stronger local anomaly responses. Color intensity is normalized within each image and does not establish a defect probability.</p></div>}
  </section>
}
