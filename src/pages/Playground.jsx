import React,{useEffect,useState} from 'react'
import {Page} from '../components.jsx'

const presets={
  Hello:'module demo\n\nfunction main(): void {\n  print("Hello, Noqeri")\n}',
  Functions:'function twice(value: i64): i64 {\n  return value * 2\n}\n\nfunction main(): void {\n  print(twice(21 as i64))\n}',
  Modules:'module app.main\nimport "./math.nqr"\n\nfunction main(): void {\n  print("Local import syntax")\n}',
  Records:'record User {\n  id: u64\n  name: string\n}\n\nfunction printId(user: *User): void {\n  print(user.id)\n}'
}

function inspectSource(source){
  const counts={
    lines:source.length?source.split(/\r\n?|\n/).length:0,
    functions:0,
    modules:0,
    records:0
  }
  const kinds={function:'functions',module:'modules',record:'records'}
  let index=0
  while(index<source.length){
    if(source.startsWith('//',index)){
      while(index<source.length&&source[index]!=='\n')index++
      continue
    }
    if(source.startsWith('/*',index)){
      const end=source.indexOf('*/',index+2)
      index=end<0?source.length:end+2
      continue
    }
    const char=source[index]
    if(char==='"'||char==="'"){
      const quote=char
      index++
      while(index<source.length){
        if(source[index]==='\\'){index+=2;continue}
        if(source[index]===quote){index++;break}
        index++
      }
      continue
    }
    if(/[A-Za-z_]/.test(char)){
      const start=index++
      while(index<source.length&&/[A-Za-z0-9_]/.test(source[index]))index++
      const key=kinds[source.slice(start,index)]
      if(key)counts[key]++
      continue
    }
    index++
  }
  return counts
}

export function Playground(){
  const [name,setName]=useState('Functions')
  const [code,setCode]=useState(presets.Functions)
  const [inspection,setInspection]=useState(()=>inspectSource(presets.Functions))
  const [dirty,setDirty]=useState(false)
  const [pulse,setPulse]=useState(false)
  const [copyStatus,setCopyStatus]=useState('')

  useEffect(()=>{
    if(!pulse)return
    const timer=window.setTimeout(()=>setPulse(false),650)
    return()=>window.clearTimeout(timer)
  },[pulse])

  useEffect(()=>{
    if(!copyStatus)return
    const timer=window.setTimeout(()=>setCopyStatus(''),1800)
    return()=>window.clearTimeout(timer)
  },[copyStatus])

  function load(preset){
    const next=presets[preset]
    setName(preset)
    setCode(next)
    setInspection(inspectSource(next))
    setDirty(false)
    setCopyStatus('')
  }

  function inspect(){
    setInspection(inspectSource(code))
    setDirty(false)
    setPulse(false)
    requestAnimationFrame(()=>setPulse(true))
  }

  async function copy(){
    try{
      if(!navigator.clipboard?.writeText){
        setCopyStatus('Clipboard access is unavailable here. Select the source and copy it manually.')
        return
      }
      await navigator.clipboard.writeText(code)
      setCopyStatus('Source copied.')
    }catch{
      setCopyStatus('Copy was blocked by the browser. Select the source and copy it manually.')
    }
  }

  return <Page kicker="PLAYGROUND / SOURCE INSPECTOR" title="Try Noqeri in the browser." intro="Edit examples based on the current language reference and inspect their declaration shape. This browser page does not compile or execute source; use the Noqeri CLI for compiler diagnostics.">
    <div className="preset-tabs" role="group" aria-label="Example programs">{Object.keys(presets).map(preset=><button className={name===preset?'active':''} onClick={()=>load(preset)} key={preset}>{preset}</button>)}</div>
    <section className="playground-designer">
      <div className="play-editor">
        <header><span>source.nqr</span><div><button type="button" onClick={copy}>Copy source</button><button type="button" onClick={()=>load(name)}>Reset</button></div></header>
        <textarea value={code} onChange={event=>{setCode(event.target.value);setDirty(true)}} spellCheck="false" aria-label="Noqeri source"/>
        <p className="playground-status" role="status" aria-live="polite">{copyStatus}</p>
      </div>
      <div className={'compiler-flow'+(pulse?' pulse':'')}>
        <button type="button" onClick={inspect}>Inspect source</button>
        {['Source','Declarations','Types','NIR','Output'].map((step,index)=><React.Fragment key={step}><span>{step}</span>{index<4&&<i aria-hidden="true"/>}</React.Fragment>)}
      </div>
      <aside className="play-output">
        <header>SOURCE SHAPE</header>
        <p>These are lightweight declaration counts, not compiler results.</p>
        <dl><dt>lines</dt><dd>{inspection.lines}</dd><dt>functions</dt><dd>{inspection.functions}</dd><dt>modules</dt><dd>{inspection.modules}</dd><dt>records</dt><dd>{inspection.records}</dd></dl>
        <small>{dirty?'Source changed — inspect again to refresh counts.':'No compilation or runtime execution performed.'}</small>
        <p className="playground-cli">For compiler checks: <code>./build/noqeri check file.nqr</code></p>
      </aside>
    </section>
  </Page>
}
