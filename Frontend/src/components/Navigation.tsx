import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Menu, ScanLine, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export function Navigation() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const nav = useRef<HTMLElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    function closeOutside(event: PointerEvent) {
      if (!nav.current?.contains(event.target as Node)) setOpen(false)
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        toggle.current?.focus()
      }
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <nav ref={nav} className="navigation" aria-label="Main navigation" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
    }}>
      <div className="brand-pill flex items-center">
        <Link to="/" className="brand-link flex items-center gap-2.5" aria-label="VisionQC home" onClick={() => setOpen(false)}>
          <ScanLine size={20} strokeWidth={1.5} className="text-orange-400" aria-hidden="true" />
          <span>VisionQC</span>
        </Link>
        <button ref={toggle} className="menu-toggle" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="nav-links" onClick={() => setOpen(!open)}>
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>
      {open && <div id="nav-links" className="nav-dropdown">
        <Link to="/" aria-current={location.pathname === '/' ? 'page' : undefined} onClick={() => setOpen(false)}>Overview <ArrowUpRight size={15} /></Link>
        <Link to="/inspection" aria-current={location.pathname === '/inspection' ? 'page' : undefined} onClick={() => setOpen(false)}>Start inspection <ArrowUpRight size={15} /></Link>
      </div>}
    </nav>
  )
}
