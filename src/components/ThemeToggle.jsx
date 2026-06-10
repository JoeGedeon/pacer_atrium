const OPTIONS = [
  { value: 'dark',   label: '🌙' },
  { value: 'light',  label: '☀️' },
  { value: 'system', label: '⬡' },
]

export default function ThemeToggle({ theme, onThemeChange }) {
  return (
    <div style={{ display: 'flex', gap: '3px' }}>
      {OPTIONS.map(o => (
        <button
          key={o.value}
          onClick={() => onThemeChange(o.value)}
          title={o.value}
          style={{
            flex: 1,
            padding: '4px 0',
            borderRadius: '5px',
            fontSize: '11px',
            lineHeight: 1,
            background: theme === o.value ? 'var(--bg-3)' : 'transparent',
            color:      theme === o.value ? 'var(--text-2)' : 'var(--text-6)',
            border: `1px solid ${theme === o.value ? 'var(--border-1)' : 'transparent'}`,
            cursor: 'pointer',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
