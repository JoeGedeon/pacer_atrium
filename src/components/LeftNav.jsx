const PACER_ROOMS = [
  { id: 'atrium',    label: 'Atrium',    icon: '🍍' },
  { id: 'veyra',     label: 'Veyra',     icon: '🧠' },
  { id: 'kel',       label: 'KEL',       icon: '✨' },
  { id: 'fleetflow', label: 'FleetFlow', icon: '🚚' },
  { id: 'isles',     label: 'Isles',     icon: '🏕' },
  { id: 'archive',   label: 'Archive',   icon: '📚' },
  { id: 'doctrine',  label: 'Doctrine',  icon: '📜' },
  { id: 'content',   label: 'Content',   icon: '🎥' },
]

export default function LeftNav({ currentRoom, onSelect }) {
  return (
    <nav
      className="flex flex-col py-8 px-3 shrink-0 border-r"
      style={{ width: '200px', background: '#0a0d16', borderColor: '#111827' }}
    >
      <div className="mb-8 px-3">
        <button
          onClick={() => onSelect('home')}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
        >
          <p
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: '#1d4ed8', letterSpacing: '0.2em' }}
          >
            PACER
          </p>
        </button>
      </div>

      <ul className="flex flex-col gap-0.5">
        {PACER_ROOMS.map(room => {
          const isActive = currentRoom === room.id
          return (
            <li key={room.id}>
              <button
                onClick={() => onSelect(room.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left"
                style={{
                  background: isActive ? '#111827' : 'transparent',
                  color: isActive ? '#c9d3e8' : '#4b5563',
                  borderLeft: `2px solid ${isActive ? '#3b82f6' : 'transparent'}`,
                }}
              >
                <span className="text-base leading-none">{room.icon}</span>
                <span className="font-medium">{room.label}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="mt-auto px-3 flex flex-col gap-3">
        <button
          onClick={() => onSelect('home')}
          className="text-xs text-left"
          style={{ background: 'none', border: 'none', color: '#1a2d4a', cursor: 'pointer', padding: 0 }}
        >
          ⌂ Command Center
        </button>
        <p className="text-xs" style={{ color: '#1f2937' }}>
          v0.4 · Atrium
        </p>
      </div>
    </nav>
  )
}
