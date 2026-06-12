import { useState } from 'react'
import { OUTCOME_OPTIONS } from '../lib/campusTemplates'

export default function Intake({ onComplete }) {
  const [selected, setSelected] = useState(null)
  const [saving, setSaving]     = useState(false)

  async function handleContinue() {
    if (!selected || saving) return
    setSaving(true)
    await onComplete(selected)
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-0)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{ maxWidth: '540px', width: '100%' }}>

        <p style={{ color: '#1d4ed8', fontSize: '11px', letterSpacing: '0.2em',
          fontWeight: 700, textTransform: 'uppercase', marginBottom: '36px' }}>
          PACER
        </p>

        <h1 style={{ color: 'var(--text-0)', fontSize: '22px',
          fontWeight: 700, letterSpacing: '0.04em', marginBottom: '8px' }}>
          What are you building?
        </h1>
        <p style={{ color: 'var(--text-4)', fontSize: '13px',
          lineHeight: 1.7, marginBottom: '28px' }}>
          Your answer configures your campus. You can change it later in Settings.
        </p>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '10px', marginBottom: '28px',
        }}>
          {OUTCOME_OPTIONS.map(opt => {
            const isSel = selected === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                style={{
                  background:  isSel ? '#052e16' : 'var(--bg-2)',
                  border:      `1px solid ${isSel ? '#10b981' : 'var(--border-1)'}`,
                  borderRadius: '10px', padding: '16px 18px',
                  cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                }}
              >
                <span style={{ fontSize: '20px', display: 'block', marginBottom: '8px',
                  lineHeight: 1 }}>
                  {opt.icon}
                </span>
                <p style={{ color: isSel ? '#10b981' : 'var(--text-1)', fontSize: '13px',
                  fontWeight: 600, marginBottom: '4px' }}>
                  {opt.label}
                </p>
                <p style={{ color: isSel ? '#10b98190' : 'var(--text-4)',
                  fontSize: '11px', lineHeight: 1.5 }}>
                  {opt.desc}
                </p>
              </button>
            )
          })}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected || saving}
          style={{
            width: '100%', fontFamily: 'inherit',
            background:  !selected || saving ? 'var(--bg-2)' : '#052e16',
            border:      `1px solid ${!selected || saving ? 'var(--border-1)' : '#10b981'}`,
            borderRadius: '8px', padding: '14px 24px',
            color:       !selected || saving ? 'var(--text-5)' : '#10b981',
            fontSize: '13px', fontWeight: 600, letterSpacing: '0.06em',
            cursor:      !selected || saving ? 'default' : 'pointer',
          }}
        >
          {saving ? 'Configuring your campus…' : 'Enter PACER →'}
        </button>

        <p style={{ color: 'var(--text-6)', fontSize: '10px',
          textAlign: 'center', marginTop: '16px', lineHeight: 1.6 }}>
          The first cargo PACER evaluates is the person walking through the door.
        </p>

      </div>
    </div>
  )
}
