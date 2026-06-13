import { useState } from 'react'
import { sendToPACER } from '../lib/bridge'

const ROUTES = [
  { id: 'FleetFlow',              label: 'FleetFlow',              description: 'Operational Systems',                  color: '#3b82f6', activeBg: '#0d1f3c', activeBorder: '#1d3f6e' },
  { id: 'Isles of the Awakening', label: 'Isles',                  description: 'Incubation · Potential · Wilderness',    color: '#10b981', activeBg: '#041f14', activeBorder: '#065f3a' },
  { id: 'Doctrine',               label: 'Doctrine',               description: 'Principles · Frameworks · Architecture', color: '#f59e0b', activeBg: '#1c1200', activeBorder: '#5c3a00' },
  { id: 'Theater',                label: 'Theater',                description: 'Stage for Production · Manifestation',  color: '#a855f7', activeBg: '#130a20', activeBorder: '#6b21a8' },
  { id: 'Content',                label: 'Content',                description: 'Media · Assets · Publishing',           color: '#8b5cf6', activeBg: '#130c24', activeBorder: '#3b1f7a' },
  { id: 'Archive',                label: 'Archive',                description: 'Preserve Without Routing',              color: '#6b7280', activeBg: '#0f1117', activeBorder: '#374151' },
]

const ROUTE_COLORS = {
  'FleetFlow':              '#3b82f6',
  'Isles of the Awakening': '#10b981',
  'Doctrine':               '#f59e0b',
  'Theater':                '#a855f7',
  'Content':                '#8b5cf6',
  'Archive':                '#6b7280',
}

function destColor(dest) { return ROUTE_COLORS[dest] || '#4b5563' }

const STATIC_NEXT = {
  FleetFlow:                ['Is this pattern repeating?', 'Who else sees this?', 'What is the cost of ignoring it?'],
  'Isles of the Awakening': ['What could this become?', 'What is this idea waiting to find?', 'What would make this ready to move?'],
  Doctrine:                 ['Is this a principle or an exception?', 'What rule would prevent this?', 'Who needs to know this?'],
  Theater:                  ['What format serves this best?', 'Who is the audience?', 'What should they feel after experiencing it?'],
  Content:                  ['What is the headline?', 'Who is the audience?', 'What format fits this best?'],
  Archive:                  ['When should this resurface?', 'What would make this relevant again?', 'Who should find this?'],
}

const TYPE_ICONS = { text: '✍️', voice: '🎤', image: '📸', document: '📄', idea: '💡' }

// ── Journey Timeline ───────────────────────────────────────────────────────────

function fmt(d) {
  if (!d) return null
  const date = d instanceof Date ? d : new Date(d)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' · ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function JourneyStep({ done, label, timestamp, detail, color, isLast }) {
  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '14px' }}>
        <span style={{ fontSize: '8px', color: done ? color : 'var(--border-2)', lineHeight: 1, display: 'block', marginTop: '3px' }}>
          {done ? '⬤' : '○'}
        </span>
        {!isLast && (
          <div style={{
            width: '1px', flex: 1, minHeight: '18px',
            background: done ? color + '30' : 'var(--border-1)',
            margin: '4px 0',
          }} />
        )}
      </div>
      <div style={{ paddingBottom: isLast ? '0' : '14px' }}>
        <p style={{ color: done ? 'var(--text-2)' : 'var(--text-6)', fontSize: '12px',
          fontWeight: done ? 500 : 400, lineHeight: 1.4 }}>
          {label}
        </p>
        {timestamp && (
          <p style={{ color: 'var(--text-6)', fontSize: '10px', marginTop: '1px' }}>{timestamp}</p>
        )}
        {detail && (
          <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.6, marginTop: '4px' }}>{detail}</p>
        )}
      </div>
    </div>
  )
}

function JourneyTimeline({ observation, thread }) {
  const ts = observation.timestamp

  const steps = [
    {
      label:    'Entered Atrium',
      detail:   null,
      done:     true,
      ts:       fmt(ts),
      color:    '#1d4ed8',
    },
    {
      label:    observation.claude ? 'MUSE — Analyzed' : 'MUSE Analysis',
      detail:   observation.claude
        ? `${observation.claude.destination} · ${Math.round((observation.claude.confidence || 0) * 100)}% confidence`
        : null,
      done:     !!observation.claude,
      ts:       observation.claude ? fmt(ts) : null,
      color:    '#6366f1',
    },
    {
      label:    observation.constellation ? `VERA — ${observation.constellation}` : 'VERA Pattern',
      detail:   observation.constellation ? 'Constellation named' : null,
      done:     !!observation.constellation,
      ts:       observation.constellation ? fmt(ts) : null,
      color:    '#8b5cf6',
    },
    {
      label:    observation.destination ? `Routed → ${observation.destination}` : 'Destination',
      detail:   null,
      done:     !!observation.destination,
      ts:       observation.destination ? fmt(ts) : null,
      color:    '#10b981',
    },
    {
      label:    thread
        ? `KEL — ${thread.decision === 'approved' ? '✓ Approved' : thread.decision === 'declined' ? '✗ Declined' : 'Pending'}`
        : 'KEL Deliberation',
      detail:   thread?.recommendation
        ? (thread.recommendation.length > 80 ? thread.recommendation.slice(0, 80) + '…' : thread.recommendation)
        : null,
      done:     !!thread,
      ts:       thread ? fmt(thread.decisionAt) : null,
      color:    thread?.decision === 'approved' ? '#10b981' : thread?.decision === 'declined' ? '#ef4444' : '#f59e0b',
    },
    {
      label:    thread?.artifact ? `Forge — ${thread.artifact.title.length > 45 ? thread.artifact.title.slice(0, 45) + '…' : thread.artifact.title}` : 'Forge',
      detail:   thread?.artifact ? 'Artifact manufactured · Sent to Theater' : null,
      done:     !!thread?.artifact,
      ts:       thread?.artifact ? fmt(thread.outcomeAt) : null,
      color:    '#10b981',
    },
    {
      label:    thread?.outcomeSignal
        ? `Archivist — ${thread.outcomeSignal}`
        : 'Archivist',
      detail:   thread?.outcomeNote
        ? (thread.outcomeNote.length > 70 ? thread.outcomeNote.slice(0, 70) + '…' : thread.outcomeNote)
        : null,
      done:     !!thread?.outcomeSignal,
      ts:       null,
      color:    thread?.outcomeSignal === 'positive' ? '#10b981'
        : thread?.outcomeSignal === 'friction' ? '#f97316'
        : '#6b7280',
    },
  ]

  return (
    <div className="px-6 py-5 flex-1 overflow-y-auto">
      <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
        textTransform: 'uppercase', fontWeight: 600, marginBottom: '20px' }}>
        Observation Journey
      </p>
      {steps.map((step, i) => (
        <JourneyStep
          key={i}
          done={step.done}
          label={step.label}
          timestamp={step.ts}
          detail={step.detail}
          color={step.color}
          isLast={i === steps.length - 1}
        />
      ))}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function PACERProcessing({
  observation, observations = [], onRoute, onAcceptConstellation, hasApiKey, onRequestApiKey, uid,
  isMobile, onBack, thread = null,
}) {
  const [sending, setSending] = useState(false)
  const [sentIds, setSentIds] = useState(new Set())
  const [sendError, setSendError] = useState(null)
  const [view, setView]           = useState('analysis')

  async function handleSendToPACER() {
    if (!observation || sending || sentIds.has(observation.id)) return
    setSending(true)
    setSendError(null)
    try {
      await sendToPACER(observation, uid)
      setSentIds(prev => new Set([...prev, observation.id]))
    } catch (err) {
      const msg = err?.code || err?.message || 'Unknown error'
      console.error('[PACER bridge] sendToPACER failed:', err)
      setSendError(`Send failed: ${msg}`)
    } finally {
      setSending(false)
    }
  }

  if (!observation) {
    return (
      <aside className="flex flex-col shrink-0 border-l"
        style={{ width: '288px', background: 'var(--bg-1)', borderColor: 'var(--border-0)' }}
      >
        <div className="px-6 py-5 border-b" style={{ borderColor: 'var(--border-0)' }}>
          <p className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: 'var(--text-5)', letterSpacing: '0.15em' }}
          >PACER Processing</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-4">
          <p className="text-xs text-center leading-relaxed" style={{ color: 'var(--text-6)' }}>
            Waiting for an observation to enter the system.
          </p>
          {!hasApiKey && (
            <button onClick={onRequestApiKey} className="text-xs"
              style={{ background: 'none', border: 'none', color: 'var(--text-4)', cursor: 'pointer' }}
            >+ Enable Claude routing</button>
          )}
        </div>
      </aside>
    )
  }

  const routed    = observation.destination !== null
  const claude    = observation.claude
  const analyzing = observation.analyzing || false
  const claudeError = observation.claudeError || null
  const isSent    = sentIds.has(observation.id)

  const related = observation.constellation
    ? observations.filter(o => o.constellation === observation.constellation && o.id !== observation.id).slice(0, 3)
    : []

  const nextObs = claude?.suggestions || (routed ? STATIC_NEXT[observation.destination] : null)

  const claudeSuggestsConstellation = claude?.constellation
  const constellationDiffers =
    claudeSuggestsConstellation &&
    (!observation.constellation ||
      observation.constellation.toLowerCase() !== claudeSuggestsConstellation.toLowerCase())

  return (
    <aside className="flex flex-col overflow-y-auto"
      style={{
        width: isMobile ? '100%' : '288px',
        flexShrink: isMobile ? 0 : 0,
        borderLeft: isMobile ? 'none' : '1px solid var(--border-0)',
        borderTop: isMobile ? '1px solid var(--border-0)' : 'none',
        background: 'var(--bg-1)',
      }}
    >
      {/* Header */}
      <div className="px-6 py-5 border-b shrink-0" style={{ borderColor: 'var(--border-0)' }}>
        {isMobile && onBack && (
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-4)',
            fontSize: '11px', cursor: 'pointer', padding: 0, marginBottom: '10px', display: 'block' }}>
            ← Back to observations
          </button>
        )}
        <p className="text-xs font-semibold tracking-widest uppercase mb-1"
          style={{ color: '#1d4ed8', letterSpacing: '0.15em' }}
        >PACER Processing</p>
        <p className="text-xs" style={{ color: 'var(--text-5)' }}>Observation received</p>
      </div>

      {/* Tabs */}
      <div className="shrink-0" style={{ borderBottom: '1px solid var(--border-1)', display: 'flex' }}>
        {['Analysis', 'Journey'].map(tab => {
          const active = view === tab.toLowerCase()
          return (
            <button
              key={tab}
              onClick={() => setView(tab.toLowerCase())}
              style={{
                flex: 1, padding: '8px 0', background: 'none', border: 'none',
                borderBottom: active ? '2px solid #1d4ed8' : '2px solid transparent',
                color: active ? 'var(--text-1)' : 'var(--text-5)',
                fontSize: '11px', fontWeight: active ? 600 : 400,
                cursor: 'pointer', fontFamily: 'inherit', marginBottom: '-1px',
                letterSpacing: '0.03em',
              }}
            >
              {tab}
            </button>
          )
        })}
      </div>

      {/* Journey view */}
      {view === 'journey' && (
        <JourneyTimeline observation={observation} thread={thread} />
      )}

      {/* Analysis view */}
      {view === 'analysis' && (
        <>
          {observation.storageUrl && (
            <div style={{ borderBottom: '1px solid var(--border-1)' }}>
              <img
                src={observation.storageUrl}
                alt={observation.text || 'observation'}
                style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', display: 'block' }}
              />
            </div>
          )}

          {observation.constellation && (
            <div className="px-6 py-3 border-b" style={{ borderColor: 'var(--border-1)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-3)' }}>constellation</p>
              <p className="text-sm font-medium" style={{ color: '#a07830' }}>{observation.constellation}</p>
            </div>
          )}

          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-1)' }}>
            <div className="flex items-center gap-3 mb-2">
              <p className="text-xs capitalize" style={{ color: 'var(--text-2)' }}>
                {TYPE_ICONS[observation.type] || '✍️'} {observation.type}
              </p>
              {observation.source && (
                <p className="text-xs" style={{ color: 'var(--text-5)' }}>
                  · {observation.source}
                </p>
              )}
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-3)' }}>
              {(observation.text?.length ?? 0) > 100 ? observation.text.slice(0, 100) + '…' : (observation.text || '')}
            </p>
          </div>

          {(analyzing || claude || claudeError) && (
            <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-1)' }}>
              {analyzing && (
                <div className="flex items-center gap-2">
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1d4ed8', animation: 'pulse-fade 1.5s infinite' }} />
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>Claude is reading…</p>
                </div>
              )}
              {!analyzing && claudeError && (
                <p className="text-xs" style={{ color: '#ef4444' }}>
                  Claude unavailable: {claudeError || 'routing manually'}
                </p>
              )}
              {!analyzing && claude && (
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase mb-3"
                    style={{ color: 'var(--text-4)', letterSpacing: '0.15em' }}
                  >Claude Suggests</p>

                  {constellationDiffers && (
                    <div className="rounded-lg px-3 py-2.5 mb-3 flex items-start justify-between gap-3"
                      style={{ background: '#0e0c06', border: '1px solid #2d1e08' }}
                    >
                      <div>
                        <p className="text-xs mb-0.5" style={{ color: '#3a2808' }}>constellation</p>
                        <p className="text-sm font-medium" style={{ color: '#a07830' }}>{claudeSuggestsConstellation}</p>
                      </div>
                      <button onClick={() => onAcceptConstellation(observation.id, claudeSuggestsConstellation)}
                        className="text-xs px-2.5 py-1.5 rounded-lg shrink-0"
                        style={{ background: '#1a1008', color: '#8b6620', border: '1px solid #4a3010', cursor: 'pointer' }}
                      >{observation.constellation ? 'Override' : 'Accept'}</button>
                    </div>
                  )}

                  <div className="rounded-lg px-3 py-2.5 mb-2"
                    style={{ background: 'var(--bg-0)', border: `1px solid ${destColor(claude.destination)}30` }}
                  >
                    <p className="text-xs mb-1.5" style={{ color: 'var(--text-5)' }}>Primary Destination</p>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium" style={{ color: destColor(claude.destination) }}>{claude.destination}</p>
                      <span className="text-xs" style={{ color: destColor(claude.destination) + '99' }}>
                        {Math.round((claude.confidence || 0) * 100)}%
                      </span>
                    </div>
                    <div className="rounded-full overflow-hidden" style={{ height: '2px', background: 'var(--border-1)' }}>
                      <div className="h-full rounded-full"
                        style={{ width: `${Math.round((claude.confidence || 0) * 100)}%`, background: destColor(claude.destination) }}
                      />
                    </div>
                  </div>

                  {claude.secondaryDestination && claude.secondaryDestination !== 'null' && (
                    <div className="rounded-lg px-3 py-2.5 mb-3"
                      style={{ background: 'var(--bg-0)', border: '1px solid var(--border-1)' }}
                    >
                      <p className="text-xs mb-1.5" style={{ color: 'var(--text-5)' }}>Also consider</p>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm" style={{ color: destColor(claude.secondaryDestination) + 'cc' }}>
                          {claude.secondaryDestination}
                        </p>
                        <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                          {Math.round((claude.secondaryConfidence || 0) * 100)}%
                        </span>
                      </div>
                      <div className="rounded-full overflow-hidden" style={{ height: '2px', background: 'var(--border-1)' }}>
                        <div className="h-full rounded-full"
                          style={{ width: `${Math.round((claude.secondaryConfidence || 0) * 100)}%`, background: destColor(claude.secondaryDestination) + '60' }}
                        />
                      </div>
                    </div>
                  )}

                  {claude.reason && (
                    <div>
                      <p className="text-xs font-semibold uppercase mb-1"
                        style={{ color: 'var(--text-4)', letterSpacing: '0.12em', fontSize: '10px' }}
                      >Why</p>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-3)' }}>{claude.reason}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {related.length > 0 && (
            <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-1)' }}>
              <p className="text-xs mb-3" style={{ color: 'var(--text-3)' }}>In the same constellation:</p>
              <div className="flex flex-col gap-2">
                {related.map(r => (
                  <div key={r.id} className="rounded-lg px-3 py-2"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border-1)' }}
                  >
                    <p className="text-xs mb-1" style={{ color: '#3a2808' }}>
                      {TYPE_ICONS[r.type] || '✍️'} {r.type}
                      {r.destination && <span style={{ marginLeft: '6px', color: 'var(--text-4)' }}>→ {r.destination}</span>}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>
                      {r.text.length > 70 ? r.text.slice(0, 70) + '…' : r.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="px-6 py-5 border-b" style={{ borderColor: 'var(--border-1)' }}>
            <p className="text-xs mb-3" style={{ color: 'var(--text-5)' }}>
              {routed ? 'Routed to:' : claude ? 'Confirm or route manually:' : 'Where does this belong?'}
            </p>
            <div className="flex flex-col gap-2">
              {ROUTES.map(route => {
                const isSelected       = observation.destination === route.id
                const isClaudePrimary  = !routed && claude?.destination === route.id
                const isClaudeSecondary = !routed && claude?.secondaryDestination === route.id
                const isDisabled       = routed && !isSelected
                return (
                  <button key={route.id}
                    onClick={() => !routed && onRoute(observation.id, route.id)}
                    disabled={isDisabled}
                    className="text-left rounded-lg px-4 py-3 transition-all"
                    style={{
                      background: isSelected ? route.activeBg : 'var(--bg-2)',
                      border: `1px solid ${
                        isSelected ? route.activeBorder
                        : isClaudePrimary ? route.color + '55'
                        : isClaudeSecondary ? route.color + '30'
                        : 'var(--border-1)'
                      }`,
                      opacity: isDisabled ? 0.25 : 1,
                      cursor:  isDisabled ? 'not-allowed' : routed ? 'default' : 'pointer',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium"
                        style={{ color: isSelected ? route.color : isClaudePrimary ? route.color + 'cc' : isClaudeSecondary ? route.color + '88' : 'var(--text-2)' }}
                      >{route.label}</p>
                      {isClaudePrimary && !isSelected && (
                        <span style={{ fontSize: '9px', color: route.color + '70', letterSpacing: '0.05em' }}>primary</span>
                      )}
                      {isClaudeSecondary && !isSelected && (
                        <span style={{ fontSize: '9px', color: route.color + '50', letterSpacing: '0.05em' }}>secondary</span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5"
                      style={{ color: isSelected ? route.color + '99' : 'var(--text-5)' }}
                    >{route.description}</p>
                  </button>
                )
              })}
            </div>

            {routed && nextObs && (
              <div className="mt-6">
                <p className="text-xs mb-3" style={{ color: 'var(--text-5)' }}>Possible next observations:</p>
                <div className="flex flex-col gap-2">
                  {nextObs.map((q, i) => (
                    <p key={i} className="text-xs leading-relaxed" style={{ color: 'var(--text-3)' }}>• {q}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {routed && observation.destination === 'Theater' && (
            <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-1)' }}>
              <div style={{
                background: '#0d0b14',
                border: '1px solid #a855f740',
                borderLeft: '3px solid #a855f7',
                borderRadius: '0 8px 8px 0',
                overflow: 'hidden',
              }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid #a855f720',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ color: '#a855f7', fontSize: '9px', fontWeight: 700,
                    letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    Staging Passport
                  </p>
                  <p style={{ color: '#a855f760', fontSize: '9px', letterSpacing: '0.08em' }}>
                    IN PRODUCTION
                  </p>
                </div>
                <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {[
                    { label: 'Origin',      value: 'Atrium',     check: true  },
                    { label: 'K.E.L.',      value: observation.claude ? 'Reviewed' : 'Pending', check: !!observation.claude },
                    { label: 'Human Gate',  value: 'Approved',   check: true  },
                    { label: 'Destination', value: 'Theater',    check: null  },
                  ].map(({ label, value, check }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <p style={{ color: 'var(--text-6)', fontSize: '10px' }}>{label}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <p style={{ color: check === null ? '#a855f7' : 'var(--text-3)', fontSize: '10px' }}>{value}</p>
                        {check !== null && (
                          <p style={{ color: check ? '#10b981' : 'var(--text-6)', fontSize: '10px' }}>
                            {check ? '✓' : '—'}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="px-6 py-5">
            <p className="text-xs mb-3" style={{ color: 'var(--text-5)' }}>Send to campus:</p>
            <button onClick={handleSendToPACER} disabled={sending || isSent}
              className="w-full text-left rounded-lg px-4 py-3"
              style={{
                background: isSent ? '#041208' : 'var(--bg-0)',
                border:    `1px solid ${isSent ? '#0a3018' : 'var(--border-1)'}`,
                cursor:     sending || isSent ? 'default' : 'pointer',
                opacity:    sending ? 0.6 : 1,
              }}
            >
              <p className="text-sm font-medium" style={{ color: isSent ? '#1a7a40' : 'var(--text-3)' }}>
                {isSent ? '✓ Sent to PACER' : sending ? 'Sending…' : 'Send to PACER'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: isSent ? '#0f4a28' : 'var(--text-6)' }}>
                {isSent ? 'Pending review — awaiting approval' : 'Enters as pending_review'}
              </p>
            </button>
            {sendError && <p className="text-xs mt-2" style={{ color: '#ef4444' }}>{sendError}</p>}
            {!hasApiKey && (
              <button onClick={onRequestApiKey}
                className="w-full text-xs mt-4 py-2 rounded-lg"
                style={{ background: 'transparent', border: '1px solid var(--border-1)', color: 'var(--text-5)', cursor: 'pointer' }}
              >+ Enable Claude routing</button>
            )}
          </div>
        </>
      )}
    </aside>
  )
}
