const ROOM_META = {
  veyra: {
    icon: '🧠',
    name: 'Veyra',
    layer: 'Recognition Layer',
    description: 'Pattern identification, constellation mapping, and routing intelligence.',
  },
  kel: {
    icon: '✨',
    name: 'KEL',
    layer: 'Exploration Layer',
    description: 'Navigate constellations. Find connections across observations, media, and destinations.',
  },
  fleetflow: {
    icon: '🚚',
    name: 'FleetFlow',
    layer: 'Execution Layer',
    description: 'Moving industry operations. Fleet management, labor productivity, claims defense.',
  },
  isles: {
    icon: '🏕',
    name: 'Isles',
    layer: 'Execution Layer',
    description: 'Isles of the Awakened. World-building, characters, mythology, and Kodex lore.',
  },
  archive: {
    icon: '📚',
    name: 'Archive',
    layer: 'Preservation Layer',
    description: 'All observations preserved. Routed and unrouted. Waiting to become relevant.',
  },
  doctrine: {
    icon: '📜',
    name: 'Doctrine',
    layer: 'Translation Layer',
    description: 'Principles, frameworks, and institutional canon. Observations that became permanent.',
  },
  content: {
    icon: '🎥',
    name: 'Content',
    layer: 'Publishing Layer',
    description: 'Creative assets and audience-facing work. Observations that became output.',
  },
}

export default function PlaceholderRoom({ room }) {
  const meta = ROOM_META[room] || { icon: '🔵', name: room, layer: '', description: '' }

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center"
      style={{ background: '#090c14' }}
    >
      <div
        className="text-center"
        style={{ maxWidth: '360px', padding: '0 24px' }}
      >
        <div style={{ fontSize: '30px', marginBottom: '16px' }}>{meta.icon}</div>

        {meta.layer && (
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-2"
            style={{ color: '#1a2d4a', letterSpacing: '0.15em' }}
          >
            {meta.layer}
          </p>
        )}

        <h2
          className="font-bold tracking-widest uppercase"
          style={{ fontSize: '16px', color: '#c9d3e8', letterSpacing: '0.2em', marginBottom: '14px' }}
        >
          {meta.name}
        </h2>

        <p
          className="text-sm leading-relaxed"
          style={{ color: '#2d3a50', marginBottom: '32px' }}
        >
          {meta.description}
        </p>

        <p className="text-xs" style={{ color: '#141c2e' }}>
          This room is being constructed.
        </p>
      </div>
    </div>
  )
}
