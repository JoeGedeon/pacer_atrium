import { useEffect, useRef } from 'react'

const BACKDROP = {
  position: 'fixed', inset: 0, zIndex: 9000,
  background: 'rgba(0,0,0,0.55)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '20px',
  animation: 'fadeIn 0.25s ease',
}

const CARD = {
  background: 'var(--bg-1)', border: '1px solid var(--border-1)',
  borderRadius: '14px', padding: '28px 32px',
  maxWidth: '440px', width: '100%',
  boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
}

const SPEAKING_BAR = {
  position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
  zIndex: 9000,
  background: 'var(--bg-1)', border: '1px solid var(--border-1)',
  borderRadius: '24px', padding: '10px 20px',
  display: 'flex', alignItems: 'center', gap: '10px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
}

function btn(primary) {
  return {
    fontFamily: 'inherit', cursor: 'pointer', borderRadius: '8px',
    fontSize: '12px', fontWeight: 600, padding: '10px 20px',
    ...(primary
      ? { background: '#052e16', border: '1px solid #10b981', color: '#10b981' }
      : { background: 'none', border: '1px solid var(--border-1)', color: 'var(--text-4)' }
    ),
  }
}

export default function ArrivalBrief({ mode, greeting, text, loading, onDismiss, onAccept, onDecline }) {
  const autoRef = useRef(null)

  // Auto-dismiss voice overlay after 12s failsafe
  useEffect(() => {
    if (mode !== 'voice') return
    autoRef.current = setTimeout(onDismiss, 12000)
    return () => clearTimeout(autoRef.current)
  }, [mode]) // eslint-disable-line

  if (mode === 'voice') {
    return (
      <div style={SPEAKING_BAR}>
        <span style={{
          width: '7px', height: '7px', borderRadius: '50%',
          background: '#8b5cf6', boxShadow: '0 0 8px #8b5cf680', flexShrink: 0,
          animation: 'voice-ring 1.6s ease-in-out infinite',
        }} />
        <span style={{ color: 'var(--text-2)', fontSize: '12px' }}>PACER is speaking…</span>
        <button onClick={onDismiss} style={{
          background: 'none', border: 'none', color: 'var(--text-5)',
          cursor: 'pointer', fontSize: '14px', padding: '0 0 0 4px', lineHeight: 1,
        }}>✕</button>
      </div>
    )
  }

  if (mode === 'ask') {
    return (
      <div style={BACKDROP} onClick={e => { if (e.target === e.currentTarget) onDecline() }}>
        <div style={CARD}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>
            Arrival
          </p>
          <p style={{ color: 'var(--text-0)', fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
            {greeting}
          </p>
          <p style={{ color: 'var(--text-5)', fontSize: '12px', marginBottom: '22px' }}>
            Would you like your morning briefing?
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={btn(true)} onClick={onAccept}>Brief me</button>
            <button style={btn(false)} onClick={onDecline}>Not now</button>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'text') {
    return (
      <div style={BACKDROP} onClick={e => { if (e.target === e.currentTarget) onDismiss() }}>
        <div style={CARD}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>
            Institutional Pulse
          </p>
          <p style={{ color: 'var(--text-0)', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
            {greeting}
          </p>
          <div style={{
            borderLeft: '3px solid #3b82f6', paddingLeft: '16px',
            marginBottom: '22px', minHeight: '40px',
          }}>
            {loading ? (
              <p style={{ color: 'var(--text-5)', fontSize: '13px', fontStyle: 'italic' }}>
                Reading the campus…
              </p>
            ) : (
              <p style={{ color: 'var(--text-1)', fontSize: '13px', lineHeight: 1.85, fontStyle: 'italic' }}>
                {text}
              </p>
            )}
          </div>
          <button style={btn(false)} onClick={onDismiss}>Dismiss</button>
        </div>
      </div>
    )
  }

  return null
}
