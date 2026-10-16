import React, { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { Home } from './pages/Home.jsx'
import { clientVersion } from './noqeri/client.generated.nqo'
import { useNoqeriMotion } from './motion/MotionProvider.jsx'
import { InteractionRuntime } from './motion/InteractionRuntime.jsx'
import './refresh.css'

const Language = lazy(() => import('./pages/Language.jsx').then(module => ({ default: module.Language })))
const Docs = lazy(() => import('./pages/Docs.jsx').then(module => ({ default: module.Docs })))
const Packages = lazy(() => import('./pages/Packages.jsx').then(module => ({ default: module.Packages })))
const Registry = lazy(() => import('./pages/Registry.jsx').then(module => ({ default: module.Registry })))
const Ecosystem = lazy(() => import('./pages/Ecosystem.jsx').then(module => ({ default: module.Ecosystem })))
const Benchmarks = lazy(() => import('./pages/Benchmarks.jsx').then(module => ({ default: module.Benchmarks })))
const Install = lazy(() => import('./pages/Install.jsx').then(module => ({ default: module.Install })))
const Playground = lazy(() => import('./pages/Playground.jsx').then(module => ({ default: module.Playground })))
const Community = lazy(() => import('./pages/Community.jsx').then(module => ({ default: module.Community })))
const About = lazy(() => import('./pages/About.jsx').then(module => ({ default: module.About })))
const NotFound = lazy(() => import('./pages/NotFound.jsx').then(module => ({ default: module.NotFound })))

const nav = [['Language', '/language'], ['Docs', '/docs'], ['Packages', '/packages'], ['Registry', '/registry'], ['Ecosystem', '/ecosystem']]

function GithubIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .7a11.3 11.3 0 0 0-3.57 22c.57.1.78-.25.78-.55v-2.2c-3.18.7-3.85-1.35-3.85-1.35-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.25 3.34.96.1-.74.4-1.25.73-1.54-2.54-.29-5.21-1.27-5.21-5.59 0-1.23.44-2.24 1.17-3.03-.12-.29-.51-1.45.11-3 0 0 .95-.31 3.11 1.16A10.8 10.8 0 0 1 12 6.99c.96 0 1.93.13 2.84.38 2.16-1.47 3.11-1.16 3.11-1.16.62 1.55.23 2.71.11 3 .73.79 1.8 1.17 3.03 0 4.33-2.68 5.29-5.23.41.35.78 1.05.78 2.12v3.22c0 .3.21.66.79.55A11.3 11.3 0 0 0 12 .7Z"/></svg>
}

function PageMeta() {
  const location = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    const rawTitle = location.pathname === '/' ? 'Noqeri' : location.pathname.split('/').filter(Boolean).join(' · ')
    const title = rawTitle.split(/[-/]+/).filter(Boolean).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' · ')
    document.title = title + ' — Noqeri'
  }, [location.pathname])
  return null
}

function CursorFollower() {
  const { reduced, finePointer } = useNoqeriMotion()
  const ref = useRef(null)

  useEffect(() => {
    if (reduced || !finePointer) return
    const element = ref.current
    let frame = 0
    let x = 0
    let y = 0
    const move = event => {
      x = event.clientX
      y = event.clientY
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        if (element) element.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)'
      })
    }
    const over = event => {
      const target = event.target instanceof Element ? event.target.closest('a,button,[data-cursor]') : null
      if (element) element.dataset.mode = target && target.dataset.cursor ? target.dataset.cursor : (target ? 'action' : '')
    }
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerover', over)
    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerover', over)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [reduced, finePointer])

  if (reduced || !finePointer) return null
  return <div className="cursor-follower" ref={ref} aria-hidden="true"><span /></div>
}

function SlashTransition({ path }) {
  const { reduced } = useNoqeriMotion()
  if (reduced) return null
  return <motion.div key={path} className="slash-transition" initial={{ scaleX: 0, x: '-55%' }} animate={{ scaleX: [0, 1, 1, 0], x: ['-55%', '0%', '0%', '55%'] }} transition={{ duration: .58, times: [0, .38, .62, 1], ease: [.22, 1, .36, 1] }} aria-hidden="true" />
}

export default function App() {
  const location = useLocation()
  const [compact, setCompact] = useState(false)
  const { reduced, tokens } = useNoqeriMotion()

  useEffect(() => {
    let last = window.scrollY
    let frame = 0
    let compactValue = false
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const y = window.scrollY
        const next = y > 22 && y >= last - 4
        last = y
        if (next !== compactValue) {
          compactValue = next
          setCompact(next)
        }
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return <div className="site-shell designer-shell">
    <a className="skip-link" href="#main">Skip to content</a>
    <PageMeta />
    <InteractionRuntime />
    <CursorFollower />
    <SlashTransition path={location.pathname} />
    <header className={'masthead' + (compact ? ' is-compact' : '')}>
      <NavLink className="wordmark" to="/">NOQERI<span>/</span></NavLink>
      <nav aria-label="Primary">{nav.map(([label, path]) => <NavLink key={path} to={path}>{label}</NavLink>)}</nav>
      <div className="header-actions">
        <span className="version-chip">Language {clientVersion()}</span>
        <a className="github-button" href="https://github.com/EMN90909/Noqeri" target="_blank" rel="noreferrer" aria-label="Noqeri on GitHub"><GithubIcon /></a>
        <NavLink className="install-button" to="/install">Install</NavLink>
      </div>
    </header>
    <main id="main" className="route-stage">
      <AnimatePresence mode="wait">
        <motion.div key={location.pathname} className="page-transition premium-route" initial={reduced ? false : { opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? undefined : { opacity: 0, y: -3 }} transition={{ duration: reduced ? 0 : .32, ease: tokens.ease.editorial }}>
          <Suspense fallback={<div className="route-loading" role="status" aria-live="polite">Loading Noqeri…</div>}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/language" element={<Language />} />
              <Route path="/docs/*" element={<Docs />} />
              <Route path="/packages" element={<Packages />} />
              <Route path="/registry" element={<Registry />} />
              <Route path="/ecosystem" element={<Ecosystem />} />
              <Route path="/benchmarks" element={<Benchmarks />} />
              <Route path="/install" element={<Install />} />
              <Route path="/playground" element={<Playground />} />
              <Route path="/community" element={<Community />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </main>
    <footer>
      <div className="footer-mark">NQ</div>
      <div><strong>Noqeri language {clientVersion()}</strong><br />Compact, explicit, inspectable.</div>
      <div className="footer-links"><NavLink to="/docs">Docs</NavLink><NavLink to="/packages">Packages</NavLink><NavLink to="/community">Community</NavLink><NavLink to="/about">About</NavLink></div>
      <div className="made-by">Made by <strong>Emmanuel Nasong'o</strong></div>
    </footer>
  </div>
}
