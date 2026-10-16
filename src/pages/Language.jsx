import React,{useState} from 'react'
import {motion} from 'motion/react'
import {Page} from '../components.jsx'
import {useNoqeriMotion} from '../motion/MotionProvider.jsx'

const features=[
  ['Functions','Small readable units with explicit inputs and return types.','function greet(name: string): string {\n  return "hello " + name\n}'],
  ['Records','Typed data shapes with declaration-order fields.','record User {\n  id: u64\n  name: string\n}'],
  ['Modules','Import sibling source files using a quoted relative path.','module app.main\nimport "./math.nqr"'],
  ['Generics','Reuse functions while keeping type parameters visible.','function identity<T>(value: T): T {\n  return value\n}'],
  ['Systems','Make atomic operations and raw-memory intent explicit.','let counter: u64 = 0 as u64\nlet ptr: *u64 = &counter\natomic.store(ptr, 1 as u64)\nlet current: u64 = atomic.load(ptr)'],
  ['Host ABI','Keep platform services behind explicit host functions.','extern function domText(selector: string, value: string): bool\n\nexport function writeBadge(): bool {\n  return domText("[data-noqeri-client]", "Noqeri 1.4")\n}']
]

export function Language(){
  const [active,setActive]=useState(0)
  const {reduced}=useNoqeriMotion()
  return <Page kicker="LANGUAGE / REFERENCE" title="A compact language surface for wide targets." intro="Examples here follow the current Noqeri source reference: typed records, quoted local imports, explicit conversions, atomics and host ABI boundaries. The browser examples are illustrative; the compiler repository defines what each build currently implements.">
    <div className="syntax-specimen">
      <div className="syntax-tabs" role="tablist" aria-label="Language features">
        {features.map((feature,index)=><button key={feature[0]} type="button" role="tab" id={'language-tab-'+index} aria-controls="language-specimen" aria-selected={active===index} tabIndex={active===index?0:-1} onMouseEnter={()=>setActive(index)} onFocus={()=>setActive(index)} onClick={()=>setActive(index)} onKeyDown={event=>{let next=index;if(event.key==='ArrowRight')next=(index+1)%features.length;else if(event.key==='ArrowLeft')next=(index-1+features.length)%features.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=features.length-1;else return;event.preventDefault();setActive(next);event.currentTarget.parentElement?.querySelectorAll('[role="tab"]')[next]?.focus()}}>{String(index+1).padStart(2,'0')} <span>{feature[0]}</span></button>)}
      </div>
      <motion.div id="language-specimen" role="tabpanel" aria-labelledby={'language-tab-'+active} className="syntax-stage" key={active} initial={reduced?false:{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:reduced?0:.24,ease:[.22,1,.36,1]}}>
        <div><small>{features[active][0]}</small><h2>{features[active][1]}</h2></div>
        <pre><code>{features[active][2]}</code></pre>
      </motion.div>
    </div>
    <div className="compiler-rail" aria-label="Current stage-one compiler flow"><span>source</span><i/><span>lex + syntax</span><i/><span>stage 1</span><i/><span>check</span></div>
    <p className="language-status">Current stage-one CLI commands include <code>--version</code>, <code>check</code>, <code>lex-count</code>, <code>fingerprint</code> and <code>selftest</code>. Broader compiler and tooling features are being ported into the self-hosted implementation.</p>
    <div className="syntax-tiles" aria-label="Syntax concepts">{['function','record','module','import','array','pointer'].map(token=><span key={token}>{token}</span>)}</div>
  </Page>
}
