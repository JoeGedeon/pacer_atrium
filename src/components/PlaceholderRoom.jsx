const ROOM_META = {
  vera: {
    icon: '✨',
    name: 'VERA',
    layer: 'Recognition Infrastructure',
    description: 'Pattern detection and routing intelligence. Not a destination — a service. VERA reads every observation and finds signal in the stream.',
  },
  kel: {
    icon: '✨',
    name: 'KEL',
    layer: 'Exploration Infrastructure',
    description: 'Constellation navigation and connection mapping. Not a destination — a service. KEL links observations across the campus.',
  },
  fleetflow: {
    icon: '🚚',
    name: 'FleetFlow',
    layer: 'Execution Layer',
    description: 'Moving industry operations. Fleet management, labor productivity, claims defense.',
  },
  isles: {
    icon: '🏝',
    name: 'Isles of the Awakening',
    layer: 'World Layer',
    description: 'Worlds · Lore · Characters. The mythology, universe, and creative IP of Isles of the Awakening.',
  },
  archive: {
    icon: '📚',
    name: 'Archive',
    layer: 'Preservation Layer',
    description: 'All observations preserved. Routed and unrouted. Waiting to become relevant.',
  },
  muse: {
    icon: '🎭',
    name: 'Muse',
    layer: 'Creative Faculty',
    description: 'Ideas · Stories · Characters · Worlds. The creative intelligence of the campus.',
  },
}

export default function PlaceholderRoom({ room }) {
  const meta = ROOM_META[room] || { icon: '🔵', name: room, layer: '', description: '' }

  return (
    <div className="flex-1 flex flex-col items-center justify-center"
      style={{ background: 'var(--bg-0)' }}
    >
      <div className="text-center" style={{ maxWidth: '360px', padding: '0 24px' }}>
        <div style={{ fontSize: '30px', marginBottom: '16px' }}>{meta.icon}</div>

        {meta.layer && (
          <p className="text-xs font-semibold tracking-widest uppercase mb-2"
            style={{ color: 'var(--text-4)', letterSpacing: '0.15em' }}
          >{meta.layer}</p>
        )}

        <h2 className="font-bold tracking-wide uppercase"
          style={{ fontSize: '14px', color: 'var(--text-0)', letterSpacing: '0.12em', marginBottom: '14px' }}
        >{meta.name}</h2>

        <p className="text-sm leading-relaxed"
          style={{ color: 'var(--text-3)', marginBottom: '32px' }}
        >{meta.description}</p>

        <p className="text-xs" style={{ color: 'var(--text-6)' }}>This room is being constructed.</p>
      </div>
    </div>
  )
}
