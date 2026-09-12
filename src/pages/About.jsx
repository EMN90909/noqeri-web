import React from 'react'
import { NavLink } from 'react-router-dom'
import { Card, Code, PageHero } from '../components.jsx'

export function About(){return <div className="page-body">
  <PageHero index="11 / ABOUT" title="Small surface. Serious reach." text="Noqeri is an independent language project focused on readable static typing, explicit low-level control, portable host boundaries and a toolchain that stays understandable." />
  <section className="statement"><span>WHY</span><p>Systems capability should be available without turning ordinary application code into a ceremony.</p></section>
  <section className="grid cols-3">
    <Card index="01" title="Language">Familiar syntax, strict conversion rules, owned fixed arrays, borrowed slices, constrained generics and explicit systems operations.</Card>
    <Card index="02" title="Toolchain">Compiler, formatter, LSP, package metadata, content-addressed locks, target adapters and reproducible tests live as one coherent project.</Card>
    <Card index="03" title="Web">Noqeri can emit portable JavaScript modules for browser and hosted server adapters while retaining its native systems path.</Card>
  </section>
  <Code>{`function principle<T: Eq>(left: T, right: T): bool {\n    return left == right\n}`}</Code>
  <section className="big-link"><NavLink className="cta" to="/docs/getting-started">Read the manual <span>↗</span></NavLink></section>
</div>}
