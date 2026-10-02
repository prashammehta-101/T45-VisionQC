import { motion } from 'motion/react'
import { ArrowUpRight, Crosshair, Radio, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

export function DeviationFeatureBanner() {
  return (
    <section className="vqc-banner-section" aria-label="Anomaly Visualization Feature">
      <div className="vqc-banner-container">
        <motion.div
          className="vqc-banner-card"
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
        >
          {/* Left Visual Column - Large Manufactured Component with Scanning HUD */}
          <div className="vqc-banner-visual-col">
            <div className="vqc-banner-img-wrapper">
              <img
                src="/assets/banner-deviation-scan.jpg"
                alt="Precision manufactured industrial valve inspected with machine vision"
                className="vqc-banner-photo"
                loading="lazy"
              />

              {/* Technical Grid Overlay */}
              <div className="vqc-banner-tech-grid" aria-hidden="true" />

              {/* HUD Scan Reticle & Animated Scanline */}
              <div className="vqc-banner-scan-reticle" aria-hidden="true">
                <div className="vqc-banner-laser-line" />
                <div className="vqc-banner-tag-ai">
                  <Radio size={12} className="text-[#ff763b] animate-pulse" />
                  <span>AI SCAN / REALTIME</span>
                </div>
              </div>

              {/* Localized Orange Anomaly Heatmap Glow */}
              <div className="vqc-banner-heatmap-bubble" aria-hidden="true">
                <div className="vqc-heatmap-contour c1" />
                <div className="vqc-heatmap-contour c2" />
                <div className="vqc-heatmap-label">
                  <span>DEVIATION HEATMAP</span>
                  <strong>+2.8% LOC</strong>
                </div>
              </div>

              {/* Status HUD Overlays */}
              <div className="vqc-banner-hud-bottom">
                <div className="vqc-hud-stat-box">
                  <span className="vqc-hud-lbl">CONFIDENCE</span>
                  <strong className="vqc-hud-val">97.4%</strong>
                </div>

                <div className="vqc-hud-stat-box is-pass">
                  <span className="vqc-hud-lbl">STATUS</span>
                  <div className="vqc-hud-pass-badge">
                    <ShieldCheck size={14} />
                    <strong>PASS</strong>
                  </div>
                </div>
              </div>

              {/* Technical Spec / Barcode Stamp */}
              <div className="vqc-banner-spec-stamp" aria-hidden="true">
                <div className="vqc-barcode-lines">
                  <span /><span /><span /><span /><span /><span /><span /><span /><span /><span />
                </div>
                <span className="vqc-spec-code">ENGINEERED FOR PRECISION // VQC-SPEC-09</span>
              </div>
            </div>
          </div>

          {/* Right Content Column - Huge Editorial Headline & Actions */}
          <div className="vqc-banner-content-col">
            {/* Background HUD Wireframe Element */}
            <div className="vqc-banner-wireframe-hud" aria-hidden="true">
              <svg viewBox="0 0 160 160" fill="none" className="vqc-wire-globe">
                <circle cx="80" cy="80" r="70" stroke="#ffffff12" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="80" cy="80" r="45" stroke="#ffffff1a" strokeWidth="1" />
                <ellipse cx="80" cy="80" rx="70" ry="25" stroke="#ffffff15" strokeWidth="1" />
                <ellipse cx="80" cy="80" rx="25" ry="70" stroke="#ffffff15" strokeWidth="1" />
                <line x1="80" y1="5" x2="80" y2="155" stroke="#ff763b44" strokeWidth="1" />
                <line x1="5" y1="80" x2="155" y2="80" stroke="#ff763b44" strokeWidth="1" />
                <circle cx="80" cy="80" r="3" fill="#ff763b" />
              </svg>
            </div>

            <div className="vqc-banner-copy-block">
              <div className="vqc-banner-eyebrow">
                <Crosshair size={13} className="text-[#ff763b]" />
                <span>SPATIAL ANOMALY LOCALIZATION</span>
              </div>

              <h2 className="vqc-banner-headline">
                SEE THE
                <br />
                DEVIATION.
              </h2>

              <p className="vqc-banner-paragraph">
                VisionQC doesn’t just tell you that a product failed. It shows exactly where
                the product differs from what normal should look like.
              </p>

              {/* Technical Spec List */}
              <div className="vqc-banner-specs">
                <div className="vqc-spec-chip">
                  <span className="vqc-spec-key">RESOLUTION</span>
                  <span className="vqc-spec-data">SUB-MILLIMETER</span>
                </div>
                <div className="vqc-spec-chip">
                  <span className="vqc-spec-key">INFERENCE</span>
                  <span className="vqc-spec-data">&lt; 14 MS</span>
                </div>
                <div className="vqc-spec-chip">
                  <span className="vqc-spec-key">DATASET REQ</span>
                  <span className="vqc-spec-data">0 DEFECT LABELS</span>
                </div>
              </div>

              {/* CTA Button */}
              <div className="vqc-banner-cta-row">
                <Link to="/inspection" className="vqc-banner-btn">
                  <span>START INSPECTION</span>
                  <ArrowUpRight size={17} />
                </Link>
                <span className="vqc-banner-hint">Tested across machined parts, castings &amp; assemblies</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
