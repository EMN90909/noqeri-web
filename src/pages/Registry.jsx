import React,{useEffect,useMemo,useState} from 'react'
import {Page} from '../components.jsx'
import {selectRelease,downloadPath} from '../packageCatalog.js'

const stages=['Discover','Resolve','Lock','Download','Verify']

export function Registry(){
  const [index,setIndex]=useState(null)
  const [error,setError]=useState('')
  const [query,setQuery]=useState('')
  const [stage,setStage]=useState(0)
  useEffect(()=>{
    const controller=new AbortController()
    fetch('/registry/index.json',{signal:controller.signal})
      .then(r=>{if(!r.ok)throw new Error('Registry responded '+r.status);return r.json()})
      .then(setIndex).catch(e=>{if(e.name!=='AbortError')setError(e.message)})
    return ()=>controller.abort()
  },[])
  const available=useMemo(()=>index?.packages?.filter(p=>selectRelease(p))||[],[index])
  const featured=available.find(p=>p.namespace==='noqeri'&&p.name==='json')||available[0]
  const found=available.filter(p=>`${p.namespace}/${p.name} ${p.description||''}`.toLowerCase().includes(query.toLowerCase().trim())).slice(0,12)
  const release=featured&&selectRelease(featured)
  return <Page kicker="REGISTRY / RELEASES" title="The Noqeri registry, built for deterministic packages." intro="Discover published versions, download exact package archives and verify identities before using them.">
    <div className="registry-status"><span><i/>{error?'Registry unavailable':index?'Registry index loaded':'Loading registry'}</span><span>{available.length} available packages</span><span>Verify before execution</span></div>
    {error&&<div className="notice" role="alert">Could not load the registry: {error}</div>}
    {featured&&release&&<section className="registry-feature"><div><small>FEATURED PUBLISHED PACKAGE</small><h2>{featured.namespace}/{featured.name}</h2><p>{featured.description} Latest non-withdrawn version: {release.version}.</p><a className="cta" href={downloadPath(featured,release)}>Download {release.version} <span>↓</span></a></div>
      <label><span>FIND A PACKAGE</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search published packages"/></label></section>}
    {query&&<div className="package-list" aria-live="polite">{found.length?found.map(pkg=>{const r=selectRelease(pkg);return <div className="package-row" key={pkg.namespace+'/'+pkg.name}><strong>{pkg.namespace}/{pkg.name}</strong><span> {r.version} </span><a href={downloadPath(pkg,r)}>Download ↓</a></div>}):<p>No non-withdrawn packages match this search.</p>}</div>}
    <section className="verify-path" aria-label="Package verification steps"><div className="verify-line" aria-hidden="true"/>{stages.map((s,i)=><button type="button" key={s} className={i<=stage?'on':''} onClick={()=>setStage(i)} aria-pressed={stage===i}><b>{String(i+1).padStart(2,'0')}</b><span>{s}</span></button>)}</section>
    <div className="notice">The diagram explains a verification workflow, not the status of your download. The site publishes tar-gzip archives; the Noqeri CLI separately verifies package-file hashes against registry metadata when available. Do not execute unverified downloads.</div>
  </Page>
}
