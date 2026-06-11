export default function BuilderStudioRoom({ isMobile }) {
  const px = isMobile ? 'px-6' : 'px-10'

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-0)' }}>

      <div className={`shrink-0 ${px} pt-8 pb-6`}
        style={{ borderBottom: '1px solid var(--border-0)' }}>
        <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
          The Forge
        </p>
        <h2 style={{ fontSize: '18px', color: 'var(--text-0)', fontWeight: 700,
          letterSpacing: '0.08em', marginBottom: '6px' }}>Builder Studio</h2>
        <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic' }}>
          Knowledge enters. Evidence leaves.
        </p>
      </div>

      <div className={`flex-1 overflow-y-auto ${px} py-8`}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '400px', textAlign: 'center' }}>
          <p style={{
            color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.2em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '20px',
          }}>
            Not Open
          </p>
          <p style={{ color: 'var(--text-3)', fontSize: '13px', lineHeight: 1.8,
            marginBottom: '12px' }}>
            This room is not open yet.
          </p>
          <p style={{ color: 'var(--text-5)', fontSize: '12px', lineHeight: 1.7 }}>
            The unlock condition has not been earned.
          </p>
        </div>
      </div>

    </div>
  )
}
