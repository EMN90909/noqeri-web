import React from 'react'
import { motion } from 'motion/react'
import { Card, Code, CTA, Grid } from '../components.jsx'
import { Reveal,AnimatedRule } from '../motion/primitives.jsx'
import { useNoqeriMotion } from '../motion/MotionProvider.jsx'

const sample=`module app.home

function greet(name: string): string {
    return "Hello, " + name
}

export function main(): void {
    print(greet("Noqeri"))
}`

export function Home(){
  const {reduced,tokens}=useNoqeriMotion()
  const line={hidden:{opacity:0,y:32},show:{opacity:1,y:0}}
  function parallax(event){
    if(reduced||!window.matchMedia('(pointer:fine) and (hover:hover)').matches)return
    const rect=event.currentTarget.getBoundingClientRect()
    const x=((event.clientX-rect.left)/rect.width-.5)*2
    const y=((event.clientY-rect.top)/rect.height-.5)*2
    event.currentTarget.style.setProperty('--hero-x',`${(x*6).toFixed(2)}px`)
    event.currentTarget.style.setProperty('--hero-y',`${(y*5).toFixed(2)}px`)
  }
  function reset(event){event.currentTarget.style.setProperty('--hero-x','0px');event.currentTarget.style.setProperty('--hero-y','0px')}
  return <>
    <section className="home-hero premium-hero" onPointerMove={parallax} onPointerLeave={reset}>
      <motion.div className="hero-number" initial={reduced?false:{opacity:0,y:-10}} animate={{opacity:1,y:0}} transition={{duration:tokens.duration.base,ease:tokens.ease.editorial}}>1.0</motion.div>
      <div className="hero-copy">
        <motion.div className="kicker hero-kicker" initial={reduced?false:{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.08,duration:tokens.duration.fast,ease:tokens.ease.sharp}}>A SMALL LANGUAGE WITH A WIDE REACH</motion.div>
        <motion.h1 initial="hidden" animate="show" transition={{staggerChildren:reduced?0:tokens.stagger.hero,delayChildren:reduced?0:.12}}>
          <span className="hero-line-mask"><motion.span className="hero-line" variants={line} transition={{duration:reduced?0:tokens.duration.hero,ease:tokens.ease.editorial}}>One language.</motion.span></span>
          <span className="hero-line-mask"><motion.em className="hero-line" variants={line} transition={{duration:reduced?0:tokens.duration.hero,ease:tokens.ease.editorial}}>More places.</motion.em></span>
        </motion.h1>
        <motion.p initial={reduced?false:{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:reduced?0:.34,duration:tokens.duration.base,ease:tokens.ease.editorial}}>Noqeri keeps ordinary code readable, then lets you move into native systems work, browser modules, server APIs and embedded data without switching language models.</motion.p>
        <motion.div className="hero-actions" initial={reduced?false:{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:reduced?0:.43,duration:tokens.duration.base,ease:tokens.ease.editorial}}><CTA to="/docs/getting-started">Start building</CTA><CTA to="/docs/web-objects">See web + data</CTA></motion.div>
      </div>
      <motion.div className="hero-code kinetic-code" initial={reduced?false:{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:reduced?0:.22,duration:tokens.duration.slow,ease:tokens.ease.editorial}}><Code label="SOURCE / 1.0">{sample}</Code><span className="compiler-pulse" aria-hidden="true"/></motion.div>
    </section>
    <AnimatedRule/>
    <Reveal as="section" className="statement premium-statement" distance={14}><span>THE 1.0 IDEA</span><p>Keep the common path simple. Make powerful capabilities explicit. Put platform complexity in libraries and hosts instead of syntax.</p></Reveal>
    <Reveal as="div" className="capability-grid" distance={18}><Grid cols={4}><Card index="01" title="Native"><p>Typed NIR, explicit targets, ABI boundaries, atomics, pointers and freestanding x86-64 output.</p></Card><Card index="02" title="Web"><p><code>.nqo</code> modules expose DOM, routing, fetch, JSON and host-backed server capabilities.</p></Card><Card index="03" title="Data"><p><code>.nqd</code> is a compact typed data language backed by the embedded NoqeriDB engine.</p></Card><Card index="04" title="Packages"><p>The 1.0 registry publishes compiler-checked core, web, security and data package surfaces with deterministic downloads.</p></Card></Grid></Reveal>
    <Reveal as="section" className="big-link manual-gateway" distance={12}><CTA to="/docs">Open the 1.0 manual</CTA></Reveal>
  </>
}
