import { useState, useEffect } from 'react'
import { useTheme } from './hooks/useTheme'
import { useAuth } from './hooks/useAuth'
import { useIsMobile } from './hooks/useIsMobile'
import LeftNav from './components/LeftNav'
import AuthGate from './components/AuthGate'
import PACERHome from './components/PACERHome'
import ObservationStream from './components/ObservationStream'
import PACERProcessing from './components/PACERProcessing'
import AtriumDashboard from './components/AtriumDashboard'
import DoctrineRoom from './components/DoctrineRoom'
import TheaterRoom from './components/TheaterRoom'
import MuseRoom from './components/MuseRoom'
import VERARoom from './components/VERARoom'
import ArchiveRoom from './components/ArchiveRoom'
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
  const { user, loading, signIn, signUp, signOut } = useAuth()
  const isMobile = useIsMobile()

  const [currentRoom, setCurrentRoom] = useState('home')
  const [observations, setObservations] = useState(loadObservations)
  const [activeObservation, setActiveObservation] = useState(null)
  const [apiKey] = useState(() => localStorage.getItem('pacer_api_key') || null)
  const [showKeyGate, setShowKeyGate] = useState(false)

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
      source: obs.source || null,
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
  const isVERA     = currentRoom === 'vera'
  const isArchive  = currentRoom === 'archive'

  if (loading) {
    return (
      <div style={{ background: 'var(--bg-0)', height: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center' }}
      >
        <p style={{ color: 'var(--text-6)', fontSize: '11px' }}>…</p>
      </div>
    )
  }

  if (!user) {
    return <AuthGate onSignIn={signIn} onSignUp={signUp} />
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--bg-0)',
        color: 'var(--text-0)',
      }}
    >
      {showKeyGate && <APIKeyGate onKey={handleApiKey} />}

      {!isHome && (
        <LeftNav
          currentRoom={currentRoom}
          onSelect={setCurrentRoom}
          theme={theme}
          onThemeChange={setTheme}
          user={user}
          onSignOut={signOut}
          hasApiKey={!!apiKey}
          onConnectClaude={() => setShowKeyGate(true)}
          isMobile={isMobile}
        />
      )}

      {/* Room area — on mobile, sits above the fixed bottom nav */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        paddingBottom: isMobile && !isHome ? '60px' : 0,
      }}>
        {isHome && (
          <PACERHome
            onEnter={room => setCurrentRoom(room)}
            observationCount={observations.length}
          />
        )}

        {isAtrium && (
          <>
            {/* On mobile: show stream OR detail, not both side-by-side */}
            {(!isMobile || !activeObservation) && (
              <ObservationStream
                observations={observations}
                onSubmit={submitObservation}
                activeObservation={activeObservation}
                onSelectObservation={setActiveObservation}
                isMobile={isMobile}
              />
            )}
            {activeObservation
              ? (
                <PACERProcessing
                  observation={activeObservation}
                  observations={observations}
                  onRoute={routeObservation}
                  onAcceptConstellation={acceptConstellation}
                  hasApiKey={!!apiKey}
                  onRequestApiKey={() => setShowKeyGate(true)}
                  uid={user?.uid}
                  isMobile={isMobile}
                  onBack={isMobile ? () => setActiveObservation(null) : null}
                />
              )
              : (
                !isMobile && (
                  <AtriumDashboard
                    observations={observations}
                    onSelectObservation={setActiveObservation}
                  />
                )
              )
            }
          </>
        )}

        {isMuse     && <MuseRoom observations={observations} onSurface={submitObservation} isMobile={isMobile} />}
        {isVERA     && <VERARoom observations={observations} apiKey={apiKey} onConnectClaude={() => setShowKeyGate(true)} isMobile={isMobile} />}
        {isArchive  && <ArchiveRoom observations={observations} />}
        {isDoctrine && <DoctrineRoom />}
        {isTheater  && <TheaterRoom />}

        {!isHome && !isAtrium && !isMuse && !isVERA && !isArchive && !isDoctrine && !isTheater && (
          <PlaceholderRoom room={currentRoom} />
        )}
      </div>
    </div>
  )
}
