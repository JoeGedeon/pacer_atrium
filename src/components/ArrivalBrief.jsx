import { useRef } from 'react'

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

// mode: 'ask' | 'text' | 'voice'
// Both 'text' and 'voice' render a card + Play button.
// The explicit tap to open the card satisfies browser autoplay policy in all modes.
export default function ArrivalBrief({ mode, greeting, text, loading, isSpeaking, onDismiss, onAccept, onDecline, onSpeak, onRefresh }) {
  const dismissed = useRef(false)
  function dismiss() { if (!dismissed.current) { dismissed.current = true; onDismiss() } }

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

  if (mode === 'text' || mode === 'voice') {
    return (
      <div style={BACKDROP} onClick={e => { if (e.target === e.currentTarget) dismiss() }}>
        <div style={CARD}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <img
              src="/pacer-seal.png"
              alt="PACER"
              style={{ width: '44px', height: '44px', objectFit: 'contain' }}
            />
          </div>
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
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {!loading && text && (
              <button
                style={btn(true)}
                disabled={isSpeaking}
                onClick={() => {
                  console.debug('[arrival voice] play clicked, text length:', text?.length)
                  onSpeak()
                }}
              >
                {isSpeaking ? '🔊 Speaking…' : '▶ Play'}
              </button>
            )}
            {!loading && onRefresh && (
              <button style={btn(false)} onClick={onRefresh} title="Refresh with latest data">
                ↺ Refresh
              </button>
            )}
            <button style={btn(false)} onClick={dismiss}>Dismiss</button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

