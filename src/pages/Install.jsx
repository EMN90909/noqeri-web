import React,{useEffect,useState} from 'react'
import {Page} from '../components.jsx'

const commands={
  macOS:'git clone https://github.com/EMN90909/Noqeri.git\ncd Noqeri\nexport NOQERI_STAGE0=/path/to/trusted/noqeri\n./scripts/build.sh\n./build/noqeri selftest',
  Linux:'git clone https://github.com/EMN90909/Noqeri.git\ncd Noqeri\nexport NOQERI_STAGE0=/path/to/trusted/noqeri\n./scripts/build.sh\n./build/noqeri selftest',
  Windows:'git clone https://github.com/EMN90909/Noqeri.git\ncd Noqeri\n$env:NOQERI_STAGE0 = "C:\\path\\to\\noqeri.exe"\n.\\scripts\\build.ps1\n.\\build\\noqeri.cmd selftest',
  Manual:'The current self-host build needs one trusted seed compiler. Set NOQERI_STAGE0, then run scripts/build.sh on POSIX or scripts/build.ps1 in PowerShell.'
}
const steps=[
  ['Install the seed','A trusted Noqeri seed executable is required once to build the self-hosted stage-one compiler. Point NOQERI_STAGE0 at that executable.'],
  ['Build and verify','Run scripts/build.sh on macOS/Linux or scripts/build.ps1 on Windows, then run the generated compiler selftest.'],
  ['Create a source file','Write app.nqr using the current language reference. Source files use the .nqr extension.'],
  ['Check the file','Run ./build/noqeri check app.nqr. Stage one currently exposes check, lex-count, fingerprint, selftest and --version; the historical run/build commands are not yet part of this path.']
]

export function Install(){
  const [os,setOs]=useState('Linux')
  const [open,setOpen]=useState(0)
  const [copyStatus,setCopyStatus]=useState('')

  useEffect(()=>{
    if(!copyStatus)return
    const timer=window.setTimeout(()=>setCopyStatus(''),1800)
    return()=>window.clearTimeout(timer)
  },[copyStatus])

  async function copy(){
    if(os==='Manual'){
      setCopyStatus('Choose macOS, Linux or Windows for a copyable build command.')
      return
    }
    try{
      if(!navigator.clipboard?.writeText){
        setCopyStatus('Clipboard access is unavailable. Select the command and copy it manually.')
        return
      }
      await navigator.clipboard.writeText(commands[os])
      setCopyStatus('Build command copied.')
    }catch{
      setCopyStatus('Copy was blocked by the browser. Select the command and copy it manually.')
    }
  }

  return <Page kicker="INSTALL / SELF-HOSTED COMPILER" title="Build Noqeri from source." intro="The current main branch uses a staged self-host build. It needs a trusted seed compiler once; the normal stage-one build no longer relies on the old CMake/C++17 bootstrap.">
    <div className="os-selector" role="group" aria-label="Choose build instructions">{Object.keys(commands).map(platform=><button type="button" key={platform} className={os===platform?'active':''} onClick={()=>{setOs(platform);setCopyStatus('')}}>{platform}</button>)}</div>
    <section className="install-command">
      <header><span>BUILD / {os.toUpperCase()}</span><button type="button" onClick={copy}>Copy command</button></header>
      <pre><code>{commands[os]}</code></pre>
      <p className="install-copy-status" role="status" aria-live="polite">{copyStatus}</p>
    </section>
    <div className="install-helper">The seed compiler path is a placeholder; replace it with the executable already available on your machine.</div>
    <section className="install-stepper">{steps.map((step,index)=><article key={step[0]} className={open===index?'open':''}><button type="button" onClick={()=>setOpen(open===index?-1:index)} aria-expanded={open===index}><b>{index+1}</b><span>{step[0]}</span><em>{open===index?'−':'+'}</em></button>{open===index&&<p>{step[1]}</p>}</article>)}</section>
  </Page>
}
