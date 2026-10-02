import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
export function useRemote<T>(path: string, poll = false) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  const refresh = useCallback(() => setRevision(value => value + 1), [])
  useEffect(() => {
    let active = true
    const controller = new AbortController()
    async function load() {
      try { const value = await api<T>(path, { signal: controller.signal }); if (active) { setData(value); setError('') } }
      catch (e) { if (active) { setData(null); setError(e instanceof Error ? e.message : 'Data unavailable.') } }
    }
    void load()
    const timer = poll ? window.setInterval(() => { void load() }, 15000) : undefined
    return () => { active = false; controller.abort(); window.clearInterval(timer) }
  }, [path, revision, poll])
  return { data, error, refresh }
}
