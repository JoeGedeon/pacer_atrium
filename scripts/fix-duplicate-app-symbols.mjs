import { readFile, writeFile } from 'node:fs/promises'

const appPath = new URL('../src/App.jsx', import.meta.url)
let source = await readFile(appPath, 'utf8')

const replacements = [
  {
    name: 'duplicate command imports',
    from: `  listenCommands, updateCommand,\n  createCommand, updateCommand, submitCommandForApproval,\n  approveCommand, denyCommand, completeCommand, failCommand, archiveCommand, listenCommands,\n`,
    to: `  createCommand, updateCommand, submitCommandForApproval,\n  approveCommand, denyCommand, completeCommand, failCommand, archiveCommand, listenCommands,\n`,
  },
  {
    name: 'duplicate PACERVoice import',
    from: `import PACERVoice from './components/PACERVoice'\nimport CommandWorkbench from './components/CommandWorkbench'\nimport { uploadStudioArtifactImage } from './lib/imageUpload'\nimport PACERVoice from './components/PACERVoice'\n`,
    to: `import PACERVoice from './components/PACERVoice'\nimport CommandWorkbench from './components/CommandWorkbench'\nimport { uploadStudioArtifactImage } from './lib/imageUpload'\n`,
  },
  {
    name: 'duplicate Firestore listeners and unreachable cleanup',
    from: `    const unsubDoctrine  = listenDoctrineCases(user.uid, setDoctrineCases)\n    const unsubCommands  = listenCommands(user.uid, setCommands)\n    return () => { unsubObs(); unsubMuse(); unsubGrad(); unsubReviews(); unsubDecisions(); unsubThreads(); unsubEvents(); unsubLogs(); unsubProds(); unsubMedia(); unsubDoctrine(); unsubCommands() }\n    const unsubDoctrine   = listenDoctrineCases(user.uid, setDoctrineCases)\n    const unsubCommands   = listenCommands(user.uid, setCommands)\n    const unsubArtifacts  = listenStudioArtifacts(user.uid, setStudioArtifacts)\n    const unsubLineage    = listenLineage(user.uid, setLineage)\n    return () => { unsubObs(); unsubMuse(); unsubGrad(); unsubReviews(); unsubDecisions(); unsubThreads(); unsubEvents(); unsubLogs(); unsubProds(); unsubMedia(); unsubDoctrine(); unsubCommands(); unsubArtifacts(); unsubLineage() }\n`,
    to: `    const unsubDoctrine   = listenDoctrineCases(user.uid, setDoctrineCases)\n    const unsubCommands   = listenCommands(user.uid, setCommands)\n    const unsubArtifacts  = listenStudioArtifacts(user.uid, setStudioArtifacts)\n    const unsubLineage    = listenLineage(user.uid, setLineage)\n    return () => { unsubObs(); unsubMuse(); unsubGrad(); unsubReviews(); unsubDecisions(); unsubThreads(); unsubEvents(); unsubLogs(); unsubProds(); unsubMedia(); unsubDoctrine(); unsubCommands(); unsubArtifacts(); unsubLineage() }\n`,
  },
]

let changed = false
for (const replacement of replacements) {
  if (source.includes(replacement.from)) {
    source = source.replace(replacement.from, replacement.to)
    changed = true
    console.log(`[prebuild] fixed ${replacement.name}`)
  }
}

const duplicateChecks = [
  ["import PACERVoice from './components/PACERVoice'", 1],
  ['listenCommands, updateCommand', 0],
  ['const unsubDoctrine  =', 0],
]

for (const [needle, expected] of duplicateChecks) {
  const count = source.split(needle).length - 1
  if (count !== expected) {
    throw new Error(`[prebuild] App.jsx integrity check failed for "${needle}": expected ${expected}, found ${count}`)
  }
}

if (changed) await writeFile(appPath, source)
console.log('[prebuild] App.jsx duplicate-symbol check passed')
