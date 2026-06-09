import { useState } from 'react'

export default function APIKeyGate({ onKey }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  function save() {
    const k = value.trim()
    if (!k.startsWith('sk-')) {
      setError('Key should start with sk-')
      return
    }
    localStorage.setItem('pacer_api_key', k)
    onKey(k)
  }

  function skip() {
    localStorage.setItem('pacer_key_skipped', '1')
    onKey(null)
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(7, 9, 15, 0.95)' }}
    >
      <div
        className="rounded-xl px-8 py-8 w-full"
        style={{ maxWidth: '400px', background: '#0a0d16', border: '1px solid #1f2937' }}
      >
        <div className="text-center mb-6">
          <div style={{ fontSize: '26px', marginBottom: '8px' }}>🍍</div>
          <h2
            className="font-bold tracking-widest uppercase"
            style={{ fontSize: '14px', color: '#c9d3e8', letterSpacing: '0.2em' }}
          >
            PACER ATRIUM
          </h2>
          <p className="mt-2 text-xs" style={{ color: '#374151' }}>
            Claude routing requires an Anthropic API key.
          </p>
          <p className="mt-1 text-xs" style={{ color: '#1f2937' }}>
            Stored locally. Never sent anywhere except Anthropic.
          </p>
        </div>

        <input
          type="password"
          value={value}
          onChange={e => { setValue(e.target.value); setError('') }}
          placeholder="sk-ant-..."
          autoFocus
          className="w-full rounded-lg px-4 py-3 text-sm outline-none mb-2"
          style={{
            background: '#0d1520',
            color: '#c9d3e8',
            border: '1px solid #1f2937',
          }}
          onFocus={e => { e.target.style.borderColor = '#2563eb' }}
          onBlur={e => { e.target.style.borderColor = '#1f2937' }}
          onKeyDown={e => { if (e.key === 'Enter') save() }}
        />

        {error && (
          <p className="text-xs mb-2" style={{ color: '#ef4444' }}>{error}</p>
        )}

        <button
          onClick={save}
          className="w-full py-2.5 rounded-lg text-sm font-medium mb-3"
          style={{
            background: '#1d4ed8',
            color: '#e0eaff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Enter the Atrium
        </button>

        <button
          onClick={skip}
          className="w-full text-xs"
          style={{
            background: 'none',
            border: 'none',
            color: '#2d3a50',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          Continue without Claude routing →
        </button>
      </div>
    </div>
  )
}
