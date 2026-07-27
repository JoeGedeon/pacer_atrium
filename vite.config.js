import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function repairLegacyAppDuplicates() {
  return {
    name: 'repair-legacy-app-duplicates',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('/src/App.jsx') && !id.endsWith('\\src\\App.jsx')) return null

      let repaired = code

      repaired = repaired.replace(
        `  listenCommands, updateCommand,\n  createCommand, updateCommand, submitCommandForApproval,\n  approveCommand, denyCommand, completeCommand, failCommand, archiveCommand, listenCommands,\n`,
        `  createCommand, updateCommand, submitCommandForApproval,\n  approveCommand, denyCommand, completeCommand, failCommand, archiveCommand, listenCommands,\n`,
      )

      repaired = repaired.replace(
        `import PACERVoice from './components/PACERVoice'\nimport CommandWorkbench from './components/CommandWorkbench'\nimport { uploadStudioArtifactImage } from './lib/imageUpload'\nimport PACERVoice from './components/PACERVoice'\n`,
        `import PACERVoice from './components/PACERVoice'\nimport CommandWorkbench from './components/CommandWorkbench'\nimport { uploadStudioArtifactImage } from './lib/imageUpload'\n`,
      )

      repaired = repaired.replace(
        `    const unsubDoctrine  = listenDoctrineCases(user.uid, setDoctrineCases)\n    const unsubCommands  = listenCommands(user.uid, setCommands)\n    return () => { unsubObs(); unsubMuse(); unsubGrad(); unsubReviews(); unsubDecisions(); unsubThreads(); unsubEvents(); unsubLogs(); unsubProds(); unsubMedia(); unsubDoctrine(); unsubCommands() }\n    const unsubDoctrine   = listenDoctrineCases(user.uid, setDoctrineCases)\n    const unsubCommands   = listenCommands(user.uid, setCommands)\n    const unsubArtifacts  = listenStudioArtifacts(user.uid, setStudioArtifacts)\n    const unsubLineage    = listenLineage(user.uid, setLineage)\n    return () => { unsubObs(); unsubMuse(); unsubGrad(); unsubReviews(); unsubDecisions(); unsubThreads(); unsubEvents(); unsubLogs(); unsubProds(); unsubMedia(); unsubDoctrine(); unsubCommands(); unsubArtifacts(); unsubLineage() }\n`,
        `    const unsubDoctrine   = listenDoctrineCases(user.uid, setDoctrineCases)\n    const unsubCommands   = listenCommands(user.uid, setCommands)\n    const unsubArtifacts  = listenStudioArtifacts(user.uid, setStudioArtifacts)\n    const unsubLineage    = listenLineage(user.uid, setLineage)\n    return () => { unsubObs(); unsubMuse(); unsubGrad(); unsubReviews(); unsubDecisions(); unsubThreads(); unsubEvents(); unsubLogs(); unsubProds(); unsubMedia(); unsubDoctrine(); unsubCommands(); unsubArtifacts(); unsubLineage() }\n`,
      )

      const voiceImports = repaired.match(/import PACERVoice from '.\/components\/PACERVoice'/g) || []
      if (voiceImports.length !== 1) {
        throw new Error(`[vite repair] expected one PACERVoice import, found ${voiceImports.length}`)
      }
      if (repaired.includes('listenCommands, updateCommand')) {
        throw new Error('[vite repair] duplicate command import pattern still present')
      }

      return repaired === code ? null : { code: repaired, map: null }
    },
  }
}

export default defineConfig({
  plugins: [repairLegacyAppDuplicates(), react()],
})
