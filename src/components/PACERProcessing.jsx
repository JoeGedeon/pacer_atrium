const ROUTES = [
  {
    id:          'FleetFlow',
    label:       'FleetFlow',
    description: 'Operations, fleet, logistics',
    color:       '#3b82f6',
    activeBg:    '#0d1f3c',
    activeBorder:'#1d3f6e',
  },
  {
    id:          'Isles',
    label:       'Isles',
    description: 'World-building, lore, narrative',
    color:       '#10b981',
    activeBg:    '#041f14',
    activeBorder:'#065f3a',
  },
  {
    id:          'Doctrine',
    label:       'Doctrine',
    description: 'Principles, frameworks, constitution',
    color:       '#f59e0b',
    activeBg:    '#1c1200',
    activeBorder:'#5c3a00',
  },
  {
    id:          'Content',
    label:       'Content',
    description: 'Assets, posts, creative work',
    color:       '#8b5cf6',
    activeBg:    '#130c24',
    activeBorder:'#3b1f7a',
  },
  {
    id:          'Archive',
    label:       'Archive',
    description: 'Preserve without routing',
    color:       '#6b7280',
    activeBg:    '#0f1117',
    activeBorder:'#374151',
  },
]

const NEXT_OBSERVATIONS = {
  FleetFlow: [
    'Is this pattern repeating?',
    'Who else sees this?',
    'What is the cost of ignoring it?',
  ],
  Isles: [
    'What character embodies this?',
    'Where does this fit the mythology?',
    'What emotion does this carry?',
  ],
  Doctrine: [
    'Is this a principle or an exception?',
    'What rule would prevent this?',
    'Who needs to know this?',
  ],
  Content: [
    'What is the headline?',
    'Who is the audience?',
    'What format fits this best?',
  ],
  Archive: [
    'When should this resurface?',
    'What would make this relevant again?',
    'Who should find this?',
  ],
}

const TYPE_ICONS = {
  text:     '✍️',
  voice:    '🎤',
  image:    '📸',
  document: '📄',
  idea:     '💡',
}

export default function PACERProcessing({ observation, observations = [], onRoute }) {
  if (!observation) {
    return (
      <aside
        className="flex flex-col shrink-0 border-l"
        style={{ width: '288px', background: '#080b13', borderColor: '#111827' }}
      >
        <div
          className="px-6 py-5 border-b"
          style={{ borderColor: '#111827' }}
        >
          <p
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: '#1f2937', letterSpacing: '0.15em' }}
          >
            PACER Processing
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center px-8">
          <p
            className="text-xs text-center leading-relaxed"
            style={{ color: '#151d2e' }}
          >
            Waiting for an observation to enter the system.
          </p>
        </div>
      </aside>
    )
  }

  const routed = observation.destination !== null
  const nextObs = routed ? NEXT_OBSERVATIONS[observation.destination] : null

  const related = observation.constellation
    ? observations.filter(o =>
        o.constellation === observation.constellation && o.id !== observation.id
      ).slice(0, 4)
    : []

  return (
    <aside
      className="flex flex-col shrink-0 border-l overflow-y-auto"
      style={{ width: '288px', background: '#080b13', borderColor: '#111827' }}
    >
      <div
        className="px-6 py-5 border-b shrink-0"
        style={{ borderColor: '#111827' }}
      >
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-1"
          style={{ color: '#1d4ed8', letterSpacing: '0.15em' }}
        >
          PACER Processing
        </p>
        <p className="text-xs" style={{ color: '#1f2937' }}>
          Observation received
        </p>
      </div>

      {observation.constellation && (
        <div
          className="px-6 py-3 border-b"
          style={{ borderColor: '#0f1520' }}
        >
          <p className="text-xs mb-1" style={{ color: '#2d3a50' }}>constellation</p>
          <p className="text-sm font-medium" style={{ color: '#a07830' }}>
            {observation.constellation}
          </p>
        </div>
      )}

      <div
        className="px-6 py-4 border-b"
        style={{ borderColor: '#0f1520' }}
      >
        <p className="text-xs mb-2 capitalize" style={{ color: '#374151' }}>
          {observation.type}
        </p>
        <p
          className="text-sm leading-relaxed"
          style={{ color: '#4b6080' }}
        >
          {observation.text.length > 100
            ? observation.text.slice(0, 100) + '…'
            : observation.text}
        </p>
      </div>

      {related.length > 0 && (
        <div
          className="px-6 py-4 border-b"
          style={{ borderColor: '#0f1520' }}
        >
          <p className="text-xs mb-3" style={{ color: '#2d3a50' }}>
            In the same constellation:
          </p>
          <div className="flex flex-col gap-2">
            {related.map(r => (
              <div
                key={r.id}
                className="rounded-lg px-3 py-2"
                style={{ background: '#0d1117', border: '1px solid #141c2e' }}
              >
                <p className="text-xs mb-1" style={{ color: '#4a3010' }}>
                  {TYPE_ICONS[r.type] || '✍️'} {r.type}
                  {r.destination && (
                    <span style={{ marginLeft: '6px', color: '#2d3a50' }}>→ {r.destination}</span>
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

      <div className="px-6 py-5">
        <p className="text-xs mb-3" style={{ color: '#1f2937' }}>
          {routed ? 'Routed to:' : 'Suggested routes:'}
        </p>

        <div className="flex flex-col gap-2">
          {ROUTES.map(route => {
            const isSelected = observation.destination === route.id
            const isDisabled = routed && !isSelected

            return (
              <button
                key={route.id}
                onClick={() => !routed && onRoute(observation.id, route.id)}
                disabled={isDisabled}
                className="text-left rounded-lg px-4 py-3 transition-all"
                style={{
                  background: isSelected ? route.activeBg : '#0d1117',
                  border: `1px solid ${isSelected ? route.activeBorder : '#141c2e'}`,
                  opacity: isDisabled ? 0.25 : 1,
                  cursor: isDisabled ? 'not-allowed' : routed ? 'default' : 'pointer',
                }}
              >
                <p
                  className="text-sm font-medium"
                  style={{ color: isSelected ? route.color : '#374151' }}
                >
                  {route.label}
                </p>
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
                <p
                  key={i}
                  className="text-xs leading-relaxed"
                  style={{ color: '#2d3a50' }}
                >
                  • {q}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
