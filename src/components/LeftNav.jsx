const NAV_ITEMS = [
  { id: 'atrium',       label: 'Atrium',       icon: '🍍' },
  { id: 'notice',       label: 'Notice',       icon: '🔵' },
  { id: 'preserve',     label: 'Preserve',     icon: '📚' },
  { id: 'translate',    label: 'Translate',    icon: '🔄' },
  { id: 'pass-forward', label: 'Pass Forward', icon: '➡️' },
]

export default function LeftNav({ activeSection, onSelect }) {
  return (
    <nav
      className="flex flex-col py-8 px-3 shrink-0 border-r"
      style={{ width: '200px', background: '#0a0d16', borderColor: '#111827' }}
    >
      <div className="mb-8 px-3">
        <div style={{ fontSize: '22px', lineHeight: 1, marginBottom: '6px' }}>🍍</div>
        <p
          className="text-xs font-bold tracking-widest uppercase"
          style={{ color: '#1d4ed8', letterSpacing: '0.2em' }}
        >
          PACER
        </p>
      </div>

      <ul className="flex flex-col gap-0.5">
        {NAV_ITEMS.map(item => {
          const isActive = activeSection === item.id
          return (
            <li key={item.id}>
              <button
                onClick={() => onSelect(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left"
                style={{
                  background: isActive ? '#111827' : 'transparent',
                  color: isActive ? '#c9d3e8' : '#4b5563',
                  borderLeft: `2px solid ${isActive ? '#3b82f6' : 'transparent'}`,
                }}
              >
                <span className="text-base leading-none">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="mt-auto px-3">
        <p className="text-xs" style={{ color: '#1f2937' }}>
          v0.1 · Atrium
        </p>
      </div>
    </nav>
  )
}
