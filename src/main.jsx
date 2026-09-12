import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { NoqeriMotionProvider } from './motion/MotionProvider.jsx'
import './styles.css'
import './motion.css'
import './designer.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <NoqeriMotionProvider>
        <App />
      </NoqeriMotionProvider>
    </BrowserRouter>
  </React.StrictMode>
)
