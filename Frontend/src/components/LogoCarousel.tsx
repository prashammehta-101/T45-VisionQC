import { useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'motion/react'
import { Pause, Play } from 'lucide-react'
import { interfaceLogos, secondLogoRow, type InterfaceLogo } from '../data/interfaceLogos'
import '../styles/logo-carousel.css'

function LogoMark({ id }: { id: InterfaceLogo['id'] }) {
  return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
    {id === 'react' && <g stroke="currentColor" strokeWidth="1.4"><ellipse cx="16" cy="16" rx="14" ry="5.5" /><ellipse cx="16" cy="16" rx="14" ry="5.5" transform="rotate(60 16 16)" /><ellipse cx="16" cy="16" rx="14" ry="5.5" transform="rotate(120 16 16)" /><circle cx="16" cy="16" r="2.4" fill="currentColor" stroke="none" /></g>}
    {id === 'typescript' && <><rect x="2" y="2" width="28" height="28" rx="2" fill="currentColor" /><path d="M7 14H19M13 14V26M26 15C21 11 18 18 23 20C28 22 26 28 20 25" stroke="#17131e" strokeWidth="2.3" /></>}
    {id === 'vite' && <><path d="M2 5L15 29C15.4 29.8 16.6 29.8 17 29L30 5L16 8Z" fill="currentColor" opacity=".5" /><path d="M18 1L10 16H16L13 29L25 11H18L21 1Z" fill="currentColor" /></>}
    {id === 'tailwind' && <path d="M16 6C10.7 6 7.3 8.7 6 14C8 11.3 10.3 10.3 13 11C14.5 11.4 15.6 12.5 16.8 13.7C18.7 15.6 20.9 18 26 18C31.3 18 34.7 15.3 36 10C34 12.7 31.7 13.7 29 13C27.5 12.6 26.4 11.5 25.2 10.3C23.3 8.4 21.1 6 16 6ZM6 18C.7 18-2.7 20.7-4 26C-2 23.3.3 22.3 3 23C4.5 23.4 5.6 24.5 6.8 25.7C8.7 27.6 10.9 30 16 30C21.3 30 24.7 27.3 26 22C24 24.7 21.7 25.7 19 25C17.5 24.6 16.4 23.5 15.2 22.3C13.3 20.4 11.1 18 6 18Z" transform="translate(4 1) scale(.75)" fill="currentColor" />}
    {id === 'motion' && <g fill="currentColor"><path d="M2 23L12 9H21L11 23Z" /><path d="M14 23L24 9H29L19 23Z" opacity=".65" /><path d="M23 23L30 13V23Z" opacity=".35" /></g>}
    {id === 'lucide' && <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="16" cy="16" r="12" /><path d="M10 19C13 24 20 24 23 17M11 11H11.1M21 11H21.1" /></g>}
  </svg>
}

function LogoRow({ logos, reverse = false }: { logos: InterfaceLogo[]; reverse?: boolean }) {
  return <div className={'vqc-logo-row' + (reverse ? ' vqc-logo-row-reverse' : '')} aria-hidden={reverse || undefined}>
    <div className="vqc-logo-track">
      {[0, 1].map(copy => <ul key={copy} className="vqc-logo-group" aria-label={copy === 0 && !reverse ? 'Frontend technologies' : undefined} aria-hidden={copy === 1 || undefined}>
        {logos.map(logo => <li key={logo.id} className={'vqc-logo-item vqc-logo-' + logo.id}>
          <LogoMark id={logo.id} /><span>{logo.name}</span>
        </li>)}
      </ul>)}
    </div>
  </div>
}

/** Two equal copies per row make -50% exactly one complete, seamless cycle. */
export function LogoCarousel() {
  const section = useRef<HTMLElement>(null)
  const visible = useInView(section, { margin: '100px 0px 100px 0px' })
  const reduced = useReducedMotion()
  const [paused, setPaused] = useState(false)

  return <section ref={section} className="vqc-logo-carousel" aria-labelledby="interface-stack-title"
    data-paused={paused || !visible || !!reduced}>
    <div className="vqc-logo-heading">
      <div><span className="vqc-logo-eyebrow">THE INTERFACE STACK</span><h2 id="interface-stack-title">A modern foundation.<br className="vqc-logo-mobile-break" /> A seamless experience.</h2></div>
      <button type="button" className="vqc-logo-pause" disabled={!!reduced} aria-pressed={paused || !!reduced}
        aria-label={reduced ? 'Logo animation disabled by reduced-motion preference' : paused ? 'Resume logo animation' : 'Pause logo animation'}
        onClick={() => setPaused(value => !value)}>
        {paused || reduced ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
        <span>{reduced ? 'Reduced motion' : paused ? 'Resume' : 'Pause'}</span>
      </button>
    </div>
    <div className="vqc-logo-window">
      <LogoRow logos={interfaceLogos} />
      <LogoRow logos={secondLogoRow} reverse />
    </div>
    <p className="vqc-logo-caption">The technologies behind this interface.</p>
  </section>
}
