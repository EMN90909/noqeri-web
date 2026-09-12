import React, { useMemo, useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { docs, docGroups } from '../docsContent.js'
import { Code } from '../components.jsx'

function DocsMenu({ query, setQuery }) {
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return docs
    return docs.filter(d => `${d.title} ${d.summary} ${d.group}`.toLowerCase().includes(q))
  }, [query])
  return <aside className="docs-menu">
    <div className="docs-menu-head"><span>MANUAL / 1.5</span><b>{docs.length} TOPICS</b></div>
    <label className="docs-search"><span>SEARCH</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="types, web, ABI…" /></label>
    {docGroups.map(group => {
      const items = visible.filter(d => d.group === group)
      return items.length ? <div className="docs-group" key={group}><h4>{group}</h4>{items.map(d => <NavLink key={d.slug} to={`/docs/${d.slug}`}>{d.title}</NavLink>)}</div> : null
    })}
  </aside>
}

function DocsIndex(){return <article className="docs-article docs-index">
  <div className="doc-kicker">NOQERI DOCUMENTATION</div>
  <h1>Language + toolchain manual.</h1>
  <p className="doc-lead">The manual follows the language from first program through type rules, memory, generics, packages, native targets and browser/server web output. Every topic has a stable <code>/docs/*</code> route.</p>
  <div className="docs-start-grid">
    {docs.slice(0,8).map((d,i)=><NavLink key={d.slug} to={`/docs/${d.slug}`}><small>{String(i+1).padStart(2,'0')}</small><strong>{d.title}</strong><span>{d.summary}</span></NavLink>)}
  </div>
  <section className="doc-section"><h2>Design contract</h2><p>Noqeri keeps safe, common operations concise and makes capability-changing operations visible. Integer narrowing is explicit, raw memory remains explicit, borrowed slices cannot outlive proven local owners, and target/environment services are separated from language semantics.</p></section>
</article>}

function DocArticle({ doc }){
  const index=docs.findIndex(d=>d.slug===doc.slug), prev=docs[index-1], next=docs[index+1]
  return <article className="docs-article">
    <div className="doc-kicker">{doc.group} / {String(index+1).padStart(2,'0')}</div>
    <h1>{doc.title}</h1>
    <p className="doc-lead">{doc.summary}</p>
    {doc.sections.map((section,i)=><section className="doc-section" key={i}><h2>{section.title}</h2>{section.paragraphs.map((p,j)=><p key={j}>{p}</p>)}{section.points&&<ul>{section.points.map(x=><li key={x}>{x}</li>)}</ul>}</section>)}
    {doc.code && <Code>{doc.code}</Code>}
    {doc.note && <div className="doc-note"><b>NOTE</b><span>{doc.note}</span></div>}
    <nav className="docs-prev-next">{prev?<NavLink to={`/docs/${prev.slug}`}><small>PREVIOUS</small>{prev.title}</NavLink>:<span/>}{next?<NavLink to={`/docs/${next.slug}`}><small>NEXT</small>{next.title}</NavLink>:<span/>}</nav>
  </article>
}

export function Docs(){
  const params=useParams(), slug=params['*']?.replace(/^\//,'')||''
  const [query,setQuery]=useState('')
  const doc=docs.find(d=>d.slug===slug)
  return <div className="docs-layout"><DocsMenu query={query} setQuery={setQuery}/>{slug ? (doc?<DocArticle doc={doc}/>:<article className="docs-article"><div className="doc-kicker">404 / DOCS</div><h1>Topic not found.</h1><p className="doc-lead">Use the manual index to continue.</p><NavLink className="cta" to="/docs">Documentation index →</NavLink></article>) : <DocsIndex/>}</div>
}
