import { CapabilityStrip } from './CapabilityStrip'
import { FeaturedCapabilities } from './FeaturedCapabilities'
import { DeviationFeatureBanner } from './DeviationFeatureBanner'
import { InspectionWorkflow } from './InspectionWorkflow'
import { LiveQualityControl } from './LiveQualityControl'
import { SupervisorControl } from './SupervisorControl'
import { RejectionInsights } from './RejectionInsights'
import { FinalCTASection } from './FinalCTASection'
import { EditorialFooter } from './EditorialFooter'
import '../../styles/editorial.css'

export function VisionEditorialLanding() {
  return (
    <div className="vqc-editorial-root">
      {/* SECTION 1 — CAPABILITY / TRUST STRIP */}
      <CapabilityStrip />

      {/* SECTION 2 — FEATURED VISIONQC CAPABILITIES (3 LARGE CARDS) */}
      <FeaturedCapabilities />

      {/* SECTION 3 — LARGE FEATURE BANNER ("SEE THE DEVIATION.") */}
      <DeviationFeatureBanner />

      {/* SECTION 4 — INSPECTION WORKFLOW ("FROM GOOD TO VERIFIED.") */}
      <InspectionWorkflow />

      {/* SECTION 5 — LIVE QUALITY CONTROL (DARK DASHBOARD PREVIEW) */}
      <LiveQualityControl />

      {/* SECTION 6 — SUPERVISOR CONTROL (TUNABLE THRESHOLD SLIDER) */}
      <SupervisorControl />

      {/* SECTION 7 — REJECTION RATE / INSIGHTS (WEEKLY CHART & TELEMETRY) */}
      <RejectionInsights />

      {/* SECTION 8 — FINAL CTA ("START INSPECTING SMARTER.") */}
      <FinalCTASection />

      {/* SECTION 9 — EDITORIAL FOOTER */}
      <EditorialFooter />
    </div>
  )
}
