import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight, Check, Play, RotateCcw } from 'lucide-react'
import { products } from '../../data/demoData'
import { DemoLabel, ProductImage, Section } from './Primitives'

const stages = ['Good sample', 'New product', 'Scanning', 'Anomaly heatmap', 'Needs review']
export function InteractiveDemo() {
  const [stage, setStage] = useState(0)
  const [running, setRunning] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const reduced = useReducedMotion()
  useEffect(() => () => { if (timer.current) clearInterval(timer.current) }, [])
  function start() {
    if (running) return
    setStage(0)
    if (reduced) { setStage(4); return }
    setRunning(true)
    let step = 0
    timer.current = setInterval(() => {
      step++
      setStage(step)
      if (step === 4) { clearInterval(timer.current!); timer.current = null; setRunning(false) }
    }, 1000)
  }
  return <Section id="demo" number="13" label="A closer look" title="See VisionQC In Action."
    intro="One reference. One new image. Watch how a visual difference becomes a reviewable signal." className="vqc-demo-section">
    <div className="vqc-demo-stage">
      <div className="vqc-panel-head"><DemoLabel>Guided simulation / Metal Bottle Cap</DemoLabel><span className="vqc-mono">0{stage + 1} / 05</span></div>
      <div className="vqc-demo-visuals"><div><span className="vqc-kicker">01 / GOOD SAMPLE</span><ProductImage src={products[0].image} name="Illustrative good metal bottle cap reference" /><span className="vqc-good"><Check size={13} />LEARNED NORMAL</span></div>
        <ArrowRight className="vqc-demo-arrow" size={25} strokeWidth={1.2} />
        <div><span className="vqc-kicker">02 / NEW PRODUCT</span><ProductImage src={products[0].image.replace('.svg', '-review.svg')} name="Illustrative new metal bottle cap with simulated anomaly region" mode={stage >= 3 ? 'overlay' : 'original'} anomaly={stage >= 3} scanning={stage === 2} />
          <motion.span className={stage >= 3 ? 'vqc-accent' : 'vqc-muted'} key={stage} initial={{ opacity: reduced ? 1 : .3 }} animate={{ opacity: 1 }}>{stage === 0 ? 'READY TO COMPARE' : stage === 1 ? 'IMAGE RECEIVED' : stage === 2 ? 'SCANNING PRODUCT' : stage === 3 ? 'REGION HIGHLIGHTED' : 'ANOMALY DETECTED · SCORE 0.91'}</motion.span></div>
      </div>
      <div className="vqc-demo-stages">{stages.map((text, i) => <span key={text} className={i <= stage ? 'is-active' : ''}><b>{String(i + 1).padStart(2, '0')}</b>{text}</span>)}</div>
      <div className="vqc-demo-bottom"><p aria-live="polite">{stage === 4 ? 'Anomaly detected. Review the highlighted region against your product criteria.' : 'Follow a product from its normal reference to an illustrative anomaly result.'}<small>Simulated visualization. No defect classification or measured accuracy is implied.</small></p>
        <button className="vqc-button is-primary" onClick={start} disabled={running}>{stage === 4 ? <RotateCcw size={16} /> : <Play size={15} />}{running ? 'Demo Running…' : stage === 4 ? 'Replay Demo' : 'Run the Demo'}</button></div>
    </div>
  </Section>
}
