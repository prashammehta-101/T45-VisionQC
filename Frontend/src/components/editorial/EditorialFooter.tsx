import { ArrowUpRight, Crosshair, Github, Linkedin, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

export function EditorialFooter() {
  return (
    <footer className="vqc-editorial-footer" role="contentinfo" aria-label="VisionQC Footer">
      <div className="vqc-footer-container">
        {/* Main Footer Upper Row */}
        <div className="vqc-footer-main-grid">
          {/* Brand Col */}
          <div className="vqc-footer-brand-col">
            <Link to="/" className="vqc-footer-logo-link">
              <span className="vqc-footer-logo-mark">VISIONQC</span>
              <span className="vqc-footer-logo-tag">AI</span>
            </Link>
            <p className="vqc-footer-brand-desc">
              AI-powered visual quality inspection for modern manufacturing.
            </p>
            <div className="vqc-footer-badge">
              <span className="vqc-footer-pulse-dot" />
              <span>SYSTEM STATUS: OPERATIONAL</span>
            </div>
          </div>

          {/* Nav Column 1: PRODUCT */}
          <div className="vqc-footer-nav-col">
            <h4 className="vqc-footer-col-title">PRODUCT</h4>
            <ul className="vqc-footer-link-list">
              <li><Link to="/inspection">Inspection</Link></li>
              <li><a href="#capabilities">Normal Learning</a></li>
              <li><a href="#capabilities">Heatmaps</a></li>
              <li><a href="#threshold">Thresholds</a></li>
              <li><a href="#quality-control">Inspection Logs</a></li>
            </ul>
          </div>

          {/* Nav Column 2: PLATFORM */}
          <div className="vqc-footer-nav-col">
            <h4 className="vqc-footer-col-title">PLATFORM</h4>
            <ul className="vqc-footer-link-list">
              <li><a href="#workflow">How It Works</a></li>
              <li><a href="#quality-control">Dashboard</a></li>
              <li><a href="#insights">Analytics</a></li>
              <li><Link to="/inspection">Documentation</Link></li>
            </ul>
          </div>

          {/* Nav Column 3: COMPANY */}
          <div className="vqc-footer-nav-col">
            <h4 className="vqc-footer-col-title">COMPANY</h4>
            <ul className="vqc-footer-link-list">
              <li><a href="#capabilities">About</a></li>
              <li><a href="#workflow">Technology</a></li>
              <li><a href="mailto:contact@visionqc.ai">Contact</a></li>
            </ul>
          </div>

          {/* Nav Column 4: SOCIAL / LINKS */}
          <div className="vqc-footer-nav-col">
            <h4 className="vqc-footer-col-title">SOCIAL / LINKS</h4>
            <ul className="vqc-footer-link-list">
              <li>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="vqc-footer-ext-link">
                  <Github size={13} />
                  <span>GitHub</span>
                  <ArrowUpRight size={11} />
                </a>
              </li>
              <li>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="vqc-footer-ext-link">
                  <Linkedin size={13} />
                  <span>LinkedIn</span>
                  <ArrowUpRight size={11} />
                </a>
              </li>
              <li>
                <a href="mailto:hello@visionqc.ai" className="vqc-footer-ext-link">
                  <Mail size={13} />
                  <span>Email</span>
                  <ArrowUpRight size={11} />
                </a>
              </li>
            </ul>
          </div>

          {/* Right Visual Accent Thumbnail (Inspired by reference right footer graphic) */}
          <div className="vqc-footer-visual-col">
            <div className="vqc-footer-art-card">
              <img
                src="/assets/footer-accent-graphic.jpg"
                alt="VisionQC Anomaly Heatmap Signal"
                className="vqc-footer-art-img"
                loading="lazy"
              />
              <div className="vqc-footer-art-overlay">
                <div className="vqc-footer-art-meta">
                  <Crosshair size={12} className="text-[#ff763b]" />
                  <span>HEATMAP SPECTRA // ONLINE</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="vqc-footer-bottom-bar">
          <span className="vqc-footer-copyright">
            © 2026 VisionQC. All rights reserved.
          </span>

          <div className="vqc-footer-legal-links">
            <a id="privacy" href="#privacy">Privacy Policy</a>
            <span className="vqc-legal-divider">·</span>
            <a id="terms" href="#terms">Terms &amp; Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
