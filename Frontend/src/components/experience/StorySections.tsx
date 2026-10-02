import { ArrowDown, ArrowRight, ArrowUpRight, BadgeDollarSign, Boxes, Check, Cpu, Database, Eye, Fingerprint, Layers, LockKeyhole, Package, ScanLine, Settings2, ShieldCheck, Workflow } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router-dom'
import { benefits, conditions, processSteps, useCases, products } from '../../data/demoData'
import { DemoLabel, JumpLink, ProductImage, Section } from './Primitives'

export function ProblemSection() {
  const problems = [
    { icon: BadgeDollarSign, title: 'Expensive Inspection Systems', text: 'Specialized hardware and engineering expertise can put traditional machine vision out of reach.' },
    { icon: Database, title: 'Large Labelled Datasets', text: 'Supervised defect detection often needs many labelled examples of different defect categories.' },
    { icon: Eye, title: 'Manual Inspection', text: 'Repetitive work. Subtle differences. Results that can vary between operators.' },
  ]
  return <Section id="problem" number="01" label="A different starting point" title="Quality Inspection Shouldn’t Require a Data Science Team."
    intro="Small manufacturers need reliable visual inspection. Getting started shouldn’t mean assembling an entire machine-vision department.">
    <div className="vqc-three vqc-problems">{problems.map(({ icon: Icon, title, text }, i) => <article key={title}>
      <div className="vqc-row"><Icon size={25} strokeWidth={1.25} /><span className="vqc-mono">0{i + 1}</span></div><h3>{title}</h3><p>{text}</p>
    </article>)}</div>
    <div className="vqc-manifesto"><span className="vqc-kicker">VisionQC takes a different approach.</span>
      <p>Instead of teaching the system every possible defect,<br /><em>teach it what a GOOD product looks like.</em></p><ArrowDown size={27} strokeWidth={1.2} /></div>
  </Section>
}
export function CoreConcept() {
  const reduced = useReducedMotion()
  const nodes = [
    { icon: Layers, title: '20–30', text: 'Good product images' }, { icon: Fingerprint, title: 'Learn normal', text: 'Build a visual profile' },
    { icon: Package, title: 'New product', text: 'One new image' }, { icon: ScanLine, title: 'Compare', text: 'Find visual differences' },
    { icon: Eye, title: 'Anomaly map', text: 'Locate detected regions' }, { icon: ShieldCheck, title: 'Result', text: 'Pass or needs review' },
  ]
  return <Section id="concept" number="02" label="The core idea" title="Teach It Normal. Let It Find the Abnormal."
    intro="A small set of good examples becomes the reference for every new inspection.">
    <div className="vqc-concept">{nodes.map(({ icon: Icon, title, text }, i) => <motion.div key={title} className="vqc-concept-node"
      initial={reduced ? false : { opacity: .25 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: .7 }} transition={{ delay: reduced ? 0 : i * .09 }}>
      <span className="vqc-node-index">0{i + 1}</span><Icon size={27} strokeWidth={1.25} /><strong>{title}</strong><span>{text}</span>
      {i < nodes.length - 1 && <ArrowRight className="vqc-flow-arrow" size={16} />}
    </motion.div>)}</div>
    <p className="vqc-footnote"><span className="vqc-status-dot" />Learn the expected appearance. Flag the unexpected.</p>
  </Section>
}
export function HowItWorks() {
  const reduced = useReducedMotion()
  return <Section id="how-it-works" number="03" label="From samples to signal" title="Five Steps. One Clear Process.">
    <div className="vqc-timeline">{processSteps.map((step, i) => <motion.article key={step.title}
      className="vqc-timeline-step" initial={reduced ? false : { opacity: .35 }} whileInView={{ opacity: 1 }} viewport={{ amount: .65 }}>
      <span className="vqc-step-number">0{i + 1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div>
      <div className="vqc-step-preview">
        {i === 0 && <><span className="vqc-kicker">PRODUCT / SURFACE QUALITY</span><strong>Metal Bottle Cap</strong><Package size={26} /></>}
        {i === 1 && <><div className="vqc-mini-samples">{Array.from({ length: 6 }, (_, n) => <div key={n}><img src={products[0].image} alt={'Illustrative good sample ' + (n + 1)} loading="lazy" /><Check size={10} /></div>)}</div><span>28 accepted reference samples</span></>}
        {i === 2 && <><span>Learning Normality <b>100%</b></span><progress max="100" value="100" aria-label="Example training complete" /><span><Check size={12} /> Normal visual profile created</span></>}
        {i === 3 && <><span className="vqc-kicker">NEW INSPECTION / #1048</span><JumpLink to="#inspection">Upload Image</JumpLink></>}
        {i === 4 && <><div className="vqc-equation"><span>Original</span><b>+</b><span>Heatmap</span><b>=</b><span>Result</span></div><span className="vqc-kicker">See the difference. Make the decision.</span></>}
      </div>
    </motion.article>)}</div>
  </Section>
}
export function Benefits() {
  return <Section id="benefits" number="14" label="Built to get started" title="Inspection Without the Traditional Complexity.">
    <div className="vqc-benefits">{benefits.map(([number, title, text]) => <article key={title}><span className="vqc-mono">{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
  </Section>
}
export function UseCases() {
  const icons = [Settings2, Package, Layers, Cpu, Workflow, Boxes]
  return <Section id="use-cases" number="15" label="Potential use cases" title="Built for Real-World Manufacturing."
    intro="Explore visual inspection for consistent products in controlled environments. Suitability must be validated with your own samples.">
    <div className="vqc-use-cases">{useCases.map(([title, text, code], index) => {
      const Icon = icons[index]
      return <article key={title}><Icon size={30} strokeWidth={1.2} /><span className="vqc-kicker">{code}</span><h3>{title}</h3><p>{text}</p></article>
    })}</div>
  </Section>
}
export function Architecture() {
  return <Section id="architecture" number="16" label="Under the surface" title="A Clear Path From Pixels to Decisions."
    intro="Conceptual architecture for an anomaly-detection system. This frontend demonstrates the flow; model services are not connected.">
    <div className="vqc-architecture">
      <div className="vqc-architecture-lane"><span className="vqc-kicker">01 / BUILD THE REFERENCE</span><div className="vqc-architecture-flow">{['Good image upload', 'Preprocessing', 'Feature extraction', 'Normality learning'].map((text, i) => <div key={text}><Database size={18} /><span>{text}</span>{i < 3 && <ArrowRight size={14} />}</div>)}</div></div>
      <div className="vqc-architecture-bridge"><span>PRODUCT-SPECIFIC NORMAL PROFILE</span><ArrowDown size={20} /></div>
      <div className="vqc-architecture-lane"><span className="vqc-kicker">02 / INSPECT A NEW IMAGE</span><div className="vqc-architecture-flow">{['New image', 'Preprocess & extract', 'Anomaly comparison', 'Score + heatmap'].map((text, i) => <div key={text}><ScanLine size={18} /><span>{text}</span>{i < 3 && <ArrowRight size={14} />}</div>)}</div></div>
      <div className="vqc-architecture-result"><ArrowDown size={18} /><span>FINAL RESULT</span><strong>Pass <span>/</span> Needs Review</strong></div>
    </div>
  </Section>
}
export function MLConcept() {
  return <Section id="ml-concept" number="17" label="Normal is the reference" title="A Different Way to Approach Visual Inspection.">
    <div className="vqc-two vqc-comparison">
      <article><span className="vqc-kicker">SUPERVISED DEFECT CLASSIFICATION</span><h3>Teach every category.</h3><div className="vqc-class-tags">{['Good', 'Bad', 'Scratch', 'Crack', 'Dent', 'Discoloration', 'Misalignment', '…'].map(text => <span key={text}>{text}</span>)}</div><p>Typically requires labelled examples of the categories it should recognize.</p></article>
      <article><span className="vqc-kicker vqc-accent">VISIONQC / ANOMALY DETECTION</span><h3>Teach what belongs.</h3><div className="vqc-class-tags is-good">{Array.from({ length: 8 }, (_, i) => <span key={i}><Check size={12} />Good</span>)}</div><p>Learn the normal appearance, then score how much a new image differs. A difference needs review; it is not a defect classification.</p></article>
    </div><div className="vqc-inline-flow">New image <ArrowRight size={16} /> Compare with normal <ArrowRight size={16} /> Visual difference <ArrowRight size={16} /> <strong>Anomaly score</strong></div>
  </Section>
}
export function PrivacySection() {
  return <Section id="privacy" number="18" label="Clear boundaries" title="Your Product Data Stays Yours.">
    <div className="vqc-two vqc-privacy"><div><LockKeyhole size={38} strokeWidth={1.1} /><h3>Your images, in this browser session.</h3><p>This demo previews selected images locally. It does not send them to an inspection service or save them to a server. Reloading clears uploads and session inspection results.</p><DemoLabel>Frontend demo · no model service connected</DemoLabel></div>
      <dl><div><dt>Controlled image processing</dt><dd>Local previews; analysis is simulated</dd></div><div><dt>Product-specific datasets</dt><dd>Separate sample sets in session memory</dd></div><div><dt>Separate normal profiles</dt><dd>Simulated training status per product</dd></div><div><dt>Inspection history</dt><dd>Demo records and session results</dd></div><div><dt>Configurable data retention</dt><dd>Planned for a connected backend</dd></div></dl></div>
  </Section>
}
export function Limitations() {
  return <Section id="limitations" number="19" label="Good inputs matter" title="Designed for Controlled Inspection Environments.">
    <div className="vqc-two vqc-conditions"><ul>{conditions.map(text => <li key={text}><Check size={17} /><span>{text}</span></li>)}</ul>
      <div><span className="vqc-kicker">A REPRESENTATIVE NORMAL</span><p>VisionQC learns the appearance of normal products. If training images do not represent legitimate variation in the product, the system may flag acceptable products as anomalies.</p><p className="vqc-fine">Anomaly scores support an operator’s decision. Validate the setup and review flagged products before taking action.</p></div></div>
  </Section>
}
export function FinalCTA() {
  return <Section id="get-started" number="20" label="Start with normal" title="Teach Your Product What Normal Looks Like." className="vqc-final"
    intro="Start with a small collection of good products and turn visual inspection into a repeatable process.">
    <div className="vqc-actions"><Link to="/inspection" className="vqc-button is-primary">Start Inspection<ArrowUpRight size={17} /></Link><JumpLink to="#demo">Explore Demo</JumpLink></div>
    <span className="vqc-final-stamp">20–30 GOOD IMAGES.<br />A DIFFERENT STARTING POINT.</span>
  </Section>
}
export function Footer() {
  return <footer className="vqc-footer"><div><a href="/" className="vqc-footer-brand">VisionQC<span>↗</span></a><p>Visual Anomaly Detection<br />for Small-Scale Manufacturing</p></div>
    <nav aria-label="Product links"><span>Product</span><a href="/#how-it-works">How It Works</a><Link to="/inspection">Inspection</Link><a href="/#analytics">Analytics</a></nav>
    <nav aria-label="Technology links"><span>Technology</span><a href="/#architecture">Architecture</a><a href="/#use-cases">Use Cases</a><a href="/#ml-concept">Documentation</a></nav>
    <div className="vqc-footer-bottom"><span>© 2026 VisionQC</span><span>Built to see the difference.</span><a href="/#privacy">Privacy & Data <ArrowUpRight size={12} /></a></div>
  </footer>
}
export function WorkflowPreview() {
  return <div className="vqc-workflow-preview"><DemoLabel /><ProductImage src={products[0].image} name="Illustrative normal bottle cap reference" /><span className="vqc-kicker">REFERENCE / METAL BOTTLE CAP</span></div>
}
