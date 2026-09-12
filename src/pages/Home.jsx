import React from 'react'
import { Card, Code, CTA, Grid } from '../components.jsx'

const sample=`module app.home

function greet(name: string): string {
    return "Hello, " + name
}

export function main(): void {
    print(greet("Noqeri"))
}`
export function Home(){return <>
  <section className="home-hero"><div className="hero-number">1.0</div><div className="hero-copy"><div className="kicker">A SMALL LANGUAGE WITH A WIDE REACH</div><h1>One language.<br/><em>More places.</em></h1><p>Noqeri keeps ordinary code readable, then lets you move into native systems work, browser modules, server APIs and embedded data without switching language models.</p><div className="hero-actions"><CTA to="/docs/getting-started">Start building</CTA><CTA to="/docs/web-objects">See web + data</CTA></div></div><div className="hero-code"><Code>{sample}</Code></div></section>
  <section className="statement"><span>THE 1.0 IDEA</span><p>Keep the common path simple. Make powerful capabilities explicit. Put platform complexity in libraries and hosts instead of syntax.</p></section>
  <Grid cols={4}><Card index="01" title="Native"><p>Typed NIR, explicit targets, ABI boundaries, atomics, pointers and freestanding x86-64 output.</p></Card><Card index="02" title="Web"><p><code>.nqo</code> modules expose DOM, routing, fetch, JSON and host-backed server capabilities.</p></Card><Card index="03" title="Data"><p><code>.nqd</code> is a compact typed data language backed by the embedded NoqeriDB engine.</p></Card><Card index="04" title="Packages"><p>The 1.0 registry publishes tested core, web, security and data package surfaces with deterministic downloads.</p></Card></Grid>
  <section className="big-link"><CTA to="/docs">Open the 1.0 manual</CTA></section>
</>}
