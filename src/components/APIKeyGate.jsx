import { useState } from 'react'
import { saveProviderKey } from '../lib/anthropicProxy'

export default function APIKeyGate({ onKey }) {
  const [value, setValue]   = useState('')
  const [error, setError]   = useState('')
  const [saving, setSaving] = useState(false)

  async function save() {
    const k = value.trim()
    if (!k.startsWith('sk-')) {
      setError('Key should start with sk-')
      return
    }
    setSaving(true)
    setError('')
    try {
      const bundle = await saveProviderKey(k)
      onKey(bundle)
    } catch {
      setError('Failed to secure key. Check your connection and try again.')
      setSaving(false)
    }
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
        style={{ maxWidth: '400px', background: 'var(--bg-1)', border: '1px solid var(--border-2)' }}
      >
        <div className="text-center mb-6">
          <div style={{ fontSize: '26px', marginBottom: '8px' }}>🍍</div>
          <h2
            className="font-bold tracking-widest uppercase"
            style={{ fontSize: '14px', color: 'var(--text-0)', letterSpacing: '0.2em' }}
          >
            PACER ATRIUM
          </h2>
          <p className="mt-2 text-xs" style={{ color: 'var(--text-2)' }}>
            Claude routing requires an Anthropic API key.
          </p>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-5)' }}>
            Encrypted on save. Never stored in plaintext.
          </p>
        </div>

        <input
          type="password"
          value={value}
          onChange={e => { setValue(e.target.value); setError('') }}
          placeholder="sk-ant-..."
          autoFocus
          disabled={saving}
          className="w-full rounded-lg px-4 py-3 text-sm outline-none mb-2"
          style={{
            background: 'var(--bg-input)',
            color: 'var(--text-0)',
            border: '1px solid var(--border-2)',
            opacity: saving ? 0.6 : 1,
          }}
          onFocus={e => { e.target.style.borderColor = '#2563eb' }}
          onBlur={e => { e.target.style.borderColor = '#1f2937' }}
          onKeyDown={e => { if (e.key === 'Enter' && !saving) save() }}
        />

        {error && (
          <p className="text-xs mb-2" style={{ color: '#ef4444' }}>{error}</p>
        )}

        <button
          onClick={save}
          disabled={saving}
          className="w-full py-2.5 rounded-lg text-sm font-medium mb-3"
          style={{
            background: saving ? 'var(--bg-2)' : '#1d4ed8',
            color: saving ? 'var(--text-5)' : '#e0eaff',
            border: 'none',
            cursor: saving ? 'default' : 'pointer',
          }}
        >
          {saving ? 'Securing key…' : 'Enter the Atrium'}
        </button>

        <button
          onClick={skip}
          disabled={saving}
          className="w-full text-xs"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-3)',
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
