const BACKDROP = {
  position: 'fixed', inset: 0, zIndex: 9100,
  background: 'rgba(0,0,0,0.7)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '24px',
}

export default function OnboardingCard({ onEnter }) {
  return (
    <div style={BACKDROP}>
      <div style={{
        background: 'var(--bg-1)',
        border: '1px solid var(--border-1)',
        borderRadius: '16px',
        padding: '36px 40px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
      }}>
        <div style={{ fontSize: '32px', marginBottom: '24px', filter: 'hue-rotate(160deg) saturate(2) brightness(1.1)' }}>
          🍍
        </div>

        <p style={{
          color: 'var(--text-0)', fontSize: '18px', fontWeight: 700,
          letterSpacing: '0.04em', marginBottom: '20px',
        }}>
          Welcome.
        </p>

        <p style={{ color: 'var(--text-2)', fontSize: '13px', lineHeight: 1.9, marginBottom: '20px' }}>
          PACER is a campus for memory, understanding, and action.
        </p>

        <div style={{
          borderLeft: '2px solid var(--border-1)',
          paddingLeft: '16px',
          marginBottom: '20px',
        }}>
          <p style={{ color: 'var(--text-3)', fontSize: '13px', lineHeight: 2.0 }}>
            Some rooms preserve what matters.<br />
            Some rooms help ideas take shape.<br />
            Some rooms exist to examine reality and decide what comes next.
          </p>
        </div>

        <p style={{ color: 'var(--text-3)', fontSize: '13px', lineHeight: 1.9, marginBottom: '8px' }}>
          You do not need to understand everything at once.
        </p>

        <p style={{ color: 'var(--text-3)', fontSize: '13px', lineHeight: 1.9, marginBottom: '32px' }}>
          Begin where your curiosity takes you.
        </p>

        <p style={{
          color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic',
          marginBottom: '28px',
          borderTop: '1px solid var(--border-0)',
          paddingTop: '20px',
        }}>
          There is room. Come in.
        </p>

        <button
          onClick={onEnter}
          style={{
            width: '100%', fontFamily: 'inherit', cursor: 'pointer',
            background: 'var(--bg-2)', border: '1px solid var(--border-1)',
            borderRadius: '8px', padding: '13px 20px',
            color: 'var(--text-1)', fontSize: '12px', fontWeight: 600,
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}
        >
          Enter the Campus
        </button>
      </div>
    </div>
  )
}
