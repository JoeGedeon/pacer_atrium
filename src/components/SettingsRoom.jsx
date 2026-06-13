import { useState, useRef } from 'react'
import ThemeToggle from './ThemeToggle'
import { ROOM_VOICE_CONFIG, ROOM_DISPLAY_NAMES, getRoomSample, speakWithVoice } from '../lib/roomVoice'

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

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'ht', label: 'Haitian Creole' },
  { value: 'fr', label: 'French' },
  { value: 'pt', label: 'Portuguese' },
]

const AI_PROVIDER_OPTIONS = [
  { value: 'claude',  label: 'Claude (Anthropic)' },
  { value: 'openai',  label: 'ChatGPT (OpenAI)' },
  { value: 'gemini',  label: 'Gemini (Google)' },
]

function ProfileSelect({ value, onChange, options, placeholder = 'Select…' }) {
  return (
    <select
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      style={{
        background: 'var(--bg-0)',
        border: '1px solid var(--border-1)',
        color: value ? 'var(--text-0)' : 'var(--text-5)',
        fontSize: '12px',
        padding: '6px 10px',
        borderRadius: '6px',
        fontFamily: 'inherit',
        cursor: 'pointer',
        minWidth: '180px',
      }}
    >
      {!value && <option value="" disabled>{placeholder}</option>}
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

const ARRIVAL_OPTIONS = [
  { id: 'silent',  label: 'Silent',       note: 'PACER loads without greeting. The campus is yours.' },
  { id: 'ask',     label: 'Ask Me First', note: 'PACER asks before delivering the briefing. Safe for shared screens.' },
  { id: 'text',    label: 'Text Brief',   note: 'A briefing card appears with today\'s institutional pulse.' },
  { id: 'voice',   label: 'Voice Brief',  note: 'PACER greets you and reads the briefing aloud on arrival.' },
]

const PULSE_OPTIONS = [
  { id: 'off',   label: 'Off',        note: 'No automatic pulse. PACER remains quiet unless summoned.' },
  { id: 'text',  label: 'Text Brief', note: 'A brief card surfaces campus changes since your last session.' },
  { id: 'voice', label: 'Voice',      note: 'PACER delivers the pulse aloud.' },
]

function OptionList({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          style={{
            width: '100%', textAlign: 'left', background: value === opt.id ? '#0f172a' : 'var(--bg-2)',
            border: `1px solid ${value === opt.id ? '#3b82f660' : 'var(--border-0)'}`,
            borderRadius: '8px', padding: '12px 16px', cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'flex-start', gap: '12px',
          }}
        >
          <span style={{
            marginTop: '2px', flexShrink: 0, width: '12px', height: '12px',
            borderRadius: '50%', border: `2px solid ${value === opt.id ? '#3b82f6' : 'var(--border-1)'}`,
            background: value === opt.id ? '#3b82f6' : 'none',
            display: 'inline-block',
          }} />
          <div>
            <p style={{ color: value === opt.id ? 'var(--text-1)' : 'var(--text-3)', fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>
              {opt.label}
            </p>
            <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.55 }}>
              {opt.note}
            </p>
          </div>
        </button>
      ))}
    </div>
  )
}

export default function SettingsRoom({
  user, profile, theme, onThemeChange, apiKey, onApiKeyChange, onSignOut, isMobile,
  arrivalMode = 'silent', onArrivalModeChange,
  middayPulseMode = 'off', onMiddayPulseModeChange,
  eveningReviewMode = 'off', onEveningReviewModeChange,
  onPreferredLanguageChange, onNativeLanguageChange, onAiProviderChange,
}) {
  const anthropicConnected  = !!apiKey
  const [rhythmSaved, setRhythmSaved] = useState(false)
  const rhythmSavedTimer = useRef(null)
  const [testingRoom, setTestingRoom] = useState(null)

  const VOICE_ROOMS = ['atrium', 'muse', 'vera', 'kel', 'content', 'businesscenter', 'archive', 'doctrine']

  function handleTestVoice(roomId) {
    if (testingRoom) {
      window.speechSynthesis?.cancel()
      setTestingRoom(null)
      return
    }
    setTestingRoom(roomId)
    speakWithVoice(getRoomSample(roomId), ROOM_VOICE_CONFIG[roomId], {
      onEnd:   () => setTestingRoom(null),
      onError: () => setTestingRoom(null),
    })
  }

  function markRhythmSaved() {
    setRhythmSaved(true)
    clearTimeout(rhythmSavedTimer.current)
    rhythmSavedTimer.current = setTimeout(() => setRhythmSaved(false), 2500)
  }

  function handleArrivalChange(mode) { onArrivalModeChange?.(mode); markRhythmSaved() }
  function handleMiddayChange(mode)  { onMiddayPulseModeChange?.(mode); markRhythmSaved() }
  function handleEveningChange(mode) { onEveningReviewModeChange?.(mode); markRhythmSaved() }

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

        {/* Identity & Access */}
        <Section title="Identity & Access">
          {user?.displayName && (
            <Row label="Name">
              <span style={{ color: 'var(--text-2)', fontSize: '12px' }}>{user.displayName}</span>
            </Row>
          )}
          <Row label="Email">
            <span style={{ color: 'var(--text-3)', fontSize: '12px' }}>{user?.email}</span>
          </Row>
          <Row label="Preferred Language">
            <ProfileSelect
              value={profile?.preferredLanguage}
              onChange={onPreferredLanguageChange}
              options={LANGUAGE_OPTIONS}
              placeholder="Choose language…"
            />
          </Row>
          <Row label="Native Language">
            <ProfileSelect
              value={profile?.nativeLanguage}
              onChange={onNativeLanguageChange}
              options={LANGUAGE_OPTIONS}
              placeholder="Choose language…"
            />
          </Row>
          <Row label="AI Provider">
            <ProfileSelect
              value={profile?.aiProvider || 'claude'}
              onChange={onAiProviderChange}
              options={AI_PROVIDER_OPTIONS}
            />
          </Row>
        </Section>


        {/* Campus Rhythm */}
        <Section title="Campus Rhythm">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.7 }}>
              Configure when the institution speaks. PACER is silent unless invited, scheduled, or necessary.
            </p>
            {rhythmSaved && (
              <span style={{ color: '#10b981', fontSize: '10px', fontWeight: 600, flexShrink: 0, marginLeft: '10px' }}>
                ✓ Saved
              </span>
            )}
          </div>

          <p style={{ color: 'var(--text-4)', fontSize: '11px', fontWeight: 600, marginBottom: '8px' }}>
            Arrival Brief
          </p>
          <p style={{ color: 'var(--text-6)', fontSize: '10px', marginBottom: '10px' }}>
            First session of the day. Institution speaks first.
          </p>
          <OptionList options={ARRIVAL_OPTIONS} value={arrivalMode} onChange={handleArrivalChange} />

          <p style={{ color: 'var(--text-4)', fontSize: '11px', fontWeight: 600, marginBottom: '8px', marginTop: '24px' }}>
            Midday Pulse
          </p>
          <p style={{ color: 'var(--text-6)', fontSize: '10px', marginBottom: '10px' }}>
            Around noon, if new observations or events have arrived since morning.
          </p>
          <OptionList options={PULSE_OPTIONS} value={middayPulseMode} onChange={handleMiddayChange} />

          <p style={{ color: 'var(--text-4)', fontSize: '11px', fontWeight: 600, marginBottom: '8px', marginTop: '24px' }}>
            Evening Review
          </p>
          <p style={{ color: 'var(--text-6)', fontSize: '10px', marginBottom: '10px' }}>
            End of day. What moved, what stalled, what requires tomorrow's attention.
          </p>
          <OptionList options={PULSE_OPTIONS} value={eveningReviewMode} onChange={handleEveningChange} />

          <p style={{ color: 'var(--text-4)', fontSize: '11px', fontWeight: 600, marginBottom: '8px', marginTop: '24px' }}>
            Voice Interaction
          </p>
          <div style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            padding: '12px 16px', borderRadius: '8px', background: 'var(--bg-2)',
            border: '1px solid var(--border-0)', gap: '12px',
          }}>
            <div>
              <p style={{ color: 'var(--text-2)', fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>
                Push-to-Talk
              </p>
              <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.55 }}>
                Mic button appears on the home screen. Resident speaks first.
              </p>
            </div>
            <GovernancePill on={true} />
          </div>
          <p style={{ color: 'var(--text-6)', fontSize: '9px', marginTop: '8px' }}>
            Wake phrase activation planned for a future update.
          </p>
        </Section>

        {/* Voice */}
        <Section title="Voice">
          <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.7, marginBottom: '16px' }}>
            Each room carries its own voice. PACER should sound like the room you are standing in.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {VOICE_ROOMS.map(roomId => {
              const cfg     = ROOM_VOICE_CONFIG[roomId]
              const isTesting = testingRoom === roomId
              return (
                <div
                  key={roomId}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: '8px',
                    background: isTesting ? '#0a0d14' : 'var(--bg-1)',
                    border: `1px solid ${isTesting ? '#6366f140' : 'var(--border-0)'}`,
                    gap: '12px',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span style={{ color: 'var(--text-1)', fontSize: '12px', fontWeight: 500 }}>
                        {ROOM_DISPLAY_NAMES[roomId]}
                      </span>
                      <span style={{
                        fontSize: '9px', padding: '1px 7px', borderRadius: '999px', fontWeight: 600,
                        letterSpacing: '0.06em', background: 'var(--bg-2)',
                        color: isTesting ? '#a5b4fc' : 'var(--text-4)',
                        border: `1px solid ${isTesting ? '#6366f160' : 'var(--border-1)'}`,
                      }}>
                        {cfg.label}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-6)', fontSize: '10px' }}>{cfg.character}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span style={{ color: 'var(--text-6)', fontSize: '9px', fontFamily: 'monospace' }}>
                      {cfg.rate.toFixed(2)}× · {cfg.pitch.toFixed(2)}p
                    </span>
                    <button
                      onClick={() => handleTestVoice(roomId)}
                      style={{
                        background: isTesting ? '#1e1b4b' : 'var(--bg-2)',
                        border: `1px solid ${isTesting ? '#6366f1' : 'var(--border-1)'}`,
                        color: isTesting ? '#a5b4fc' : 'var(--text-4)',
                        fontSize: '10px', cursor: 'pointer',
                        padding: '4px 10px', borderRadius: '5px', fontFamily: 'inherit',
                      }}
                    >
                      {isTesting ? '■ Stop' : '▶ Test'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <p style={{ color: 'var(--text-6)', fontSize: '9px', marginTop: '12px' }}>
            Voice selection uses available system voices. Results vary by browser and OS.
          </p>
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

        {/* About PACER */}
        <Section title="About PACER">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '8px' }}>
            <img
              src="/pacer-seal.png"
              alt="PACER"
              style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '16px' }}
            />
            <p style={{ color: 'var(--text-0)', fontSize: '15px', fontWeight: 700,
              letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '8px' }}>
              PACER
            </p>
            <p style={{ color: 'var(--text-4)', fontSize: '11px', fontStyle: 'italic',
              letterSpacing: '0.06em', marginBottom: '6px' }}>
              Reality voted. Architecture adapted.
            </p>
            <p style={{ color: 'var(--text-6)', fontSize: '10px', letterSpacing: '0.08em',
              textTransform: 'uppercase', marginBottom: '20px' }}>
              Pattern · Adaptive · Cognition · Execution · Resonance
            </p>
            <p style={{ color: 'var(--text-6)', fontSize: '10px', lineHeight: 1.7, textAlign: 'center',
              borderTop: '1px solid var(--border-0)', paddingTop: '16px', width: '100%' }}>
              Infrastructure is declared once. Behavior is inherited everywhere.
            </p>
          </div>
        </Section>

        <p style={{ color: 'var(--text-6)', fontSize: '9px', paddingBottom: '32px' }}>
          PACER v0.7 · Atrium · Settings are device-local
        </p>
      </div>
    </div>
  )
}
