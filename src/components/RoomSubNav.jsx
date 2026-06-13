export default function RoomSubNav({ tabs, activeTab, onSelect }) {
  return (
    <div
      className="shrink-0"
      style={{
        borderBottom: '1px solid var(--border-1)',
        display: 'flex',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {tabs.map(tab => {
        const active = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            style={{
              padding: '8px 16px',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${active ? 'var(--text-2)' : 'transparent'}`,
              color: active ? 'var(--text-1)' : 'var(--text-5)',
              fontSize: '11px',
              fontWeight: active ? 600 : 400,
              cursor: 'pointer',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              marginBottom: '-1px',
              letterSpacing: '0.02em',
              transition: 'color 0.1s',
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
