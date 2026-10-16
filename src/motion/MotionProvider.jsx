import React,{createContext,useContext,useEffect,useMemo,useState} from 'react'
import { MotionConfig,useReducedMotion } from 'motion/react'
import { motionTokens } from './tokens.js'
import { clientFinePointer,clientMotionProfile,clientReducedMotion } from '../noqeri/client.generated.nqo'

const NoqeriMotionContext=createContext({reduced:false,finePointer:false,profile:null,tokens:motionTokens})

function readNoqeriMotionProfile(){
  try{return JSON.parse(clientMotionProfile())}catch{return null}
}

export function NoqeriMotionProvider({children}){
  const motionReduced=Boolean(useReducedMotion())
  const [runtime,setRuntime]=useState(()=>({
    reduced:typeof window==='undefined'?false:Boolean(clientReducedMotion()),
    finePointer:typeof window==='undefined'?false:Boolean(clientFinePointer()),
    profile:typeof window==='undefined'?null:readNoqeriMotionProfile()
  }))

  useEffect(()=>{
    const refresh=()=>setRuntime({
      reduced:Boolean(clientReducedMotion()),
      finePointer:Boolean(clientFinePointer()),
      profile:readNoqeriMotionProfile()
    })
    refresh()
    const media=window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const pointer=window.matchMedia?.('(hover: hover) and (pointer: fine)')
    media?.addEventListener?.('change',refresh)
    pointer?.addEventListener?.('change',refresh)
    window.addEventListener('resize',refresh,{passive:true})
    return()=>{
      media?.removeEventListener?.('change',refresh)
      pointer?.removeEventListener?.('change',refresh)
      window.removeEventListener('resize',refresh)
    }
  },[])

  const reduced=Boolean(motionReduced||runtime.reduced)
  const value=useMemo(()=>({reduced,finePointer:runtime.finePointer,profile:runtime.profile,tokens:motionTokens}),[reduced,runtime])

  useEffect(()=>{
    document.documentElement.dataset.motion=reduced?'reduced':'full'
    document.documentElement.dataset.pointer=runtime.finePointer?'fine':'coarse'
  },[reduced,runtime.finePointer])

  return <NoqeriMotionContext.Provider value={value}>
    <MotionConfig reducedMotion={reduced?'always':'never'} transition={{duration:motionTokens.duration.fast,ease:motionTokens.ease.sharp}}>
      {children}
    </MotionConfig>
  </NoqeriMotionContext.Provider>
}

export function useNoqeriMotion(){return useContext(NoqeriMotionContext)}
