import { useEffect, useRef, useState } from 'react'
import { inspectionHistory, products as initialProducts, type Inspection, type Outcome, type Sample } from '../data/demoData'
import { demoMetrics, validateImage } from '../lib/demoLogic'

export function useVisionDemo() {
  const [products, setProducts] = useState(initialProducts)
  const [selectedId, setSelectedId] = useState('cap')
  const [samples, setSamples] = useState<Record<string, Sample[]>>({})
  const [history, setHistory] = useState<Inspection[]>(inspectionHistory)
  const [result, setResult] = useState<Inspection>(inspectionHistory[1])
  const [inspectionImage, setInspectionImage] = useState<string | null>(null)
  const [imageSource, setImageSource] = useState<Inspection['source']>('demo')
  const [scenario, setScenario] = useState<Outcome>('REVIEW')
  const [training, setTraining] = useState<{ productId: string; progress: number } | null>(null)
  const [analysis, setAnalysis] = useState(-1)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loadingFiles, setLoadingFiles] = useState(false)
  const urls = useRef(new Set<string>())
  const trainingTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const analysisTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const nextId = useRef(1049)
  const alive = useRef(true)
  const busy = useRef(false)
  const product = products.find(item => item.id === selectedId)!
  const analyzing = analysis >= 0 && analysis < 5
  const activeImage = inspectionImage || (scenario === 'REVIEW' ? product.image.replace('.svg', '-review.svg') : product.image)

  useEffect(() => {
    alive.current = true
    const allocated = urls.current
    return () => {
      alive.current = false
      if (trainingTimer.current) clearInterval(trainingTimer.current)
      if (analysisTimer.current) clearInterval(analysisTimer.current)
      allocated.forEach(url => URL.revokeObjectURL(url))
    }
  }, [])

  async function preview(file: File) {
    const issue = validateImage(file)
    if (issue) throw new Error(issue)
    const url = URL.createObjectURL(file)
    try {
      const image = new Image()
      image.src = url
      await image.decode()
      if (!alive.current) { URL.revokeObjectURL(url); return null }
      urls.current.add(url)
      return url
    } catch {
      URL.revokeObjectURL(url)
      throw new Error('This image could not be read. Try another JPG, PNG, or WebP.')
    }
  }

  function selectProduct(id: string) {
    if (training || analyzing || busy.current) return
    setSelectedId(id)
    setInspectionImage(null)
    setImageSource('demo')
    setMessage('')
    setError('')
  }

  async function addSamples(files: File[]) {
    if (training || analyzing || busy.current || !files.length) return
    busy.current = true
    setLoadingFiles(true)
    setError('')
    const accepted: Sample[] = []
    const errors: string[] = []
    const room = Math.max(0, 60 - product.sampleCount)
    for (const file of files.slice(0, room)) {
      try {
        const url = await preview(file)
        if (url) accepted.push({ id: crypto.randomUUID(), name: file.name, url })
      } catch (issue) { errors.push(issue instanceof Error ? issue.message : 'Unable to load image.') }
    }
    if (!alive.current) return
    if (accepted.length) {
      setSamples(old => ({ ...old, [selectedId]: [...(old[selectedId] || []), ...accepted] }))
      setProducts(old => old.map(item => item.id === selectedId ? { ...item, sampleCount: item.sampleCount + accepted.length, ready: false } : item))
      setMessage(accepted.length + ' image(s) added. Rebuild this normal profile before inspecting.')
    }
    if (files.length > room) errors.push('The demo supports up to 60 samples per product.')
    setError([...new Set(errors)].join(' '))
    busy.current = false
    setLoadingFiles(false)
  }

  function resetSamples() {
    if (training || analyzing || busy.current) return
    for (const sample of samples[selectedId] || []) {
      URL.revokeObjectURL(sample.url)
      urls.current.delete(sample.url)
    }
    setSamples(old => ({ ...old, [selectedId]: [] }))
    const seed = initialProducts.find(item => item.id === selectedId)!
    setProducts(old => old.map(item => item.id === selectedId ? { ...seed, ready: false } : item))
    setMessage('Example dataset restored. Build the profile to continue.')
    setError('')
  }

  function train() {
    if (training || analyzing || busy.current) return
    if (product.sampleCount < 20) { setError('Add at least 20 good samples before training.'); return }
    setError('')
    setMessage('')
    let progress = 0
    const id = selectedId
    setTraining({ productId: id, progress })
    trainingTimer.current = setInterval(() => {
      progress = Math.min(100, progress + 5)
      setTraining({ productId: id, progress })
      if (progress === 100) {
        clearInterval(trainingTimer.current!)
        trainingTimer.current = null
        setProducts(old => old.map(item => item.id === id ? { ...item, ready: true, updated: 'Just now' } : item))
        setMessage('Normal profile successfully created — simulated training complete.')
        setTraining(null)
      }
    }, 150)
  }

  async function uploadInspection(file: File, source: Inspection['source'] = 'upload') {
    if (analyzing || busy.current) return
    busy.current = true
    setLoadingFiles(true)
    setError('')
    try {
      const url = await preview(file)
      if (url) { setInspectionImage(url); setImageSource(source); setMessage('Image ready. Choose a demo outcome and run the inspection.') }
    } catch (issue) { setError(issue instanceof Error ? issue.message : 'Unable to load image.') }
    busy.current = false
    if (alive.current) setLoadingFiles(false)
  }

  function useDemoImage() {
    if (analyzing || busy.current) return
    setInspectionImage(null)
    setImageSource('demo')
    setError('')
    setMessage('Example product image selected.')
  }

  function inspect() {
    if (analyzing || training || busy.current) return
    if (!product.ready) { setError('Build the normal profile for this product first.'); return }
    setError('')
    setMessage('')
    setAnalysis(0)
    let step = 0
    const record: Inspection = {
      id: String(nextId.current++), productId: selectedId, product: product.name,
      date: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date()),
      ...demoMetrics(scenario), result: scenario, image: activeImage, source: imageSource,
    }
    analysisTimer.current = setInterval(() => {
      step++
      setAnalysis(step)
      if (step === 5) {
        clearInterval(analysisTimer.current!)
        analysisTimer.current = null
        setResult(record)
        setHistory(old => [record, ...old])
        setMessage('Inspection complete. The simulated result has been added to history.')
      }
    }, 480)
  }

  function previewResult(outcome: Outcome) {
    if (analyzing) return
    setResult(old => {
      const reference = old.image.replace('-review.svg', '.svg')
      const image = old.source === 'demo' ? (outcome === 'REVIEW' ? reference.replace('.svg', '-review.svg') : reference) : old.image
      return { ...old, ...demoMetrics(outcome), result: outcome, image }
    })
  }

  function clearFeedback() { setMessage(''); setError('') }

  return { clearFeedback, products, product, selectedId, selectProduct, samples: samples[selectedId] || [], history, result, setResult,
    inspectionImage: activeImage, imageSource, scenario, setScenario, training, train, resetSamples,
    analysis, analyzing, message, error, loadingFiles, addSamples, uploadInspection, useDemoImage, inspect, previewResult }
}
export type VisionDemo = ReturnType<typeof useVisionDemo>
