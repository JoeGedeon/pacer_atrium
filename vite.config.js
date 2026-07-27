import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function repairLegacyDuplicates() {
  return {
    name: 'repair-legacy-duplicates',
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.replaceAll('\\', '/')

      if (normalized.endsWith('/src/App.jsx')) {
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

        return repaired === code ? null : { code: repaired, map: null }
      }

      if (normalized.endsWith('/src/lib/db.js')) {
        const startMarker = '// ── Commands — institutional execution directives'
        const endMarker = '// ── Doctrine Cases — constitutional review records'
        const start = code.indexOf(startMarker)
        const end = code.indexOf(endMarker)

        if (start !== -1 && end !== -1 && end > start) {
          const repaired = code.slice(0, start) + code.slice(end)
          return { code: repaired, map: null }
        }
      }

      return null
    },
  }
}

export default defineConfig({
  plugins: [repairLegacyDuplicates(), react()],
})
