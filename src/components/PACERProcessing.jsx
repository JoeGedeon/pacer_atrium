import { useState } from 'react'
import { sendToPACER } from '../lib/bridge'

const ROUTES = [
  { id: 'FleetFlow', label: 'FleetFlow', description: 'Operations, fleet, logistics',         color: '#3b82f6', activeBg: '#0d1f3c', activeBorder: '#1d3f6e' },
  { id: 'Isles',     label: 'Isles',     description: 'World-building, lore, narrative',      color: '#10b981', activeBg: '#041f14', activeBorder: '#065f3a' },
  { id: 'Doctrine',  label: 'Doctrine',  description: 'Principles, frameworks, constitution', color: '#f59e0b', activeBg: '#1c1200', activeBorder: '#5c3a00' },
  { id: 'Content',   label: 'Content',   description: 'Assets, posts, creative work',         color: '#8b5cf6', activeBg: '#130c24', activeBorder: '#3b1f7a' },
  { id: 'Archive',   label: 'Archive',   description: 'Preserve without routing',             color: '#6b7280', activeBg: '#0f1117', activeBorder: '#374151' },
]

const STATIC_NEXT = {
  FleetFlow: ['Is this pattern repeating?', 'Who else sees this?', 'What is the cost of ignoring it?'],
  Isles:     ['What character embodies this?', 'Where does this fit the mythology?', 'What emotion does this carry?'],
  Doctrine:  ['Is this a principle or an exception?', 'What rule would prevent this?', 'Who needs to know this?'],
  Content:   ['What is the headline?', 'Who is the audience?', 'What format fits this best?'],
  Archive:   ['When should this resurface?', 'What would make this relevant again?', 'Who should find this?'],
}

const TYPE_ICONS = { text: '✍️', voice: '🎤', image: '📸', document: '📄', idea: '💡' }

export default function PACERProcessing({
  observation,
  observations = [],
  onRoute,
  onAcceptConstellation,
  hasApiKey,
  onRequestApiKey,
}) {
  const [sending, setSending] = useState(false)
  const [sentIds, setSentIds] = useState(new Set())
  const [sendError, setSendError] = useState(null)

  async function handleSendToPACER() {
    if (!observation || sending || sentIds.has(observation.id)) return
    setSending(true)
    setSendError(null)
    try {
      await sendToPACER(observation)
      setSentIds(prev => new Set([...prev, observation.id]))
    } catch {
      setSendError('Could not reach PACER. Try again.')
    } finally {
      setSending(false)
    }
  }

  if (!observation) {
    return (
      <aside
        className="flex flex-col shrink-0 border-l"
        style={{ width: '288px', background: '#080b13', borderColor: '#111827' }}
      >
        <div className="px-6 py-5 border-b" style={{ borderColor: '#111827' }}>
          <p
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: '#1f2937', letterSpacing: '0.15em' }}
          >
            PACER Processing
          </p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-4">
          <p className="text-xs text-center leading-relaxed" style={{ color: '#151d2e' }}>
            Waiting for an observation to enter the system.
          </p>
          {!hasApiKey && (
            <button
              onClick={onRequestApiKey}
              className="text-xs"
              style={{ background: 'none', border: 'none', color: '#1a2d4a', cursor: 'pointer' }}
            >
              + Enable Claude routing
            </button>
          )}
        </div>
      </aside>
    )
  }

  const routed = observation.destination !== null
  const claude = observation.claude
  const analyzing = observation.analyzing || false
  const claudeError = observation.claudeError || null
  const isSent = sentIds.has(observation.id)

  const related = observation.constellation
    ? observations
        .filter(o => o.constellation === observation.constellation && o.id !== observation.id)
        .slice(0, 3)
    : []

  const nextObs = claude?.suggestions || (routed ? STATIC_NEXT[observation.destination] : null)

  const claudeSuggestsConstellation = claude?.constellation
  const constellationDiffers =
    claudeSuggestsConstellation &&
    (!observation.constellation ||
      observation.constellation.toLowerCase() !== claudeSuggestsConstellation.toLowerCase())

  return (
    <aside
      className="flex flex-col shrink-0 border-l overflow-y-auto"
      style={{ width: '288px', background: '#080b13', borderColor: '#111827' }}
    >
      {/* Header */}
      <div className="px-6 py-5 border-b shrink-0" style={{ borderColor: '#111827' }}>
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-1"
          style={{ color: '#1d4ed8', letterSpacing: '0.15em' }}
        >
          PACER Processing
        </p>
        <p className="text-xs" style={{ color: '#1f2937' }}>Observation received</p>
      </div>

      {/* User constellation */}
      {observation.constellation && (
        <div className="px-6 py-3 border-b" style={{ borderColor: '#0f1520' }}>
          <p className="text-xs mb-1" style={{ color: '#2d3a50' }}>constellation</p>
          <p className="text-sm font-medium" style={{ color: '#a07830' }}>
            {observation.constellation}
          </p>
        </div>
      )}

      {/* Observation preview */}
      <div className="px-6 py-4 border-b" style={{ borderColor: '#0f1520' }}>
        <p className="text-xs mb-2 capitalize" style={{ color: '#374151' }}>
          {TYPE_ICONS[observation.type] || '✍️'} {observation.type}
        </p>
        <p className="text-sm leading-relaxed" style={{ color: '#4b6080' }}>
          {observation.text.length > 100
            ? observation.text.slice(0, 100) + '…'
            : observation.text}
        </p>
      </div>

      {/* Claude analysis */}
      {(analyzing || claude || claudeError) && (
        <div className="px-6 py-4 border-b" style={{ borderColor: '#0f1520' }}>
          {analyzing && (
            <div className="flex items-center gap-2">
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#1d4ed8',
                  animation: 'pulse-fade 1.5s infinite',
                }}
              />
              <p className="text-xs" style={{ color: '#2d3a50' }}>Claude is reading…</p>
            </div>
          )}

          {!analyzing && claudeError && (
            <p className="text-xs" style={{ color: '#3d1515' }}>
              Claude unavailable — routing manually.
            </p>
          )}

          {!analyzing && claude && (
            <div>
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-3"
                style={{ color: '#1a2d4a', letterSpacing: '0.15em' }}
              >
                Claude Suggests
              </p>

              {constellationDiffers && (
                <div
                  className="rounded-lg px-3 py-2.5 mb-3 flex items-start justify-between gap-3"
                  style={{ background: '#0e0c06', border: '1px solid #2d1e08' }}
                >
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: '#3a2808' }}>constellation</p>
                    <p className="text-sm font-medium" style={{ color: '#a07830' }}>
                      {claudeSuggestsConstellation}
                    </p>
                  </div>
                  <button
                    onClick={() => onAcceptConstellation(observation.id, claudeSuggestsConstellation)}
                    className="text-xs px-2.5 py-1.5 rounded-lg shrink-0"
                    style={{
                      background: '#1a1008',
                      color: '#8b6620',
                      border: '1px solid #4a3010',
                      cursor: 'pointer',
                    }}
                  >
                    {observation.constellation ? 'Override' : 'Accept'}
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: '#0a1020', color: '#2d4060', border: '1px solid #141c2e' }}
                >
                  {Math.round((claude.confidence || 0) * 100)}% confident
                </span>
              </div>

              {claude.reason && (
                <p className="text-xs leading-relaxed" style={{ color: '#2d3a50' }}>
                  {claude.reason}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Related observations */}
      {related.length > 0 && (
        <div className="px-6 py-4 border-b" style={{ borderColor: '#0f1520' }}>
          <p className="text-xs mb-3" style={{ color: '#2d3a50' }}>In the same constellation:</p>
          <div className="flex flex-col gap-2">
            {related.map(r => (
              <div
                key={r.id}
                className="rounded-lg px-3 py-2"
                style={{ background: '#0d1117', border: '1px solid #141c2e' }}
              >
                <p className="text-xs mb-1" style={{ color: '#3a2808' }}>
                  {TYPE_ICONS[r.type] || '✍️'} {r.type}
                  {r.destination && (
                    <span style={{ marginLeft: '6px', color: '#1a2d4a' }}>→ {r.destination}</span>
                  )}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: '#374151' }}>
                  {r.text.length > 70 ? r.text.slice(0, 70) + '…' : r.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Routing */}
      <div className="px-6 py-5 border-b" style={{ borderColor: '#0f1520' }}>
        <p className="text-xs mb-3" style={{ color: '#1f2937' }}>
          {routed ? 'Routed to:' : 'Suggested routes:'}
        </p>

        <div className="flex flex-col gap-2">
          {ROUTES.map(route => {
            const isSelected = observation.destination === route.id
            const isClaudeSuggestion = !routed && claude?.destination === route.id
            const isDisabled = routed && !isSelected

            return (
              <button
                key={route.id}
                onClick={() => !routed && onRoute(observation.id, route.id)}
                disabled={isDisabled}
                className="text-left rounded-lg px-4 py-3 transition-all"
                style={{
                  background: isSelected ? route.activeBg : '#0d1117',
                  border: `1px solid ${
                    isSelected
                      ? route.activeBorder
                      : isClaudeSuggestion
                      ? route.color + '55'
                      : '#141c2e'
                  }`,
                  opacity: isDisabled ? 0.25 : 1,
                  cursor: isDisabled ? 'not-allowed' : routed ? 'default' : 'pointer',
                }}
              >
                <div className="flex items-center justify-between">
                  <p
                    className="text-sm font-medium"
                    style={{
                      color: isSelected
                        ? route.color
                        : isClaudeSuggestion
                        ? route.color + 'cc'
                        : '#374151',
                    }}
                  >
                    {route.label}
                  </p>
                  {isClaudeSuggestion && !isSelected && (
                    <span style={{ fontSize: '9px', color: route.color + '70', letterSpacing: '0.05em' }}>
                      suggested
                    </span>
                  )}
                </div>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: isSelected ? route.color + '99' : '#1f2937' }}
                >
                  {route.description}
                </p>
              </button>
            )
          })}
        </div>

        {routed && nextObs && (
          <div className="mt-6">
            <p className="text-xs mb-3" style={{ color: '#1f2937' }}>
              Possible next observations:
            </p>
            <div className="flex flex-col gap-2">
              {nextObs.map((q, i) => (
                <p key={i} className="text-xs leading-relaxed" style={{ color: '#2d3a50' }}>
                  • {q}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Send to PACER */}
      <div className="px-6 py-5">
        <p className="text-xs mb-3" style={{ color: '#1f2937' }}>Send to campus:</p>
        <button
          onClick={handleSendToPACER}
          disabled={sending || isSent}
          className="w-full text-left rounded-lg px-4 py-3"
          style={{
            background: isSent ? '#041208' : '#0a0f1a',
            border: `1px solid ${isSent ? '#0a3018' : '#141c2e'}`,
            cursor: sending || isSent ? 'default' : 'pointer',
            opacity: sending ? 0.6 : 1,
          }}
        >
          <p
            className="text-sm font-medium"
            style={{ color: isSent ? '#1a7a40' : '#2d3a50' }}
          >
            {isSent ? '✓ Sent to PACER' : sending ? 'Sending…' : 'Send to PACER'}
          </p>
          <p className="text-xs mt-0.5" style={{ color: isSent ? '#0f4a28' : '#151d2e' }}>
            {isSent ? 'Pending review — awaiting approval' : 'Enters as pending_review'}
          </p>
        </button>

        {sendError && (
          <p className="text-xs mt-2" style={{ color: '#5a1a1a' }}>{sendError}</p>
        )}

        {!hasApiKey && (
          <button
            onClick={onRequestApiKey}
            className="w-full text-xs mt-4 py-2 rounded-lg"
            style={{
              background: 'transparent',
              border: '1px solid #141c2e',
              color: '#1f2937',
              cursor: 'pointer',
            }}
          >
            + Enable Claude routing
          </button>
        )}
      </div>
    </aside>
  )
}
