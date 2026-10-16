import React,{useEffect,useState} from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Reveal } from './motion/primitives.jsx'
import { useNoqeriMotion } from './motion/MotionProvider.jsx'

export function Page({ kicker, title, intro, children }) {
  return <>
    <section className="page-hero motion-page-hero">
      <Reveal as="div" className="kicker" distance={6}>{kicker}</Reveal>
      <Reveal as="h1" delay={.035} distance={18}>{title}</Reveal>
      <Reveal as="p" delay={.08} distance={10}>{intro}</Reveal>
    </section>
    <section className="page-body">{children}</section>
  </>
}

export function Code({ children,label='NOQERI' }) {
  const [copied,setCopied]=useState(false)
  const text=typeof children==='string'?children:''
  useEffect(()=>{if(!copied)return;const id=setTimeout(()=>setCopied(false),1400);return()=>clearTimeout(id)},[copied])
  async function copy(){
    if(!text||!navigator.clipboard)return
    await navigator.clipboard.writeText(text)
    setCopied(true)
  }
  return <div className={`code-shell${copied?' is-copied':''}`}>
    <div className="code-toolbar"><span>{label}</span>{text&&<button type="button" onClick={copy} aria-live="polite">{copied?'COPIED ✓':'COPY'}</button>}</div>
    <pre className="code"><code>{children}</code></pre>
  </div>
}

export function Grid({ children, cols = 3 }) {
  return <div className={`grid cols-${cols}`}>{children}</div>
}

export function Card({ index, title, children }) {
  const {reduced,tokens}=useNoqeriMotion()
  return <motion.article className="card motion-card" whileHover={reduced?undefined:{y:-3}} whileFocus={reduced?undefined:{y:-2}} transition={tokens.spring}><div className="card-rule" aria-hidden="true"/><div className="card-index">{index}</div><h3>{title}</h3><div>{children}</div></motion.article>
}

export function CTA({ to, children }) {
  return <Link className="cta motion-cta" to={to}>{children} <span aria-hidden="true">↘</span></Link>
}
