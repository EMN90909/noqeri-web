import React, { useEffect } from 'react'
import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
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
import { About } from './pages/About.jsx'
import { NotFound } from './pages/NotFound.jsx'
import { clientVersion } from './noqeri/client.generated.nqo'

const nav=[['Language','/language'],['Docs','/docs'],['Packages','/packages'],['Registry','/registry'],['Ecosystem','/ecosystem']]
function GithubIcon(){return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .7a11.3 11.3 0 0 0-3.57 22c.57.1.78-.25.78-.55v-2.2c-3.18.7-3.85-1.35-3.85-1.35-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.25 3.34.96.1-.74.4-1.25.73-1.54-2.54-.29-5.21-1.27-5.21-5.59 0-1.23.44-2.24 1.17-3.03-.12-.29-.51-1.45.11-3 0 0 .95-.31 3.11 1.16A10.8 10.8 0 0 1 12 6.99c.96 0 1.93.13 2.84.38 2.16-1.47 3.11-1.16 3.11-1.16.62 1.55.23 2.71.11 3 .73.79 1.17 1.8 1.17 3.03 0 4.33-2.68 5.29-5.23 5.57.41.35.78 1.05.78 2.12v3.22c0 .3.21.66.79.55A11.3 11.3 0 0 0 12 .7Z"/></svg>}
function PageMeta(){const location=useLocation();useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});const part=location.pathname==='/'?'Noqeri':location.pathname.split('/').filter(Boolean).map(x=>x.replaceAll('-',' ')).join(' · ');document.title=`${part.replace(/\b\w/g,c=>c.toUpperCase())} — Noqeri`},[location.pathname]);return null}
export default function App(){const location=useLocation();return <div className="site-shell">
  <a className="skip-link" href="#main">Skip to content</a><PageMeta/>
  <header className="masthead">
    <NavLink className="wordmark" to="/" aria-label="Noqeri home">NOQERI<span>/</span></NavLink>
    <nav aria-label="Primary">{nav.map(([label,path])=><NavLink key={path} to={path}>{label}</NavLink>)}</nav>
    <div className="header-actions"><span className="version-chip" data-noqeri-client>Noqeri {clientVersion()}</span><a className="github-button" href="https://github.com/EMN90909/Noqeri" target="_blank" rel="noreferrer" aria-label="Noqeri on GitHub"><GithubIcon/></a><NavLink className="install-button" to="/install">Install</NavLink></div>
  </header>
  <main id="main" className="route-stage"><div key={location.pathname} className="page-transition"><Routes location={location}>
    <Route path="/" element={<Home/>}/><Route path="/language" element={<Language/>}/><Route path="/docs/*" element={<Docs/>}/><Route path="/packages" element={<Packages/>}/><Route path="/registry" element={<Registry/>}/><Route path="/ecosystem" element={<Ecosystem/>}/><Route path="/benchmarks" element={<Benchmarks/>}/><Route path="/install" element={<Install/>}/><Route path="/playground" element={<Playground/>}/><Route path="/community" element={<Community/>}/><Route path="/about" element={<About/>}/><Route path="*" element={<NotFound/>}/>
  </Routes></div></main>
  <footer><div className="footer-mark">NQ</div><div><strong>Noqeri 1.0</strong><br/>Native systems, portable web objects and embedded data with one compact language surface.</div><div className="footer-links"><NavLink to="/docs">Docs</NavLink><NavLink to="/packages">Packages</NavLink><NavLink to="/about">About</NavLink><a href="https://github.com/EMN90909/Noqeri">GitHub</a></div><div className="made-by">Made by <strong>Noethic</strong></div></footer>
</div>}
