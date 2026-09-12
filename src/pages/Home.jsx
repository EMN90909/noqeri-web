import React from 'react'
import { Card, Code, CTA, Grid } from '../components.jsx'

const sample = `module graphics.buffer

record Buffer {
    pixels: *volatile u32
    length: usize
}

function update(counter: *u64): u64 {
    atomic.store(counter, 1)
    return atomic.exchange(counter, 2)
}`

export function Home() {
  return <>
    <section className="home-hero">
      <div className="hero-number">01</div>
      <div className="hero-copy"><div className="kicker">A GENERAL-PURPOSE SYSTEMS LANGUAGE</div><h1>Explicit power.<br/><em>Less ceremony.</em></h1><p>Noqeri is a compact, statically typed language for ordinary software and low-level work without making an operating system part of the language model.</p><div className="hero-actions"><CTA to="/language">Read the language</CTA><CTA to="/install">Get the toolchain</CTA></div></div>
      <div className="hero-code"><Code>{sample}</Code></div>
    </section>
    <section className="statement"><span>THE POSITION</span><p>Readable enough for application code. Explicit enough for memory, atomics, intrinsics and freestanding targets.</p></section>
    <Grid cols={3}>
      <Card index="A" title="Typed"><p>Fixed-width integers, records, pointers, arrays, slices and generics with visible conversions.</p></Card>
      <Card index="B" title="Freestanding"><p>Host capabilities are an ABI boundary. Filesystems, processes and specific kernels are not assumed by the language.</p></Card>
      <Card index="C" title="Toolable"><p>A compiler, interpreter, NIR, package contract, formatter and language server grow as one system.</p></Card>
    </Grid>
    <section className="big-link"><CTA to="/ecosystem">Explore the Noqeri ecosystem</CTA></section>
  </>
}
