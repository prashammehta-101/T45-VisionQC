import { useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { Hero } from './components/Hero'
import { Navigation } from './components/Navigation'
import { VisionEditorialLanding } from './components/editorial/VisionEditorialLanding'
import { LiveWorkspace } from './pages/LiveWorkspace'

function RoutePosition() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      let target = hash.slice(1)
      try { target = decodeURIComponent(target) } catch { /* Keep malformed fragments harmless. */ }
      document.getElementById(target)?.scrollIntoView({ behavior: 'auto' })
    }
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}
function VisionQCRedirect() {
  useEffect(() => {
    window.location.replace('/visionqc/' + window.location.search + window.location.hash)
  }, [])
  return <a href="/visionqc/">Open VisionQC</a>
}
function NotFound() {
  return <main className="workspace-page min-h-svh"><Navigation /><section className="workspace-content px-6"><h1>Page not found.</h1><Link className="back-link" to="/">Return to VisionQC</Link></section></main>
}
export default function App() {
  return <><RoutePosition /><Routes>
    <Route path="/" element={<><Hero /><VisionEditorialLanding /></>} />
    <Route path="/inspection" element={<VisionQCRedirect />} />
    <Route path="/inspection/legacy" element={<LiveWorkspace />} />
    <Route path="*" element={<NotFound />} />
  </Routes></>
}
