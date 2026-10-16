import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Page } from '../components.jsx'
import { useNoqeriMotion } from '../motion/MotionProvider.jsx'

const features = [
  ['First program', 'Start with ordinary functions, values and output. The syntax stays readable before introducing systems details.', 'function square(x: int): int {\n    return x * x\n}\n\nprint("Hello from Noqeri")\nprint(square(7))'],
  ['Counted loops', 'Use repeat when the count is the idea, and while when a condition controls the loop.', 'let total = 0\n\nrepeat 4 {\n    total = total + 3\n}\n\nprint(total) // 12'],
  ['Functions and generics', 'Give functions clear inputs and result types. Generic type parameters let a reusable function keep its value type.', 'function add(a: int, b: int): int {\n    return a + b\n}\n\nfunction identity<T>(value: T): T {\n    return value\n}'],
  ['Records and arrays', 'Records declare named fields; fixed arrays declare both their element type and length.', 'record User {\n    id: u64\n    name: string\n}\n\nlet values: [int; 4] = [1, 2, 3, 4]\nprint(values[2])'],
  ['Modules and packages', 'A quoted path imports a local source file. The package form names a registry dependency pinned by the project lockfile.', 'module app.main\nimport "./math.nqr"\nimport package "noqeri/base64"'],
  ['Explicit systems code', 'Fixed-width values, pointers and atomic operations make low-level intent visible rather than hiding it in syntax.', 'let counter: u64 = 0\nlet ptr: *u64 = &counter\natomic.store(ptr, 1 as u64)\nlet current: u64 = atomic.load(ptr)'],
  ['Error propagation', 'throw and prefix try provide allocation-free status propagation for integer-returning functions.', 'function openDevice(): isize {\n    throw 3\n}\n\nfunction start(): isize {\n    let status: isize = try openDevice()\n    return status\n}']
]

function moveTab(event, index, setActive) {
  let next = index
  if (event.key === 'ArrowRight') next = (index + 1) % features.length
  else if (event.key === 'ArrowLeft') next = (index - 1 + features.length) % features.length
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = features.length - 1
  else return
  event.preventDefault()
  setActive(next)
  document.getElementById('language-tab-' + next)?.focus()
}

export function Language() {
  const [active, setActive] = useState(0)
  const { reduced } = useNoqeriMotion()

  return <Page kicker="LANGUAGE / REFERENCE" title="Easy to read. Ready to grow." intro="Noqeri starts with familiar code, then opens into fixed-width types, records, packages and explicit systems features. These examples follow the language grammar and getting-started guide in the main Noqeri repository.">
    <div className="syntax-specimen">
      <div className="syntax-tabs" role="tablist" aria-label="Noqeri language examples">
        {features.map((feature, index) => <button key={feature[0]} type="button" role="tab" id={'language-tab-' + index} aria-controls="language-specimen" aria-selected={active === index} tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={event => moveTab(event, index, setActive)}>{String(index + 1).padStart(2, '0')} <span>{feature[0]}</span></button>)}
      </div>
      <motion.div id="language-specimen" role="tabpanel" aria-labelledby={'language-tab-' + active} className="syntax-stage" key={active} initial={reduced ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .32, ease: [.22, 1, .36, 1] }}>
        <div><small>{features[active][0]}</small><h2>{features[active][1]}</h2></div>
        <pre><code>{features[active][2]}</code></pre>
      </motion.div>
    </div>
    <div className="compiler-rail" aria-label="Stage-one validation path"><span>source</span><i /><span>lex + syntax</span><i /><span>stage 1</span><i /><span>check</span></div>
    <section className="language-source-card">
      <div>
        <small>IMPLEMENTATION NOTE</small>
        <h2>Clear syntax. Honest compiler status.</h2>
        <p>The current self-hosted stage-one CLI offers version reporting, syntax/token checks, token counts and source fingerprints, alongside package and environment commands. It is not yet a claim that every backend or the full historical toolchain has reached parity.</p>
        <p><a href="https://github.com/EMN90909/Noqeri/blob/main/Grammar/noqeri.grammar.md" target="_blank" rel="noreferrer">Read the language grammar</a><span aria-hidden="true"> · </span><a href="https://github.com/EMN90909/Noqeri/blob/main/Doc/GETTING_STARTED.md" target="_blank" rel="noreferrer">Read the getting-started guide</a></p>
      </div>
      <div className="language-cli">
        <small>STAGE-ONE CLI</small>
        <pre><code>noqeri --version\nnoqeri check examples/hello.nqr\nnoqeri lex-count examples/hello.nqr\nnoqeri fingerprint examples/hello.nqr\nnoqeri selftest</code></pre>
        <p><code>noqeri check</code> currently reports a syntax/token check; it does not promise full type-checking or native execution.</p>
      </div>
    </section>
    <div className="syntax-tiles" aria-label="Syntax concepts">{['function', 'repeat', 'record', 'module', 'import package', 'fixed array', 'pointer', 'try'].map(token => <span key={token}>{token}</span>)}</div>
  </Page>
}
