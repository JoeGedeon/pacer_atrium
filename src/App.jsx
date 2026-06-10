import { useState, useEffect } from 'react'
import { useTheme } from './hooks/useTheme'
import LeftNav from './components/LeftNav'
import PACERHome from './components/PACERHome'
import ObservationStream from './components/ObservationStream'
import PACERProcessing from './components/PACERProcessing'
import AtriumDashboard from './components/AtriumDashboard'
import DoctrineRoom from './components/DoctrineRoom'
import TheaterRoom from './components/TheaterRoom'
import MuseRoom from './components/MuseRoom'
import PlaceholderRoom from './components/PlaceholderRoom'
import APIKeyGate from './components/APIKeyGate'
import { analyzeObservation } from './lib/claudeRouting'

function loadObservations() {
  try {
    return JSON.parse(localStorage.getItem('pacer_observations') || '[]').map(o => ({
      ...o,
      timestamp: new Date(o.timestamp),
    }))
  } catch {
    return []
  }
}

export default function App() {
  const { theme, setTheme } = useTheme()

  const [currentRoom, setCurrentRoom] = useState('home')
  const [observations, setObservations] = useState(loadObservations)
  const [activeObservation, setActiveObservation] = useState(null)
  const [apiKey] = useState(() => localStorage.getItem('pacer_api_key') || null)
  const [showKeyGate, setShowKeyGate] = useState(
    () => !localStorage.getItem('pacer_api_key') && !localStorage.getItem('pacer_key_skipped')
  )

  useEffect(() => {
    try {
      localStorage.setItem('pacer_observations', JSON.stringify(observations))
    } catch { /* storage full */ }
  }, [observations])

  function patchObservation(id, patch) {
    setObservations(prev => prev.map(o => o.id === id ? { ...o, ...patch } : o))
    setActiveObservation(prev => prev?.id === id ? { ...prev, ...patch } : prev)
  }

  async function submitObservation(obs) {
    const id = Date.now()
    const entry = {
      id,
      text: obs.text,
      type: obs.type,
      constellation: obs.constellation || null,
      timestamp: new Date(),
      status: 'received',
      destination: null,
      analyzing: !!apiKey,
      claude: null,
      claudeError: null,
    }
    setObservations(prev => [entry, ...prev])
    setActiveObservation(entry)

    if (apiKey) {
      try {
        const result = await analyzeObservation(obs.text, apiKey)
        patchObservation(id, { analyzing: false, claude: result })
      } catch (e) {
        patchObservation(id, { analyzing: false, claudeError: e.message })
      }
    }
  }

  function routeObservation(id, destination) {
    patchObservation(id, { destination, status: 'routed' })
  }

  function acceptConstellation(id, constellation) {
    patchObservation(id, { constellation })
  }

  function handleApiKey(key) {
    setShowKeyGate(false)
    if (key) {
      localStorage.setItem('pacer_api_key', key)
      window.location.reload()
    }
  }

  const isHome     = currentRoom === 'home'
  const isAtrium   = currentRoom === 'atrium'
  const isDoctrine = currentRoom === 'doctrine'
  const isTheater  = currentRoom === 'content'
  const isMuse     = currentRoom === 'muse'

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'var(--bg-0)', color: 'var(--text-0)' }}
    >
      {showKeyGate && <APIKeyGate onKey={handleApiKey} />}

      {!isHome && (
        <LeftNav
          currentRoom={currentRoom}
          onSelect={setCurrentRoom}
          theme={theme}
          onThemeChange={setTheme}
        />
      )}

      {isHome && (
        <PACERHome
          onEnter={room => setCurrentRoom(room)}
          observationCount={observations.length}
        />
      )}

      {isAtrium && (
        <>
          <ObservationStream
            observations={observations}
            onSubmit={submitObservation}
            activeObservation={activeObservation}
            onSelectObservation={setActiveObservation}
          />
          {activeObservation
            ? (
              <PACERProcessing
                observation={activeObservation}
                observations={observations}
                onRoute={routeObservation}
                onAcceptConstellation={acceptConstellation}
                hasApiKey={!!apiKey}
                onRequestApiKey={() => setShowKeyGate(true)}
              />
            )
            : (
              <AtriumDashboard
                observations={observations}
                onSelectObservation={setActiveObservation}
              />
            )
          }
        </>
      )}

      {isMuse     && <MuseRoom observations={observations} />}
      {isDoctrine && <DoctrineRoom />}
      {isTheater  && <TheaterRoom />}

      {!isHome && !isAtrium && !isMuse && !isDoctrine && !isTheater && (
        <PlaceholderRoom room={currentRoom} />
      )}
    </div>
  )
}
