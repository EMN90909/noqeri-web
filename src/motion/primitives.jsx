import React,{useRef} from 'react'
import { motion,useScroll } from 'motion/react'
import { useNoqeriMotion } from './MotionProvider.jsx'

export function Reveal({children,className='',delay=0,as='div',amount=.18,distance}){
  const {reduced,tokens}=useNoqeriMotion()
  const Component=motion[as]||motion.div
  const travel=distance??tokens.distance.component
  return <Component className={className} initial={reduced?false:{opacity:0,y:travel}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount}} transition={{duration:reduced?0:tokens.duration.base,delay:reduced?0:delay,ease:tokens.ease.editorial}}>{children}</Component>
}

export function AnimatedRule({className=''}){
  const {reduced,tokens}=useNoqeriMotion()
  return <motion.div aria-hidden="true" className={`animated-rule ${className}`} initial={reduced?false:{scaleX:0}} whileInView={{scaleX:1}} viewport={{once:true,amount:.7}} transition={{duration:reduced?0:tokens.duration.base,ease:tokens.ease.editorial}}/>
}

export function ArticleProgress({children,className=''}){
  const ref=useRef(null)
  const {scrollYProgress}=useScroll({target:ref,offset:['start start','end end']})
  return <div ref={ref} className={className}><motion.div className="reading-progress" style={{scaleX:scrollYProgress}} aria-hidden="true"/>{children}</div>
}
