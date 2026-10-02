import { useState } from 'react'
import { motion } from 'motion/react'
import { ArrowUpRight, Crosshair, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

interface CapabilityCardData {
  id: string
  number: string
  title: string
  description: string
  image: string
  tag: string
  badgeContent: React.ReactNode
}

const CARDS: CapabilityCardData[] = [
  {
    id: 'learn-normal',
    number: '01',
    title: 'LEARN NORMAL',
    description:
      'Teach VisionQC what a good product looks like using just 20–30 reference images.',
    image: '/assets/card-learn-normal.jpg',
    tag: 'REFERENCE ENGINE',
    badgeContent: (
      <div className="vqc-card-overlay-badges">
        <div className="vqc-badge-row">
          <span className="vqc-unit-badge is-good">
            <span className="vqc-badge-dot" /> GOOD UNIT
          </span>
          <span className="vqc-unit-badge is-good">
            <span className="vqc-badge-dot" /> GOOD UNIT
          </span>
          <span className="vqc-unit-badge is-good">
            <span className="vqc-badge-dot" /> GOOD UNIT
          </span>
        </div>
        <div className="vqc-model-badge">
          <Sparkles size={11} className="text-[#ff763b]" />
          <span>NORMAL MODEL TRAINING</span>
        </div>
      </div>
    ),
  },
  {
    id: 'live-inspection',
    number: '02',
    title: 'LIVE INSPECTION',
    description:
      'Inspect each new unit directly through a webcam or phone camera.',
    image: '/assets/card-live-inspection.jpg',
    tag: 'OPTICAL INGESTION',
    badgeContent: (
      <div className="vqc-card-overlay-camera">
        <div className="vqc-camera-live-pill">
          <span className="vqc-pulse-dot" /> LIVE CAMERA
          <span className="vqc-active-label">● ACTIVE</span>
        </div>
        <div className="vqc-card-scan-reticle">
          <div className="vqc-reticle-corner tl" />
          <div className="vqc-reticle-corner tr" />
          <div className="vqc-reticle-corner bl" />
          <div className="vqc-reticle-corner br" />
          <div className="vqc-card-scan-laser" />
        </div>
      </div>
    ),
  },
  {
    id: 'detect-deviation',
    number: '03',
    title: 'DETECT DEVIATION',
    description:
      'Identify abnormal regions and visualize them using an AI-generated heatmap.',
    image: '/assets/card-detect-deviation.jpg',
    tag: 'ANOMALY REASONING',
    badgeContent: (
      <div className="vqc-card-overlay-deviation">
        <div className="vqc-card-heatmap-glow" />
        <div className="vqc-card-metrics-pill">
          <div className="vqc-metric-item">
            <span className="vqc-metric-lbl">DEVIATION</span>
            <strong className="vqc-metric-val is-accent">2.8%</strong>
          </div>
          <div className="vqc-metric-divider" />
          <div className="vqc-metric-item">
            <span className="vqc-metric-lbl">CONFIDENCE</span>
            <strong className="vqc-metric-val">97.4%</strong>
          </div>
        </div>
      </div>
    ),
  },
]

export function FeaturedCapabilities() {
  const [activeCard, setActiveCard] = useState<number>(0)

  return (
    <section className="vqc-featured-section" id="capabilities" aria-labelledby="featured-cap-title">
      <div className="vqc-featured-container">
        {/* Editorial Section Header */}
        <div className="vqc-featured-header">
          <div className="vqc-featured-title-col">
            <span className="vqc-featured-eyebrow">
              <Crosshair size={12} className="text-[#ff763b]" /> CORE ARCHITECTURE
            </span>
            <h2 id="featured-cap-title" className="vqc-featured-headline">
              VISIONQC
              <br />
              CAPABILITIES
            </h2>
          </div>

          <div className="vqc-featured-desc-col">
            <p className="vqc-featured-description">
              Everything needed to move from manual inspection to AI-assisted quality control.
            </p>
            <div className="vqc-featured-actions">
              <Link to="/inspection" className="vqc-editorial-link">
                <span>VIEW ALL CAPABILITIES</span>
                <ArrowUpRight size={15} />
              </Link>
              <div className="vqc-featured-pagination" aria-hidden="true">
                {['01', '02', '03'].map((num, i) => (
                  <button
                    key={num}
                    type="button"
                    className={`vqc-page-num ${activeCard === i ? 'is-active' : ''}`}
                    onClick={() => setActiveCard(i)}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3 Large Visual Cards Grid */}
        <div className="vqc-cards-grid">
          {CARDS.map((card, idx) => (
            <motion.article
              key={card.id}
              className={`vqc-cap-card ${activeCard === idx ? 'is-focused' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: idx * 0.12 }}
              onMouseEnter={() => setActiveCard(idx)}
            >
              <Link to="/inspection" className="vqc-card-inner-link" aria-label={`Inspect with ${card.title}`}>
                {/* Visual Canvas Area */}
                <div className="vqc-card-visual-frame">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="vqc-card-photo"
                    loading="lazy"
                  />
                  <div className="vqc-card-gradient-overlay" />
                  
                  {/* Top Tag & Number */}
                  <div className="vqc-card-meta-bar">
                    <span className="vqc-card-tag">{card.tag}</span>
                    <span className="vqc-card-index">{card.number}</span>
                  </div>

                  {/* Contextual Overlays */}
                  {card.badgeContent}
                </div>

                {/* Bottom Card Typography & CTA */}
                <div className="vqc-card-footer">
                  <div className="vqc-card-copy">
                    <h3 className="vqc-card-title">{card.title}</h3>
                    <p className="vqc-card-desc">{card.description}</p>
                  </div>
                  <div className="vqc-card-arrow-btn" aria-hidden="true">
                    <ArrowUpRight size={18} strokeWidth={2.2} />
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
