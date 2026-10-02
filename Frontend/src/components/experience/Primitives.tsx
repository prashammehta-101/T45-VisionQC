import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useReducedMotion, useInView } from 'motion/react'
import { ArrowUpRight, Check, Upload, X } from 'lucide-react'
import type { Outcome } from '../../data/demoData'

export function Section({ id, number, label, title, intro, children, className = '' }: {
  id: string; number: string; label: string; title: string; intro?: string; children: ReactNode; className?: string
}) {
  const reduced = useReducedMotion()
  return <motion.section id={id} className={'vqc-section ' + className} aria-labelledby={id + '-title'}
    initial={reduced ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.06 }} transition={{ duration: .55 }}>
    <div className="vqc-section-heading">
      <span className="vqc-kicker"><span>{number}</span> / {label}</span>
      <h2 id={id + '-title'}>{title}</h2>
      {intro && <p>{intro}</p>}
    </div>
    {children}
  </motion.section>
}
export function Badge({ outcome }: { outcome: Outcome }) {
  return <span className={'vqc-badge ' + (outcome === 'PASS' ? 'is-pass' : 'is-review')}>
    {outcome === 'PASS' ? <Check size={12} /> : <span className="vqc-status-dot" />}
    {outcome === 'PASS' ? 'PASS' : 'NEEDS REVIEW'}
  </span>
}
export function DemoLabel({ children = 'Interactive demo · simulated data' }: { children?: ReactNode }) {
  return <span className="vqc-demo-label"><span />{children}</span>
}
export function JumpLink({ to, children, primary = false }: { to: string; children: ReactNode; primary?: boolean }) {
  return <a href={to} className={'vqc-button ' + (primary ? 'is-primary' : '')}>{children}<ArrowUpRight size={16} /></a>
}
export function Counter({ value, decimals = 0, suffix = '' }: { value: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const visible = useInView(ref, { once: true })
  const reduced = useReducedMotion()
  const [count, setCount] = useState(value)
  useEffect(() => {
    if (!visible || reduced) return
    let frame: number
    const start = performance.now()
    const update = (now: number) => {
      const fraction = Math.min(1, (now - start) / 850)
      setCount(value * (1 - Math.pow(1 - fraction, 3)))
      if (fraction < 1) frame = requestAnimationFrame(update)
    }
    frame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frame)
  }, [value, visible, reduced])
  return <span ref={ref} aria-label={value.toFixed(decimals) + suffix}>{(reduced ? value : count).toLocaleString('en-US', { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}{suffix}</span>
}
export function UploadZone({ title, multiple = false, disabled = false, onFiles }: {
  title: string; multiple?: boolean; disabled?: boolean; onFiles: (files: File[]) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  return <div className={'vqc-upload ' + (dragging ? 'is-dragging' : '')}
    onDragOver={event => { event.preventDefault(); if (!disabled) setDragging(true) }}
    onDragLeave={() => setDragging(false)}
    onDrop={event => { event.preventDefault(); setDragging(false); if (!disabled) onFiles(Array.from(event.dataTransfer.files).slice(0, multiple ? 60 : 1)) }}>
    <Upload size={25} strokeWidth={1.3} aria-hidden="true" />
    <strong>{title}</strong><span>or choose files from your device</span>
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple={multiple} disabled={disabled}
      aria-label={title} className="vqc-file-input" onChange={event => {
        if (event.target.files) onFiles(Array.from(event.target.files))
        event.target.value = ''
      }} />
    <button type="button" className="vqc-button" disabled={disabled} onClick={() => input.current?.click()}>Browse Files<ArrowUpRight size={15} /></button>
    <small>JPG, PNG, WebP · up to 10 MB each{multiple ? ' · 20–30 recommended' : ''}</small>
  </div>
}
export function ProductImage({ src, name, mode = 'original', anomaly = false, scanning = false }: {
  src: string; name: string; mode?: 'original' | 'heatmap' | 'overlay'; anomaly?: boolean; scanning?: boolean
}) {
  return <div className={'vqc-product-image vqc-mode-' + mode + (scanning ? ' is-scanning' : '')}>
    <img src={src} alt={name} loading="lazy" decoding="async" />
    {mode !== 'original' && <div className={'vqc-map-layer ' + (anomaly ? 'is-anomaly' : 'is-normal')} aria-hidden="true">
      {anomaly && <><span className="vqc-hotspot" /><span className="vqc-region"><i />DETECTED REGION</span></>}
    </div>}
    <span className="vqc-image-cross cross-a" aria-hidden="true">+</span>
    <span className="vqc-image-cross cross-b" aria-hidden="true">+</span>
    <span className="vqc-image-code" aria-hidden="true">VQC / VISUAL FIELD</span>
    {scanning && <span className="vqc-scan" aria-hidden="true" />}
  </div>
}
export function CameraCapture({ onCapture, onClose }: { onCapture: (file: File) => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    const focusBefore = document.activeElement as HTMLElement | null
    dialog.current?.showModal()
    let stream: MediaStream | undefined
    let canceled = false
    async function connect() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera access requires HTTPS or localhost. You can upload an image instead.')
        const connection = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
        if (canceled) { connection.getTracks().forEach(track => track.stop()); return }
        stream = connection
        if (video.current) { video.current.srcObject = stream; await video.current.play() }
        if (!canceled) setReady(true)
      } catch (issue) {
        if (!canceled) setError(issue instanceof Error && issue.message.includes('HTTPS') ? issue.message : 'Camera unavailable or permission denied. You can upload an image instead.')
      }
    }
    void connect()
    return () => { canceled = true; stream?.getTracks().forEach(track => track.stop()); focusBefore?.focus() }
  }, [])
  function capture() {
    const feed = video.current
    if (!feed || !feed.videoWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = feed.videoWidth
    canvas.height = feed.videoHeight
    canvas.getContext('2d')?.drawImage(feed, 0, 0)
    canvas.toBlob(blob => {
      if (blob) { onCapture(new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })); onClose() }
      else setError('Could not capture this image. Please try again.')
    }, 'image/jpeg', .9)
  }
  return <dialog className="vqc-camera" ref={dialog} aria-labelledby="camera-title" onCancel={event => { event.preventDefault(); onClose() }}>
    <div className="vqc-panel-head"><h3 id="camera-title">Capture a product image</h3><button type="button" className="vqc-icon-button" aria-label="Close camera" onClick={onClose}><X size={20} /></button></div>
    <video ref={video} muted playsInline aria-label="Live camera preview" />
    {error && <p role="alert">{error}</p>}
    <div className="vqc-actions"><button className="vqc-button is-primary" disabled={!ready} onClick={capture}>Capture Image</button><button className="vqc-button" onClick={onClose}>Cancel</button></div>
    <p className="vqc-fine">Camera stops when this dialog closes. Analysis is simulated.</p>
  </dialog>
}
