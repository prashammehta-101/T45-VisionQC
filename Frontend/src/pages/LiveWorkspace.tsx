import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ScanLine } from 'lucide-react'
import { LiveInspection } from '../components/LiveInspection'
import { ModelPerformance } from '../components/ModelPerformance'
import { useRemote } from '../hooks/useRemote'
import { PRODUCT, percent, score, type Evaluation, type History, type Today, type Threshold } from '../lib/api'
import '../styles/experience.css'
import '../styles/live.css'
export function LiveWorkspace() {
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const history = useRemote<History>('/inspections?product_id=' + PRODUCT + '&page=' + page + (filter ? '&prediction=' + filter : ''), true)
  const today = useRemote<Today>('/inspections/today?product_id=' + PRODUCT, true)
  const evaluation = useRemote<Evaluation>('/model/evaluation/' + PRODUCT)
  const threshold = useRemote<Threshold>('/model/threshold/' + PRODUCT, true)
  const health = useRemote<{ databaseReady: boolean; ai: { cudaAvailable: boolean; gpu: string; modelAvailable: boolean } | null }>('/health', true)
  function refresh() { history.refresh(); today.refresh(); health.refresh() }
  return <div className="vqc-root live-workspace"><a className="vqc-skip" href="#inspection">Skip to inspection</a><nav className="vqc-section-nav" aria-label="Inspection workspace"><Link className="vqc-nav-brand" to="/"><ScanLine size={18} /> VISIONQC <small>/ WORKSPACE</small></Link><div><a href="#inspection">Inspect</a><a href="#performance">Model performance</a><a href="#history">History</a></div></nav><main className="vqc-content"><div className="live-health"><span className="vqc-kicker">{PRODUCT} / PATCHCORE</span><p>{health.error || (!health.data ? 'Connecting to services…' : (health.data.ai?.cudaAvailable ? health.data.ai.gpu : 'CUDA service unavailable') + ' · ' + (health.data.databaseReady ? 'MongoDB connected' : 'MongoDB unavailable'))}</p></div>
    {threshold.error && <p className="live-error">{threshold.error}</p>}
    <LiveInspection threshold={threshold.data} onInspect={refresh} />
    <ModelPerformance data={evaluation.data} error={evaluation.error} refresh={evaluation.refresh} onThreshold={() => { threshold.refresh(); evaluation.refresh() }} />
    <section className="vqc-section" id="history"><div className="vqc-section-heading"><span className="vqc-kicker">03 / INSPECTION HISTORY</span><h2>Every inspection.<br />A traceable decision.</h2><p>Actual MongoDB records with the decision threshold used at inspection time.</p></div>
      {today.error && <p className="live-error" role="alert">{today.error}</p>}{today.data && <><p className="vqc-fine">Today in {today.data.timezone}</p><div className="live-metrics">{[['Today’s inspections', today.data.total], ['Passed', today.data.passed], ['Rejected', today.data.rejected], ['Rejection rate', percent(today.data.rejectionRate)]].map(([label, value]) => <article className="vqc-panel" key={label}><span className="vqc-kicker">{label}</span><strong>{value}</strong></article>)}</div></>}
      <div className="vqc-row"><div className="vqc-actions">{['', 'PASS', 'FAIL'].map(value => <button key={value} className="vqc-button" aria-pressed={filter === value} onClick={() => { setFilter(value); setPage(1) }}>{value || 'All'}</button>)}</div><button className="vqc-button" onClick={refresh}>Refresh history</button></div>
      {history.error && <p className="live-error" role="alert">{history.error}</p>}{!history.data && !history.error && <p>Loading inspections…</p>}{history.data && <><div className="live-table-wrap vqc-panel"><table className="live-table"><caption>{history.data.total} matching inspections</caption><thead><tr><th>Time</th><th>Product</th><th>Score</th><th>Threshold</th><th>Result</th><th>Images</th></tr></thead><tbody>{history.data.items.map(row => <tr key={row.inspectionId}><td>{new Date(row.timestamp).toLocaleString()}</td><td>{row.productId}</td><td>{score(row.anomalyScore)}</td><td>{score(row.threshold)}</td><td className={row.prediction === 'PASS' ? 'vqc-good' : 'vqc-accent'}>{row.prediction}</td><td><a href={row.comparisonUrl} target="_blank" rel="noreferrer">View heatmap ↗</a></td></tr>)}{!history.data.items.length && <tr><td colSpan={6}>No inspections match this filter. Capture a frame or upload an image to begin.</td></tr>}</tbody></table></div><div className="vqc-actions"><button className="vqc-button" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page}</span><button className="vqc-button" disabled={page * history.data.pageSize >= history.data.total} onClick={() => setPage(page + 1)}>Next</button></div></>}
    </section><footer className="live-pad"><Link to="/">← Back to VisionQC</Link><p className="vqc-fine">Real images. Real scores. Dataset-specific decisions.</p></footer></main></div>
}
