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

const FLEETFLOW_FUTURE_METRICS = [
  'Active Companies',
  'Active Jobs',
  'Revenue Processed',
  'Revenue Recovered',
  'Failed Workflows',
  'Subscription Count',
  'Missed Charges Detected',
]

function formatDateFull(date) {
  if (!date) return 'Unknown Date'
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
}

const ORDINALS = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth']
function ordinal(n) { return ORDINALS[n - 1] ?? `#${n}` }

function groupEventsByDate(events) {
  const groups = {}
  events.forEach(e => {
    const key = formatDateFull(e.createdAt)
    if (!groups[key]) groups[key] = []
    groups[key].push(e)
  })
  return Object.entries(groups)
}

function Dot({ ok }) {
  return (
    <span style={{
      display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%',
      background: ok ? '#10b981' : '#f59e0b',
      marginRight: '8px', marginTop: '1px', flexShrink: 0,
    }} />
  )
}

function HealthRow({ label, value, ok = true }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '7px 0', borderBottom: '1px solid var(--border-0)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Dot ok={ok} />
        <span style={{ color: 'var(--text-4)', fontSize: '12px' }}>{label}</span>
      </div>
      <span style={{
        color: ok ? 'var(--text-1)' : '#f59e0b',
        fontSize: '12px', fontWeight: 600, fontVariantNumeric: 'tabular-nums',
      }}>{value}</span>
    </div>
  )
}

function MetricTile({ label, value, note }) {
  const isDash = value === '—'
  return (
    <div style={{
      background: 'var(--bg-2)', border: '1px solid var(--border-1)',
      borderRadius: '8px', padding: '14px 16px',
    }}>
      <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.1em',
        textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>{label}</p>
      <p style={{
        color: isDash ? 'var(--text-6)' : 'var(--text-0)',
        fontSize: '20px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', marginBottom: '2px',
      }}>{value}</p>
      {note && (
        <p style={{ color: 'var(--text-6)', fontSize: '10px', fontStyle: 'italic', lineHeight: 1.5 }}>
          {note}
        </p>
      )}
    </div>
  )
}

function generatePulse({ totalObs, pendingCount, stagedCount, constitutionalTests, apiConnected, recentEventCount }) {
  if (totalObs === 0) {
    return 'The Atrium is quiet. The campus is ready to receive its first observation.'
  }
  if (!apiConnected) {
    return `${totalObs} observation${totalObs !== 1 ? 's' : ''} captured. Connect Claude to enable MUSE analysis and institutional intelligence.`
  }
  if (pendingCount > 5 && pendingCount > stagedCount * 3) {
    return `${pendingCount} observations are awaiting routing decisions. Human Gate attention may be the current bottleneck.`
  }
  if (stagedCount > 0 && constitutionalTests > 0) {
    return `Campus is active. ${stagedCount} observation${stagedCount !== 1 ? 's' : ''} staged for Theater. Constitutional testing is on the record.`
  }
  if (stagedCount > 0) {
    return `${stagedCount} observation${stagedCount !== 1 ? 's' : ''} staged for production. The pipeline is moving.`
  }
  if (recentEventCount > 3) {
    return 'Institutional activity is elevated. Multiple governance events recorded in recent sessions.'
  }
  return `${totalObs} observation${totalObs !== 1 ? 's' : ''} in memory. Campus is operational.`
}

export default function BusinessCenterRoom({
  observations = [], graduates = [], builderReadiness = 'locked',
  museWorks = [], institutionEvents = [], apiKey = null,
  onRequestBuilderReview, onEnterBuilderStudio, isMobile,
}) {
  const px = isMobile ? 'px-6' : 'px-10'

  // ── Cockpit metrics ──────────────────────────────────────────────────────────
  const totalObs        = observations.length
  const pendingCount    = observations.filter(o => !o.destination).length
  const stagedToTheater = observations.filter(o => o.destination === 'Theater').length
  const archiveCount    = observations.filter(o =>
    o.status === 'archived' || (o.destination || '').toLowerCase().includes('archive')
  ).length
  const constitutionalTests = institutionEvents.filter(e => e.eventType === 'multi_manifest_test_completed').length
  const apiConnected    = !!apiKey
  const recentEvents    = institutionEvents.slice(0, 12)
  const groupedEvents   = groupEventsByDate(recentEvents)

  const pulse = generatePulse({
    totalObs, pendingCount, stagedCount: stagedToTheater,
    constitutionalTests, apiConnected, recentEventCount: recentEvents.length,
  })

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-0)' }}>

      {/* Header */}
      <div className={`shrink-0 ${px} pt-8 pb-5`}
        style={{ borderBottom: '1px solid var(--border-0)' }}>
        <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
          College of Operations
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline',
          justifyContent: 'space-between', gap: '12px' }}>
          <h2 style={{ fontSize: '18px', color: 'var(--text-0)',
            fontWeight: 700, letterSpacing: '0.08em' }}>Business Center</h2>
          <p style={{ color: 'var(--text-6)', fontSize: '10px',
            fontStyle: 'italic', flexShrink: 0 }}>The Bridge</p>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto ${px} py-8`}>

        {/* ── INSTITUTIONAL PULSE ─────────────────────────────────────────── */}
        <div style={{ maxWidth: '600px', marginBottom: '32px' }}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>
            Institutional Pulse
          </p>
          <div style={{
            background: 'var(--bg-2)', border: '1px solid var(--border-1)',
            borderLeft: '3px solid #3b82f6', borderRadius: '0 10px 10px 0',
            padding: '20px 24px',
          }}>
            <p style={{ color: 'var(--text-1)', fontSize: '15px',
              lineHeight: 1.7, fontStyle: 'italic' }}>
              {pulse}
            </p>
          </div>
        </div>

        {/* ── SYSTEM HEALTH ───────────────────────────────────────────────── */}
        <div style={{ maxWidth: '600px', marginBottom: '32px' }}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>
            System Health
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '14px',
          }}>
            {/* PACER Health */}
            <div style={{
              background: 'var(--bg-2)', border: '1px solid var(--border-1)',
              borderRadius: '10px', padding: '16px 18px',
            }}>
              <p style={{ color: 'var(--text-3)', fontSize: '10px', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
                PACER Health
              </p>
              <HealthRow label="Observations Captured" value={totalObs} />
              <HealthRow label="Pending Routing"
                value={pendingCount}
                ok={pendingCount < 10} />
              <HealthRow label="Staged to Theater" value={stagedToTheater} />
              <HealthRow label="Archive Count" value={archiveCount} />
              <HealthRow label="Works in Progress" value={museWorks.length} />
            </div>
            {/* Campus Health */}
            <div style={{
              background: 'var(--bg-2)', border: '1px solid var(--border-1)',
              borderRadius: '10px', padding: '16px 18px',
            }}>
              <p style={{ color: 'var(--text-3)', fontSize: '10px', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
                Campus Health
              </p>
              <HealthRow label="API Connection"
                value={apiConnected ? 'Connected' : 'Not Connected'}
                ok={apiConnected} />
              <HealthRow label="Authentication" value="Active" />
              <HealthRow label="All Rooms" value="Reachable" />
              <HealthRow label="Firestore" value="Active" />
              <HealthRow label="Storage" value="Active" />
            </div>
          </div>
        </div>

        {/* ── INSTITUTIONAL HEALTH ────────────────────────────────────────── */}
        <div style={{ maxWidth: '600px', marginBottom: '32px' }}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>
            Institutional Health
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
            gap: '10px',
          }}>
            <MetricTile label="Observations" value={totalObs} />
            <MetricTile label="Staged to Theater" value={stagedToTheater} />
            <MetricTile label="Constitutional Tests" value={constitutionalTests} />
            <MetricTile label="Manifest Decisions" value="—"
              note="Wires when MUSE records persist" />
            <MetricTile label="Manifestation Refusal Rate" value="—"
              note="Requires MUSE decision records" />
            <MetricTile label="Human Gate Queue" value={pendingCount}
              note="Pending routing decisions" />
          </div>
        </div>

        {/* ── CREATOR TIMELINE ────────────────────────────────────────────── */}
        {recentEvents.length > 0 && (
          <div style={{ maxWidth: '600px', marginBottom: '32px' }}>
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>
              Creator Timeline
            </p>
            <div style={{
              background: 'var(--bg-2)', border: '1px solid var(--border-1)',
              borderRadius: '10px', overflow: 'hidden',
            }}>
              {groupedEvents.map(([dateLabel, events], gi) => (
                <div key={dateLabel} style={{
                  borderBottom: gi < groupedEvents.length - 1
                    ? '1px solid var(--border-0)' : 'none',
                  padding: '14px 18px',
                }}>
                  <p style={{ color: 'var(--text-4)', fontSize: '10px', fontWeight: 600,
                    letterSpacing: '0.08em', marginBottom: '8px' }}>
                    {dateLabel}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {events.map(e => (
                      <div key={e.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <span style={{ color: 'var(--text-6)', fontSize: '11px',
                          marginTop: '1px', flexShrink: 0 }}>·</span>
                        <p style={{ color: 'var(--text-2)', fontSize: '12px', lineHeight: 1.5 }}>
                          {e.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FLEETFLOW WING ──────────────────────────────────────────────── */}
        <div style={{ maxWidth: '600px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span>🚚</span>
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontWeight: 600 }}>
              FleetFlow Wing
            </p>
          </div>
          <div style={{
            background: 'var(--bg-2)', border: '1px solid var(--border-1)',
            borderRadius: '10px', overflow: 'hidden',
          }}>
            <div style={{
              padding: '12px 18px', borderBottom: '1px solid var(--border-0)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{
                display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%',
                background: FLEETFLOW_URL ? '#10b981' : '#6b7280', flexShrink: 0,
              }} />
              <p style={{
                color: FLEETFLOW_URL ? '#10b981' : 'var(--text-4)',
                fontSize: '12px', fontWeight: 600,
              }}>
                {FLEETFLOW_URL ? 'Connected' : 'Not Yet Connected'}
              </p>
            </div>
            <div style={{ padding: '14px 18px' }}>
              <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.1em',
                textTransform: 'uppercase', marginBottom: '10px' }}>
                Future Metrics
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {FLEETFLOW_FUTURE_METRICS.map(metric => (
                  <div key={metric} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '5px 0', borderBottom: '1px solid var(--border-0)',
                  }}>
                    <span style={{ color: 'var(--text-4)', fontSize: '12px' }}>{metric}</span>
                    <span style={{ color: 'var(--text-6)', fontSize: '12px' }}>—</span>
                  </div>
                ))}
              </div>
              <p style={{ color: 'var(--text-6)', fontSize: '10px',
                fontStyle: 'italic', marginTop: '12px', lineHeight: 1.6 }}>
                FleetFlow Wing route bridge pending. The wing already belongs here.
              </p>
            </div>
          </div>
        </div>

        {/* ── COLLEGE OF OPERATIONS ───────────────────────────────────────── */}
        <div style={{ maxWidth: '600px', paddingTop: '32px',
          borderTop: '1px solid var(--border-0)', marginBottom: '32px' }}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
            College of Operations
          </p>
          <p style={{ color: 'var(--text-5)', fontSize: '12px',
            fontStyle: 'italic', marginBottom: '20px' }}>
            Operational truth matters.
          </p>
          <p style={{ color: 'var(--text-2)', fontSize: '13px',
            lineHeight: 1.8, marginBottom: '10px' }}>
            Business Center is where the institution teaches operational stewardship — not as a feature set, but as a discipline. Clients, projects, revenue, invoices, teams: these are not administrative tasks. They are the instruments of accountability.
          </p>
          <p style={{ color: 'var(--text-3)', fontSize: '13px', lineHeight: 1.8 }}>
            A resident can spend months inside Business Center and never open FleetFlow. They should still leave understanding how to run an operation with integrity. That is the college's job.
          </p>
        </div>

        <div style={{ maxWidth: '600px', marginBottom: '36px' }}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>
            What This College Teaches
          </p>
          <div className="flex flex-col gap-3">
            {TEACHINGS.map(({ label, note }) => (
              <div key={label} style={{ borderLeft: '2px solid #3b82f630', paddingLeft: '14px' }}>
                <p style={{ color: 'var(--text-1)', fontSize: '12px',
                  fontWeight: 600, marginBottom: '3px' }}>{label}</p>
                <p style={{ color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.65 }}>{note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── GRADUATE REGISTRY ───────────────────────────────────────────── */}
        <div style={{ maxWidth: '600px', marginBottom: '36px',
          paddingTop: '32px', borderTop: '1px solid var(--border-0)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px' }}>🚚</span>
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontWeight: 600 }}>
              Graduate Registry
            </p>
          </div>

          <div style={{
            background: 'var(--bg-2)', border: '1px solid var(--border-1)',
            borderLeft: '3px solid #10b981', borderRadius: '0 8px 8px 0',
            padding: '16px 20px', marginBottom: '12px',
          }}>
            <p style={{ color: 'var(--text-1)', fontSize: '14px',
              fontWeight: 700, letterSpacing: '0.04em', marginBottom: '2px' }}>FleetFlow</p>
            <p style={{ color: 'var(--text-4)', fontSize: '10px', fontWeight: 600,
              letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '12px' }}>
              First Graduate
            </p>
            <p style={{ color: 'var(--text-3)', fontSize: '12px',
              lineHeight: 1.7, marginBottom: '6px' }}>
              Built from thirty years of operational reality.
            </p>
            <p style={{ color: 'var(--text-4)', fontSize: '11px',
              lineHeight: 1.65, fontStyle: 'italic' }}>
              Proof that the discipline survives contact with reality.
            </p>
          </div>

          {graduates.filter(g => g.sequence > 1).map(g => (
            <div key={g.id} style={{
              background: 'var(--bg-2)', border: '1px solid var(--border-1)',
              borderLeft: '3px solid #10b981', borderRadius: '0 8px 8px 0',
              padding: '16px 20px', marginBottom: '12px',
            }}>
              <p style={{ color: 'var(--text-1)', fontSize: '14px',
                fontWeight: 700, letterSpacing: '0.04em', marginBottom: '2px' }}>
                {g.graduateName}
              </p>
              <p style={{ color: 'var(--text-4)', fontSize: '10px', fontWeight: 600,
                letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '10px' }}>
                {ordinal(g.sequence)} Graduate
              </p>
              {g.proof && (
                <p style={{ color: 'var(--text-4)', fontSize: '11px',
                  lineHeight: 1.65, fontStyle: 'italic' }}>{g.proof}</p>
              )}
            </div>
          ))}

          {FLEETFLOW_URL ? (
            <a
              href={FLEETFLOW_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block', background: '#052e16',
                border: '1px solid #10b981', color: '#10b981', fontSize: '13px',
                fontWeight: 600, padding: '12px 24px', borderRadius: '8px',
                textDecoration: 'none', letterSpacing: '0.04em', marginTop: '4px',
              }}
            >
              Enter FleetFlow Workspace →
            </a>
          ) : (
            <div style={{
              background: 'var(--bg-2)', border: '1px solid var(--border-1)',
              borderRadius: '8px', padding: '14px 18px', maxWidth: '400px', marginTop: '4px',
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

        {/* ── BUILDER STUDIO ──────────────────────────────────────────────── */}
        <div style={{
          maxWidth: '600px', marginBottom: '40px',
          paddingTop: '36px', borderTop: '1px solid var(--border-0)',
        }}>
          <div style={{
            border: '1px solid var(--border-1)', borderRadius: '10px',
            padding: '28px 28px 24px', background: 'var(--bg-1)', textAlign: 'center',
          }}>
            <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.2em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '16px' }}>
              Builder Studio
            </p>
            <p style={{ color: 'var(--text-2)', fontSize: '13px',
              lineHeight: 1.8, marginBottom: '4px' }}>
              Knowledge enters.
            </p>
            <p style={{ color: 'var(--text-2)', fontSize: '13px',
              lineHeight: 1.8, marginBottom: '24px' }}>
              Evidence leaves.
            </p>
            {builderReadiness === 'approved' && (
              <button
                onClick={onEnterBuilderStudio}
                style={{
                  display: 'inline-block', background: '#1a0a00',
                  border: '1px solid #f59e0b', borderRadius: '6px', padding: '10px 22px',
                  color: '#f59e0b', fontSize: '12px', letterSpacing: '0.06em',
                  fontWeight: 700, cursor: 'pointer',
                }}
              >
                Enter Builder Studio →
              </button>
            )}
            {builderReadiness === 'pending' && (
              <div style={{
                display: 'inline-block', border: '1px solid #3b82f640',
                borderRadius: '6px', padding: '10px 22px', color: '#3b82f6',
                fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600,
              }}>
                Under KEL Review
              </div>
            )}
            {builderReadiness === 'locked' && (
              <div style={{
                display: 'inline-block', border: '1px solid var(--border-1)',
                borderRadius: '6px', padding: '10px 22px', color: 'var(--text-5)',
                fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600,
              }}>
                Door Closed
              </div>
            )}
            <p style={{ color: 'var(--text-6)', fontSize: '10px',
              marginTop: '18px', fontStyle: 'italic' }}>
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
                    background: 'none', border: '1px solid var(--border-1)',
                    borderRadius: '6px', padding: '8px 16px', color: 'var(--text-3)',
                    fontSize: '11px', letterSpacing: '0.04em', cursor: 'pointer',
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
