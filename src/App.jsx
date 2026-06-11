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
import KELRoom from './components/KELRoom'
import SettingsRoom from './components/SettingsRoom'
import PlaceholderRoom from './components/PlaceholderRoom'
import APIKeyGate from './components/APIKeyGate'
import { analyzeObservation } from './lib/claudeRouting'
import {
  listenObservations, createObservation, updateObservation,
  listenMuseWorks, createKELDecision,
} from './lib/db'

async function migrateLocalStorage(uid) {
  const flagKey = `pacer_migrated_${uid}`
  if (localStorage.getItem(flagKey)) return
  try {
    const raw = localStorage.getItem('pacer_observations')
    if (raw) {
      const local = JSON.parse(raw).map(o => ({ ...o, timestamp: new Date(o.timestamp) }))
      for (const obs of [...local].reverse()) {
        await createObservation(uid, {
          text:          obs.text,
          type:          obs.type,
          storageUrl:    obs.storageUrl    || null,
          constellation: obs.constellation || null,
          source:        obs.source        || null,
          status:        obs.status        || 'received',
          destination:   obs.destination   || null,
          claude:        obs.claude        || null,
          claudeError:   obs.claudeError   || null,
          timestamp:     obs.timestamp,
        })
      }
      localStorage.removeItem('pacer_observations')
    }
  } catch (e) {
    console.error('[PACER migration]', e)
  }
  localStorage.setItem(flagKey, '1')
}

export default function App() {
  const { theme, setTheme } = useTheme()
  const { user, loading, signIn, signUp, signOut } = useAuth()
  const isMobile = useIsMobile()

  const [currentRoom, setCurrentRoom]             = useState('home')
  const [observations, setObservations]           = useState([])
  const [museWorks, setMuseWorks]                 = useState([])
  const [activeObservationId, setActiveObservationId] = useState(null)
  const [analyzingIds, setAnalyzingIds]           = useState(new Set())
  const [apiKey, setApiKey]                       = useState(() => localStorage.getItem('pacer_api_key') || null)
  const [showKeyGate, setShowKeyGate]             = useState(false)

  // Derived: merge Firestore data with ephemeral per-session analyzing state
  const _active = observations.find(o => o.id === activeObservationId) || null
  const activeObservation = _active
    ? { ..._active, analyzing: analyzingIds.has(_active.id) }
    : null

  // Start Firestore listeners once we know the user
  useEffect(() => {
    if (!user) return
    migrateLocalStorage(user.uid)
    const unsubObs  = listenObservations(user.uid, setObservations)
    const unsubMuse = listenMuseWorks(user.uid, setMuseWorks)
    return () => { unsubObs(); unsubMuse() }
  }, [user?.uid]) // eslint-disable-line react-hooks/exhaustive-deps

  async function submitObservation(obs) {
    const id = await createObservation(user.uid, {
      text:          obs.text,
      type:          obs.type,
      storageUrl:    obs.storageUrl    || null,
      constellation: obs.constellation || null,
      source:        obs.source        || null,
      status:        'received',
      destination:   null,
      claude:        null,
      claudeError:   null,
    })
    setActiveObservationId(id)

    if (apiKey && obs.type !== 'image') {
      setAnalyzingIds(prev => new Set([...prev, id]))
      try {
        const result = await analyzeObservation(obs.text, apiKey)
        await updateObservation(user.uid, id, { claude: result })
      } catch (e) {
        await updateObservation(user.uid, id, { claudeError: e.message })
      } finally {
        setAnalyzingIds(prev => { const s = new Set(prev); s.delete(id); return s })
      }
    }
  }

  async function routeObservation(id, destination) {
    await updateObservation(user.uid, id, { destination, status: 'routed' })
  }

  async function acceptConstellation(id, constellation) {
    await updateObservation(user.uid, id, { constellation })
  }

  function handleApiKey(key) {
    setShowKeyGate(false)
    if (key) {
      localStorage.setItem('pacer_api_key', key)
      setApiKey(key)
    }
  }

  async function recordKELDecision(decisionData) {
    if (!user) return
    await createKELDecision(user.uid, decisionData)
  }

  const isHome     = currentRoom === 'home'
  const isAtrium   = currentRoom === 'atrium'
  const isDoctrine = currentRoom === 'doctrine'
  const isTheater  = currentRoom === 'content'
  const isMuse     = currentRoom === 'muse'
  const isVERA     = currentRoom === 'vera'
  const isArchive  = currentRoom === 'archive'
  const isKEL      = currentRoom === 'kel'
  const isSettings = currentRoom === 'settings'

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
            {(!isMobile || !activeObservation) && (
              <ObservationStream
                observations={observations}
                onSubmit={submitObservation}
                activeObservation={activeObservation}
                onSelectObservation={obs => setActiveObservationId(obs.id)}
                uid={user?.uid}
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
                  onBack={isMobile ? () => setActiveObservationId(null) : null}
                />
              )
              : (
                !isMobile && (
                  <AtriumDashboard
                    observations={observations}
                    onSelectObservation={obs => setActiveObservationId(obs.id)}
                  />
                )
              )
            }
          </>
        )}

        {isMuse && (
          <MuseRoom
            observations={observations}
            works={museWorks}
            uid={user?.uid}
            onSurface={submitObservation}
            isMobile={isMobile}
          />
        )}
        {isVERA && (
          <VERARoom
            observations={observations}
            museWorks={museWorks}
            apiKey={apiKey}
            onConnectClaude={() => setShowKeyGate(true)}
            isMobile={isMobile}
          />
        )}
        {isArchive  && <ArchiveRoom observations={observations} museWorks={museWorks} />}
        {isDoctrine && <DoctrineRoom />}
        {isTheater  && <TheaterRoom />}
        {isKEL && (
          <KELRoom
            observations={observations}
            apiKey={apiKey}
            onConnectClaude={() => setShowKeyGate(true)}
            onDecision={recordKELDecision}
            isMobile={isMobile}
          />
        )}
        {isSettings && (
          <SettingsRoom
            user={user}
            theme={theme}
            onThemeChange={setTheme}
            apiKey={apiKey}
            onApiKeyChange={setApiKey}
            onSignOut={signOut}
            isMobile={isMobile}
          />
        )}

        {!isHome && !isAtrium && !isMuse && !isVERA && !isArchive && !isDoctrine && !isTheater && !isKEL && !isSettings && (
          <PlaceholderRoom room={currentRoom} />
        )}
      </div>
    </div>
  )
}
