import { useState } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export function FinalCTASection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (email.trim()) {
      setSubmitted(true)
    }
  }

  return (
    <section className="vqc-final-cta-section" id="get-started" aria-labelledby="final-cta-title">
      <div className="vqc-cta-container">
        <motion.div
          className="vqc-cta-banner"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
        >
          {/* Subtle Industrial Reticle & Scan Lines */}
          <div className="vqc-cta-bg-grid" aria-hidden="true" />
          <div className="vqc-cta-scan-laser" aria-hidden="true" />
          
          <div className="vqc-cta-inner-layout">
            {/* Left Headline Area */}
            <div className="vqc-cta-headline-block">
              <div className="vqc-cta-badge">
                <Sparkles size={13} className="text-[#ff763b]" />
                <span>ZERO DEFECT LABELS REQUIRED</span>
              </div>
              <h2 id="final-cta-title" className="vqc-cta-headline">
                START
                <br />
                INSPECTING
                <br />
                SMARTER.
              </h2>
              <p className="vqc-cta-support-text">
                Teach VisionQC what good looks like. Then let every new unit prove itself.
              </p>
            </div>

            {/* Right Action & Form Area (Inspired by reference inline email / CTA bar) */}
            <div className="vqc-cta-actions-block">
              <div className="vqc-cta-bullet-list">
                <div className="vqc-cta-bullet">
                  <CheckCircle2 size={15} className="text-[#ff763b]" />
                  <span>20–30 normal sample images to bootstrap</span>
                </div>
                <div className="vqc-cta-bullet">
                  <CheckCircle2 size={15} className="text-[#ff763b]" />
                  <span>Runs entirely inside standard webcams &amp; browsers</span>
                </div>
                <div className="vqc-cta-bullet">
                  <CheckCircle2 size={15} className="text-[#ff763b]" />
                  <span>Sub-millimeter localized anomaly heatmaps</span>
                </div>
              </div>

              {/* Direct Start Inspection Button & Email Form */}
              <div className="vqc-cta-form-wrap">
                {submitted ? (
                  <div className="vqc-cta-success-msg">
                    <CheckCircle2 size={18} className="text-[#c5e2ba]" />
                    <span>Access granted. Redirecting to workspace...</span>
                    <Link to="/inspection" className="vqc-cta-inline-link">
                      Launch Workbench Now →
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="vqc-cta-input-form">
                    <input
                      type="email"
                      placeholder="ENTER YOUR FACILITY EMAIL..."
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="vqc-cta-email-input"
                      aria-label="Work email address"
                    />
                    <button type="submit" className="vqc-cta-submit-btn" aria-label="Start Inspection">
                      <ArrowRight size={18} />
                    </button>
                  </form>
                )}

                {/* Primary Button fallback and secondary link */}
                <div className="vqc-cta-sublinks">
                  <Link to="/inspection" className="vqc-cta-primary-btn">
                    <span>START INSPECTION</span>
                    <ArrowRight size={16} />
                  </Link>
                  <a href="#workflow" className="vqc-cta-secondary-link">
                    EXPLORE HOW IT WORKS
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Corner Brackets */}
          <div className="vqc-cta-reticle-corner tl" aria-hidden="true" />
          <div className="vqc-cta-reticle-corner tr" aria-hidden="true" />
          <div className="vqc-cta-reticle-corner bl" aria-hidden="true" />
          <div className="vqc-cta-reticle-corner br" aria-hidden="true" />
        </motion.div>
      </div>
    </section>
  )
}
