import { useState, useEffect, useMemo, useRef } from 'react'
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
import BusinessCenterRoom from './components/BusinessCenterRoom'
import BuilderStudioRoom from './components/BuilderStudioRoom'
import IslesRoom from './components/IslesRoom'
import SettingsRoom from './components/SettingsRoom'
import PlaceholderRoom from './components/PlaceholderRoom'
import Intake from './components/Intake'
import ConversationMode from './components/ConversationMode'
import ArrivalBrief from './components/ArrivalBrief'
import OnboardingCard from './components/OnboardingCard'
import APIKeyGate from './components/APIKeyGate'
import { analyzeObservation, generateInstitutionalPulse } from './lib/claudeRouting'
import { saveProviderKey } from './lib/anthropicProxy'
import {
  listenObservations, createObservation, updateObservation,
  listenMuseWorks, createKELDecision, listenKELDecisions, listenGraduates,
  createKELReview, listenKELReviews, updateKELReview,
  createInstitutionEvent, listenInstitutionEvents,
  listenCreatorLogs, createCreatorLog,
  getUserProfile, createUserProfile, updateUserProfile,
  createProduction, listenProductions, updateProduction,
  incrementCampusStat, listenCampusStats,
  getLatestBrief, saveLatestBrief,
  createThread, listenThreads,
} from './lib/db'
import { CAMPUS_TEMPLATES, OUTCOME_OPTIONS } from './lib/campusTemplates'
import { requestGoogleToken, requestGoogleTokenSilent, revokeGoogleToken, isTokenExpired } from './lib/googleAuth'
import { fetchEmailSummary, fetchTodayEvents, emailContextString, calendarContextString } from './lib/googleData'
import { getVoiceConfig, speakWithVoice } from './lib/roomVoice'
import { uploadVoiceSeed } from './lib/voiceUpload'
import PACERVoice from './components/PACERVoice'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || null

const CREATOR_EMAIL = (import.meta.env.VITE_CREATOR_EMAIL || 'jgedeon22@gmail.com').toLowerCase()
const CREATOR_UID   = import.meta.env.VITE_CREATOR_UID   || null

function isCreator(user) {
  if (!user) return false
  if (CREATOR_UID && user.uid === CREATOR_UID) return true
  return user.email?.toLowerCase() === CREATOR_EMAIL
}

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
  const [atriumMode, setAtriumMode]               = useState('observe') // 'observe' | 'conversation'
  const [voiceMode, setVoiceMode]                 = useState(() => localStorage.getItem('pacer_voice_mode') === 'on')
  const [observations, setObservations]           = useState([])
  const [museWorks, setMuseWorks]                 = useState([])
  const [graduates, setGraduates]                 = useState([])
  const [activeObservationId, setActiveObservationId] = useState(null)
  const [analyzingIds, setAnalyzingIds]           = useState(new Set())
  const [apiKey, setApiKey]                       = useState(() => {
    // v2: encrypted keyBundle stored as JSON
    try {
      const v2 = localStorage.getItem('pacer_api_key_v2')
      if (v2) return JSON.parse(v2)
    } catch {}
    // v1 legacy: raw string key (migrated to encrypted on next save)
    return localStorage.getItem('pacer_api_key') || null
  })
  const [showKeyGate, setShowKeyGate]             = useState(false)
  const [kelReviews, setKelReviews]               = useState([])
  const [kelDecisions, setKelDecisions]           = useState([])
  const [threads, setThreads]                     = useState([])
  const [institutionEvents, setInstitutionEvents] = useState([])
  const [creatorLogs, setCreatorLogs]             = useState([])
  const [productions, setProductions]             = useState([])
  const [profile, setProfile]                     = useState(undefined) // undefined=loading, null=no profile, obj=exists
  const [googleTokenData, setGoogleTokenData]     = useState(() => {
    try {
      const raw = sessionStorage.getItem('pacer_google_token')
      if (!raw) return null
      const data = JSON.parse(raw)
      if (isTokenExpired(data)) { sessionStorage.removeItem('pacer_google_token'); return null }
      return data
    } catch { return null }
  })
  const [emailData, setEmailData]                 = useState(null)
  const [calendarEvents, setCalendarEvents]       = useState([])
  const [campusStats, setCampusStats]             = useState(null) // creator-only beta counters

  // ── Arrival Protocol ──────────────────────────────────────────────────────────
  const [arrivalState, setArrivalState]     = useState(null) // null | 'asking' | 'text' | 'voice'
  const [arrivalText, setArrivalText]       = useState('')
  const [arrivalLoading, setArrivalLoading] = useState(false)
  const [arrivalSpeaking, setArrivalSpeaking] = useState(false)
  const hasArrived                          = useRef(false)
  const briefRefreshedForGoogle             = useRef(false)
  const googleStateRef                      = useRef({ tokenData: null, emailData: null, calendarEvents: [] })
  const [googleReconnecting, setGoogleReconnecting]   = useState(false)
  const [googleReconnectFailed, setGoogleReconnectFailed] = useState(false)

  // Builder readiness derives from thread layer (primary) or kel_decisions (fallback)
  // Unlocked by Human Gate approval on any KEL recommendation — not a separate review ceremony
  const builderReadiness = useMemo(() => {
    if (threads.some(t => t.decision === 'approved'))      return 'approved'
    if (threads.length > 0)                                return 'pending'
    if (kelDecisions.some(d => d.decision === 'approved')) return 'approved'
    if (kelDecisions.length > 0)                           return 'pending'
    return 'locked'
  }, [threads, kelDecisions])

  const campusConfig = profile ? (CAMPUS_TEMPLATES[profile.campusId] || CAMPUS_TEMPLATES.explorer) : null
  const visibleRooms = campusConfig?.rooms ?? null // null = all rooms (creator)

  // Google connection status — 4 states so UI never lies during async operations
  const googleStatus = useMemo(() => {
    if (!profile || !profile.googleConnected) return 'disconnected'
    if (googleTokenData && !isTokenExpired(googleTokenData)) return 'connected'
    if (googleReconnecting)    return 'reconnecting'
    if (googleReconnectFailed) return 'reconnect-required'
    return 'reconnecting' // profile connected, token absent, reconnect not yet fired
  }, [profile, googleTokenData, googleReconnecting, googleReconnectFailed])

  // Derived: merge Firestore data with ephemeral per-session analyzing state
  const _active = observations.find(o => o.id === activeObservationId) || null
  const activeObservation = _active
    ? { ..._active, analyzing: analyzingIds.has(_active.id) }
    : null

  // Load or seed campus profile once user is known
  useEffect(() => {
    if (!user) { setProfile(undefined); setCampusStats(null); return }
    // New auth session — reset nav so login always lands at home, not last room
    setCurrentRoom('home')
    hasArrived.current = false
    briefRefreshedForGoogle.current = false
    setArrivalState(null)
    setArrivalText('')
    setGoogleReconnecting(false)
    setGoogleReconnectFailed(false)
    if (isCreator(user)) {
      const creatorBase = { campusId: 'creator', campusName: 'JPG Ventures', bypass: true }
      setProfile(creatorBase) // instant access — no loading state
      getUserProfile(user.uid).then(existing => {
        if (!existing) {
          createUserProfile(user.uid, creatorBase)
        } else {
          setProfile({ ...creatorBase, ...existing })
          // Load API key from Firestore if not already in localStorage
          if (existing.anthropicKeyBundle && !localStorage.getItem('pacer_api_key_v2')) {
            localStorage.setItem('pacer_api_key_v2', JSON.stringify(existing.anthropicKeyBundle))
            setApiKey(existing.anthropicKeyBundle)
          } else if (existing.anthropicApiKey && !localStorage.getItem('pacer_api_key_v2') && !localStorage.getItem('pacer_api_key')) {
            // Legacy plaintext key — migrate to encrypted bundle
            saveProviderKey(existing.anthropicApiKey)
              .then(bundle => {
                localStorage.setItem('pacer_api_key_v2', JSON.stringify(bundle))
                localStorage.removeItem('pacer_api_key')
                setApiKey(bundle)
                return updateUserProfile(user.uid, { anthropicKeyBundle: bundle, anthropicApiKey: null })
              })
              .catch(() => {
                // Migration failed (no server yet) — use legacy string temporarily
                localStorage.setItem('pacer_api_key', existing.anthropicApiKey)
                setApiKey(existing.anthropicApiKey)
              })
          }
        }
      })
      // Creator-only: listen to beta stats counters
      const unsubStats = listenCampusStats(setCampusStats)
      return () => unsubStats()
    }
    const today = new Date().toISOString().slice(0, 10)
    getUserProfile(user.uid).then(p => {
      setProfile(p ?? null)
      if (p) {
        // Load API key from Firestore if not already in localStorage
        if (p.anthropicKeyBundle && !localStorage.getItem('pacer_api_key_v2')) {
          localStorage.setItem('pacer_api_key_v2', JSON.stringify(p.anthropicKeyBundle))
          setApiKey(p.anthropicKeyBundle)
        } else if (p.anthropicApiKey && !localStorage.getItem('pacer_api_key_v2') && !localStorage.getItem('pacer_api_key')) {
          saveProviderKey(p.anthropicApiKey)
            .then(bundle => {
              localStorage.setItem('pacer_api_key_v2', JSON.stringify(bundle))
              localStorage.removeItem('pacer_api_key')
              setApiKey(bundle)
              return updateUserProfile(user.uid, { anthropicKeyBundle: bundle, anthropicApiKey: null })
            })
            .catch(() => {
              localStorage.setItem('pacer_api_key', p.anthropicApiKey)
              setApiKey(p.anthropicApiKey)
            })
        }
        // Track return visits — only when user has visited before
        if (p.lastVisitDate && p.lastVisitDate !== today) {
          updateUserProfile(user.uid, { lastVisitDate: today })
          incrementCampusStat('returns')
        } else if (!p.lastVisitDate) {
          updateUserProfile(user.uid, { lastVisitDate: today })
        }
      }
    })
  }, [user?.uid]) // eslint-disable-line react-hooks/exhaustive-deps

  // Start Firestore listeners once we know the user
  useEffect(() => {
    if (!user) return
    migrateLocalStorage(user.uid)
    const unsubObs       = listenObservations(user.uid, setObservations)
    const unsubMuse      = listenMuseWorks(user.uid, setMuseWorks)
    const unsubGrad      = listenGraduates(user.uid, setGraduates)
    const unsubReviews   = listenKELReviews(user.uid, setKelReviews)
    const unsubDecisions = listenKELDecisions(user.uid, setKelDecisions)
    const unsubThreads   = listenThreads(user.uid, setThreads)
    const unsubEvents    = listenInstitutionEvents(user.uid, setInstitutionEvents)
    const unsubLogs      = listenCreatorLogs(user.uid, setCreatorLogs)
    const unsubProds     = listenProductions(user.uid, setProductions)
    return () => { unsubObs(); unsubMuse(); unsubGrad(); unsubReviews(); unsubDecisions(); unsubThreads(); unsubEvents(); unsubLogs(); unsubProds() }
  }, [user?.uid]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Silent Google reconnect on login ─────────────────────────────────────────
  // If Firestore says this user has authorized Google before, try to get a token
  // without showing a popup. Works when the Google session is still alive in browser.
  // On failure: shows "Reconnect required" — never wipes the Firestore flag.
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return
    if (!profile || profile.googleConnected !== true) return
    if (googleTokenData && !isTokenExpired(googleTokenData)) return
    const hint = profile.googleEmail || undefined
    setGoogleReconnecting(true)
    setGoogleReconnectFailed(false)
    requestGoogleTokenSilent(GOOGLE_CLIENT_ID, hint)
      .then(tokenData => {
        setGoogleTokenData(tokenData)
        sessionStorage.setItem('pacer_google_token', JSON.stringify(tokenData))
        setGoogleReconnecting(false)
        return Promise.allSettled([
          fetchEmailSummary(tokenData.access_token),
          fetchTodayEvents(tokenData.access_token),
        ])
      })
      .then(results => {
        if (!results) return
        const [email, calendar] = results
        if (email.status === 'fulfilled')    setEmailData(email.value)
        if (calendar.status === 'fulfilled') setCalendarEvents(calendar.value)
      })
      .catch(err => {
        console.warn('[PACER Google] silent reconnect failed:', err?.message)
        setGoogleReconnecting(false)
        setGoogleReconnectFailed(true)
        // Do NOT clear profile.googleConnected — user did not disconnect intentionally
      })
  }, [profile?.googleConnected, profile?.googleEmail]) // eslint-disable-line

  // ── Google / Gmail connect ────────────────────────────────────────────────────
  async function handleConnectGmail() {
    if (!GOOGLE_CLIENT_ID) return
    try {
      const tokenData = await requestGoogleToken(GOOGLE_CLIENT_ID)
      setGoogleTokenData(tokenData)
      sessionStorage.setItem('pacer_google_token', JSON.stringify(tokenData))
      const [emailResult, calResult] = await Promise.allSettled([
        fetchEmailSummary(tokenData.access_token),
        fetchTodayEvents(tokenData.access_token),
      ])
      if (emailResult.status === 'fulfilled') setEmailData(emailResult.value)
      if (calResult.status === 'fulfilled')   setCalendarEvents(calResult.value)
      // Persist connection to Firestore — enables silent reconnect after logout
      if (user) {
        const patch = {
          googleConnected: true,
          googleConnectedAt: new Date().toISOString(),
          googleEmail: user.email || null, // hint for silent re-auth
        }
        updateUserProfile(user.uid, patch)
        setProfile(prev => prev ? { ...prev, ...patch } : prev)
      }
    } catch (err) {
      console.error('[PACER Gmail]', err)
    }
  }

  function handleDisconnectGmail() {
    if (googleTokenData?.access_token) revokeGoogleToken(googleTokenData.access_token)
    sessionStorage.removeItem('pacer_google_token')
    setGoogleTokenData(null)
    setEmailData(null)
    setCalendarEvents([])
    if (user) {
      updateUserProfile(user.uid, { googleConnected: false })
      setProfile(prev => prev ? { ...prev, googleConnected: false } : prev)
    }
  }

  // ── Arrival Protocol ─────────────────────────────────────────────────────────
  // Derive from Firebase Auth — never hardcode a name
  const arrivedFirstName = user?.displayName?.split(' ')?.[0]
    || user?.email?.split('@')?.[0]
    || null

  function getArrivalGreeting(name) {
    const h = new Date().getHours()
    const salutation = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
    return name ? `${salutation}, ${name}.` : `${salutation}.`
  }

  async function buildArrivalText(forceRefresh = false) {
    const today = new Date().toDateString()
    // Read from ref — avoids stale closure from when the effect fired
    const { emailData: currentEmail, calendarEvents: currentCalendar } = googleStateRef.current

    // Use whatever Google data we have regardless of token validity
    // Expired token ≠ disconnected: if we have calendar/email data, use it
    const calendarIncluded = currentCalendar.length > 0
    const emailIncluded    = !!currentEmail

    // Check Firestore for a brief generated today on any device
    if (!forceRefresh && user) {
      try {
        const stored = await getLatestBrief(user.uid)
        if (stored && new Date(stored.generatedAt).toDateString() === today && stored.version === 'v3') {
          // Reuse cached brief unless we now have Google data that it lacked
          const weHaveMore = (calendarIncluded && !stored.calendarIncluded) || (emailIncluded && !stored.emailIncluded)
          if (!weHaveMore) return stored.text
        }
        // v1/v2 briefs are intentionally ignored — regenerate with v3 directive prompt
      } catch (_) {} // network issue — fall through to generate
    }

    // Generate fresh
    try {
      if (apiKey) {
        const text = await generateInstitutionalPulse(
          {
            observations, productions, institutionEvents, creatorLogs, kelReviews,
            emailContext:    emailIncluded    ? emailContextString(currentEmail)    : null,
            calendarContext: calendarIncluded ? calendarContextString(currentCalendar) : null,
          },
          apiKey
        )
        if (text) {
          if (user) saveLatestBrief(user.uid, { text, calendarIncluded, emailIncluded }).catch(() => {})
          return text
        }
      }
    } catch (_) { /* fall through to static */ }

    // Static fallback
    const unrouted = observations.filter(o => !o.destination).length
    const pending  = productions.filter(p => p.humanGateStatus === 'pending' || (p.status === 'staged' && !p.humanGateStatus)).length
    const parts = []
    if (observations.length === 0) parts.push('The Atrium is quiet.')
    else parts.push(`${observations.length} observation${observations.length !== 1 ? 's' : ''} in memory.`)
    if (unrouted > 0) parts.push(`${unrouted} awaiting routing.`)
    if (pending > 0) parts.push(`${pending} production${pending !== 1 ? 's' : ''} awaiting approval.`)
    if (institutionEvents.length > 0) parts.push('Institutional activity is on record.')
    return parts.join(' ') || 'Campus is operational.'
  }

  function speakArrivalText(text) {
    try {
      if (!window.speechSynthesis) { console.debug('[arrival voice] speechSynthesis unavailable'); return }
      console.debug('[arrival voice] button clicked')
      console.debug('[arrival voice] text:', text)
      console.debug('[arrival voice] text length:', text?.length)
      console.debug('[arrival voice] typeof text:', typeof text)
      console.debug('[arrival voice] currentRoom:', currentRoom)
      const greeting = getArrivalGreeting(arrivedFirstName)
      console.debug('[arrival voice] greeting:', greeting)
      const full = text ? `${greeting} ${text}` : greeting
      console.debug('[arrival voice] full text length:', full?.length)
      const voiceConfig = { ...getVoiceConfig(currentRoom), gender: null }
      console.debug('[arrival voice] voiceConfig:', JSON.stringify(voiceConfig))
      console.debug('[arrival voice] calling speakWithVoice')
      speakWithVoice(full, voiceConfig, {
        onStart: () => { console.debug('[arrival voice] onstart'); setArrivalSpeaking(true) },
        onEnd:   () => { console.debug('[arrival voice] onend'); setArrivalSpeaking(false); setArrivalState(null) },
        onError: () => { console.debug('[arrival voice] onerror callback'); setArrivalSpeaking(false) },
      })
    } catch (err) {
      console.error('[arrival voice] CRASH:', err)
      console.error('[arrival voice] stack:', err?.stack)
      setArrivalSpeaking(false)
    }
  }

  useEffect(() => {
    if (!profile || profile === undefined || hasArrived.current) return
    const mode = profile.arrivalMode || 'silent'
    if (mode === 'silent') { hasArrived.current = true; return }

    hasArrived.current = true
    const timer = setTimeout(async () => {
      if (mode === 'ask') {
        setArrivalState('asking')
      } else if (mode === 'text' || mode === 'voice') {
        // voice shows text card + Play button — browser autoplay policy requires a tap
        setArrivalState(mode)
        setArrivalLoading(true)
        const text = await buildArrivalText()
        setArrivalText(text || '')
        setArrivalLoading(false)
      }
    }, 700)
    return () => clearTimeout(timer)
  }, [profile?.campusId]) // eslint-disable-line

  async function handleArrivalAccept() {
    setArrivalState('text')
    setArrivalLoading(true)
    const text = await buildArrivalText()
    setArrivalText(text || '')
    setArrivalLoading(false)
  }

  // Keep ref current — buildArrivalText reads from here to avoid stale closures
  useEffect(() => {
    googleStateRef.current = { tokenData: googleTokenData, emailData, calendarEvents }
  }, [googleTokenData, emailData, calendarEvents]) // eslint-disable-line

  // ── Refresh Google data when token is valid ──────────────────────────────────
  useEffect(() => {
    if (!googleTokenData || isTokenExpired(googleTokenData)) return
    Promise.allSettled([
      fetchEmailSummary(googleTokenData.access_token),
      fetchTodayEvents(googleTokenData.access_token),
    ]).then(([email, calendar]) => {
      if (email.status === 'fulfilled')    setEmailData(email.value)
      if (calendar.status === 'fulfilled') setCalendarEvents(calendar.value)
    })
  }, [googleTokenData]) // eslint-disable-line

  // ── Refresh brief when Google data first arrives ──────────────────────────────
  // Regenerates with Google context and updates the visible card unconditionally —
  // avoids the stale-closure problem of checking arrivalState inside an async .then().
  useEffect(() => {
    if (briefRefreshedForGoogle.current) return
    if (!emailData && calendarEvents.length === 0) return
    briefRefreshedForGoogle.current = true
    buildArrivalText(true).then(text => {
      if (!text) return
      setArrivalText(text)
      setArrivalLoading(false) // clears spinner in case brief was in loading state
    })
  }, [emailData, calendarEvents]) // eslint-disable-line

  async function submitObservation(obs) {
    if (!isCreator(user)) incrementCampusStat('observations')
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

  function toggleVoiceMode() {
    setVoiceMode(prev => {
      const next = !prev
      localStorage.setItem('pacer_voice_mode', next ? 'on' : 'off')
      return next
    })
  }

  function handleApiKey(keyOrBundle) {
    setShowKeyGate(false)
    if (keyOrBundle) {
      // keyOrBundle is a keyBundle object from APIKeyGate (or raw string for legacy)
      const isBundle = typeof keyOrBundle === 'object' && keyOrBundle.encrypted
      if (isBundle) {
        localStorage.setItem('pacer_api_key_v2', JSON.stringify(keyOrBundle))
        if (user) updateUserProfile(user.uid, { anthropicKeyBundle: keyOrBundle, anthropicApiKey: null })
      } else {
        localStorage.setItem('pacer_api_key', keyOrBundle)
      }
      setApiKey(keyOrBundle)
    }
  }

  function handleApiKeyChange(keyOrBundle) {
    if (keyOrBundle) {
      const isBundle = typeof keyOrBundle === 'object' && keyOrBundle.encrypted
      if (isBundle) {
        localStorage.setItem('pacer_api_key_v2', JSON.stringify(keyOrBundle))
        localStorage.removeItem('pacer_api_key')
        if (user) updateUserProfile(user.uid, { anthropicKeyBundle: keyOrBundle, anthropicApiKey: null })
      } else {
        localStorage.setItem('pacer_api_key', keyOrBundle)
      }
      setApiKey(keyOrBundle)
    } else {
      localStorage.removeItem('pacer_api_key_v2')
      localStorage.removeItem('pacer_api_key')
      setApiKey(null)
      if (user) updateUserProfile(user.uid, { anthropicKeyBundle: null, anthropicApiKey: null })
    }
  }

  async function plantVoiceSeed(audioBlob) {
    if (!user) return
    if (!isCreator(user)) incrementCampusStat('observations')
    const storageUrl = await uploadVoiceSeed(audioBlob, user.uid)
    await createObservation(user.uid, {
      text:          '',
      type:          'voice',
      storageUrl,
      destination:   'Isles of the Awakening',
      constellation: null,
      source:        null,
      status:        'seed',
      claude:        null,
      claudeError:   null,
    })
  }

  async function createProductionRecord(data) {
    if (!user) return
    await createProduction(user.uid, data)
  }

  async function updateProductionRecord(id, patch) {
    if (!user) return
    await updateProduction(user.uid, id, patch)
  }

  async function addCreatorLog(data) {
    if (!user) return
    await createCreatorLog(user.uid, data)
  }

  async function recordKELDecision(decisionData) {
    if (!user) return
    const { observationIds, ...kelData } = decisionData
    await createKELDecision(user.uid, kelData)
    await createThread(user.uid, {
      observationIds: observationIds || [],
      recommendation: decisionData.recommendation,
      reasoning:      decisionData.reasoning      || null,
      domain:         decisionData.domain         || null,
      confidence:     decisionData.confidence     ?? null,
      cited:          decisionData.cited          || [],
      decision:       decisionData.decision,
    })
  }

  async function requestBuilderReview() {
    if (builderReadiness !== 'locked') return  // already pending or approved
    const id = await createKELReview(user.uid, { requestType: 'builder_readiness' })
    await createInstitutionEvent(user.uid, {
      eventType:       'builder_review_requested',
      title:           'Builder Review Requested',
      description:     'A readiness review has been submitted to KEL. The forge does not open without judgment.',
      relatedEntityId: id,
    })
  }

  // Called by KEL only — no other path opens the forge
  async function approveKELReview(id) {
    await updateKELReview(user.uid, id, { status: 'approved', reviewedBy: user.uid })
    await createInstitutionEvent(user.uid, {
      eventType:       'builder_review_approved',
      title:           'Builder Review Approved',
      description:     'KEL has confirmed readiness. Builder Studio is open. The forge begins.',
      relatedEntityId: id,
    })
  }

  // No silent denials — rationale required
  async function denyKELReview(id, rationale) {
    await updateKELReview(user.uid, id, { status: 'denied', rationale, reviewedBy: user.uid })
    await createInstitutionEvent(user.uid, {
      eventType:       'builder_review_denied',
      title:           'Builder Review Denied',
      description:     `Denied. ${rationale}`,
      relatedEntityId: id,
    })
  }

  const isHome     = currentRoom === 'home'
  const isAtrium   = currentRoom === 'atrium'
  const isDoctrine = currentRoom === 'doctrine'
  const isTheater  = currentRoom === 'content'
  const isMuse     = currentRoom === 'muse'
  const isVERA     = currentRoom === 'vera'
  const isArchive  = currentRoom === 'archive'
  const isIsles          = currentRoom === 'isles'
  const isKEL            = currentRoom === 'kel'
  const isBusinessCenter = currentRoom === 'businesscenter'
  const isBuilderStudio  = currentRoom === 'builderstudio'
  const isSettings       = currentRoom === 'settings'

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

  if (profile === undefined) {
    return (
      <div style={{ background: 'var(--bg-0)', height: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center' }}
      >
        <p style={{ color: 'var(--text-6)', fontSize: '11px' }}>…</p>
      </div>
    )
  }

  if (profile === null) {
    return (
      <Intake
        onComplete={async (outcomeId) => {
          const opt = OUTCOME_OPTIONS.find(o => o.id === outcomeId)
          const template = CAMPUS_TEMPLATES[opt?.template || 'explorer']
          const newProfile = {
            campusId:      template.id,
            campusName:    template.name,
            outcomeChoice: outcomeId,
            bypass:        false,
          }
          await createUserProfile(user.uid, newProfile)
          incrementCampusStat('visitors')
          setProfile(newProfile)
        }}
      />
    )
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
          visibleRooms={visibleRooms}
          voiceMode={voiceMode}
          onToggleVoice={toggleVoiceMode}
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
            onMorningBrief={handleArrivalAccept}
            campusStats={campusStats}
            isMobile={isMobile}
            googleStatus={googleStatus}
            onReconnectGoogle={GOOGLE_CLIENT_ID ? handleConnectGmail : null}
          />
        )}

        {isAtrium && (
          atriumMode === 'conversation'
            ? (
              <ConversationMode
                observations={observations}
                institutionEvents={institutionEvents}
                apiKey={apiKey}
                onConnectClaude={() => setShowKeyGate(true)}
                isMobile={isMobile}
                onSwitchToText={() => setAtriumMode('observe')}
                emailContext={emailContextString(emailData)}
                calendarContext={calendarContextString(calendarEvents)}
                voiceConfig={getVoiceConfig('atrium')}
              />
            )
            : (
              <>
                {(!isMobile || !activeObservation) && (
                  <ObservationStream
                    observations={observations}
                    onSubmit={submitObservation}
                    activeObservation={activeObservation}
                    onSelectObservation={obs => setActiveObservationId(obs.id)}
                    uid={user?.uid}
                    isMobile={isMobile}
                    onSwitchToConversation={() => setAtriumMode('conversation')}
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
            )
        )}

        {isMuse && (
          <MuseRoom
            observations={observations}
            works={museWorks}
            uid={user?.uid}
            onSurface={submitObservation}
            apiKey={apiKey}
            onConnectClaude={() => setShowKeyGate(true)}
            onNavigate={setCurrentRoom}
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
            voiceMode={voiceMode}
          />
        )}
        {isArchive  && <ArchiveRoom observations={observations} museWorks={museWorks} institutionEvents={institutionEvents} uid={user?.uid} isMobile={isMobile} />}
        {isIsles && (
          <IslesRoom
            observations={observations}
            onRoute={routeObservation}
            onNavigate={setCurrentRoom}
            onPlantVoiceSeed={plantVoiceSeed}
            isMobile={isMobile}
          />
        )}
        {isDoctrine && <DoctrineRoom isMobile={isMobile} />}
        {isTheater  && (
          <TheaterRoom
            graduates={graduates}
            observations={observations}
            productions={productions}
            onCreateProduction={createProductionRecord}
            onUpdateProduction={updateProductionRecord}
            apiKey={apiKey}
            onConnectClaude={() => setShowKeyGate(true)}
            uid={user?.uid}
            isMobile={isMobile}
          />
        )}
        {isBusinessCenter && (
          <BusinessCenterRoom
            observations={observations}
            graduates={graduates}
            builderReadiness={builderReadiness}
            museWorks={museWorks}
            institutionEvents={institutionEvents}
            creatorLogs={creatorLogs}
            kelReviews={kelReviews}
            productions={productions}
            apiKey={apiKey}
            googleToken={googleTokenData?.access_token || null}
            googleStatus={googleStatus}
            emailData={emailData}
            calendarEvents={calendarEvents}
            onRequestBuilderReview={requestBuilderReview}
            onEnterBuilderStudio={() => setCurrentRoom('builderstudio')}
            onAddLog={addCreatorLog}
            onNavigate={setCurrentRoom}
            onConnectGmail={GOOGLE_CLIENT_ID ? handleConnectGmail : null}
            onDisconnectGmail={handleDisconnectGmail}
            isMobile={isMobile}
          />
        )}
        {isBuilderStudio && (
          <BuilderStudioRoom
            isMobile={isMobile}
            builderReadiness={builderReadiness}
            threads={threads}
            onNavigate={setCurrentRoom}
          />
        )}
        {isKEL && (
          <KELRoom
            observations={observations}
            apiKey={apiKey}
            onConnectClaude={() => setShowKeyGate(true)}
            onDecision={recordKELDecision}
            kelReviews={kelReviews}
            onApproveReview={approveKELReview}
            onDenyReview={denyKELReview}
            isMobile={isMobile}
            voiceMode={voiceMode}
          />
        )}
        {isSettings && (
          <SettingsRoom
            user={user}
            profile={profile}
            theme={theme}
            onThemeChange={setTheme}
            apiKey={apiKey}
            onApiKeyChange={handleApiKeyChange}
            onSignOut={signOut}
            isMobile={isMobile}
            arrivalMode={profile?.arrivalMode || 'silent'}
            onArrivalModeChange={mode => {
              updateUserProfile(user.uid, { arrivalMode: mode })
              setProfile(prev => prev ? { ...prev, arrivalMode: mode } : prev)
            }}
            middayPulseMode={profile?.middayPulseMode || 'off'}
            onMiddayPulseModeChange={mode => {
              updateUserProfile(user.uid, { middayPulseMode: mode })
              setProfile(prev => prev ? { ...prev, middayPulseMode: mode } : prev)
            }}
            eveningReviewMode={profile?.eveningReviewMode || 'off'}
            onEveningReviewModeChange={mode => {
              updateUserProfile(user.uid, { eveningReviewMode: mode })
              setProfile(prev => prev ? { ...prev, eveningReviewMode: mode } : prev)
            }}
            onPreferredLanguageChange={lang => {
              updateUserProfile(user.uid, { preferredLanguage: lang })
              setProfile(prev => prev ? { ...prev, preferredLanguage: lang } : prev)
            }}
            onNativeLanguageChange={lang => {
              updateUserProfile(user.uid, { nativeLanguage: lang })
              setProfile(prev => prev ? { ...prev, nativeLanguage: lang } : prev)
            }}
            onAiProviderChange={provider => {
              updateUserProfile(user.uid, { aiProvider: provider })
              setProfile(prev => prev ? { ...prev, aiProvider: provider } : prev)
            }}
            googleStatus={googleStatus}
            onConnectGmail={GOOGLE_CLIENT_ID ? handleConnectGmail : null}
            onDisconnectGmail={handleDisconnectGmail}
          />
        )}

        {!isHome && !isAtrium && !isMuse && !isVERA && !isArchive && !isIsles && !isDoctrine && !isTheater && !isKEL && !isBusinessCenter && !isBuilderStudio && !isSettings && (
          <PlaceholderRoom room={currentRoom} />
        )}
      </div>

      {/* ── Push-to-talk voice — home screen only ─────────────────────────── */}
      {isHome && (
        <PACERVoice
          apiKey={apiKey}
          observations={observations}
          institutionEvents={institutionEvents}
          emailContext={emailContextString(emailData)}
          calendarContext={calendarContextString(calendarEvents)}
        />
      )}

      {/* ── Onboarding orientation — first-time non-creator visitors ─────── */}
      {profile && profile.hasSeenOnboarding === false && !isCreator(user) && (
        <OnboardingCard
          onEnter={() => {
            updateUserProfile(user.uid, { hasSeenOnboarding: true })
            setProfile(prev => prev ? { ...prev, hasSeenOnboarding: true } : prev)
          }}
        />
      )}

      {/* ── Arrival Protocol overlay ───────────────────────────────────────── */}
      {arrivalState && (
        <ArrivalBrief
          mode={arrivalState === 'asking' ? 'ask' : arrivalState}
          greeting={getArrivalGreeting(arrivedFirstName)}
          text={arrivalText}
          loading={arrivalLoading}
          isSpeaking={arrivalSpeaking}
          onDismiss={() => { window.speechSynthesis?.cancel(); setArrivalSpeaking(false); setArrivalState(null) }}
          onAccept={handleArrivalAccept}
          onDecline={() => setArrivalState(null)}
          onSpeak={() => speakArrivalText(arrivalText)}
          onRefresh={arrivalState !== 'asking' ? async () => {
            setArrivalLoading(true)
            const text = await buildArrivalText(true) // force: bypass cache, write new brief
            setArrivalText(text || '')
            setArrivalLoading(false)
          } : undefined}
        />
      )}
    </div>
  )
}
