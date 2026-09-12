import {useEffect} from 'react'
import {useLocation} from 'react-router-dom'
import {clientFinePointer,clientReducedMotion} from '../noqeri/client.generated.nqo'

const ENTRY_SELECTORS=[
  '.statement',
  '.capability-plate',
  '.syntax-stage',
  '.syntax-tiles button',
  '.registry-feature',
  '.verify-path button',
  '.ecosystem-map',
  '.ecosystem-stories article',
  '.benchmark-chart',
  '.install-command',
  '.install-stepper article',
  '.playground-designer',
  '.community-cards a',
  '.about-origin',
  '.principles-list button',
  '.about-timeline',
  '.broken-code'
].join(',')

function safeBool(fn,fallback=false){
  try{return Boolean(fn())}catch{return fallback}
}

function animateElement(el,keyframes,options,bag){
  if(!el?.animate)return null
  const animation=el.animate(keyframes,{fill:'both',...options})
  bag.push(animation)
  animation.finished.catch(()=>{}).finally(()=>{
    if(options?.fill==='both') animation.commitStyles?.()
    animation.cancel()
  })
  return animation
}

function routeWipe(reduced,bag){
  if(reduced)return
  const wipe=document.createElement('div')
  wipe.className='nq-native-route-wipe'
  wipe.setAttribute('aria-hidden','true')
  document.body.appendChild(wipe)
  const animation=wipe.animate([
    {transform:'translate3d(-115%,0,0) skewX(-7deg)'},
    {transform:'translate3d(-12%,0,0) skewX(-7deg)',offset:.42},
    {transform:'translate3d(12%,0,0) skewX(-7deg)',offset:.58},
    {transform:'translate3d(115%,0,0) skewX(-7deg)'}
  ],{duration:560,easing:'cubic-bezier(.22,1,.36,1)'})
  bag.push(animation)
  animation.finished.catch(()=>{}).finally(()=>wipe.remove())
}

function heroEntrance(reduced,bag){
  if(reduced)return
  const hero=document.querySelector('.premium-hero')
  if(!hero)return
  const rail=hero.querySelector('.hero-number')
  const kicker=hero.querySelector('.kicker')
  const lines=[...hero.querySelectorAll('.hero-line')]
  const copy=hero.querySelector('.hero-copy > p')
  const actions=hero.querySelector('.hero-actions')
  const pipeline=hero.querySelector('.hero-pipeline')
  const code=hero.querySelector('.hero-code')

  animateElement(rail,[{opacity:0,transform:'translateY(-22px)'},{opacity:1,transform:'translateY(0)'}],{duration:460,easing:'cubic-bezier(.22,1,.36,1)'},bag)
  animateElement(kicker,[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,delay:90,easing:'cubic-bezier(.22,1,.36,1)'},bag)
  lines.forEach((line,index)=>animateElement(line,[{transform:'translateY(112%)'},{transform:'translateY(0)'}],{duration:700,delay:130+index*105,easing:'cubic-bezier(.22,1,.36,1)'},bag))
  animateElement(copy,[{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:520,delay:330,easing:'cubic-bezier(.22,1,.36,1)'},bag)
  animateElement(actions,[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{duration:480,delay:410,easing:'cubic-bezier(.22,1,.36,1)'},bag)
  animateElement(pipeline,[{opacity:0,letterSpacing:'.22em'},{opacity:1,letterSpacing:'.08em'}],{duration:520,delay:490,easing:'cubic-bezier(.22,1,.36,1)'},bag)
  animateElement(code,[{opacity:0,transform:'translate3d(44px,18px,0) rotateY(-7deg) scale(.975)'},{opacity:1,transform:'translate3d(0,0,0) rotateY(0) scale(1)'}],{duration:760,delay:220,easing:'cubic-bezier(.16,1,.3,1)'},bag)

  const codeLines=[...hero.querySelectorAll('.hero-code code')]
  codeLines.forEach((line,index)=>animateElement(line,[{clipPath:'inset(0 100% 0 0)',opacity:.35},{clipPath:'inset(0 0 0 0)',opacity:1}],{duration:760,delay:560+index*40,easing:'cubic-bezier(.22,1,.36,1)'},bag))
}

function pageEntrance(reduced,bag){
  if(reduced)return
  const hero=document.querySelector('.page-hero')
  if(!hero)return
  const kicker=hero.querySelector('.kicker')
  const title=hero.querySelector('h1')
  const intro=hero.querySelector('p')
  animateElement(kicker,[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:360,easing:'cubic-bezier(.22,1,.36,1)'},bag)
  animateElement(title,[{clipPath:'inset(0 0 100% 0)',transform:'translateY(24px)'},{clipPath:'inset(0 0 0 0)',transform:'translateY(0)'}],{duration:680,delay:50,easing:'cubic-bezier(.22,1,.36,1)'},bag)
  animateElement(intro,[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:480,delay:180,easing:'cubic-bezier(.22,1,.36,1)'},bag)
}

function pageSpecificAnimations(reduced,bag){
  if(reduced)return
  document.querySelectorAll('.syntax-tabs button').forEach((el,index)=>animateElement(el,[{opacity:0,transform:'translateX(-14px)'},{opacity:1,transform:'translateX(0)'}],{duration:340,delay:150+index*55,easing:'cubic-bezier(.22,1,.36,1)'},bag))
  document.querySelectorAll('.verify-path button').forEach((el,index)=>animateElement(el,[{opacity:.25,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,delay:170+index*80,easing:'cubic-bezier(.22,1,.36,1)'},bag))
  document.querySelectorAll('.ecosystem-map g line').forEach((el,index)=>{
    el.style.strokeDasharray='260'
    el.style.strokeDashoffset='260'
    animateElement(el,[{strokeDashoffset:260},{strokeDashoffset:0}],{duration:850,delay:120+index*45,easing:'cubic-bezier(.22,1,.36,1)'},bag)
  })
  document.querySelectorAll('.benchmark-row > div span').forEach((el,index)=>animateElement(el,[{transform:'scaleX(0)'},{transform:getComputedStyle(el).transform==='none'?'scaleX(1)':getComputedStyle(el).transform}],{duration:900,delay:160+index*110,easing:'cubic-bezier(.22,1,.36,1)'},bag))
  document.querySelectorAll('.compiler-flow span,.compiler-flow i').forEach((el,index)=>animateElement(el,[{opacity:.2,transform:'translateY(-5px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,delay:120+index*55,easing:'ease-out'},bag))
}

export function InteractionRuntime(){
  const location=useLocation()

  useEffect(()=>{
    const animations=[]
    const reduced=safeBool(clientReducedMotion,false)
    const fine=safeBool(clientFinePointer,false)
    const root=document.documentElement
    root.classList.add('nq-interactions-ready')
    root.dataset.nqMotion=reduced?'reduced':'full'
    root.dataset.nqPointer=fine?'fine':'coarse'

    routeWipe(reduced,animations)
    requestAnimationFrame(()=>{
      heroEntrance(reduced,animations)
      pageEntrance(reduced,animations)
      pageSpecificAnimations(reduced,animations)
    })

    let observer=null
    if(!reduced&&'IntersectionObserver' in window){
      observer=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(!entry.isIntersecting||entry.target.dataset.nqSeen==='1')return
          entry.target.dataset.nqSeen='1'
          animateElement(entry.target,[{opacity:.12,transform:'translateY(26px)'},{opacity:1,transform:'translateY(0)'}],{duration:560,easing:'cubic-bezier(.22,1,.36,1)'},animations)
          observer?.unobserve(entry.target)
        })
      },{threshold:.14,rootMargin:'0px 0px -4% 0px'})
      document.querySelectorAll(ENTRY_SELECTORS).forEach(el=>observer.observe(el))
    }

    const hero=document.querySelector('.premium-hero')
    let ticking=false
    const onScroll=()=>{
      if(ticking)return
      ticking=true
      requestAnimationFrame(()=>{
        const y=window.scrollY||0
        root.style.setProperty('--nq-scroll-y',String(y))
        root.style.setProperty('--nq-scroll-progress',String(Math.min(1,y/Math.max(1,document.documentElement.scrollHeight-innerHeight))))
        if(hero&&!reduced){
          const amount=Math.min(18,y*.035)
          hero.style.setProperty('--nq-head-parallax',`${amount*.55}px`)
          hero.style.setProperty('--nq-code-parallax',`${amount}px`)
        }
        ticking=false
      })
    }
    window.addEventListener('scroll',onScroll,{passive:true})
    onScroll()

    return()=>{
      observer?.disconnect()
      window.removeEventListener('scroll',onScroll)
      animations.forEach(animation=>{try{animation.cancel()}catch{}})
      document.querySelectorAll('[data-nq-seen]').forEach(el=>delete el.dataset.nqSeen)
    }
  },[location.pathname])

  return null
}
