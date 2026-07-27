import { readFile, writeFile } from 'node:fs/promises'
import { transform } from 'esbuild'

const appPath = new URL('../src/App.jsx', import.meta.url)
const original = await readFile(appPath, 'utf8')
const lines = original.split(/\r?\n/)

// Repair only the exact duplicated declarations already present in App.jsx.
// This deliberately works line-by-line so it cannot swallow unrelated braces,
// JSX, or function boundaries during Netlify's prebuild step.
const output = []
let pacerVoiceSeen = false
let insideDbImport = false
let listenerRepairStarted = false
let listenerRepairFinished = false

for (let index = 0; index < lines.length; index += 1) {
  const line = lines[index]

  if (line.includes("from './lib/db'")) insideDbImport = false
  if (line.trim() === 'import {') insideDbImport = true

  if (line === "import PACERVoice from './components/PACERVoice'") {
    if (pacerVoiceSeen) continue
    pacerVoiceSeen = true
  }

  if (insideDbImport && line.trim() === 'listenCommands, updateCommand,') {
    continue
  }

  if (
    insideDbImport &&
    line.trim() === 'approveCommand, denyCommand, completeCommand, failCommand, archiveCommand, listenCommands,'
  ) {
    output.push('  approveCommand, denyCommand, completeCommand, failCommand, archiveCommand, listenCommands,')
    continue
  }

  if (
    line.includes('const unsubDoctrine  = listenDoctrineCases') &&
    lines[index + 1]?.includes('const unsubCommands  = listenCommands') &&
    lines[index + 2]?.includes('return () =>')
  ) {
    listenerRepairStarted = true
    // Skip the first duplicate pair and its premature cleanup return.
    index += 2
    continue
  }

  if (listenerRepairStarted && line.includes('const unsubDoctrine   = listenDoctrineCases')) {
    listenerRepairFinished = true
  }

  output.push(line)
}

let repaired = output.join('\n')

const count = needle => repaired.split(needle).length - 1
if (count("import PACERVoice from './components/PACERVoice'") !== 1) {
  throw new Error('[prebuild] PACERVoice import repair failed')
}
if (count('listenCommands, updateCommand,') !== 0) {
  throw new Error('[prebuild] duplicate command import repair failed')
}
if (!listenerRepairStarted || !listenerRepairFinished) {
  throw new Error('[prebuild] duplicate listener block was not repaired safely')
}

// Never write malformed JSX. esbuild is already installed through Vite.
try {
  await transform(repaired, { loader: 'jsx', jsx: 'automatic' })
} catch (error) {
  const detail = error?.errors?.[0]
  const where = detail?.location ? `${detail.location.line}:${detail.location.column}` : 'unknown location'
  throw new Error(`[prebuild] repaired App.jsx still fails to parse at ${where}: ${detail?.text || error.message}`)
}

if (repaired !== original) {
  await writeFile(appPath, repaired)
  console.log('[prebuild] repaired duplicate App.jsx symbols without altering component structure')
}
console.log('[prebuild] App.jsx JSX integrity check passed')
