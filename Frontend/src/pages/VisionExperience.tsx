import { useRef } from 'react'
import { ArrowUpRight, ScanLine } from 'lucide-react'
import { MotionConfig, useInView } from 'motion/react'
import type { VisionDemo } from '../hooks/useVisionDemo'
import { AnalyticsDashboard } from '../components/experience/AnalyticsDashboard'
import { InteractiveDemo } from '../components/experience/InteractiveDemo'
import { AnalysisAnimation, AnomalyHeatmap, InspectionHistory, InspectionResults, InspectionSection, ProductManagement, ProductSetup, TrainingSection, WorkflowStatus, WorkspaceHeader } from '../components/experience/InspectionWorkbench'
import { Architecture, Benefits, CoreConcept, FinalCTA, Footer, HowItWorks, Limitations, MLConcept, PrivacySection, ProblemSection, UseCases } from '../components/experience/StorySections'
import '../styles/experience.css'

export function VisionExperience({ demo, workspace = false }: { demo: VisionDemo; workspace?: boolean }) {
  const pageRef = useRef<HTMLDivElement>(null)
  const visible = useInView(pageRef)
  return <MotionConfig reducedMotion="user"><div ref={pageRef} className="vqc-root">
    <a className="vqc-skip" href="#inspection">Skip to inspection workspace</a>
    {workspace && <WorkspaceHeader />}
    <nav className="vqc-section-nav" aria-label="Explore VisionQC"><a href={workspace ? '/' : '#problem'} className="vqc-nav-brand"><ScanLine size={18} /><span>VISIONQC <small>/ {workspace ? 'WORKSPACE' : 'THE PROCESS'}</small></span></a>
      <div><a href="#training">Learn</a><a href="#inspection">Inspect</a><a href="#analytics">Analyze</a><a href="#demo">Try the Demo<ArrowUpRight size={12} /></a></div>
    </nav>
    <div className="vqc-content">
      {!workspace && <><ProblemSection /><CoreConcept /><HowItWorks /></>}
      <ProductSetup demo={demo} /><TrainingSection demo={demo} /><InspectionSection demo={demo} />
      <AnalysisAnimation demo={demo} /><InspectionResults demo={demo} /><AnomalyHeatmap demo={demo} />
      <InspectionHistory demo={demo} /><AnalyticsDashboard demo={demo} /><ProductManagement demo={demo} />
      <InteractiveDemo />
      {!workspace && <><Benefits /><UseCases /><Architecture /><MLConcept /><PrivacySection /><Limitations /><FinalCTA /></>}
      <Footer />
    </div>
    <WorkflowStatus demo={demo} visible={visible} />
  </div></MotionConfig>
}
