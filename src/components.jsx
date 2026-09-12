import React from 'react'
import { Link } from 'react-router-dom'

export function Page({ kicker, title, intro, children }) {
  return <>
    <section className="page-hero">
      <div className="kicker">{kicker}</div>
      <h1>{title}</h1>
      <p>{intro}</p>
    </section>
    <section className="page-body">{children}</section>
  </>
}

export function Code({ children }) {
  return <pre className="code"><code>{children}</code></pre>
}

export function Grid({ children, cols = 3 }) {
  return <div className={`grid cols-${cols}`}>{children}</div>
}

export function Card({ index, title, children }) {
  return <article className="card"><div className="card-index">{index}</div><h3>{title}</h3><div>{children}</div></article>
}

export function CTA({ to, children }) {
  return <Link className="cta" to={to}>{children} <span>↘</span></Link>
}
