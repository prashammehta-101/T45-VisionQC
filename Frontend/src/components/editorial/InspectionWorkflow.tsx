import { useState } from 'react'
import { motion } from 'motion/react'
import { CheckCircle2, Cpu, Eye, Layers, Sparkles } from 'lucide-react'

interface WorkflowStep {
  number: string
  title: string
  tagline: string
  detail: string
  icon: React.ElementType
  visualBadge: string
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    number: '01',
    title: 'TEACH',
    tagline: 'Upload 20–30 good units.',
    detail: 'Collect standard production samples without defects. No complex bounding boxes or annotations needed.',
    icon: Layers,
    visualBadge: '28 REFERENCE IMAGES',
  },
  {
    number: '02',
    title: 'LEARN',
    tagline: 'VisionQC builds a representation of normal.',
    detail: 'Deep neural feature extractors model surface geometry, texture tolerances, and normal variations.',
    icon: Cpu,
    visualBadge: 'LATENT EMBEDDING GENERATED',
  },
  {
    number: '03',
    title: 'INSPECT',
    tagline: 'Point a camera at the next product.',
    detail: 'Capture any unit via USB webcam, smartphone lens, or industrial GigE vision feed in real-time.',
    icon: Eye,
    visualBadge: 'LIVE STREAM ACQUISITION',
  },
  {
    number: '04',
    title: 'DECIDE',
    tagline: 'Receive a confidence score, heatmap and PASS/FAIL result.',
    detail: 'Automated anomaly thresholding outputs immediate verdict with pixel-precise deviation overlay.',
    icon: CheckCircle2,
    visualBadge: 'INSTANT VERDICT: PASS',
  },
]

export function InspectionWorkflow() {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <section className="vqc-workflow-section" id="workflow" aria-labelledby="workflow-title">
      <div className="vqc-workflow-container">
        {/* Section Heading */}
        <div className="vqc-workflow-header">
          <div className="vqc-workflow-badge">
            <Sparkles size={13} className="text-[#ff763b]" />
            <span>THE 4-STAGE PIPELINE</span>
          </div>
          <h2 id="workflow-title" className="vqc-workflow-title">
            FROM GOOD
            <br />
            TO VERIFIED.
          </h2>
          <p className="vqc-workflow-subtitle">
            A continuous, closed-loop machine vision workflow built specifically for small shop floors.
          </p>
        </div>

        {/* Animated Laser Progress Line */}
        <div className="vqc-workflow-progress-track" aria-hidden="true">
          <div className="vqc-workflow-progress-bar" />
          <div className="vqc-workflow-laser-dot" />
        </div>

        {/* Horizontal 4-Stage Editorial Cards */}
        <div className="vqc-workflow-grid">
          {WORKFLOW_STEPS.map((step, idx) => {
            const Icon = step.icon
            const isSelected = activeStep === idx

            return (
              <motion.article
                key={step.number}
                className={`vqc-step-card ${isSelected ? 'is-selected' : ''}`}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                onClick={() => setActiveStep(idx)}
              >
                {/* Step Index & Icon */}
                <div className="vqc-step-top">
                  <span className="vqc-step-num">{step.number}</span>
                  <div className="vqc-step-icon-wrap">
                    <Icon size={18} strokeWidth={1.75} />
                  </div>
                </div>

                {/* Step Titles */}
                <div className="vqc-step-content">
                  <h3 className="vqc-step-name">{step.title}</h3>
                  <p className="vqc-step-tagline">{step.tagline}</p>
                  <p className="vqc-step-detail">{step.detail}</p>
                </div>

                {/* Technical Bottom Chip */}
                <div className="vqc-step-bottom">
                  <div className="vqc-step-badge">
                    <span className="vqc-step-dot" />
                    <span>{step.visualBadge}</span>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
