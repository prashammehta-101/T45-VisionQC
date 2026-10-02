import { distribution, inspectionHistory, trend } from '../../data/demoData'
import type { VisionDemo } from '../../hooks/useVisionDemo'
import { summarize } from '../../lib/demoLogic'
import { Counter, DemoLabel, Section } from './Primitives'

export function AnalyticsDashboard({ demo }: { demo: VisionDemo }) {
  const stats = summarize(demo.history, inspectionHistory.length)
  const series = trend.map((day, i) => i === trend.length - 1 ? { ...day, total: day.total + stats.extra.length, passed: day.passed + stats.extra.filter(row => row.result === 'PASS').length } : day)
  const bins = distribution.map((bin, i) => ({ ...bin, count: bin.count + stats.extra.filter(row => i === 0 ? row.score < .1 : i === 4 ? row.score >= .7 && row.score < .9 : false).length }))
  const max = Math.max(...series.map(day => day.total)) * 1.15
  const points = (key: 'total' | 'passed') => series.map((day, i) => (36 + i * 46) + ',' + (156 - day[key] / max * 122)).join(' ')
  return <Section id="analytics" number="11" label="The wider view" title="Understand Your Inspection Process."
    intro="A sample seven-day overview. New session inspections update the totals, trend, and score distribution.">
    <div className="vqc-row vqc-analytics-heading"><DemoLabel>Sample reporting period</DemoLabel><span className="vqc-mono">SEP 26 — OCT 02, 2026</span></div>
    <div className="vqc-stat-strip">{[
      { label: 'Total inspections', value: stats.total, note: 'Across the sample period' },
      { label: 'Passed', value: stats.passed, note: 'Within normal reference' },
      { label: 'Anomalies', value: stats.anomalies, note: 'Flagged for operator review' },
      { label: 'Pass rate', value: stats.rate, note: 'Demo data, not model accuracy', percent: true },
    ].map(item => <div key={item.label}><span className="vqc-kicker">{item.label}</span><strong><Counter value={item.value} decimals={item.percent ? 1 : 0} suffix={item.percent ? '%' : ''} /></strong><span>{item.note}</span></div>)}</div>
    <div className="vqc-chart-grid">
      <article className="vqc-chart"><div className="vqc-row"><h3>Inspection Results</h3><span className="vqc-mono">01</span></div>
        <div className="vqc-donut" role="img" aria-label={stats.passed + ' passed and ' + stats.anomalies + ' need review'}
          style={{ background: 'conic-gradient(#bdc7ac 0% ' + stats.rate + '%, #ff8a50 ' + stats.rate + '% 100%)' }}>
          <div><strong>{stats.rate.toFixed(1)}<small>%</small></strong><span>PASS RATE</span></div>
        </div><div className="vqc-chart-legend"><span><i className="is-pass" />Passed <b>{stats.passed.toLocaleString()}</b></span><span><i />Needs review <b>{stats.anomalies.toLocaleString()}</b></span></div>
      </article>
      <article className="vqc-chart"><div className="vqc-row"><h3>Inspection Trend</h3><span className="vqc-mono">02</span></div>
        <svg className="vqc-trend" viewBox="0 0 350 190" role="img" aria-labelledby="trend-title trend-desc"><title id="trend-title">Seven-day inspection trend</title><desc id="trend-desc">Total inspections increased from 140 to {series[6].total}. Passed inspections increased from 126 to {series[6].passed}. Full values in the data table below.</desc>
          {[0, 1, 2, 3].map(i => <g key={i}><line x1="35" x2="318" y1={34 + i * 40} y2={34 + i * 40} stroke="#ffffff12" /><text x="27" y={38 + i * 40} textAnchor="end">{Math.round(max * (3 - i) / 3)}</text></g>)}
          <polyline points={points('total')} fill="none" stroke="#ff8a50" strokeWidth="2" strokeLinejoin="round" /><polyline points={points('passed')} fill="none" stroke="#bdc7ac" strokeWidth="2" strokeLinejoin="round" />
          {series.map((day, i) => <g key={day.day}><circle cx={36 + i * 46} cy={156 - day.total / max * 122} r="3" fill="#ff8a50"><title>{day.day + ': ' + day.total + ' total, ' + day.passed + ' passed'}</title></circle><text x={36 + i * 46} y="181" textAnchor="middle">{day.day}</text></g>)}
        </svg><div className="vqc-chart-legend is-inline"><span><i />Total</span><span><i className="is-pass" />Passed</span></div>
      </article>
      <article className="vqc-chart"><div className="vqc-row"><h3>Anomaly Score Distribution</h3><span className="vqc-mono">03</span></div>
        <div className="vqc-histogram" role="img" aria-label={bins.map(bin => bin.label + ': ' + bin.count + ' inspections').join(', ')}>
          {bins.map(bin => <div key={bin.label}><span>{bin.count}</span><i style={{ height: bin.count / Math.max(...bins.map(item => item.count)) * 130 + 'px' }} className={bin.review ? 'is-review' : ''} /><small>{bin.label}</small></div>)}
        </div><p className="vqc-fine">Anomaly score →<br />Higher scores indicate larger visual differences.</p>
      </article>
    </div>
    <details className="vqc-chart-data"><summary>View chart data</summary><table><caption>Sample seven-day inspection totals</caption><thead><tr><th scope="col">Day</th><th scope="col">Total</th><th scope="col">Passed</th><th scope="col">Review</th></tr></thead><tbody>{series.map(day => <tr key={day.day}><td>{day.day}</td><td>{day.total}</td><td>{day.passed}</td><td>{day.total - day.passed}</td></tr>)}</tbody></table></details>
  </Section>
}
