import { useState } from 'react'
import { sendToPACER } from '../lib/bridge'

const ROUTES = [
  { id: 'FleetFlow',              label: 'FleetFlow',              description: 'Operational Systems',                  color: '#3b82f6', activeBg: '#0d1f3c', activeBorder: '#1d3f6e' },
  { id: 'Isles of the Awakening', label: 'Isles of the Awakening', description: 'Worlds · Lore · Characters',            color: '#10b981', activeBg: '#041f14', activeBorder: '#065f3a' },
  { id: 'Doctrine',               label: 'Doctrine',               description: 'Principles · Frameworks · Architecture', color: '#f59e0b', activeBg: '#1c1200', activeBorder: '#5c3a00' },
  { id: 'Content',                label: 'Content',                description: 'Media · Assets · Publishing',           color: '#8b5cf6', activeBg: '#130c24', activeBorder: '#3b1f7a' },
  { id: 'Archive',                label: 'Archive',                description: 'Preserve Without Routing',              color: '#6b7280', activeBg: '#0f1117', activeBorder: '#374151' },
]

const ROUTE_COLORS = {
  'FleetFlow':              '#3b82f6',
  'Isles of the Awakening': '#10b981',
  'Doctrine':               '#f59e0b',
  'Content':                '#8b5cf6',
  'Archive':                '#6b7280',
}

function destColor(dest) { return ROUTE_COLORS[dest] || '#4b5563' }

const STATIC_NEXT = {
  FleetFlow:                ['Is this pattern repeating?', 'Who else sees this?', 'What is the cost of ignoring it?'],
  'Isles of the Awakening': ['What character embodies this?', 'Where does this fit the mythology?', 'What emotion does this carry?'],
  Doctrine:                 ['Is this a principle or an exception?', 'What rule would prevent this?', 'Who needs to know this?'],
  Content:                  ['What is the headline?', 'Who is the audience?', 'What format fits this best?'],
  Archive:                  ['When should this resurface?', 'What would make this relevant again?', 'Who should find this?'],
}

const TYPE_ICONS = { text: '✍️', voice: '🎤', image: '📸', document: '📄', idea: '💡' }

export default function PACERProcessing({
  observation, observations = [], onRoute, onAcceptConstellation, hasApiKey, onRequestApiKey, uid,
  isMobile, onBack,
}) {
  const [sending, setSending] = useState(false)
  const [sentIds, setSentIds] = useState(new Set())
  const [sendError, setSendError] = useState(null)

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
          {observation.text.length > 100 ? observation.text.slice(0, 100) + '…' : observation.text}
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
            <p className="text-xs" style={{ color: '#3d1515' }}>Claude unavailable — routing manually.</p>
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
    </aside>
  )
}
