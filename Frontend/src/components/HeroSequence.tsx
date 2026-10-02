import { useEffect, useRef, type RefObject } from 'react'

const FRAME_COUNT = 240
const frameUrl = (index: number) =>
  import.meta.env.BASE_URL + 'frames/f_' + String(index + 1).padStart(4, '0') + '.webp'

/** Scroll is the playback clock; RAF only eases toward its current target. */
export function HeroSequence({ scrollArea }: { scrollArea: RefObject<HTMLDivElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const area = scrollArea.current
    const hero = canvas?.parentElement
    const context = canvas?.getContext('2d', { alpha: false })
    if (!canvas || !area || !hero || !context) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const images = new Map<number, HTMLImageElement>()
    const loading = new Map<number, HTMLImageElement>()
    const failed = new Set<number>()
    // Coarse coverage first, then fill every gap. Scrubbed-to frames take priority.
    const queue = [...new Set([0, FRAME_COUNT - 1,
      ...Array.from({ length: 20 }, (_, i) => i * 12),
      ...Array.from({ length: FRAME_COUNT }, (_, i) => i)])]
    let disposed = false
    let target = 0
    let current = 0
    let frameRequest = 0
    let previousTime = 0
    let lastDrawn = -1
    let dirty = true
    let dpr = 0

    function measureProgress() {
      const bounds = area!.getBoundingClientRect()
      const distance = Math.max(1, bounds.height - window.innerHeight)
      target = motion.matches ? 0 : Math.min(1, Math.max(0, -bounds.top / distance)) * (FRAME_COUNT - 1)
    }

    function resize() {
      const width = hero!.clientWidth
      const height = hero!.clientHeight
      dpr = window.devicePixelRatio || 1
      canvas!.width = Math.max(1, Math.round(width * dpr))
      canvas!.height = Math.max(1, Math.round(height * dpr))
      // Let a taller mobile layout scroll into view before pinning its bottom.
      hero!.style.setProperty('--hero-pin-top', Math.min(0, window.innerHeight - height) + 'px')
      dirty = true
      measureProgress()
      if (motion.matches) draw(0)
    }

    function draw(index: number) {
      if (motion.matches && !images.has(0)) return
      let available = index
      if (!images.has(available)) {
        let nearestDistance = Infinity
        for (const loaded of images.keys()) {
          const distance = Math.abs(loaded - index)
          if (distance < nearestDistance) {
            available = loaded
            nearestDistance = distance
          }
        }
      }
      const image = images.get(available)
      if (!image || (!dirty && available === lastDrawn)) return
      const scale = Math.max(canvas!.width / image.naturalWidth, canvas!.height / image.naturalHeight)
      const drawWidth = image.naturalWidth * scale
      const drawHeight = image.naturalHeight * scale
      context!.drawImage(image, (canvas!.width - drawWidth) / 2,
        (canvas!.height - drawHeight) / 2, drawWidth, drawHeight)
      canvas!.style.opacity = '1'
      canvas!.dataset.frame = String(available + 1)
      lastDrawn = available
      dirty = false
    }

    function pump() {
      if (disposed) return
      const wanted = Math.round(target)
      const candidates = motion.matches ? [0] :
        [wanted, Math.round(current), wanted + 1, wanted - 1, ...queue]
      for (const index of candidates) {
        if (loading.size >= 4) break
        if (index < 0 || index >= FRAME_COUNT || images.has(index) || loading.has(index) || failed.has(index)) continue
        const image = new Image()
        image.decoding = 'async'
        loading.set(index, image)
        const settle = (ok: boolean) => {
          if (disposed) return
          loading.delete(index)
          image.onload = null
          image.onerror = null
          if (ok) images.set(index, image)
          else failed.add(index)
          dirty = true
          if (motion.matches) draw(0)
          pump()
        }
        image.onload = () => { void image.decode().then(() => settle(true), () => settle(false)) }
        image.onerror = () => settle(false)
        image.src = frameUrl(index)
      }
    }

    function tick(time: number) {
      if (disposed || motion.matches) return
      measureProgress()
      if (dpr !== (window.devicePixelRatio || 1)) resize()
      const elapsed = previousTime ? Math.min(time - previousTime, 64) : 16.67
      previousTime = time
      current += (target - current) * (1 - Math.exp(-elapsed / 85))
      if (Math.abs(target - current) < 0.01) current = target
      draw(Math.round(current))
      pump()
      frameRequest = requestAnimationFrame(tick)
    }

    function onScroll() {
      measureProgress()
      pump()
    }

    function onMotionChange() {
      cancelAnimationFrame(frameRequest)
      previousTime = 0
      measureProgress()
      if (motion.matches) {
        current = 0
        draw(0)
      } else frameRequest = requestAnimationFrame(tick)
      pump()
    }

    const observer = new ResizeObserver(resize)
    observer.observe(hero)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', resize)
    motion.addEventListener('change', onMotionChange)
    resize()
    current = target
    onMotionChange()

    return () => {
      disposed = true
      cancelAnimationFrame(frameRequest)
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', resize)
      motion.removeEventListener('change', onMotionChange)
      for (const image of loading.values()) {
        image.onload = null
        image.onerror = null
        image.src = ''
      }
      loading.clear()
      images.clear()
      hero.style.removeProperty('--hero-pin-top')
    }
  }, [scrollArea])

  return <canvas ref={canvasRef} className="hero-sequence" aria-hidden="true" />
}
