const TYPE_ICONS = {
  text:     '✍️',
  voice:    '🎤',
  image:    '📸',
  document: '📄',
  idea:     '💡',
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
  const { text, type, imageUrl, timestamp, destination, constellation } = observation

  return (
    <div
      onClick={onClick}
      className="rounded-lg cursor-pointer transition-all overflow-hidden"
      style={{
        background: isActive ? '#0d1a2e' : 'var(--bg-2)',
        border: `1px solid ${isActive ? '#1d4ed8' : 'var(--border-1)'}`,
      }}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt={text || 'observation'}
          style={{
            width: '100%', maxHeight: '140px', objectFit: 'cover',
            display: 'block', borderBottom: '1px solid var(--border-1)',
          }}
        />
      )}
      <div className="flex items-start gap-3 px-4 py-3">
        <span className="text-sm mt-0.5 shrink-0 opacity-70">
          {TYPE_ICONS[type] || '✍️'}
        </span>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm leading-relaxed"
            style={{ color: isActive ? 'var(--text-1)' : 'var(--text-2)' }}
          >
            {text.length > 110 ? text.slice(0, 110) + '…' : text}
          </p>
          <div className="flex items-center flex-wrap gap-2 mt-2">
            <span className="text-xs" style={{ color: 'var(--text-5)' }}>
              {formatTime(timestamp)}
            </span>
            {constellation && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: '#1e120818',
                  color: '#7a5c20',
                  border: '1px solid #3d2a0a35',
                }}
              >
                {constellation}
              </span>
            )}
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
              <span className="text-xs" style={{ color: 'var(--text-4)' }}>
                received
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
