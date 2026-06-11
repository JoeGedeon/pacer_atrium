// VITE_FLEETFLOW_URL must be set in your .env / Netlify environment variables.
const FLEETFLOW_URL = import.meta.env.VITE_FLEETFLOW_URL || null

const TEACHINGS = [
  {
    label: 'Visibility',
    note: "What you can't see, you can't manage. Operations require clear sight lines — into jobs, revenue, labor, and process.",
  },
  {
    label: 'Accountability',
    note: 'Processes have owners. Owners have consequences. Accountability is not punishment — it is protection.',
  },
  {
    label: 'Consequence',
    note: 'Small failures compound. Name them early, before they become disputes, claims, or lost revenue.',
  },
  {
    label: 'Operational Stewardship',
    note: 'Protect the operation the way you protect what it carries. The work is in your custody.',
  },
  {
    label: 'Process Discipline',
    note: 'Consistency reduces error. Error exposes gaps. Gaps become the next expensive lesson.',
  },
]

function formatDate(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

const ORDINALS = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth']
function ordinal(n) { return ORDINALS[n - 1] ?? `#${n}` }

export default function BusinessCenterRoom({ observations = [], graduates = [], builderReadiness = 'locked', onRequestBuilderReview, onEnterBuilderStudio, isMobile }) {
  const px = isMobile ? 'px-6' : 'px-10'

  const signals = observations
    .filter(o =>
      o.text && (
        o.destination?.toLowerCase().includes('fleetflow') ||
        o.destination?.toLowerCase().includes('fleet') ||
        o.destination?.toLowerCase().includes('business') ||
        o.constellation?.toLowerCase().includes('fleetflow') ||
        o.constellation?.toLowerCase().includes('operations')
      )
    )
    .slice(0, 10)

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-0)' }}>

      {/* Header */}
      <div className={`shrink-0 ${px} pt-8 pb-6`}
        style={{ borderBottom: '1px solid var(--border-0)' }}>
        <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
          College of Operations
        </p>
        <h2 style={{ fontSize: '18px', color: 'var(--text-0)', fontWeight: 700,
          letterSpacing: '0.08em', marginBottom: '6px' }}>Business Center</h2>
        <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic' }}>
          Operational truth matters.
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
            Business Center is where the institution teaches operational stewardship — not as a feature set, but as a discipline. Clients, projects, revenue, invoices, teams: these are not administrative tasks. They are the instruments of accountability.
          </p>
          <p style={{ color: 'var(--text-3)', fontSize: '13px', lineHeight: 1.8 }}>
            A resident can spend months inside Business Center and never open FleetFlow. They should still leave understanding how to run an operation with integrity. That is the college's job.
          </p>
        </div>

        {/* What this college teaches */}
        <div style={{ maxWidth: '540px', marginBottom: '36px' }}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>
            What This College Teaches
          </p>
          <div className="flex flex-col gap-3">
            {TEACHINGS.map(({ label, note }) => (
              <div key={label} style={{
                borderLeft: '2px solid #3b82f630', paddingLeft: '14px',
              }}>
                <p style={{ color: 'var(--text-1)', fontSize: '12px',
                  fontWeight: 600, marginBottom: '3px' }}>{label}</p>
                <p style={{ color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.65 }}>{note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* PACER memory — operational signals */}
        {signals.length > 0 && (
          <div style={{ maxWidth: '540px', marginBottom: '36px' }}>
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>
              Operational Signals in Memory
            </p>
            <div className="flex flex-col gap-2">
              {signals.map(obs => (
                <div key={obs.id} style={{
                  background: 'var(--bg-2)', border: '1px solid var(--border-1)',
                  borderLeft: '3px solid #3b82f630',
                  borderRadius: '0 8px 8px 0', padding: '10px 14px',
                }}>
                  <p style={{ color: 'var(--text-6)', fontSize: '9px',
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

        {/* FleetFlow Gateway — the door at the end of the college */}
        <div style={{
          maxWidth: '540px',
          borderTop: '1px solid var(--border-0)',
          paddingTop: '32px',
          marginTop: signals.length === 0 ? '0' : undefined,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '15px' }}>🚚</span>
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontWeight: 600 }}>FleetFlow Gateway</p>
          </div>

          {/* First Graduate plaque */}
          <div style={{
            background: 'var(--bg-2)',
            border: '1px solid var(--border-1)',
            borderLeft: '3px solid #10b981',
            borderRadius: '0 8px 8px 0',
            padding: '16px 20px',
            marginBottom: '20px',
          }}>
            <p style={{ color: 'var(--text-1)', fontSize: '14px', fontWeight: 700,
              letterSpacing: '0.04em', marginBottom: '2px' }}>
              FleetFlow
            </p>
            <p style={{ color: 'var(--text-4)', fontSize: '10px', fontWeight: 600,
              letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '12px' }}>
              First Graduate
            </p>
            <p style={{ color: 'var(--text-3)', fontSize: '12px', lineHeight: 1.7,
              marginBottom: '6px' }}>
              Built from thirty years of operational reality.
            </p>
            <p style={{ color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.65,
              fontStyle: 'italic' }}>
              Proof that the discipline survives contact with reality.
            </p>
          </div>

          {/* Additional graduate plaques from registry */}
          {graduates.filter(g => g.sequence > 1).map(g => (
            <div key={g.id} style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--border-1)',
              borderLeft: '3px solid #10b981',
              borderRadius: '0 8px 8px 0',
              padding: '16px 20px',
              marginBottom: '12px',
            }}>
              <p style={{ color: 'var(--text-1)', fontSize: '14px', fontWeight: 700,
                letterSpacing: '0.04em', marginBottom: '2px' }}>
                {g.graduateName}
              </p>
              <p style={{ color: 'var(--text-4)', fontSize: '10px', fontWeight: 600,
                letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '10px' }}>
                {ordinal(g.sequence)} Graduate
              </p>
              {g.proof && (
                <p style={{ color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.65,
                  fontStyle: 'italic' }}>{g.proof}</p>
              )}
            </div>
          ))}

          {/* FleetFlow-specific memory */}
          {signals.filter(o =>
            o.destination?.toLowerCase().includes('fleetflow') ||
            o.constellation?.toLowerCase().includes('fleetflow')
          ).length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              {signals
                .filter(o =>
                  o.destination?.toLowerCase().includes('fleetflow') ||
                  o.constellation?.toLowerCase().includes('fleetflow')
                )
                .slice(0, 4)
                .map(obs => (
                  <div key={obs.id} style={{
                    background: 'var(--bg-2)', border: '1px solid var(--border-1)',
                    borderLeft: '3px solid #10b98130',
                    borderRadius: '0 8px 8px 0', padding: '10px 14px',
                    marginBottom: '8px',
                  }}>
                    <p style={{ color: 'var(--text-6)', fontSize: '9px', marginBottom: '3px' }}>
                      {formatDate(obs.timestamp)}
                    </p>
                    <p style={{ color: 'var(--text-2)', fontSize: '12px', lineHeight: 1.6 }}>
                      {(obs.text?.length ?? 0) > 140
                        ? obs.text.slice(0, 140) + '…'
                        : (obs.text || '')}
                    </p>
                  </div>
                ))}
            </div>
          )}

          {FLEETFLOW_URL ? (
            <a
              href={FLEETFLOW_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                background: '#052e16', border: '1px solid #10b981',
                color: '#10b981', fontSize: '13px', fontWeight: 600,
                padding: '12px 24px', borderRadius: '8px',
                textDecoration: 'none', letterSpacing: '0.04em',
              }}
            >
              Enter FleetFlow Workspace →
            </a>
          ) : (
            <div style={{
              background: 'var(--bg-2)', border: '1px solid var(--border-1)',
              borderRadius: '8px', padding: '14px 18px', maxWidth: '400px',
            }}>
              <p style={{ color: 'var(--text-3)', fontSize: '12px', marginBottom: '5px' }}>
                FleetFlow workspace not yet connected.
              </p>
              <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.6 }}>
                Set <code style={{ color: 'var(--text-3)' }}>VITE_FLEETFLOW_URL</code> in
                environment variables to open the gateway.
              </p>
            </div>
          )}
          <p style={{ color: 'var(--text-6)', fontSize: '10px', marginTop: '10px' }}>
            Business Center teaches. FleetFlow executes. The gateway is where they meet.
          </p>
        </div>

        {/* Builder Studio — the door at the back */}
        <div style={{
          maxWidth: '540px',
          marginTop: '48px',
          paddingTop: '36px',
          borderTop: '1px solid var(--border-0)',
        }}>
          <div style={{
            border: '1px solid var(--border-1)',
            borderRadius: '10px',
            padding: '28px 28px 24px',
            background: 'var(--bg-1)',
            textAlign: 'center',
          }}>
            <p style={{
              color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.2em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '16px',
            }}>
              Builder Studio
            </p>
            <p style={{
              color: 'var(--text-2)', fontSize: '13px', lineHeight: 1.8,
              marginBottom: '4px',
            }}>
              Knowledge enters.
            </p>
            <p style={{
              color: 'var(--text-2)', fontSize: '13px', lineHeight: 1.8,
              marginBottom: '24px',
            }}>
              Evidence leaves.
            </p>
            {builderReadiness === 'approved' && (
              <button
                onClick={onEnterBuilderStudio}
                style={{
                  display: 'inline-block',
                  background: '#1a0a00',
                  border: '1px solid #f59e0b',
                  borderRadius: '6px',
                  padding: '10px 22px',
                  color: '#f59e0b',
                  fontSize: '12px',
                  letterSpacing: '0.06em',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Enter Builder Studio →
              </button>
            )}
            {builderReadiness === 'pending' && (
              <div style={{
                display: 'inline-block',
                border: '1px solid #3b82f640',
                borderRadius: '6px',
                padding: '10px 22px',
                color: '#3b82f6',
                fontSize: '11px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 600,
                cursor: 'default',
                userSelect: 'none',
              }}>
                Under KEL Review
              </div>
            )}
            {builderReadiness === 'locked' && (
              <div style={{
                display: 'inline-block',
                border: '1px solid var(--border-1)',
                borderRadius: '6px',
                padding: '10px 22px',
                color: 'var(--text-5)',
                fontSize: '11px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 600,
                cursor: 'default',
                userSelect: 'none',
              }}>
                Door Closed
              </div>
            )}
            <p style={{
              color: 'var(--text-6)', fontSize: '10px',
              marginTop: '18px', fontStyle: 'italic',
            }}>
              Graduation requires proof.
            </p>

            {builderReadiness === 'locked' && (
              <div style={{ marginTop: '20px', paddingTop: '20px',
                borderTop: '1px solid var(--border-0)' }}>
                <p style={{ color: 'var(--text-5)', fontSize: '11px',
                  lineHeight: 1.65, marginBottom: '12px' }}>
                  When the discipline is learned and a build proposal is ready,
                  ask KEL to review readiness for Builder Studio.
                </p>
                <button
                  onClick={onRequestBuilderReview}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border-1)',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    color: 'var(--text-3)',
                    fontSize: '11px',
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                  }}
                >
                  Request Builder Review
                </button>
              </div>
            )}

            {builderReadiness === 'pending' && (
              <p style={{ color: 'var(--text-5)', fontSize: '11px',
                lineHeight: 1.65, marginTop: '16px' }}>
                A readiness review has been submitted to KEL. The forge opens when judgment confirms readiness.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
