import React,{createContext,useContext} from 'react'
import { MotionConfig,useReducedMotion } from 'motion/react'
import { motionTokens } from './tokens.js'

const NoqeriMotionContext=createContext({reduced:false,tokens:motionTokens})

export function NoqeriMotionProvider({children}){
  const reduced=Boolean(useReducedMotion())
  return <NoqeriMotionContext.Provider value={{reduced,tokens:motionTokens}}>
    <MotionConfig reducedMotion="user" transition={{duration:motionTokens.duration.fast,ease:motionTokens.ease.sharp}}>
      {children}
    </MotionConfig>
  </NoqeriMotionContext.Provider>
}

export function useNoqeriMotion(){return useContext(NoqeriMotionContext)}
