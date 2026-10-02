import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import vm from 'node:vm'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const frontend = path.resolve(import.meta.dirname, '..')

// Transpile application modules without adding a test framework or bundler.
function loader(overrides = {}, globals = {}) {
  const cache = new Map()
  function load(relative) {
    const filename = path.resolve(frontend, relative)
    if (cache.has(filename)) return cache.get(filename).exports
    const module = { exports: {} }
    cache.set(filename, module)
    const source = fs.readFileSync(filename, 'utf8').replaceAll('import.meta.env.BASE_URL', "'/'")
    const compiled = ts.transpileModule(source, { compilerOptions: {
      target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
    } }).outputText
    const localRequire = name => {
      if (name in overrides) return overrides[name]
      if (name.endsWith('.css')) return {}
      if (!name.startsWith('.')) return require(name)
      const base = path.resolve(path.dirname(filename), name)
      const resolved = ['.ts', '.tsx', '.js'].map(ext => base + ext).find(file => fs.existsSync(file))
      if (!resolved) throw new Error('Unresolved module: ' + base)
      return load(resolved)
    }
    vm.runInNewContext(compiled, { module, exports: module.exports, require: localRequire, console, ...globals }, { filename })
    return module.exports
  }
  return load
}
const load = loader()
const data = load('src/data/demoData.ts')
const logic = load('src/lib/demoLogic.ts')

test('demo history filtering supports status, case-insensitive product and ID searches', () => {
  assert.equal(logic.filterHistory(data.inspectionHistory, 'All', '').length, 8)
  assert.equal(logic.filterHistory(data.inspectionHistory, 'Passed', '').length, 5)
  assert.equal(logic.filterHistory(data.inspectionHistory, 'Anomalies', '').length, 3)
  assert.equal(logic.filterHistory(data.inspectionHistory, 'Needs Review', '1047')[0].score, .87)
  assert.equal(logic.filterHistory(data.inspectionHistory, 'All', ' METAL ').length, 8)
  assert.equal(logic.filterHistory(data.inspectionHistory, 'Passed', '1047').length, 0)
  assert.equal(logic.filterHistory(data.inspectionHistory, 'All', 'missing').length, 0)
})
test('analytics reconcile across totals, chart series and newly logged inspections', () => {
  const base = logic.summarize(data.inspectionHistory, 8)
  assert.equal(base.total, 1248)
  assert.equal(base.passed, 1103)
  assert.equal(base.anomalies, 145)
  assert.equal(base.rate.toFixed(1), '88.4')
  assert.equal(data.trend.reduce((sum, row) => sum + row.total, 0), base.total)
  assert.equal(data.trend.reduce((sum, row) => sum + row.passed, 0), base.passed)
  assert.equal(data.distribution.reduce((sum, row) => sum + row.count, 0), base.total)
  const next = logic.summarize([{ result: 'PASS' }, { result: 'REVIEW' }, ...data.inspectionHistory], 8)
  assert.equal(next.total, 1250)
  assert.equal(next.passed, 1104)
  assert.equal(next.anomalies, 146)
})
test('image validation rejects unsupported, empty and oversized inputs', () => {
  assert.equal(logic.validateImage({ type: 'image/png', size: 1024 }), null)
  assert.ok(logic.validateImage({ type: 'text/html', size: 1024 }))
  assert.ok(logic.validateImage({ type: 'image/jpeg', size: 0 }))
  assert.ok(logic.validateImage({ type: 'image/webp', size: 11 * 1024 * 1024 }))
})

function workflowHarness() {
  const states = [], refs = [], cleanups = [], intervals = new Map(), revoked = []
  let stateIndex = 0, refIndex = 0, initial = true, timer = 0, url = 0, id = 0
  const react = {
    useState: initialValue => {
      const index = stateIndex++
      if (initial) states[index] = initialValue
      return [states[index], update => { states[index] = typeof update === 'function' ? update(states[index]) : update }]
    },
    useRef: initialValue => {
      const index = refIndex++
      if (initial) refs[index] = { current: initialValue }
      return refs[index]
    },
    useEffect: effect => { if (initial) cleanups.push(effect()) },
  }
  const hook = loader({ react }, {
    setInterval: fn => { intervals.set(++timer, fn); return timer },
    clearInterval: key => intervals.delete(key),
    URL: { createObjectURL: () => 'blob:test-' + (++url), revokeObjectURL: value => revoked.push(value) },
    Image: class { decode() { return this.src.includes('broken') ? Promise.reject(new Error()) : Promise.resolve() } },
    crypto: { randomUUID: () => String(++id) },
    Intl, Date,
  })('src/hooks/useVisionDemo.ts').useVisionDemo
  const render = () => { stateIndex = 0; refIndex = 0; const value = hook(); initial = false; return value }
  return {
    render, intervals, revoked,
    tick: count => { for (let i = 0; i < count; i++) [...intervals.values()].forEach(fn => fn()) },
    cleanup: () => cleanups.forEach(fn => fn?.()),
  }
}
test('product training gates inspection and successful runs append consistent results', () => {
  const harness = workflowHarness()
  let demo = harness.render()
  demo.selectProduct('cover')
  demo = harness.render()
  assert.equal(demo.product.ready, false)
  demo.inspect()
  demo = harness.render()
  assert.match(demo.error, /normal profile/)
  assert.equal(demo.history.length, 8)
  demo.train()
  demo = harness.render()
  assert.equal(demo.training.progress, 0)
  demo.selectProduct('cap')
  assert.equal(harness.render().selectedId, 'cover')
  harness.tick(20)
  demo = harness.render()
  assert.equal(demo.product.ready, true)
  assert.equal(demo.training, null)
  demo.setScenario('PASS')
  demo = harness.render()
  demo.inspect()
  harness.tick(5)
  demo = harness.render()
  assert.equal(demo.analysis, 5)
  assert.equal(demo.result.result, 'PASS')
  assert.equal(demo.result.score, .08)
  assert.equal(demo.result.productId, 'cover')
  assert.equal(demo.history.length, 9)
  assert.equal(demo.history[0].id, '1049')
  assert.equal(harness.intervals.size, 0)
  harness.cleanup()
})
test('uploads remain product-specific, invalidate training and clean up object URLs', async () => {
  const harness = workflowHarness()
  let demo = harness.render()
  await demo.addSamples([{ type: 'image/png', size: 100, name: 'good.png' }])
  demo = harness.render()
  assert.equal(demo.product.sampleCount, 29)
  assert.equal(demo.product.ready, false)
  assert.equal(demo.samples.length, 1)
  demo.selectProduct('housing')
  demo = harness.render()
  assert.equal(demo.samples.length, 0)
  assert.equal(demo.product.sampleCount, 24)
  await demo.uploadInspection({ type: 'image/jpeg', size: 100, name: 'inspect.jpg' })
  demo = harness.render()
  assert.equal(demo.imageSource, 'upload')
  assert.match(demo.inspectionImage, /^blob:/)
  demo.inspect()
  harness.tick(5)
  demo = harness.render()
  assert.equal(demo.result.source, 'upload')
  assert.equal(demo.result.score, .87)
  assert.equal(demo.result.productId, 'housing')
  harness.cleanup()
  assert.equal(harness.revoked.length, 2)
  assert.equal(harness.intervals.size, 0)
})
test('invalid uploads surface errors without changing the dataset', async () => {
  const harness = workflowHarness()
  let demo = harness.render()
  await demo.addSamples([{ type: 'text/plain', size: 10, name: 'bad.txt' }])
  demo = harness.render()
  assert.match(demo.error, /JPG, PNG, or WebP/)
  assert.equal(demo.product.sampleCount, 28)
  assert.equal(demo.product.ready, true)
  assert.equal(demo.loadingFiles, false)
  harness.cleanup()
})
test('cleanup cancels an in-progress inspection', () => {
  const harness = workflowHarness()
  const demo = harness.render()
  demo.inspect()
  assert.equal(harness.intervals.size, 1)
  harness.cleanup()
  assert.equal(harness.intervals.size, 0)
})
test('inspection redirect and legacy routes render, landing anchors and assets resolve', t => {
  const errors = []
  const warnings = []
  t.mock.method(console, 'error', (...args) => errors.push(args))
  t.mock.method(console, 'warn', (...args) => warnings.push(args))
  const App = load('src/App.tsx').default
  for (const route of ['/', '/inspection', '/inspection/legacy']) {
    const markup = renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: [route] }, React.createElement(App)))
    const ids = [...markup.matchAll(/\bid="([^"]+)"/g)].map(match => match[1])
    assert.equal(new Set(ids).size, ids.length, 'IDs must be unique')
    for (const match of markup.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(match[1]), 'Missing anchor ' + match[1])
    for (const match of markup.matchAll(/src="\/([^"]+)"/g)) assert.ok(fs.existsSync(path.join(frontend, 'public', match[1])), 'Missing asset ' + match[1])
    if (route === '/') {
      const ordered = ['capabilities', 'workflow', 'quality-control', 'threshold', 'insights', 'get-started', 'privacy', 'terms']
      let position = -1
      for (const id of ordered) {
        const next = markup.indexOf('id="' + id + '"')
        assert.ok(next > position, id + ' must occur in order')
        position = next
      }
      assert.match(markup, /class="hero-scroll-area"/)
      assert.match(markup, /class="hero-sequence"/)
    } else if (route === '/inspection') {
      assert.match(markup, /href="\/visionqc\/"/)
      assert.match(markup, /Open VisionQC/)
    } else {
      assert.match(markup, /Capture &amp; Inspect/)
      assert.match(markup, /MODEL PERFORMANCE/)
      assert.doesNotMatch(markup, /Run Demo Inspection|simulated/i)
      assert.doesNotMatch(markup, /class="hero-scroll-area"/)
    }
  }
  assert.deepEqual(errors, [], 'Rendering must not log React errors')
  assert.deepEqual(warnings, [], 'Rendering must not log React warnings')
})
test('new CSS is scoped and includes mobile table layouts and reduced-motion handling', () => {
  const css = fs.readFileSync(path.join(frontend, 'src/styles/experience.css'), 'utf8')
  // No generic selector can restyle the frozen hero.
  for (const line of css.split('\n').filter(line => line.includes('{') && !line.trim().startsWith('@') && !line.trim().startsWith('--'))) {
    if (line.startsWith('.vqc-') || line.trim().startsWith('.vqc-')) assert.ok(line.trim().startsWith('.vqc-root'))
  }
  assert.match(css, /max-width: 760px/)
  assert.match(css, /prefers-reduced-motion: reduce/)
  assert.match(css, /\.vqc-history-table tr \{ position: relative; display: grid/)
  assert.doesNotMatch(css, /\.hero\b|\.navigation\b|:root\s*\{/)
})
