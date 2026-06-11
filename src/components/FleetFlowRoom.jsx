// VITE_FLEETFLOW_URL must be set in your .env / Netlify environment variables
// to point at the deployed FleetFlow workspace.
const FLEETFLOW_URL = import.meta.env.VITE_FLEETFLOW_URL || null

const PRINCIPLES = [
  { label: 'Reality keeps score.',         note: 'Every operational failure has a cost. FleetFlow makes that cost visible before it compounds.' },
  { label: 'Small mistakes compound.',     note: 'A missed verification today becomes a disputed claim next month. FleetFlow closes the gap.' },
  { label: 'Accountability is protective.', note: 'Documentation, verification, and chain of custody protect the operation and the people inside it.' },
]

function formatDate(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function FleetFlowRoom({ observations = [], isMobile }) {
  // Surface observations routed to FleetFlow or carrying FleetFlow constellations
  const signals = observations
    .filter(o =>
      o.text && (
        o.destination?.toLowerCase().includes('fleetflow') ||
        o.constellation?.toLowerCase().includes('fleetflow') ||
        o.destination?.toLowerCase().includes('fleet')
      )
    )
    .slice(0, 12)

  const px = isMobile ? 'px-6' : 'px-10'

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-0)' }}>

      {/* Header */}
      <div className={`shrink-0 ${px} pt-8 pb-6`}
        style={{ borderBottom: '1px solid var(--border-0)' }}>
        <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
          Operational Gateway
        </p>
        <h2 style={{ fontSize: '18px', color: 'var(--text-0)', fontWeight: 700,
          letterSpacing: '0.08em', marginBottom: '6px' }}>FleetFlow Gateway</h2>
        <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic' }}>
          Reality keeps score.
        </p>
      </div>

      <div className={`flex-1 overflow-y-auto ${px} py-8`}>

        {/* Discipline statement */}
        <div style={{ maxWidth: '540px', marginBottom: '36px' }}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>
            The Discipline
          </p>
          <p style={{ color: 'var(--text-2)', fontSize: '13px', lineHeight: 1.8,
            marginBottom: '10px' }}>
            FleetFlow was built from thirty years inside the operation — not from the outside looking in. It sees what generic software misses: the gap between what was promised and what was delivered, and the cost of that gap when nobody documented the difference.
          </p>
          <p style={{ color: 'var(--text-3)', fontSize: '13px', lineHeight: 1.8 }}>
            Business Center manages operations. FleetFlow governs them. The difference shows up in disputes, in claims, in the jobs that look clean until the invoice arrives.
          </p>
        </div>

        {/* Principles */}
        <div style={{ maxWidth: '540px', marginBottom: '36px' }}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>
            What FleetFlow Teaches
          </p>
          <div className="flex flex-col gap-3">
            {PRINCIPLES.map(({ label, note }) => (
              <div key={label} style={{
                borderLeft: '2px solid #10b98130', paddingLeft: '14px',
              }}>
                <p style={{ color: 'var(--text-1)', fontSize: '12px',
                  fontWeight: 600, marginBottom: '3px' }}>{label}</p>
                <p style={{ color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.6 }}>{note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* PACER memory routed to FleetFlow */}
        {signals.length > 0 && (
          <div style={{ maxWidth: '540px', marginBottom: '36px' }}>
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>
              Signals from PACER Memory
            </p>
            <div className="flex flex-col gap-2">
              {signals.map(obs => (
                <div key={obs.id} style={{
                  background: 'var(--bg-2)', border: '1px solid var(--border-1)',
                  borderLeft: '3px solid #10b98130',
                  borderRadius: '0 8px 8px 0', padding: '10px 14px',
                }}>
                  <p style={{ color: 'var(--text-5)', fontSize: '9px',
                    marginBottom: '4px', letterSpacing: '0.06em' }}>
                    {formatDate(obs.timestamp)}
                    {obs.constellation ? ` · ✦ ${obs.constellation}` : ''}
                  </p>
                  <p style={{ color: 'var(--text-2)', fontSize: '12px', lineHeight: 1.6 }}>
                    {(obs.text?.length ?? 0) > 160
                      ? obs.text.slice(0, 160) + '…'
                      : (obs.text || '')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {signals.length === 0 && (
          <div style={{ maxWidth: '540px', marginBottom: '36px' }}>
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>
              Signals from PACER Memory
            </p>
            <p style={{ color: 'var(--text-5)', fontSize: '12px', lineHeight: 1.7 }}>
              No observations routed to FleetFlow yet. Route operational observations from Atrium
              to surface them here.
            </p>
          </div>
        )}

        {/* The door */}
        <div style={{ maxWidth: '540px' }}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>
            Enter the Workspace
          </p>
          {FLEETFLOW_URL ? (
            <a
              href={FLEETFLOW_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                background: '#052e16',
                border: '1px solid #10b981',
                color: '#10b981',
                fontSize: '13px', fontWeight: 600,
                padding: '12px 24px', borderRadius: '8px',
                textDecoration: 'none', letterSpacing: '0.04em',
                cursor: 'pointer',
              }}
            >
              Enter FleetFlow Workspace →
            </a>
          ) : (
            <div style={{
              background: 'var(--bg-2)', border: '1px solid var(--border-1)',
              borderRadius: '8px', padding: '16px 20px', maxWidth: '400px',
            }}>
              <p style={{ color: 'var(--text-3)', fontSize: '12px', marginBottom: '6px' }}>
                FleetFlow workspace URL not configured.
              </p>
              <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.6 }}>
                Set <code style={{ color: 'var(--text-3)' }}>VITE_FLEETFLOW_URL</code> in your
                environment variables to open the door.
              </p>
            </div>
          )}
          <p style={{ color: 'var(--text-6)', fontSize: '10px', marginTop: '10px' }}>
            PACER teaches. FleetFlow executes. The gateway is where they meet.
          </p>
        </div>
      </div>
    </div>
  )
}
