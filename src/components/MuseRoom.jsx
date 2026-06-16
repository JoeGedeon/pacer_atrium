import { useState, useEffect } from 'react'
import { createMuseWork, updateMuseWork } from '../lib/db'
import { getManifestDecision, DECISION_META } from '../lib/museDirector'
import { FORMATS } from '../lib/theaterEnrichment'
import RoomSubNav from './RoomSubNav'

const MUSE_TABS = [
  { id: 'inbox',  label: 'Inbox' },
  { id: 'canvas', label: 'Canvas' },
  { id: 'works',  label: 'Works' },
  { id: 'signals', label: 'Signals' },
]

const CATEGORIES = [
  { id: 'music',         label: 'Music',        icon: '🎵' },
  { id: 'visual',        label: 'Visual Art',    icon: '🎨' },
  { id: 'lore',          label: 'Lore',          icon: '📖' },
  { id: 'worldbuilding', label: 'Worldbuilding', icon: '🌎' },
  { id: 'characters',    label: 'Characters',    icon: '🎭' },
  { id: 'productions',   label: 'Productions',   icon: '🎬' },
]

const LIFECYCLE = [
  { id: 'shaping',          label: 'Shaping',         action: null },
  { id: 'structured',       label: 'Structured',       action: 'Mark Structured' },
  { id: 'premiere_ready',   label: 'Premiere Ready',   action: 'Declare Ready' },
  { id: 'opening_night',    label: 'Opening Night',    action: 'Open the Curtain' },
  { id: 'published_memory', label: 'Published Memory', action: 'Send to Archive' },
]

const LIFECYCLE_IDS = LIFECYCLE.map(s => s.id)
const STATUS_COLORS = {
  shaping:          'var(--text-4)',
  structured:       'var(--text-2)',
  premiere_ready:   '#f59e0b',
  opening_night:    '#10b981',
  published_memory: '#06b6d4',
}
const STATUS_GLYPHS = {
  shaping:          '',
  structured:       '',
  premiere_ready:   '◈ ',
  opening_night:    '✦ ',
  published_memory: '◉ ',
}

const CONSTELLATIONS = [
  { a: 'FleetFlow',           b: 'Isles',     note: 'movement as narrative' },
  { a: 'PACER',               b: 'Doctrine',  note: 'intelligence requires governance' },
  { a: 'Blue Pineapple',      b: 'Atrium',    note: 'brand as entry point' },
  { a: 'Crossing the Bridge', b: 'OpsCore',   note: 'signal finds its field view' },
]

function nextStatus(current) {
  const idx = LIFECYCLE_IDS.indexOf(current)
  return idx < LIFECYCLE_IDS.length - 1 ? LIFECYCLE_IDS[idx + 1] : current
}

// ── Creative Director view ────────────────────────────────────────────────────

function CreativeDirectorView({ observations, apiKey, onConnectClaude, onNavigate, isMobile, seedObs, onSeedConsumed }) {
  const px = isMobile ? '24px' : '40px'
  const [concept, setConcept]   = useState('')
  const [decision, setDecision] = useState(null)
  const [deciding, setDeciding] = useState(false)
  const [error, setError]       = useState(null)
  const [approved, setApproved] = useState(false)
  const [overriding, setOverriding] = useState(false)
  const [override, setOverride]     = useState(null)

  const incoming = observations.filter(o => o.text)
  const effectiveDecision = override || decision?.decision
  const decisionMeta = effectiveDecision ? DECISION_META[effectiveDecision] : null

  useEffect(() => {
    if (seedObs) {
      loadObservation(seedObs)
      onSeedConsumed?.()
    }
  }, [seedObs]) // eslint-disable-line react-hooks/exhaustive-deps

  async function askMuse() {
    if (!concept.trim() || deciding) return
    setDeciding(true)
    setDecision(null)
    setError(null)
    setApproved(false)
    setOverride(null)
    setOverriding(false)
    try {
      const result = await getManifestDecision(concept, apiKey)
      setDecision(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setDeciding(false)
    }
  }

  function loadObservation(obs) {
    setConcept(obs.text || '')
    setDecision(null)
    setApproved(false)
    setOverride(null)
    setOverriding(false)
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ padding: `32px ${px}` }}>
      <div style={{ maxWidth: '560px' }}>

        {/* Framing */}
        <div style={{ marginBottom: '28px' }}>
          <p style={{ color: 'var(--text-3)', fontSize: '13px', lineHeight: 1.8, marginBottom: '8px' }}>
            Inspiration is cheap. Judgment is rare.
          </p>
          <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.7 }}>
            MUSE evaluates whether an observation deserves manifestation.
            "Do Not Manifest" is a valid output. Mature systems are defined by what they refuse to create.
          </p>
        </div>

        {/* From Atrium */}
        {incoming.length > 0 && !concept && (
          <div style={{ marginBottom: '24px' }}>
            <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.12em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>
              From Atrium
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {incoming.slice(0, 5).map(obs => (
                <button key={obs.id} onClick={() => loadObservation(obs)} style={{
                  textAlign: 'left', background: 'var(--bg-2)',
                  border: '1px solid var(--border-1)', borderLeft: '2px solid #10b98140',
                  borderRadius: '0 6px 6px 0', padding: '8px 12px', cursor: 'pointer',
                }}>
                  <p style={{ color: 'var(--text-3)', fontSize: '11px', lineHeight: 1.5 }}>
                    {(obs.text?.length ?? 0) > 85 ? obs.text.slice(0, 85) + '…' : (obs.text || '')}
                  </p>
                  {obs.constellation && (
                    <p style={{ color: '#a07830', fontSize: '9px', marginTop: '3px' }}>{obs.constellation}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Observation input */}
        <div style={{ marginBottom: '16px' }}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>
            Observation
          </p>
          <textarea
            value={concept}
            onChange={e => { setConcept(e.target.value); setDecision(null); setApproved(false); setOverride(null) }}
            placeholder="Bring an observation. MUSE decides what it deserves."
            rows={3}
            style={{
              width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border-1)',
              borderRadius: '8px', padding: '12px 14px', color: 'var(--text-1)',
              fontSize: '13px', lineHeight: 1.6, resize: 'vertical', outline: 'none', fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Ask MUSE */}
        {!apiKey ? (
          <button onClick={onConnectClaude} style={{
            background: '#0d1a2e', border: '1px solid #1d4ed8', borderRadius: '8px',
            padding: '10px 20px', color: '#93c5fd', fontSize: '12px', fontWeight: 600,
            cursor: 'pointer', marginBottom: '24px',
          }}>
            ✦ Connect Claude to enable MUSE
          </button>
        ) : (
          <button onClick={askMuse} disabled={!concept.trim() || deciding} style={{
            background: concept.trim() && !deciding ? '#065f46' : 'var(--bg-2)',
            border: `1px solid ${concept.trim() && !deciding ? '#10b981' : 'var(--border-1)'}`,
            borderRadius: '8px', padding: '10px 20px',
            color: concept.trim() && !deciding ? '#ecfdf5' : 'var(--text-5)',
            fontSize: '12px', fontWeight: 600,
            cursor: concept.trim() && !deciding ? 'pointer' : 'default',
            marginBottom: '24px', transition: 'all 0.15s',
          }}>
            {deciding ? 'MUSE is deciding…' : '🎭 Ask MUSE'}
          </button>
        )}

        {error && <p style={{ color: '#ef4444', fontSize: '11px', marginBottom: '16px' }}>{error}</p>}

        {/* Manifest Decision card */}
        {decision && !overriding && (
          <div style={{
            border: `1px solid ${decisionMeta?.color || '#6b7280'}40`,
            borderLeft: `3px solid ${decisionMeta?.color || '#6b7280'}`,
            borderRadius: '0 10px 10px 0',
            overflow: 'hidden',
            marginBottom: '16px',
          }}>
            <div style={{ background: 'var(--bg-2)', padding: '14px 18px',
              borderBottom: '1px solid var(--border-0)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '10px' }}>
                <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
                  textTransform: 'uppercase', fontWeight: 600 }}>
                  MUSE — Manifest Decision
                </p>
                <span style={{
                  background: `${decisionMeta?.color}18`,
                  border: `1px solid ${decisionMeta?.color}40`,
                  borderRadius: '4px', padding: '3px 10px',
                  color: decisionMeta?.color,
                  fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>
                  {decisionMeta?.label || effectiveDecision}
                </span>
              </div>
              <p style={{ color: 'var(--text-2)', fontSize: '12px', lineHeight: 1.7 }}>
                {decision.reasoning}
              </p>
            </div>

            {decision.studios && decision.studios.length > 0 && (
              <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-0)',
                background: 'var(--bg-1)' }}>
                <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.1em',
                  textTransform: 'uppercase', marginBottom: '8px' }}>
                  Studios Recommended
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {decision.studios.map(sid => {
                    const f = FORMATS.find(f => f.id === sid)
                    if (!f) return null
                    const isPrimary = sid === decision.primaryStudio
                    return (
                      <span key={sid} style={{
                        padding: '4px 10px', borderRadius: '6px', fontSize: '11px',
                        background: isPrimary ? '#7c3aed' : 'var(--bg-2)',
                        color: isPrimary ? '#fff' : 'var(--text-3)',
                        border: `1px solid ${isPrimary ? '#8b5cf6' : 'var(--border-1)'}`,
                        fontWeight: isPrimary ? 600 : 400,
                      }}>
                        {f.icon} {f.label}
                        {isPrimary && <span style={{ fontSize: '8px', marginLeft: '4px', opacity: 0.7 }}>primary</span>}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {decision.note && (
              <div style={{ padding: '12px 18px', background: 'var(--bg-0)' }}>
                <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.7, fontStyle: 'italic' }}>
                  {decision.note}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Human Gate review */}
        {decision && !approved && !overriding && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button onClick={() => setApproved(true)} style={{
              flex: 1, padding: '9px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
              cursor: 'pointer', background: '#041208', border: '1px solid #0a3018', color: '#1a7a40',
              transition: 'all 0.15s',
            }}>
              ✓ Approve
            </button>
            <button onClick={() => setOverriding(true)} style={{
              padding: '9px 14px', borderRadius: '6px', fontSize: '11px',
              cursor: 'pointer', background: 'var(--bg-2)', border: '1px solid var(--border-1)',
              color: 'var(--text-4)',
            }}>
              Override
            </button>
          </div>
        )}

        {/* Override selector */}
        {overriding && (
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-1)',
            borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
            <p style={{ color: 'var(--text-4)', fontSize: '11px', marginBottom: '10px' }}>
              Human Gate — your decision:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
              {Object.entries(DECISION_META).map(([id, meta]) => (
                <button key={id}
                  onClick={() => { setOverride(id); setOverriding(false); setApproved(true) }}
                  style={{
                    textAlign: 'left', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer',
                    background: 'var(--bg-1)', border: `1px solid ${meta.color}30`,
                    color: meta.color, fontSize: '11px', fontWeight: 500,
                  }}>
                  {meta.label}
                </button>
              ))}
            </div>
            <button onClick={() => setOverriding(false)} style={{
              background: 'none', border: 'none', color: 'var(--text-5)', fontSize: '10px', cursor: 'pointer',
            }}>Cancel</button>
          </div>
        )}

        {/* Approved state — route to action */}
        {approved && (
          <div style={{
            background: 'var(--bg-2)', border: `1px solid ${decisionMeta?.color}30`,
            borderRadius: '8px', padding: '16px 18px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: effectiveDecision === 'manifest' ? '12px' : 0 }}>
              <p style={{ color: '#10b981', fontSize: '11px', fontWeight: 600 }}>
                ✓ Human Gate approved: {decisionMeta?.label}
              </p>
              {override && (
                <span style={{ color: 'var(--text-6)', fontSize: '10px', fontStyle: 'italic' }}>
                  overriding MUSE
                </span>
              )}
            </div>

            {effectiveDecision === 'manifest' && (
              <>
                <p style={{ color: 'var(--text-5)', fontSize: '11px', marginBottom: '10px', lineHeight: 1.6 }}>
                  The stage is ready.
                  {decision?.studios?.length > 0 && !override && (
                    <span> MUSE recommends: {decision.studios.map(s => {
                      const f = FORMATS.find(f => f.id === s)
                      return f ? `${f.icon} ${f.label}` : s
                    }).join(', ')}.</span>
                  )}
                </p>
                {onNavigate && (
                  <button onClick={() => onNavigate('content')} style={{
                    padding: '8px 16px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                    background: '#1d3f6e', border: '1px solid #3b82f6', color: '#93c5fd', cursor: 'pointer',
                  }}>
                    📡 Open OpsCore →
                  </button>
                )}
              </>
            )}

            {effectiveDecision === 'route_business' && onNavigate && (
              <button onClick={() => onNavigate('businesscenter')} style={{
                padding: '8px 16px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                background: '#0d1f3c', border: '1px solid #1d4ed8', color: '#93c5fd', cursor: 'pointer',
              }}>
                → Open Business Center
              </button>
            )}

            {effectiveDecision === 'route_doctrine' && onNavigate && (
              <button onClick={() => onNavigate('doctrine')} style={{
                padding: '8px 16px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                background: '#1c1200', border: '1px solid #5c3a00', color: '#f59e0b', cursor: 'pointer',
              }}>
                → Open Doctrine
              </button>
            )}

            {effectiveDecision === 'archive_only' && (
              <p style={{ color: 'var(--text-5)', fontSize: '11px', fontStyle: 'italic' }}>
                Noted. The observation is preserved. No production opened.
              </p>
            )}

            {effectiveDecision === 'do_not_manifest' && (
              <p style={{ color: 'var(--text-5)', fontSize: '11px', fontStyle: 'italic' }}>
                Observation received. Manifestation not recommended. No production opened.
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

// ── Muse Room ─────────────────────────────────────────────────────────────────

export default function MuseRoom({ observations = [], works = [], uid, onSurface, apiKey, onConnectClaude, onNavigate, isMobile, externalSeed, onExternalSeedConsumed }) {
  const [mode, setMode] = useState('canvas')

  const [activeWork, setActiveWork] = useState(null)
  const [activeObs, setActiveObs]   = useState(null)
  const [inboxObs, setInboxObs]     = useState(null)

  // Cross-room handoff — e.g. a Theater media asset sent in "for packaging"
  useEffect(() => {
    if (!externalSeed) return
    setInboxObs(externalSeed)
    setMode('inbox')
    onExternalSeedConsumed?.()
  }, [externalSeed]) // eslint-disable-line react-hooks/exhaustive-deps
  const [draft, setDraft]           = useState({ title: '', category: 'characters' })
  const [adding, setAdding]         = useState(false)
  const [surfaced, setSurfaced]     = useState(new Set())
  const [pendingActiveId, setPendingActiveId] = useState(null)

  const [editNotes, setEditNotes]   = useState('')
  const [notesWorkId, setNotesWorkId] = useState(null)

  useEffect(() => {
    if (pendingActiveId) {
      const w = works.find(w => w.id === pendingActiveId)
      if (w) { setActiveWork(w); setPendingActiveId(null) }
      return
    }
    if (!activeWork) return
    const updated = works.find(w => w.id === activeWork.id)
    if (updated) setActiveWork(updated)
  }, [works, pendingActiveId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeWork?.id !== notesWorkId) {
      setEditNotes(activeWork?.notes || '')
      setNotesWorkId(activeWork?.id || null)
    }
  }, [activeWork?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function addWork() {
    if (!draft.title.trim() || !uid) return
    const id = await createMuseWork(uid, {
      title: draft.title.trim(), category: draft.category, notes: '', status: 'shaping',
    })
    setPendingActiveId(id)
    setDraft({ title: '', category: 'characters' })
    setAdding(false)
  }

  function handleNotesChange(e) { setEditNotes(e.target.value) }
  function handleNotesBlur() {
    if (uid && notesWorkId) updateMuseWork(uid, notesWorkId, { notes: editNotes }).catch(console.error)
  }

  async function advance(id) {
    if (!uid) return
    const work = works.find(w => w.id === id)
    if (!work) return
    await updateMuseWork(uid, id, { status: nextStatus(work.status) })
  }

  function tilt(seed, i) { return (((seed.charCodeAt(0) + i) % 7) - 3) * 0.55 }

  const signals   = observations.slice(0, 14)
  const activeCat = CATEGORIES.find(c => c.id === activeWork?.category)
  const activeIdx = activeWork ? LIFECYCLE_IDS.indexOf(activeWork.status) : -1
  const nextStage = activeWork ? LIFECYCLE[activeIdx + 1] : null

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-0)' }}>

      {/* Room header */}
      <div className="shrink-0" style={{ borderBottom: '1px solid var(--border-0)',
        padding: '20px 24px 16px' }}>
        <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>MUSE</p>
        <h2 style={{ fontSize: '18px', color: 'var(--text-0)', fontWeight: 700,
          letterSpacing: '0.08em', marginBottom: '4px' }}>Creative Studio</h2>
        <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic' }}>
          {mode === 'inbox' ? 'Should this be made at all?' : 'What wants to be made next?'}
        </p>
      </div>

      <RoomSubNav tabs={MUSE_TABS} activeTab={mode} onSelect={setMode} />

      {mode === 'inbox' && (
        <CreativeDirectorView
          observations={observations}
          apiKey={apiKey}
          onConnectClaude={onConnectClaude}
          onNavigate={onNavigate}
          isMobile={isMobile}
          seedObs={inboxObs}
          onSeedConsumed={() => setInboxObs(null)}
        />
      )}

      {mode === 'works' && (
        <div className="flex-1 overflow-y-auto" style={{ padding: '24px' }}>
          <div style={{ maxWidth: '560px' }}>
            {works.length === 0 ? (
              <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic', lineHeight: 1.7 }}>
                No works in progress. Open Canvas to begin something new.
              </p>
            ) : (
              CATEGORIES.map(cat => {
                const catWorks = works.filter(w => w.category === cat.id)
                if (catWorks.length === 0) return null
                return (
                  <div key={cat.id} style={{ marginBottom: '24px' }}>
                    <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
                      textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>
                      {cat.icon} {cat.label}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {catWorks.map(w => (
                        <div key={w.id} style={{
                          background: 'var(--bg-2)', border: '1px solid var(--border-1)',
                          borderRadius: '8px', padding: '10px 14px',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'baseline',
                            justifyContent: 'space-between', gap: '10px' }}>
                            <p style={{ color: STATUS_COLORS[w.status] || 'var(--text-1)',
                              fontSize: '13px', fontWeight: 500 }}>
                              {STATUS_GLYPHS[w.status]}{w.title}
                            </p>
                            <span style={{ color: 'var(--text-6)', fontSize: '9px',
                              textTransform: 'uppercase', letterSpacing: '0.08em',
                              flexShrink: 0 }}>
                              {w.status?.replace('_', ' ')}
                            </span>
                          </div>
                          {w.notes && (
                            <p style={{ color: 'var(--text-5)', fontSize: '11px',
                              lineHeight: 1.5, marginTop: '4px' }}>
                              {w.notes.length > 80 ? w.notes.slice(0, 80) + '…' : w.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {mode === 'signals' && (
        <div className="flex-1 overflow-y-auto" style={{ padding: '24px' }}>
          <div style={{ maxWidth: '560px' }}>
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '12px' }}>
              From Atrium
            </p>
            {observations.length === 0 ? (
              <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic', lineHeight: 1.7 }}>
                No observations yet. Signals from Atrium will appear here.
              </p>
            ) : (
              observations.slice(0, 20).map(obs => (
                <div key={obs.id} style={{
                  background: 'var(--bg-2)', border: '1px solid var(--border-1)',
                  borderLeft: '2px solid #10b98140', borderRadius: '0 8px 8px 0',
                  padding: '10px 14px', marginBottom: '6px',
                }}>
                  <p style={{ color: 'var(--text-2)', fontSize: '12px', lineHeight: 1.55 }}>
                    {obs.text.length > 90 ? obs.text.slice(0, 90) + '…' : obs.text}
                  </p>
                  {obs.constellation && (
                    <p style={{ color: '#a07830', fontSize: '9px', marginTop: '4px' }}>
                      ◈ {obs.constellation}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {mode === 'canvas' && (
        <>
          <div className="flex flex-1 overflow-hidden">

            {/* LEFT WING */}
            <div className="flex flex-col shrink-0 overflow-y-auto py-5 px-3"
              style={{ width: '210px', borderRight: '1px solid var(--border-0)' }}>
              <div className="flex items-center gap-2 mb-4 px-2">
                <span className="animate-pulse shrink-0" style={{
                  width: '5px', height: '5px', borderRadius: '50%', background: '#10b981',
                }} />
                <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
                  textTransform: 'uppercase', fontWeight: 600 }}>Arriving</p>
              </div>
              {signals.length === 0 ? (
                <p className="px-2" style={{ color: 'var(--text-6)', fontSize: '11px', lineHeight: 1.7 }}>
                  Signals from Atrium will appear here.
                </p>
              ) : (
                <div className="flex flex-col gap-3 px-1">
                  {signals.map((obs, i) => {
                    const isSelected = activeObs?.id === obs.id
                    return (
                      <button key={obs.id}
                        onClick={() => { setActiveObs(obs); setActiveWork(null) }}
                        style={{
                          transform: `rotate(${tilt(obs.id, i)}deg)`,
                          background: isSelected ? 'var(--bg-3)' : 'var(--bg-2)',
                          border: `1px solid ${isSelected ? 'var(--border-2)' : 'var(--border-1)'}`,
                          borderRadius: '6px', padding: '8px 10px',
                          cursor: 'pointer', textAlign: 'left', width: '100%',
                          outline: isSelected ? '1px solid #10b98140' : 'none',
                          transition: 'all 0.12s',
                        }}>
                        <p style={{ color: isSelected ? 'var(--text-1)' : 'var(--text-2)', fontSize: '11px', lineHeight: 1.5 }}>
                          {obs.text.length > 65 ? obs.text.slice(0, 65) + '…' : obs.text}
                        </p>
                        {obs.constellation && (
                          <p style={{ color: '#a07830', fontSize: '9px', marginTop: '4px' }}>{obs.constellation}</p>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* CENTER STAGE */}
            <div className="flex-1 flex flex-col overflow-hidden"
              style={{ background: 'var(--bg-1)', borderRight: '1px solid var(--border-0)' }}>
              {activeWork ? (
                <div className="flex flex-col flex-1 px-12 py-10 overflow-y-auto">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
                        textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>
                        {activeCat?.icon} {activeCat?.label}
                      </p>
                      <h2 style={{ fontSize: '32px', color: 'var(--text-0)', fontWeight: 700,
                        letterSpacing: '-0.025em', lineHeight: 1.15 }}>
                        {activeWork.title}
                      </h2>
                    </div>
                    {nextStage ? (
                      <button onClick={() => advance(activeWork.id)} style={{
                        fontSize: '11px', padding: '7px 16px', borderRadius: '8px', fontWeight: 500,
                        background: activeWork.status === 'premiere_ready' ? '#1d4ed8' : 'var(--bg-3)',
                        color: activeWork.status === 'premiere_ready' ? '#e0eaff' : 'var(--text-2)',
                        border: `1px solid ${activeWork.status === 'premiere_ready' ? '#2563eb' : 'var(--border-1)'}`,
                        cursor: 'pointer', whiteSpace: 'nowrap',
                      }}>
                        {activeWork.status === 'premiere_ready' ? 'Opening Night →' : nextStage.action}
                      </button>
                    ) : (
                      <span style={{ fontSize: '11px', padding: '5px 14px', borderRadius: '999px',
                        background: '#06b6d415', color: '#06b6d4', border: '1px solid #06b6d430' }}>
                        In Archive
                      </span>
                    )}
                  </div>

                  {/* Lifecycle strip */}
                  <div className="flex items-center gap-0 mb-10" style={{ overflowX: 'auto' }}>
                    {LIFECYCLE.map((stage, i) => {
                      const past    = i < activeIdx
                      const current = i === activeIdx
                      const color   = STATUS_COLORS[stage.id]
                      return (
                        <div key={stage.id} className="flex items-center">
                          <div style={{ textAlign: 'center' }}>
                            <div style={{
                              width: '8px', height: '8px', borderRadius: '50%',
                              background: current ? color : past ? 'var(--border-2)' : 'var(--border-0)',
                              border: current ? `2px solid ${color}` : '2px solid transparent',
                              margin: '0 auto 4px',
                            }} />
                            <p style={{
                              fontSize: '8px', letterSpacing: '0.08em', textTransform: 'uppercase',
                              color: current ? color : past ? 'var(--text-4)' : 'var(--text-6)',
                              whiteSpace: 'nowrap',
                            }}>{stage.label}</p>
                          </div>
                          {i < LIFECYCLE.length - 1 && (
                            <div style={{
                              width: '32px', height: '1px', flexShrink: 0, margin: '-10px 4px 0',
                              background: past ? 'var(--border-2)' : 'var(--border-0)',
                            }} />
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <div style={{ flex: 1 }}>
                    <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
                      textTransform: 'uppercase', marginBottom: '12px' }}>Studio Notes</p>
                    <textarea
                      value={editNotes}
                      onChange={handleNotesChange}
                      onBlur={handleNotesBlur}
                      placeholder="What's taking shape here?"
                      className="w-full resize-none outline-none"
                      style={{
                        background: 'transparent', border: 'none',
                        color: 'var(--text-1)', fontSize: '15px',
                        lineHeight: 1.85, minHeight: '260px', width: '100%',
                      }}
                    />
                  </div>
                </div>
              ) : activeObs ? (
                <div className="flex flex-col flex-1 px-12 py-10 overflow-y-auto">
                  <div className="flex items-start justify-between mb-8">
                    <div style={{ flex: 1, paddingRight: '24px' }}>
                      <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
                        textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>
                        {activeObs.type || 'Observation'}
                        {activeObs.constellation && (
                          <span style={{ color: '#a07830' }}> · ◈ {activeObs.constellation}</span>
                        )}
                      </p>
                      <p style={{ color: 'var(--text-1)', fontSize: '16px', lineHeight: 1.75, maxWidth: '480px' }}>
                        {activeObs.text}
                      </p>
                    </div>
                    <button onClick={() => setActiveObs(null)} style={{
                      background: 'none', border: 'none', color: 'var(--text-5)',
                      cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: 0, flexShrink: 0,
                    }}>✕</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '320px' }}>
                    <button onClick={() => { setInboxObs(activeObs); setMode('inbox') }} style={{
                      padding: '10px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                      background: '#065f46', border: '1px solid #10b981', color: '#ecfdf5',
                      cursor: 'pointer', textAlign: 'left',
                    }}>
                      🎭 Ask MUSE about this
                    </button>
                    <button onClick={() => {
                      setDraft({ title: activeObs.text.slice(0, 60).trimEnd(), category: 'characters' })
                      setAdding(true)
                      setActiveObs(null)
                    }} style={{
                      padding: '10px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                      background: 'var(--bg-3)', border: '1px solid var(--border-1)', color: 'var(--text-2)',
                      cursor: 'pointer', textAlign: 'left',
                    }}>
                      + Begin a Work from this
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center px-10">
                  <div style={{ maxWidth: '340px', textAlign: 'center' }}>
                    <div style={{ fontSize: '44px', marginBottom: '22px', opacity: 0.18 }}>🎭</div>
                    <p style={{ fontSize: '19px', color: 'var(--text-3)', fontWeight: 500,
                      letterSpacing: '-0.015em', marginBottom: '10px' }}>The stage is ready.</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-5)', lineHeight: 1.7 }}>
                      Select a signal from the left wing,<br />a work from the right, or press + to begin.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT WING */}
            <div className="flex flex-col shrink-0 overflow-y-auto py-5 px-3"
              style={{ width: '250px', background: 'var(--bg-0)' }}>
              <div className="flex items-center justify-between mb-4 px-2">
                <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
                  textTransform: 'uppercase', fontWeight: 600 }}>Works in Progress</p>
                <button onClick={() => setAdding(v => !v)} style={{
                  background: 'none', border: 'none', color: 'var(--text-3)',
                  cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: 0,
                }}>+</button>
              </div>

              {adding && (
                <div className="mb-5 px-1">
                  <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-1)',
                    borderRadius: '8px', padding: '12px' }}>
                    <input value={draft.title}
                      onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
                      placeholder="Title" autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') addWork(); if (e.key === 'Escape') setAdding(false) }}
                      style={{
                        width: '100%', background: 'transparent', border: 'none',
                        borderBottom: '1px solid var(--border-1)', color: 'var(--text-0)',
                        fontSize: '13px', paddingBottom: '6px', marginBottom: '10px', outline: 'none',
                      }}
                    />
                    <select value={draft.category}
                      onChange={e => setDraft(d => ({ ...d, category: e.target.value }))}
                      style={{
                        width: '100%', background: 'var(--bg-1)', border: '1px solid var(--border-1)',
                        borderRadius: '4px', color: 'var(--text-1)', padding: '5px 6px',
                        fontSize: '11px', marginBottom: '10px', outline: 'none',
                      }}>
                      {CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                      ))}
                    </select>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={addWork} style={{
                        flex: 1, fontSize: '11px', padding: '6px', borderRadius: '5px',
                        background: '#1d4ed8', color: '#e0eaff', border: 'none', cursor: 'pointer',
                      }}>Add</button>
                      <button onClick={() => setAdding(false)} style={{
                        flex: 1, fontSize: '11px', padding: '6px', borderRadius: '5px',
                        background: 'var(--bg-3)', color: 'var(--text-2)',
                        border: '1px solid var(--border-1)', cursor: 'pointer',
                      }}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              {CATEGORIES.map(cat => {
                const catWorks = works.filter(w => w.category === cat.id)
                if (catWorks.length === 0) return null
                return (
                  <div key={cat.id} style={{ marginBottom: '18px' }}>
                    <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.12em',
                      textTransform: 'uppercase', padding: '0 8px', marginBottom: '6px' }}>
                      {cat.icon} {cat.label}
                    </p>
                    <div className="flex flex-col gap-0.5">
                      {catWorks.map(w => {
                        const glyph    = STATUS_GLYPHS[w.status] || ''
                        const color    = STATUS_COLORS[w.status] || 'var(--text-2)'
                        const isActive = activeWork?.id === w.id
                        return (
                          <button key={w.id} onClick={() => { setActiveWork(w); setActiveObs(null) }} style={{
                            textAlign: 'left', borderRadius: '6px', padding: '7px 10px',
                            fontSize: '12px', transition: 'all 0.15s', cursor: 'pointer',
                            background: isActive ? 'var(--bg-3)' : 'transparent',
                            border: `1px solid ${isActive ? 'var(--border-1)' : 'transparent'}`,
                            color: (w.status === 'shaping' || w.status === 'structured')
                              ? (isActive ? 'var(--text-0)' : 'var(--text-2)')
                              : color,
                          }}>{glyph}{w.title}</button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {works.length === 0 && !adding && (
                <p style={{ color: 'var(--text-6)', fontSize: '11px', padding: '0 8px', lineHeight: 1.7 }}>
                  Nothing in progress yet.<br />Press + to begin.
                </p>
              )}
            </div>
          </div>

          {/* BACK WALL */}
          <div className="shrink-0" style={{
            borderTop: '1px solid var(--border-0)', background: 'var(--bg-0)', padding: '12px 28px',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '10px' }}>
              <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Constellations Muse noticed
              </p>
              {onSurface && (
                <p style={{ color: 'var(--text-6)', fontSize: '9px', fontStyle: 'italic' }}>
                  — surface one to send it back to Atrium
                </p>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 28px' }}>
              {CONSTELLATIONS.map((c, i) => {
                const key  = `${c.a}⇔${c.b}`
                const done = surfaced.has(key)
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <span style={{ color: done ? 'var(--text-5)' : 'var(--text-2)', fontSize: '11px' }}>{c.a}</span>
                    <span style={{ color: 'var(--text-6)', fontSize: '11px' }}>⟷</span>
                    <span style={{ color: done ? 'var(--text-5)' : 'var(--text-2)', fontSize: '11px' }}>{c.b}</span>
                    <span style={{ color: 'var(--text-6)', fontSize: '9px', fontStyle: 'italic' }}>{c.note}</span>
                    {onSurface && (
                      done ? (
                        <span style={{ fontSize: '9px', color: '#10b981' }}>↗ surfaced</span>
                      ) : (
                        <button onClick={() => {
                          onSurface({ text: `Connection noticed: ${c.a} ⇔ ${c.b} — ${c.note}.`, type: 'text', constellation: null, source: 'Muse Back Wall' })
                          setSurfaced(prev => new Set([...prev, key]))
                        }} style={{
                          fontSize: '9px', padding: '1px 7px', borderRadius: '4px',
                          background: 'transparent', border: '1px solid var(--border-1)',
                          color: 'var(--text-4)', cursor: 'pointer',
                        }}>↗ surface</button>
                      )
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* BOTTOM */}
          <div className="shrink-0" style={{ borderTop: '1px solid var(--border-0)', padding: '14px 28px' }}>
            <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic', letterSpacing: '0.02em' }}>
              What wants to be made next?
            </p>
          </div>
        </>
      )}
    </div>
  )
}

