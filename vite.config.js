import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// The Noqeri web compiler emits a checked JavaScript transport module (.mjs).
// Do not treat legacy .nqo JavaScript shims as canonical .nqri objects.
export default defineConfig({
 plugins:[react()],
 build:{target:'es2022',cssCodeSplit:true,sourcemap:false},
 server:{host:'0.0.0.0'}
})
