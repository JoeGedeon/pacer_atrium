const DESTINATION = 'Isles of the Awakening'

function timeAgo(date) {
  if (!date) return ''
  const mins = Math.floor((Date.now() - (date instanceof Date ? date.getTime() : new Date(date).getTime())) / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function SectionHeader({ label, emoji, count, note }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <span style={{ fontSize: '14px' }}>{emoji}</span>
        <p style={{ color: 'var(--text-3)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase' }}>
          {label}
        </p>
        <span style={{ color: 'var(--text-6)', fontSize: '10px' }}>{count}</span>
      </div>
      <p style={{ color: 'var(--text-6)', fontSize: '10px', fontStyle: 'italic', paddingLeft: '22px' }}>
        {note}
      </p>
    </div>
  )
}

function SeedCard({ obs }) {
  return (
    <div style={{
      background: 'var(--bg-2)', border: '1px solid var(--border-1)',
      borderRadius: '8px', padding: '12px 16px', marginBottom: '8px',
    }}>
      <p style={{ color: 'var(--text-2)', fontSize: '12px', lineHeight: 1.65, marginBottom: '6px' }}>
        {obs.text}
      </p>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {obs.constellation && (
          <span style={{ color: '#a07830', fontSize: '10px' }}>◈ {obs.constellation}</span>
        )}
        <span style={{ color: 'var(--text-6)', fontSize: '10px' }}>{timeAgo(obs.timestamp)}</span>
      </div>
    </div>
  )
}

function GrowthCard({ obs, onRoute, onNavigate }) {
  const claude = obs.claude || {}

  return (
    <div style={{
      background: 'var(--bg-2)', border: '1px solid var(--border-1)',
      borderLeft: '3px solid #10b98140', borderRadius: '0 8px 8px 0',
      padding: '14px 18px', marginBottom: '10px',
    }}>
      <p style={{ color: 'var(--text-1)', fontSize: '12px', lineHeight: 1.65, marginBottom: '10px' }}>
        {obs.text}
      </p>

      {claude.rationale && (
        <p style={{ color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.6,
          fontStyle: 'italic', marginBottom: '10px', paddingLeft: '8px',
          borderLeft: '2px solid var(--border-2)' }}>
          {claude.rationale}
        </p>
      )}

      {obs.constellation && (
        <p style={{ color: '#a07830', fontSize: '10px', marginBottom: '10px' }}>
          ◈ {obs.constellation}
        </p>
      )}

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => onRoute(obs.id, 'Theater')}
          style={{
            background: '#130a20', border: '1px solid #6b21a820',
            color: '#a855f7', fontSize: '10px', fontWeight: 600,
            padding: '4px 10px', borderRadius: '5px', cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          → Theater
        </button>
        <button
          onClick={() => onNavigate('kel')}
          style={{
            background: 'var(--bg-3)', border: '1px solid var(--border-1)',
            color: 'var(--text-3)', fontSize: '10px', fontWeight: 600,
            padding: '4px 10px', borderRadius: '5px', cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          → KEL Review
        </button>
        <button
          onClick={() => onRoute(obs.id, 'Archive')}
          style={{
            background: 'var(--bg-3)', border: '1px solid var(--border-1)',
            color: 'var(--text-5)', fontSize: '10px',
            padding: '4px 10px', borderRadius: '5px', cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Archive as Reference
        </button>
      </div>
    </div>
  )
}

export default function IslesRoom({ observations = [], onRoute, onNavigate, isMobile }) {
  const px = isMobile ? 'px-6' : 'px-10'

  const islesObs     = observations.filter(o => o.destination === DESTINATION)
  const seeds        = islesObs.filter(o => !o.claude)
  const withSignal   = islesObs.filter(o => !!o.claude)

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-0)' }}>

      <div className={`shrink-0 ${px} pt-8 pb-6`}
        style={{ borderBottom: '1px solid var(--border-0)' }}>
        <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
          Incubation Layer
        </p>
        <h2 style={{ fontSize: '18px', color: 'var(--text-0)', fontWeight: 700,
          letterSpacing: '0.08em', marginBottom: '6px' }}>Isles</h2>
        <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic' }}>
          Where unfinished things are allowed to be alive.
        </p>
      </div>

      <div className={`flex-1 overflow-y-auto ${px} py-8`}>
        {islesObs.length === 0 ? (
          <div style={{ maxWidth: '460px' }}>
            <p style={{ color: 'var(--text-3)', fontSize: '13px', lineHeight: 1.7, marginBottom: '8px' }}>
              Nothing has arrived in Isles yet.
            </p>
            <p style={{ color: 'var(--text-5)', fontSize: '12px', lineHeight: 1.7, marginBottom: '24px' }}>
              Isles is where observations live before anyone knows what they are.
              Route an observation here from Atrium — no structure required, no decision needed.
              Ideas are allowed to exist here without justifying themselves.
            </p>
            {onNavigate && (
              <button
                onClick={() => onNavigate('atrium')}
                style={{
                  background: 'none', border: '1px solid var(--border-1)',
                  color: 'var(--text-3)', fontSize: '12px', cursor: 'pointer',
                  padding: '8px 16px', borderRadius: '6px', fontFamily: 'inherit',
                }}
              >
                Go to Atrium →
              </button>
            )}
          </div>
        ) : (
          <div style={{ maxWidth: '600px' }}>

            {seeds.length > 0 && (
              <div style={{ marginBottom: '36px' }}>
                <SectionHeader
                  emoji="🌱"
                  label="Seeds"
                  count={seeds.length}
                  note="Raw observations. No structure required. Nothing here needs to justify itself."
                />
                {seeds.map(o => <SeedCard key={o.id} obs={o} />)}
              </div>
            )}

            {withSignal.length > 0 && (
              <div style={{ marginBottom: '36px' }}>
                <SectionHeader
                  emoji="🌿"
                  label="Growth"
                  count={withSignal.length}
                  note="MUSE has noticed something here. Ready to move when you decide."
                />
                {withSignal.map(o => (
                  <GrowthCard
                    key={o.id}
                    obs={o}
                    onRoute={onRoute}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            )}

            <p style={{ color: 'var(--text-6)', fontSize: '10px', fontStyle: 'italic', marginTop: '8px' }}>
              {islesObs.length} observation{islesObs.length !== 1 ? 's' : ''} in Isles
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
