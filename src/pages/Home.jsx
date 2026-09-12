import React,{useState} from 'react'
import {motion} from 'motion/react'
import {Code,CTA} from '../components.jsx'
import {AnimatedRule,Reveal} from '../motion/primitives.jsx'
import {useNoqeriMotion} from '../motion/MotionProvider.jsx'

const sample=`module app.home\n\nfunction greet(name: string): string {\n    return "Hello, " + name\n}\n\nexport function main(): void {\n    print(greet("Noqeri"))\n}`
const plates=[['Native','target','Typed NIR, ABI boundaries and explicit systems features.'],['Web','host','Browser and server capabilities through portable web objects.'],['Data','.nqd','Compact typed data surfaces close to the language.'],['Packages','lock','Deterministic package surfaces you can inspect and pin.']]

export function Home(){
  const {reduced,tokens}=useNoqeriMotion()
  const [active,setActive]=useState(0)
  function trackCodeLight(event){
    if(reduced||!window.matchMedia('(pointer:fine) and (hover:hover)').matches)return
    const rect=event.currentTarget.getBoundingClientRect()
    const x=((event.clientX-rect.left)/rect.width)*100
    const y=((event.clientY-rect.top)/rect.height)*100
    event.currentTarget.style.setProperty('--glow-x',`${x.toFixed(1)}%`)
    event.currentTarget.style.setProperty('--glow-y',`${y.toFixed(1)}%`)
  }
  function resetCodeLight(event){
    event.currentTarget.style.setProperty('--glow-x','70%')
    event.currentTarget.style.setProperty('--glow-y','35%')
  }
  return <>
    <section className="home-hero premium-hero">
      <div className="hero-number">1.0</div>
      <div className="hero-copy">
        <motion.div className="kicker" initial={reduced?false:{opacity:0,y:8}} animate={{opacity:1,y:0}}>NOQERI 1.0 / NATIVE + WEB + DATA</motion.div>
        <h1>
          <span className="hero-line-mask"><motion.span className="hero-line" initial={reduced?false:{y:'110%'}} animate={{y:0}} transition={{duration:tokens.duration.hero,ease:tokens.ease.editorial}}>One language.</motion.span></span>
          <span className="hero-line-mask"><motion.em className="hero-line" initial={reduced?false:{y:'110%'}} animate={{y:0}} transition={{delay:reduced?0:.09,duration:tokens.duration.hero,ease:tokens.ease.editorial}}>More places.</motion.em></span>
        </h1>
        <p>Noqeri keeps everyday code small and readable, then opens into native systems, web objects, packages, embedded data and experimental platforms without changing mental models.</p>
        <div className="hero-actions"><CTA to="/docs/getting-started">Start building</CTA><CTA to="/docs">Open the manual</CTA><CTA to="/playground">Try the playground</CTA></div>
        <div className="hero-pipeline" aria-label="Compilation path">source <span>→</span> modules <span>→</span> NIR <span>→</span> target</div>
      </div>
      <div className="hero-code code-instrument" data-cursor="code" onPointerMove={trackCodeLight} onPointerLeave={resetCodeLight}>
        <div className="code-glow" aria-hidden="true"/>
        <Code label="example.nqr / NOQERI">{sample}</Code>
        <div className="code-tags"><span>module</span><span>function</span><span>return</span><span>print</span></div>
      </div>
    </section>
    <AnimatedRule/>
    <Reveal as="section" className="statement premium-statement"><span>THE IDEA</span><p>Readable where it should be. Explicit where it matters. Small enough to understand, wide enough to build real things.</p></Reveal>
    <section className="capability-plates" onMouseLeave={()=>setActive(-1)}>{plates.map((p,i)=><motion.article key={p[0]} className={`capability-plate${active===i?' active':''}${active>=0&&active!==i?' quiet':''}`} onHoverStart={()=>setActive(i)} onFocus={()=>setActive(i)} tabIndex="0" whileHover={reduced?undefined:{y:-4}}><small>0{i+1}</small><h2>{p[0]}</h2><p>{p[2]}</p><div className="plate-diagram" aria-hidden="true"><span/><b>{p[1]}</b><span/></div></motion.article>)}</section>
    <section className="big-link"><CTA to="/docs">Enter the Noqeri manual</CTA></section>
  </>
}
