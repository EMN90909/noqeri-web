import React from 'react'
import { Card, Code, Grid, Page } from '../components.jsx'

export function Language() {
  return <Page kicker="02 / LANGUAGE" title="Familiar grammar. Deliberate semantics." intro="Noqeri borrows recognisable shapes from systems languages but keeps the contract small: declarations read left-to-right, unsafe power is visible, and implicit conversions are limited to provably safe cases.">
    <Grid cols={2}>
      <Card index="01" title="Values and types"><Code>{`let port: u16 = 8080\nlet count: u64 = port\nlet byte: u8 = count as u8`}</Code></Card>
      <Card index="02" title="Borrowed slices"><Code>{`let values: [u32; 3] = [1 as u32, 2 as u32, 3 as u32]\nlet view: []u32 = slice(values)\nprint(len(view))`}</Code></Card>
      <Card index="03" title="Status propagation"><Code>{`function load(): isize {\n    throw 3\n}\n\nfunction start(): isize {\n    let status = try load()\n    return status\n}`}</Code></Card>
      <Card index="04" title="Systems work"><Code>{`let ptr: *u64 = &counter\natomic.store(ptr, 1)\nintrinsic("x86.pause")\nasm("nop")`}</Code></Card>
    </Grid>
  </Page>
}
