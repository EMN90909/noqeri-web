import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'

export default defineConfig({
  plugins:[
    react(),
    {
      name:'noqeri-nqo',
      enforce:'pre',
      load(id){ if(id.endsWith('.nqo')) return readFileSync(id,'utf8') }
    }
  ],
  build:{target:'es2022',cssCodeSplit:true,sourcemap:false},
  server:{host:'0.0.0.0'}
})
