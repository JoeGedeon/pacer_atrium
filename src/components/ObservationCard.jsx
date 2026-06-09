const TYPE_ICONS = {
  observation: '👁',
  idea:        '💡',
  jobsite:     '🏗️',
  business:    '💼',
  vision:      '🌙',
  comment:     '💬',
}

const DEST_COLORS = {
  FleetFlow: '#3b82f6',
  Isles:     '#10b981',
  Doctrine:  '#f59e0b',
  Content:   '#8b5cf6',
  Archive:   '#6b7280',
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ObservationCard({ observation, isActive, onClick }) {
  const { text, type, timestamp, destination } = observation

  return (
    <div
      onClick={onClick}
      className="rounded-lg px-4 py-3 cursor-pointer transition-all"
      style={{
        background: isActive ? '#0d1a2e' : '#0d1117',
        border: `1px solid ${isActive ? '#1d4ed8' : '#141c2e'}`,
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-sm mt-0.5 shrink-0 opacity-70">
          {TYPE_ICONS[type] || '👁'}
        </span>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm leading-relaxed"
            style={{ color: isActive ? '#b0bdd4' : '#4b5563' }}
          >
            {text.length > 110 ? text.slice(0, 110) + '…' : text}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs" style={{ color: '#1f2937' }}>
              {formatTime(timestamp)}
            </span>
            {destination && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: `${DEST_COLORS[destination]}18`,
                  color: DEST_COLORS[destination],
                  border: `1px solid ${DEST_COLORS[destination]}35`,
                }}
              >
                {destination}
              </span>
            )}
            {!destination && (
              <span className="text-xs" style={{ color: '#1a2d4a' }}>
                received
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
