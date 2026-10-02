import { useRef } from 'react'
import { HeroSequence } from './HeroSequence'
import { ArrowRight, Crosshair } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Navigation } from './Navigation'

export function StatusPill() {
  return <span className="status-pill"><span className="status-dot" />AI Inspection System</span>
}

export function HeroCTA() {
  return <Link to="/inspection" className="hero-cta"><span className="cta-icon"><ArrowRight size={19} strokeWidth={1.6} aria-hidden="true" /></span><span>Start Inspection</span></Link>
}

export function InspectionOverlay() {
  return <div className="inspection-overlays" aria-hidden="true">
    <div className="camera-label"><span className="status-dot" /> LIVE CAMERA <span className="camera-number">/ 01</span></div>
    <div className="scan-frame"><i /><i /><i /><i /><div className="scan-line" /><span className="detection-point point-one" /><span className="detection-point point-two" /><span className="detection-point point-three" /></div>
    <div className="heatmap"><span /></div>
    <div className="deviation-card"><span>DEVIATION</span><strong>2.8<span>%</span></strong><div className="heatmap-scale" /></div>
    <div className="analysis-card"><div className="analysis-title"><Crosshair size={12} /> VISION ANALYSIS</div><div className="analysis-row"><span>Confidence</span><strong>97.4<span>%</span></strong></div><div className="analysis-row"><span>Status</span><span className="pass-label"><span /> PASS</span></div></div>
    <span className="visual-caption">ILLUSTRATIVE INSPECTION</span>
  </div>
}

export function InspectionVisual() {
  return <figure className="inspection-visual" aria-label="Illustrative machine vision inspection of a precision-machined metal flange, with a localized deviation heatmap and sample analysis readings.">
    <img className="inspection-photo" src="/inspection-station.png" alt="Industrial camera inspecting a precision-machined metal flange on a dark inspection station" fetchPriority="high" />
    <InspectionOverlay />
  </figure>
}

export function Hero() {
  const scrollArea = useRef<HTMLDivElement>(null)

  return <div ref={scrollArea} className="hero-scroll-area">
    <main className="hero">
    <HeroSequence scrollArea={scrollArea} />
    <Navigation />
    <div className="hero-top-note" aria-hidden="true">BUILT TO SEE THE DIFFERENCE <span>↗</span></div>
    <section className="hero-heading" aria-labelledby="hero-title">
      <StatusPill />
      <h1 id="hero-title">AI-Powered<br />Visual Quality<br />Inspection</h1>
    </section>
    <InspectionVisual />
    <div className="hero-description">
      <p>VisionQC learns what a good product looks like from just 20–30 images, then detects deviations in real time using your camera.</p>
      <HeroCTA />
    </div>
    <div className="hero-wordmark" aria-hidden="true">VisionQC</div>
    </main>
  </div>
}
