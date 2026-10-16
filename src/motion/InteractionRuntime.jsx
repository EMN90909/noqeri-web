import {useEffect} from 'react'
import {useLocation} from 'react-router-dom'
import {clientFinePointer,clientReducedMotion} from '../noqeri/client.generated.nqo'

const ENTRY_SELECTORS=[
  '.capability-plate',
  '.syntax-stage',
  '.syntax-tiles button',
  '.registry-feature',
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

function animateElement(el,keyframes,options,bag,persist=false){
  if(!el?.animate)return null
  const animation=el.animate(keyframes,{fill:'both',...options})
  bag.push(animation)
  animation.finished.catch(()=>{}).finally(()=>{
    if(persist) animation.commitStyles?.()
    animation.cancel()
  })
  return animation
}

function pageSpecificAnimations(reduced,bag){
  if(reduced)return
  document.querySelectorAll('.syntax-tabs button').forEach((el,index)=>animateElement(el,[{opacity:0,transform:'translateX(-14px)'},{opacity:1,transform:'translateX(0)'}],{duration:340,delay:150+index*55,easing:'cubic-bezier(.22,1,.36,1)'},bag))
  document.querySelectorAll('.verify-path button').forEach((el,index)=>animateElement(el,[{opacity:.25,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,delay:170+index*80,easing:'cubic-bezier(.22,1,.36,1)'},bag))
  document.querySelectorAll('.ecosystem-map g line').forEach((el,index)=>{
    el.style.strokeDasharray='260'
    el.style.strokeDashoffset='260'
    animateElement(el,[{strokeDashoffset:260},{strokeDashoffset:0}],{duration:850,delay:120+index*45,easing:'cubic-bezier(.22,1,.36,1)'},bag,true)
  })
  document.querySelectorAll('.benchmark-row > div span').forEach((el,index)=>animateElement(el,[{transform:'scaleX(0)'},{transform:getComputedStyle(el).transform==='none'?'scaleX(1)':getComputedStyle(el).transform}],{duration:900,delay:160+index*110,easing:'cubic-bezier(.22,1,.36,1)'},bag))
  document.querySelectorAll('.compiler-flow span,.compiler-flow i').forEach((el,index)=>animateElement(el,[{opacity:.2,transform:'translateY(-5px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,delay:120+index*55,easing:'ease-out'},bag))
}

export function InteractionRuntime(){
  const location=useLocation()

  useEffect(()=>{
    const animations=[]
    let setupFrame=0
    const reduced=safeBool(clientReducedMotion,false)
    const fine=safeBool(clientFinePointer,false)
    const root=document.documentElement
    root.classList.add('nq-interactions-ready')
    root.dataset.nqMotion=reduced?'reduced':'full'
    root.dataset.nqPointer=fine?'fine':'coarse'

    setupFrame=requestAnimationFrame(()=>{
      setupFrame=0
      pageSpecificAnimations(reduced,animations)
    })

    let observer=null
    if(!reduced&&'IntersectionObserver' in window){
      observer=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(!entry.isIntersecting||entry.target.dataset.nqSeen==='1')return
          entry.target.dataset.nqSeen='1'
          const style=getComputedStyle(entry.target)
          animateElement(entry.target,[{opacity:0,transform:'translateY(18px)'},{opacity:Number(style.opacity),transform:style.transform}],{duration:460,easing:'cubic-bezier(.22,1,.36,1)'},animations)
          observer?.unobserve(entry.target)
        })
      },{threshold:.14,rootMargin:'0px 0px -4% 0px'})
      document.querySelectorAll(ENTRY_SELECTORS).forEach(el=>observer.observe(el))
    }

    const hero=document.querySelector('.premium-hero')
    let scrollFrame=0
    const onScroll=()=>{
      if(scrollFrame)return
      scrollFrame=requestAnimationFrame(()=>{
        scrollFrame=0
        const y=window.scrollY||0
        root.style.setProperty('--nq-scroll-y',String(y))
        root.style.setProperty('--nq-scroll-progress',String(Math.min(1,y/Math.max(1,document.documentElement.scrollHeight-innerHeight))))
        if(hero&&!reduced){
          const amount=Math.min(18,y*.035)
          hero.style.setProperty('--nq-head-parallax',`${amount*.55}px`)
          hero.style.setProperty('--nq-code-parallax',`${amount}px`)
        }
      })
    }
    window.addEventListener('scroll',onScroll,{passive:true})
    onScroll()

    return()=>{
      if(setupFrame)cancelAnimationFrame(setupFrame)
      if(scrollFrame)cancelAnimationFrame(scrollFrame)
      observer?.disconnect()
      window.removeEventListener('scroll',onScroll)
      animations.forEach(animation=>{try{animation.cancel()}catch{}})
      document.querySelectorAll('[data-nq-seen]').forEach(el=>delete el.dataset.nqSeen)
    }
  },[location.pathname])

  return null
}
