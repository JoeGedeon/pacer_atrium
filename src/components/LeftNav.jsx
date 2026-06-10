import ThemeToggle from './ThemeToggle'

const PACER_ROOMS = [
  { id: 'atrium',    label: 'Atrium',    icon: '🍍' },
  { id: 'muse',      label: 'Muse',      icon: '🎭' },
  { id: 'vera',      label: 'VERA',      icon: '✨', infra: true },
  { id: 'kel',       label: 'KEL',       icon: '⚙️', infra: true },
  { id: 'content',   label: 'Theater',   icon: '🎬' },
  { id: 'fleetflow', label: 'FleetFlow', icon: '🚛' },
  { id: 'isles',     label: 'Isles',     icon: '🏝️' },
  { id: 'archive',   label: 'Archive',   icon: '📚' },
  { id: 'doctrine',  label: 'Doctrine',  icon: '📜' },
]

export default function LeftNav({
  currentRoom, onSelect, theme, onThemeChange,
  user, onSignOut, hasApiKey, onConnectClaude, isMobile,
}) {
  if (isMobile) {
    return (
      <nav
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
          display: 'flex', flexDirection: 'row', alignItems: 'stretch',
          background: 'var(--bg-1)', borderTop: '1px solid var(--border-0)',
          height: '60px',
        }}
      >
        {PACER_ROOMS.map(room => {
          const isActive = currentRoom === room.id
          return (
            <button
              key={room.id}
              onClick={() => onSelect(room.id)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '2px',
                background: isActive ? 'var(--bg-3)' : 'none',
                border: 'none', cursor: 'pointer',
                borderTop: `2px solid ${isActive ? '#3b82f6' : 'transparent'}`,
                padding: '4px 2px 6px',
              }}
            >
              <span style={{ fontSize: '15px', lineHeight: 1, opacity: room.infra ? 0.6 : 1 }}>
                {room.icon}
              </span>
              <span style={{
                fontSize: '8px', lineHeight: 1, whiteSpace: 'nowrap',
                color: isActive ? 'var(--text-0)' : 'var(--text-4)',
              }}>
                {room.label}
              </span>
            </button>
          )
        })}
      </nav>
    )
  }

  return (
    <nav
      className="flex flex-col py-8 px-3 shrink-0 border-r"
      style={{ width: '200px', background: 'var(--bg-1)', borderColor: 'var(--border-0)' }}
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
                  background: isActive ? 'var(--bg-3)' : 'transparent',
                  color: isActive ? 'var(--text-0)' : room.infra ? 'var(--text-3)' : 'var(--text-2)',
                  borderLeft: `2px solid ${isActive ? '#3b82f6' : 'transparent'}`,
                }}
              >
                <span className="text-base leading-none" style={{ opacity: room.infra ? 0.6 : 1 }}>{room.icon}</span>
                <span className="font-medium text-xs leading-tight">{room.label}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="mt-auto px-3 flex flex-col gap-3">
        <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
        <button
          onClick={() => onSelect('home')}
          className="text-xs text-left"
          style={{ background: 'none', border: 'none', color: 'var(--text-4)', cursor: 'pointer', padding: 0 }}
        >
          ⌂ Command Center
        </button>
        {!hasApiKey && (
          <button
            onClick={onConnectClaude}
            className="text-xs text-left"
            style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: 0 }}
          >
            ✦ Connect Claude
          </button>
        )}
        {user && (
          <div style={{ borderTop: '1px solid var(--border-0)', paddingTop: '10px' }}>
            <p className="text-xs" style={{ color: 'var(--text-6)', marginBottom: '4px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >{user.email}</p>
            <button
              onClick={onSignOut}
              className="text-xs"
              style={{ background: 'none', border: 'none', color: 'var(--text-4)',
                cursor: 'pointer', padding: 0 }}
            >Sign out</button>
          </div>
        )}
        <p className="text-xs" style={{ color: 'var(--text-6)' }}>
          v0.7 · Atrium
        </p>
      </div>
    </nav>
  )
}
