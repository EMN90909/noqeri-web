import React,{useEffect,useMemo,useState} from 'react'
import { AnimatePresence,motion } from 'motion/react'
import { Page } from '../components.jsx'
import { useNoqeriMotion } from '../motion/MotionProvider.jsx'

function packageCommands(pkg,release){
  const origin=typeof window!=='undefined'?window.location.origin:'https://noqeri.onrender.com'
  const url=`${origin}/registry/${pkg.namespace}/${pkg.name}/${release.version}/download.nqpkg`
  const file=`${pkg.namespace}-${pkg.name}-${release.version}.nqpkg`
  return {
    unix:`curl -fL "${url}" -o "${file}"`,
    powershell:`Invoke-WebRequest -Uri "${url}" -OutFile "${file}"`
  }
}

function Command({label,value}){
  const[copied,setCopied]=useState(false)
  async function copy(){if(!navigator.clipboard)return;await navigator.clipboard.writeText(value);setCopied(true);setTimeout(()=>setCopied(false),1300)}
  return <div className="package-command"><div><span>{label}</span><button type="button" onClick={copy}>{copied?'COPIED ✓':'COPY'}</button></div><code>{value}</code></div>
}

function PackageRow({pkg}){
  const[open,setOpen]=useState(false)
  const {reduced,tokens}=useNoqeriMotion()
  const release=pkg.versions?.[0]
  const commands=release?packageCommands(pkg,release):null
  if(!release)return null
  return <motion.article layout={!reduced} className={`package-row package-catalog-row${open?' is-open':''}`} transition={{layout:tokens.spring}}>
    <div className="package-identity"><small>{pkg.namespace}</small><h3>{pkg.name}</h3></div>
    <p>{pkg.description}</p>
    <div className="package-meta"><span>{release.version}</span>{release.experimental&&<b>experimental provider</b>}<a href={`/registry/${pkg.namespace}/${pkg.name}/${release.version}/download.nqpkg`}>Download .nqpkg ↓</a><button className="package-install-toggle" type="button" aria-expanded={open} onClick={()=>setOpen(v=>!v)}>{open?'Hide commands':'Terminal commands'}</button></div>
    <AnimatePresence initial={false}>{open&&<motion.div className="package-install-panel" initial={reduced?false:{opacity:0,height:0,y:-5}} animate={{opacity:1,height:'auto',y:0}} exit={reduced?{opacity:0}:{opacity:0,height:0,y:-4}} transition={{duration:reduced?0:tokens.duration.fast,ease:tokens.ease.editorial}}><p>These commands download the exact deterministic <code>.nqpkg</code> archive served by this site. They do not pretend a package-manager install command exists where it does not.</p><div className="package-command-grid"><Command label="LINUX / macOS" value={commands.unix}/><Command label="WINDOWS POWERSHELL" value={commands.powershell}/></div></motion.div>}</AnimatePresence>
  </motion.article>
}

export function Packages(){
  const[index,setIndex]=useState(null),[error,setError]=useState(''),[query,setQuery]=useState('')
  useEffect(()=>{fetch('/registry/index.json').then(r=>{if(!r.ok)throw new Error('registry unavailable');return r.json()}).then(setIndex).catch(e=>setError(e.message))},[])
  const packages=useMemo(()=>{const all=index?.packages||[],q=query.trim().toLowerCase();return q?all.filter(pkg=>`${pkg.namespace}/${pkg.name} ${pkg.description}`.toLowerCase().includes(q)):all},[index,query])
  return <Page kicker="PACKAGES / 1.0" title="Use more. Learn less ceremony." intro="Official packages keep web, data, filesystem, crypto and network capabilities in libraries instead of bloating the language syntax.">
    <div className="package-toolbar"><span>{index?`${index.packages.length} published packages`:'Loading registry…'}</span><label className="package-filter"><span className="sr-only">Filter packages</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Filter packages…"/></label><a href="/registry/index.json">Registry JSON ↗</a></div>
    {error&&<div className="notice">{error}</div>}
    <motion.div layout className="package-list">{packages.map(pkg=><PackageRow key={`${pkg.namespace}/${pkg.name}`} pkg={pkg}/>)}</motion.div>
  </Page>
}
