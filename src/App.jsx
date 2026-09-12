import React from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home.jsx'
import { Language } from './pages/Language.jsx'
import { Docs } from './pages/Docs.jsx'
import { Packages } from './pages/Packages.jsx'
import { Registry } from './pages/Registry.jsx'
import { Ecosystem } from './pages/Ecosystem.jsx'
import { Benchmarks } from './pages/Benchmarks.jsx'
import { Install } from './pages/Install.jsx'
import { Playground } from './pages/Playground.jsx'
import { Community } from './pages/Community.jsx'
import { NotFound } from './pages/NotFound.jsx'

const nav = [
  ['Language', '/language'], ['Docs', '/docs'], ['Packages', '/packages'],
  ['Registry', '/registry'], ['Ecosystem', '/ecosystem'], ['Benchmarks', '/benchmarks']
]

export default function App() {
  return <div className="site-shell">
    <header className="masthead">
      <NavLink className="wordmark" to="/">NOQERI<span>_</span></NavLink>
      <div className="release">LANG 1.5 / EDITION 2026</div>
      <nav aria-label="Primary">
        {nav.map(([label, path]) => <NavLink key={path} to={path}>{label}</NavLink>)}
      </nav>
      <NavLink className="install-button" to="/install">Install ↘</NavLink>
    </header>
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/language" element={<Language />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/registry" element={<Registry />} />
        <Route path="/ecosystem" element={<Ecosystem />} />
        <Route path="/benchmarks" element={<Benchmarks />} />
        <Route path="/install" element={<Install />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/community" element={<Community />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
    <footer>
      <div className="footer-mark">NQ/26</div>
      <div>Noqeri is environment-neutral by design.</div>
      <div className="footer-links"><a href="https://github.com/EMN90909/Noqeri">Compiler</a><a href="https://github.com/EMN90909/noqeri-registry">Registry</a><NavLink to="/community">Community</NavLink></div>
    </footer>
  </div>
}
