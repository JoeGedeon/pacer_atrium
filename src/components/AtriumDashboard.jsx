const DEST_COLORS = {
  'FleetFlow':              '#3b82f6',
  'Isles of the Awakening': '#10b981',
  'Doctrine':               '#f59e0b',
  'Content':                '#8b5cf6',
  'Archive':                '#6b7280',
}

function destColor(d) { return DEST_COLORS[d] || '#4b5563' }

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export default function AtriumDashboard({ observations, onSelectObservation }) {
  const pending  = observations.filter(o => !o.destination)
  const routed   = observations.filter(o =>  o.destination)

  const resonance = Object.entries(
    routed.reduce((acc, o) => {
      acc[o.destination] = (acc[o.destination] || 0) + 1
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 4)

  const suggestedMove = pending.length > 0
    ? `${pending.length} signal${pending.length > 1 ? 's' : ''} awaiting routing — open one below`
    : observations.length === 0
      ? 'The stream is empty. Enter your first observation.'
      : `${routed.length} observation${routed.length !== 1 ? 's' : ''} routed and preserved.`

  return (
    <div className="flex-1 flex flex-col overflow-y-auto"
      style={{ background: 'var(--bg-0)', padding: '32px 28px' }}
    >
      <div style={{ marginBottom: '32px' }}>
        <p className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: 'var(--text-4)', letterSpacing: '0.15em', marginBottom: '6px' }}
        >PACER ATRIUM</p>
        <h2 className="font-bold" style={{ fontSize: '18px', color: 'var(--text-0)', marginBottom: '6px' }}>
          {greeting()}.
        </h2>
        <p className="text-xs" style={{ color: 'var(--text-3)' }}>
          {observations.length === 0
            ? 'No observations yet. The stream is waiting.'
            : `${observations.length} observation${observations.length !== 1 ? 's' : ''} in memory.`}
        </p>
      </div>

      {pending.length > 0 && (
        <section style={{ marginBottom: '28px' }}>
          <p className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: 'var(--text-4)', letterSpacing: '0.12em', marginBottom: '10px' }}
          >Awaiting Routing</p>
          {pending.slice(0, 3).map(obs => (
            <button key={obs.id} onClick={() => onSelectObservation(obs)}
              className="w-full text-left rounded-lg mb-2 transition-all"
              style={{ background: 'var(--bg-2)', border: '1px solid #1d4ed820', padding: '10px 14px', cursor: 'pointer' }}
            >
              <p className="text-xs" style={{ color: '#1d4ed8', marginBottom: '3px' }}>{obs.type}</p>
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>
                {obs.text.length > 80 ? obs.text.slice(0, 80) + '…' : obs.text}
              </p>
            </button>
          ))}
          {pending.length > 3 && (
            <p className="text-xs" style={{ color: 'var(--text-4)', paddingLeft: '2px' }}>
              +{pending.length - 3} more in stream
            </p>
          )}
        </section>
      )}

      {routed.length > 0 && (
        <section style={{ marginBottom: '28px' }}>
          <p className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: 'var(--text-4)', letterSpacing: '0.12em', marginBottom: '10px' }}
          >Recent Signals</p>
          {routed.slice(0, 4).map(obs => (
            <button key={obs.id} onClick={() => onSelectObservation(obs)}
              className="w-full text-left rounded-lg mb-2 flex items-start gap-3 transition-all"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border-1)', padding: '10px 14px', cursor: 'pointer' }}
            >
              <p className="flex-1 text-xs truncate" style={{ color: 'var(--text-2)' }}>
                {obs.text.length > 72 ? obs.text.slice(0, 72) + '…' : obs.text}
              </p>
              <span className="text-xs shrink-0" style={{ color: destColor(obs.destination) }}>
                {obs.destination}
              </span>
            </button>
          ))}
        </section>
      )}

      {resonance.length > 0 && (
        <section style={{ marginBottom: '28px' }}>
          <p className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: 'var(--text-4)', letterSpacing: '0.12em', marginBottom: '10px' }}
          >Resonance</p>
          <div className="flex flex-wrap gap-2">
            {resonance.map(([dest, count]) => (
              <div key={dest} className="rounded-lg px-3 py-1.5 flex items-center gap-2"
                style={{ background: 'var(--bg-2)', border: `1px solid ${destColor(dest)}25` }}
              >
                <span className="text-xs font-medium" style={{ color: destColor(dest) }}>{dest}</span>
                <span className="text-xs" style={{ color: 'var(--text-5)' }}>{count}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border-1)' }}>
        <p className="text-xs" style={{ color: 'var(--text-6)' }}>{suggestedMove}</p>
      </div>
    </div>
  )
}
