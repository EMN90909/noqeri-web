import React, { useEffect, useState } from 'react'
import { Page } from '../components.jsx'

const presets = {
  Hello: 'function square(x: int): int {\n    return x * x\n}\n\nprint("Hello from Noqeri")\nprint(square(7))',
  Functions: 'function add(a: int, b: int): int {\n    return a + b\n}\n\nprint(add(10, 20))',
  Loops: 'let total = 0\n\nrepeat 4 {\n    total = total + 3\n}\n\nprint(total) // 12',
  Modules: 'module app.main\nimport "./math.nqr"\n\nfunction main(): void {\n    print("Local import example")\n}',
  Records: 'record User {\n    id: u64\n    name: string\n}\n\nlet values: [int; 4] = [1, 2, 3, 4]\nprint(values[2])',
  Packages: 'import package "noqeri/base64"\n\n// Package versions are pinned by project.nqr and noqeri.lock.'
}

function inspectSource(source) {
  const counts = {
    lines: source.length ? source.split(/\r\n?|\n/).length : 0,
    functions: 0,
    modules: 0,
    records: 0
  }
  const kinds = { function: 'functions', module: 'modules', record: 'records' }
  let index = 0
  while (index < source.length) {
    if (source.startsWith('//', index)) {
      while (index < source.length && source[index] !== '\n') index++
      continue
    }
    if (source.startsWith('/*', index)) {
      const end = source.indexOf('*/', index + 2)
      index = end < 0 ? source.length : end + 2
      continue
    }
    const char = source[index]
    if (char === '"') {
      index++
      while (index < source.length) {
        if (source[index] === '\\') { index += 2; continue }
        if (source[index] === '"') { index++; break }
        index++
      }
      continue
    }
    if (/[A-Za-z_]/.test(char)) {
      const start = index++
      while (index < source.length && /[A-Za-z0-9_]/.test(source[index])) index++
      const key = kinds[source.slice(start, index)]
      if (key) counts[key]++
      continue
    }
    index++
  }
  return counts
}

export function Playground() {
  const [name, setName] = useState('Hello')
  const [code, setCode] = useState(presets.Hello)
  const [inspection, setInspection] = useState(() => inspectSource(presets.Hello))
  const [dirty, setDirty] = useState(false)
  const [pulse, setPulse] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')

  useEffect(() => {
    if (!pulse) return
    const timer = window.setTimeout(() => setPulse(false), 650)
    return () => window.clearTimeout(timer)
  }, [pulse])

  useEffect(() => {
    if (!copyStatus) return
    const timer = window.setTimeout(() => setCopyStatus(''), 1800)
    return () => window.clearTimeout(timer)
  }, [copyStatus])

  function load(preset) {
    const next = presets[preset]
    if (!next) return
    setName(preset)
    setCode(next)
    setInspection(inspectSource(next))
    setDirty(false)
    setCopyStatus('')
  }

  function inspect() {
    setInspection(inspectSource(code))
    setDirty(false)
    setPulse(false)
    requestAnimationFrame(() => setPulse(true))
  }

  async function copy() {
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        setCopyStatus('Clipboard access is unavailable here. Select the source and copy it manually.')
        return
      }
      await navigator.clipboard.writeText(code)
      setCopyStatus('Source copied.')
    } catch {
      setCopyStatus('Copy was blocked by the browser. Select the source and copy it manually.')
    }
  }

  return <Page kicker="PLAYGROUND / SOURCE INSPECTOR" title="Explore real Noqeri syntax." intro="Choose an example, edit it, and inspect its declaration shape. This browser playground is a lightweight source inspector, not a compiler or runtime; use the Noqeri CLI for syntax/token checks.">
    <div className="preset-tabs" role="group" aria-label="Example programs">
      {Object.keys(presets).map(preset => <button type="button" aria-pressed={name === preset} className={name === preset ? 'active' : ''} onClick={() => load(preset)} key={preset}>{preset}</button>)}
    </div>
    <section className="playground-designer">
      <div className="play-editor">
        <header><span>source.nqr</span><div><button type="button" onClick={copy}>Copy source</button><button type="button" onClick={() => load(name)}>Reset</button></div></header>
        <textarea value={code} onChange={event => { setCode(event.target.value); setDirty(true) }} spellCheck="false" aria-label="Noqeri source" />
        <p className="playground-status" role="status" aria-live="polite">{copyStatus}</p>
      </div>
      <div className={'compiler-flow' + (pulse ? ' pulse' : '')}>
        <button type="button" onClick={inspect}>Inspect source</button>
        {['Source', 'Declarations', 'Types', 'NIR', 'Output'].map((step, index) => <React.Fragment key={step}><span>{step}</span>{index < 4 && <i aria-hidden="true" />}</React.Fragment>)}
      </div>
      <aside className="play-output">
        <header>SOURCE SHAPE</header>
        <p>These are lightweight declaration counts, not compiler results.</p>
        <dl><dt>lines</dt><dd>{inspection.lines}</dd><dt>functions</dt><dd>{inspection.functions}</dd><dt>modules</dt><dd>{inspection.modules}</dd><dt>records</dt><dd>{inspection.records}</dd></dl>
        <small>{dirty ? 'Source changed — inspect again to refresh counts.' : 'No compilation or runtime execution performed.'}</small>
        <p className="playground-cli">For compiler checks: <code>./build/noqeri check file.nqr</code></p>
      </aside>
    </section>
  </Page>
}
