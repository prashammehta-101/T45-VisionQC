import { motion } from 'motion/react'
import {
  Layers,
  Camera,
  Activity,
  Sliders,
  FileSpreadsheet,
  Plus
} from 'lucide-react'

interface StripItem {
  number: string
  title: string
  desc: string
  icon: React.ElementType
}

const STRIP_ITEMS: StripItem[] = [
  {
    number: '01',
    title: 'NO LABELLED DATASET',
    desc: 'Start with just 20–30 good product images.',
    icon: Layers,
  },
  {
    number: '02',
    title: 'LIVE INSPECTION',
    desc: 'Inspect products through a webcam or phone camera.',
    icon: Camera,
  },
  {
    number: '03',
    title: 'AI DEVIATION MAP',
    desc: 'See exactly where the product differs from normal.',
    icon: Activity,
  },
  {
    number: '04',
    title: 'TUNABLE THRESHOLD',
    desc: 'Supervisors control the pass/fail sensitivity.',
    icon: Sliders,
  },
  {
    number: '05',
    title: 'INSPECTION LOGS',
    desc: "Track every inspection and today's rejection rate.",
    icon: FileSpreadsheet,
  },
]

export function CapabilityStrip() {
  return (
    <section className="vqc-strip-section" aria-label="Key VisionQC Capabilities">
      <div className="vqc-strip-container">
        <div className="vqc-strip-track">
          {STRIP_ITEMS.map((item, index) => {
            const Icon = item.icon
            return (
              <div key={item.number} className="vqc-strip-cell-wrapper">
                <motion.div
                  className="vqc-strip-item"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                >
                  <div className="vqc-strip-header">
                    <div className="vqc-strip-icon-box">
                      <Icon size={16} strokeWidth={1.75} className="vqc-strip-icon" />
                    </div>
                    <span className="vqc-strip-number">{item.number}</span>
                  </div>
                  <div className="vqc-strip-body">
                    <h3 className="vqc-strip-title">{item.title}</h3>
                    <p className="vqc-strip-desc">{item.desc}</p>
                  </div>
                </motion.div>
                {index < STRIP_ITEMS.length - 1 && (
                  <div className="vqc-strip-divider" aria-hidden="true">
                    <Plus size={12} className="vqc-strip-cross" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
