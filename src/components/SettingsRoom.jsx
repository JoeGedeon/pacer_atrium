import { useState } from 'react'
import ThemeToggle from './ThemeToggle'

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <p style={{
        color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
        textTransform: 'uppercase', fontWeight: 600, marginBottom: '16px',
        paddingBottom: '8px', borderBottom: '1px solid var(--border-0)',
      }}>{title}</p>
      {children}
    </div>
  )
}

function Row({ label, children, note }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      gap: '24px', marginBottom: note ? '6px' : '16px' }}>
      <span style={{ color: 'var(--text-2)', fontSize: '12px', paddingTop: '2px', flexShrink: 0 }}>
        {label}
      </span>
      <div style={{ flex: 1, maxWidth: '320px', textAlign: 'right' }}>
        {children}
      </div>
    </div>
  )
}

function GovernancePill({ on }) {
  return (
    <span style={{
      display: 'inline-block', fontSize: '10px', padding: '2px 8px',
      borderRadius: '999px', fontWeight: 600, letterSpacing: '0.04em',
      background: on ? '#041208' : '#140808',
      color: on ? '#1a7a40' : '#7a2020',
      border: on ? '1px solid #0a3018' : '1px solid #3a1010',
    }}>
      {on ? '✓ Enabled' : '✗ Disabled'}
    </span>
  )
}

function ProviderRow({ name, description, status, keyLabel, storedKey, onSave, onClear }) {
  const [open, setOpen]   = useState(false)
  const [draft, setDraft] = useState('')
  const isConnected = !!storedKey

  function save() {
    const trimmed = draft.trim()
    if (!trimmed) return
    onSave(trimmed)
    setDraft('')
    setOpen(false)
  }

  function clear() {
    onClear()
    setOpen(false)
  }

  return (
    <div style={{
      borderRadius: '8px', border: '1px solid var(--border-0)',
      background: 'var(--bg-1)', marginBottom: '10px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', cursor: status === 'future' ? 'default' : 'pointer',
      }}
        onClick={() => status !== 'future' && setOpen(o => !o)}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--text-0)', fontSize: '13px', fontWeight: 500 }}>{name}</span>
            <span style={{
              fontSize: '9px', padding: '2px 7px', borderRadius: '999px',
              letterSpacing: '0.06em', fontWeight: 600,
              ...(status === 'connected'
                ? { background: '#041208', color: '#1a7a40', border: '1px solid #0a3018' }
                : status === 'future'
                ? { background: 'var(--bg-2)', color: 'var(--text-5)', border: '1px solid var(--border-1)' }
                : { background: 'var(--bg-2)', color: 'var(--text-4)', border: '1px solid var(--border-1)' }),
            }}>
              {status === 'connected' ? 'Connected' : status === 'future' ? 'Future' : 'Not connected'}
            </span>
          </div>
          <p style={{ color: 'var(--text-5)', fontSize: '11px', marginTop: '2px' }}>{description}</p>
        </div>
        {status !== 'future' && (
          <span style={{ color: 'var(--text-5)', fontSize: '11px' }}>{open ? '▲' : '▼'}</span>
        )}
      </div>

      {open && (
        <div style={{ padding: '0 16px 14px', borderTop: '1px solid var(--border-0)' }}>
          <p style={{ color: 'var(--text-5)', fontSize: '10px', marginBottom: '10px', marginTop: '12px' }}>
            {keyLabel}
          </p>
          {isConnected ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--text-3)', fontSize: '11px', fontFamily: 'monospace' }}>
                ••••••••{storedKey.slice(-4)}
              </span>
              <button onClick={clear} style={{
                background: 'none', border: '1px solid var(--border-1)',
                color: '#7a2020', fontSize: '11px', cursor: 'pointer',
                padding: '4px 10px', borderRadius: '5px',
              }}>Remove</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="password"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && save()}
                placeholder="Paste key…"
                style={{
                  flex: 1, background: 'var(--bg-0)', border: '1px solid var(--border-1)',
                  color: 'var(--text-0)', fontSize: '12px', padding: '7px 10px',
                  borderRadius: '6px', outline: 'none', fontFamily: 'monospace',
                }}
              />
              <button onClick={save} disabled={!draft.trim()} style={{
                background: draft.trim() ? '#1d4ed8' : 'var(--bg-2)',
                border: '1px solid', borderColor: draft.trim() ? '#2563eb' : 'var(--border-1)',
                color: draft.trim() ? '#e0eaff' : 'var(--text-5)',
                fontSize: '11px', cursor: draft.trim() ? 'pointer' : 'default',
                padding: '7px 14px', borderRadius: '6px',
              }}>Save</button>
            </div>
          )}
          <p style={{ color: 'var(--text-6)', fontSize: '9px', marginTop: '8px' }}>
            Stored only on this device. Never sent anywhere except the provider's own API.
          </p>
        </div>
      )}
    </div>
  )
}

export default function SettingsRoom({
  user, theme, onThemeChange, apiKey, onApiKeyChange, onSignOut, isMobile,
}) {
  const anthropicConnected = !!apiKey

  function saveAnthropicKey(key) {
    localStorage.setItem('pacer_api_key', key)
    onApiKeyChange(key)
  }

  function clearAnthropicKey() {
    localStorage.removeItem('pacer_api_key')
    onApiKeyChange(null)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-0)' }}>

      {/* Header */}
      <div className="shrink-0 px-10 pt-8 pb-6" style={{ borderBottom: '1px solid var(--border-0)' }}>
        <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Configuration</p>
        <h2 style={{ fontSize: '18px', color: 'var(--text-0)', fontWeight: 700,
          letterSpacing: '0.08em', marginBottom: '6px' }}>Settings</h2>
        <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic' }}>
          Resident controls. PACER follows.
        </p>
      </div>

      <div className={`flex-1 overflow-y-auto ${isMobile ? 'px-6' : 'px-10'} py-8`}
        style={{ maxWidth: '600px' }}>

        {/* Account */}
        <Section title="Account">
          <Row label="Email">
            <span style={{ color: 'var(--text-3)', fontSize: '12px' }}>{user?.email}</span>
          </Row>
          <Row label="Session">
            <button onClick={onSignOut} style={{
              background: 'none', border: '1px solid var(--border-1)',
              color: 'var(--text-3)', fontSize: '11px', cursor: 'pointer',
              padding: '5px 12px', borderRadius: '6px',
            }}>Sign out</button>
          </Row>
        </Section>

        {/* Appearance */}
        <Section title="Appearance">
          <Row label="Theme">
            <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
          </Row>
        </Section>

        {/* AI Providers */}
        <Section title="AI Providers">
          <ProviderRow
            name="Anthropic"
            description="Powers VERA, KEL, and Muse"
            status={anthropicConnected ? 'connected' : 'not connected'}
            keyLabel="Anthropic API key"
            storedKey={apiKey}
            onSave={saveAnthropicKey}
            onClear={clearAnthropicKey}
          />
          <ProviderRow
            name="OpenAI"
            description="GPT-4o and compatible models"
            status="future"
            keyLabel=""
            storedKey={null}
            onSave={() => {}}
            onClear={() => {}}
          />
          <ProviderRow
            name="Gemini"
            description="Google AI models"
            status="future"
            keyLabel=""
            storedKey={null}
            onSave={() => {}}
            onClear={() => {}}
          />
        </Section>

        {/* PACER Routing */}
        <Section title="PACER Routing">
          <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.7,
            marginBottom: '14px' }}>
            Which provider handles each PACER function. Routing configuration is fixed in v0.7.
          </p>
          {[
            { fn: 'VERA Analysis',       provider: 'Anthropic · Claude Haiku' },
            { fn: 'KEL Recommendations', provider: 'Anthropic · Claude Haiku' },
            { fn: 'Muse Creation',       provider: 'Anthropic · Claude Haiku' },
          ].map(({ fn, provider }) => (
            <div key={fn} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '9px 0', borderBottom: '1px solid var(--border-0)',
            }}>
              <span style={{ color: 'var(--text-2)', fontSize: '12px' }}>{fn}</span>
              <span style={{ color: anthropicConnected ? '#1a7a40' : 'var(--text-5)',
                fontSize: '11px', fontStyle: 'italic' }}>
                {anthropicConnected ? provider : 'No provider connected'}
              </span>
            </div>
          ))}
        </Section>

        {/* Human Governance */}
        <Section title="Human Governance">
          <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.7,
            marginBottom: '14px' }}>
            These constraints are not configurable. They reflect the operating principles
            of PACER v0.7. No AI system in PACER executes without resident approval.
          </p>
          {[
            { rule: 'Approval Required',    on: true,  note: 'Every AI action requires a human decision.' },
            { rule: 'Auto Execute',         on: false, note: 'No AI output takes effect without confirmation.' },
            { rule: 'KEL Write Access',     on: false, note: 'KEL reads observations. KEL does not touch memory.' },
            { rule: 'KEL Decision Logging', on: true,  note: 'Human decisions are recorded by Archive, not KEL.' },
          ].map(({ rule, on, note }) => (
            <div key={rule} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ color: 'var(--text-2)', fontSize: '12px' }}>{rule}</span>
                <GovernancePill on={on} />
              </div>
              <p style={{ color: 'var(--text-5)', fontSize: '10px', lineHeight: 1.55 }}>{note}</p>
            </div>
          ))}
        </Section>

        <p style={{ color: 'var(--text-6)', fontSize: '9px', paddingBottom: '32px' }}>
          PACER v0.7 · Atrium · Settings are device-local
        </p>
      </div>
    </div>
  )
}
