import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Page } from '../components.jsx'

const principles = [
  ['Keep the first step small', 'A new programmer should be able to read a first example without learning systems internals.'],
  ['Make power explicit', 'Types, casts, pointers and platform boundaries should be visible in the code.'],
  ['Teach through real examples', 'The aim is approachable syntax backed by examples that can be inspected and tested.'],
  ['Be honest about progress', 'The website should explain what the current compiler implements and what is still in progress.'],
  ['Build in public', 'Language, packages, documentation and tooling can improve together, one useful step at a time.']
]

export function About() {
  const [active, setActive] = useState(0)

  return <Page kicker="ABOUT / THE BUILDER" title="Built by curiosity. Designed to make coding easier." intro="Noqeri is an independent language project with a simple goal: make programming feel more approachable without putting a ceiling on what people can build.">
    <section className="about-founder">
      <div className="about-founder-aside">
        <div className="about-founder-mark" aria-hidden="true">EN</div>
        <small>CREATOR / DEVELOPER</small>
        <strong>Emmanuel Nasong'o</strong>
        <span>Teen developer · Noqeri creator</span>
      </div>
      <div className="about-founder-copy">
        <p className="founder-label">MADE BY EMMANUEL NASONG'O</p>
        <p className="founder-lead">A teen developer inspired to make coding easier to learn, easier to read, and less intimidating.</p>
        <p>Noqeri grew from the idea that learning a programming language should feel like opening a door, not hitting a wall. The everyday syntax should be clear enough for a beginner to follow, while the language still leaves room to explore systems programming, web development, packages and real tools as skills grow.</p>
        <p>This is an evolving project built in public. The goal is to keep improving the language, the compiler, the examples and the ecosystem—and to be honest about the difference between a feature described in the language design and one fully supported by each compiler stage.</p>
        <div className="about-founder-links">
          <a href="https://github.com/EMN90909" target="_blank" rel="noreferrer">Follow the work on GitHub ↗</a>
          <NavLink to="/language">Explore the language →</NavLink>
          <NavLink to="/docs/getting-started">Start learning →</NavLink>
        </div>
      </div>
    </section>
    <section className="about-origin">
      <small>THE IDEA</small>
      <p>Make the common path simple, keep low-level power explicit, and let people grow from their first print statement into projects they are proud to ship.</p>
    </section>
    <section className="principles-list" aria-label="Noqeri design principles">
      {principles.map((principle, index) => <button type="button" key={principle[0]} aria-pressed={active === index} onMouseEnter={() => setActive(index)} onFocus={() => setActive(index)} onClick={() => setActive(index)}>
        <b>{String(index + 1).padStart(2, '0')}</b>
        <span>{principle[0]}</span>
        <em>{active === index ? principle[1] : 'Select to read'}</em>
      </button>)}
    </section>
    <section className="about-timeline" aria-label="Project direction">
      <span><b>01</b> Keep the beginner path readable</span><i />
      <span><b>02</b> Grow the compiler and ecosystem</span><i />
      <span><b>03</b> Improve implementation parity and tooling</span>
    </section>
    <div className="big-link"><NavLink className="cta" to="/docs">Read the Noqeri manual <span>↘</span></NavLink></div>
    <div className="notice">Made by Emmanuel Nasong'o · <a href="https://github.com/EMN90909/Noqeri" target="_blank" rel="noreferrer">View the Noqeri source</a> · <NavLink to="/packages">Explore packages</NavLink></div>
  </Page>
}
