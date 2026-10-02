import { useCallback, useEffect, useRef, useState } from 'react'
export function useInspectionCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const stream = useRef<MediaStream | null>(null)
  const generation = useRef(0)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [device, setDevice] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'ready'>('idle')
  const [error, setError] = useState('')
  const enumerate = useCallback(async () => {
    if (navigator.mediaDevices?.enumerateDevices) setDevices((await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'videoinput'))
  }, [])
  const stop = useCallback(() => {
    generation.current++
    stream.current?.getTracks().forEach(track => track.stop())
    stream.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setState('idle')
  }, [])
  const start = useCallback(async () => {
    stop(); setError(''); setState('loading')
    const request = generation.current
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera access requires localhost or HTTPS in a supported browser.')
      const media = await navigator.mediaDevices.getUserMedia({ audio: false, video: { width: { ideal: 1920 }, height: { ideal: 1080 }, ...(device ? { deviceId: { exact: device } } : { facingMode: 'environment' }) } })
      if (request !== generation.current) { media.getTracks().forEach(track => track.stop()); return }
      stream.current = media
      media.getVideoTracks()[0].addEventListener('ended', () => { if (stream.current === media) { stop(); setError('Camera disconnected. Reconnect it and start the camera again.') } })
      if (videoRef.current) { videoRef.current.srcObject = media; await videoRef.current.play() }
      await enumerate()
      if (request === generation.current) setState('ready')
    } catch (e) {
      if (request !== generation.current) return
      stop()
      const name = e instanceof Error ? e.name : ''
      setError(name === 'NotAllowedError' ? 'Camera access was denied. Enable camera permissions in your browser settings and try again.' : name === 'NotFoundError' ? 'No camera detected. Connect your USB camera and retry.' : name === 'NotReadableError' ? 'Camera is in use or unavailable. Close other camera apps and retry.' : name === 'OverconstrainedError' ? 'Selected camera is unavailable. Select another camera.' : e instanceof Error ? e.message : 'Camera could not start.')
    }
  }, [device, enumerate, stop])
  useEffect(() => {
    void navigator.mediaDevices?.enumerateDevices().then(items => setDevices(items.filter(d => d.kind === 'videoinput'))).catch(() => {})
    navigator.mediaDevices?.addEventListener('devicechange', enumerate)
    return () => { stop(); navigator.mediaDevices?.removeEventListener('devicechange', enumerate) }
  }, [enumerate, stop])
  async function capture(): Promise<Blob> {
    const current = videoRef.current
    if (!current || current.readyState < 2 || !current.videoWidth) throw new Error('Wait for the camera to be ready.')
    const canvas = document.createElement('canvas')
    canvas.width = current.videoWidth; canvas.height = current.videoHeight
    canvas.getContext('2d')!.drawImage(current, 0, 0)
    return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not capture the camera frame.')), 'image/png'))
  }
  return { videoRef, devices, device, select: (id: string) => { stop(); setDevice(id) }, state, error, start, stop, capture }
}
