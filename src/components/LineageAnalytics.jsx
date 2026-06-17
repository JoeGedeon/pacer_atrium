// Pure derived analytics layer over lineage[] state.
// No Firestore reads, no writes, no side effects.
// mode='operational' → OpsCore framing: "What should we do more of?"
// mode='historical'  → Archivist Hall framing: "What mattered most?"

import { useMemo } from 'react'

function shortId(id) {
  return id ? id.slice(0, 4).toUpperCase() : '—'
}

function fmtDate(d) {
  if (!d) return ''
  const date = d instanceof Date ? d : new Date(d)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const LABEL = {
  fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase',
  fontWeight: 700, color: 'var(--text-6)', marginBottom: '10px',
}

const CARD = {
  background: '#04080f', border: '1px solid #6366f118',
  borderRadius: '8px', padding: '16px 18px', marginBottom: '10px',
}

function MetricCard({ label, value, sub, accent = '#6366f1' }) {
  return (
    <div style={{ ...CARD, borderLeft: `3px solid ${accent}` }}>
      <p style={{ color: 'var(--text-5)', fontSize: '10px', marginBottom: '4px' }}>{label}</p>
      <p style={{ color: accent, fontSize: '24px', fontWeight: 700, lineHeight: 1.1 }}>{value}</p>
      {sub && <p style={{ color: 'var(--text-6)', fontSize: '10px', marginTop: '3px' }}>{sub}</p>}
    </div>
  )
}

function BarRow({ label, count, max, accent = '#6366f1', note }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ color: 'var(--text-3)', fontSize: '11px', flex: 1, marginRight: '8px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </span>
        <span style={{ color: accent, fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>{count}</span>
      </div>
      <div style={{ height: '3px', background: '#ffffff0a', borderRadius: '2px' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: accent, borderRadius: '2px',
          transition: 'width 0.4s ease' }} />
      </div>
      {note && <p style={{ color: 'var(--text-6)', fontSize: '9px', marginTop: '3px' }}>{note}</p>}
    </div>
  )
}

function FunnelStep({ label, count, total, accent }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0',
      borderBottom: '1px solid #ffffff06' }}>
      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: accent, flexShrink: 0 }} />
      <span style={{ color: 'var(--text-4)', fontSize: '10px', flex: 1 }}>{label}</span>
      <span style={{ color: accent, fontSize: '11px', fontWeight: 700 }}>{count}</span>
      <span style={{ color: 'var(--text-6)', fontSize: '10px', width: '36px', textAlign: 'right' }}>
        {pct}%
      </span>
    </div>
  )
}

export default function LineageAnalytics({ lineage = [], observations = [], mode = 'operational' }) {
  const metrics = useMemo(() => {
    if (lineage.length === 0) return null

    // Top observations by publication count
    const obsCounts = {}
    for (const l of lineage) {
      if (l.observationId) obsCounts[l.observationId] = (obsCounts[l.observationId] || 0) + 1
    }
    const topObs = Object.entries(obsCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

    // Top constellations by publication count
    const constCounts = {}
    for (const l of lineage) {
      if (l.constellation) constCounts[l.constellation] = (constCounts[l.constellation] || 0) + 1
    }
    const topConst = Object.entries(constCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

    // Conversion rate: unique observations that reached publication / total observations
    const publishedObsIds = new Set(lineage.filter(l => l.observationId).map(l => l.observationId))
    const conversionRate = observations.length > 0
      ? Math.round((publishedObsIds.size / observations.length) * 100)
      : null

    // Promotion funnel: how many lineage records contain each step
    const total = lineage.length
    const funnel = {
      observation: lineage.filter(l => l.observationId).length,
      thread:      lineage.filter(l => l.threadId).length,
      muse:        lineage.filter(l => l.museWorkId).length,
      production:  lineage.filter(l => l.productionId).length,
      asset:       lineage.filter(l => l.assetId).length,
    }

    // Longest chain (most steps in path[])
    const longest = [...lineage].sort((a, b) => (b.path?.length ?? 0) - (a.path?.length ?? 0))[0]

    // Recent 5 publications
    const recent = [...lineage]
      .sort((a, b) => {
        const ta = a.publishedAt instanceof Date ? a.publishedAt : new Date(a.publishedAt || 0)
        const tb = b.publishedAt instanceof Date ? b.publishedAt : new Date(b.publishedAt || 0)
        return tb - ta
      })
      .slice(0, 5)

    return { topObs, topConst, conversionRate, funnel, total, longest, recent, publishedObsIds }
  }, [lineage, observations])

  if (lineage.length === 0) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-4)', fontSize: '13px', marginBottom: '6px' }}>
          No lineage records yet.
        </p>
        <p style={{ color: 'var(--text-6)', fontSize: '11px', lineHeight: 1.7 }}>
          Lineage is written when a production or asset is published from Theater.
        </p>
      </div>
    )
  }

  if (!metrics) return null

  const { topObs, topConst, conversionRate, funnel, total, longest, recent } = metrics

  if (mode === 'operational') {
    const maxObs   = topObs[0]?.[1]   || 1
    const maxConst = topConst[0]?.[1] || 1

    return (
      <div style={{ padding: '20px 0' }}>

        {/* ── Row 1: summary metrics ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
          <MetricCard
            label="Publications"
            value={total}
            sub={`${observations.length} observations total`}
            accent="#6366f1"
          />
          <MetricCard
            label="Observation → Publication"
            value={conversionRate !== null ? `${conversionRate}%` : '—'}
            sub={`${metrics.publishedObsIds.size} unique observations reached publish`}
            accent="#10b981"
          />
        </div>

        {/* ── Top Constellations ── */}
        {topConst.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <p style={LABEL}>Top Constellations</p>
            {topConst.map(([name, count]) => (
              <BarRow key={name} label={name} count={count} max={maxConst} accent="#f59e0b" />
            ))}
          </div>
        )}

        {/* ── Top Originating Observations ── */}
        {topObs.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <p style={LABEL}>Top Originating Observations</p>
            {topObs.map(([id, count]) => (
              <BarRow
                key={id}
                label={shortId(id)}
                count={count}
                max={maxObs}
                accent="#6366f1"
                note={`Observation ${shortId(id)} seeded ${count} publication${count !== 1 ? 's' : ''}`}
              />
            ))}
          </div>
        )}

        {/* ── Promotion Funnel ── */}
        <div style={{ marginBottom: '12px' }}>
          <p style={LABEL}>Promotion Funnel</p>
          <div style={{ ...CARD, padding: '8px 18px' }}>
            <FunnelStep label="Originated from Observation" count={funnel.observation} total={total} accent="#6366f1" />
            <FunnelStep label="Promoted through Thread"     count={funnel.thread}      total={total} accent="#8b5cf6" />
            <FunnelStep label="Developed in MUSE Work"      count={funnel.muse}        total={total} accent="#a855f7" />
            <FunnelStep label="Packaged as Production"      count={funnel.production}  total={total} accent="#3b82f6" />
            <FunnelStep label="Published as Asset"          count={funnel.asset}       total={total} accent="#10b981" />
          </div>
        </div>

      </div>
    )
  }

  // mode === 'historical'
  const topConst1 = topConst[0]
  const topObs1   = topObs[0]

  return (
    <div style={{ padding: '20px 0' }}>

      {/* ── Headline metrics ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
        {topConst1 && (
          <MetricCard
            label="Highest Impact Constellation"
            value={topConst1[1]}
            sub={topConst1[0]}
            accent="#f59e0b"
          />
        )}
        {topObs1 && (
          <MetricCard
            label="Most Influential Observation"
            value={shortId(topObs1[0])}
            sub={`${topObs1[1]} publication${topObs1[1] !== 1 ? 's' : ''} originated here`}
            accent="#6366f1"
          />
        )}
      </div>

      {/* ── Longest chain ── */}
      {longest && (
        <div style={{ ...CARD, marginBottom: '24px' }}>
          <p style={LABEL}>Longest Lineage Chain</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
            <span style={{ color: '#818cf8', fontSize: '22px', fontWeight: 700 }}>
              {longest.path?.length ?? 0}
            </span>
            <span style={{ color: 'var(--text-5)', fontSize: '11px' }}>steps</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {(longest.path ?? []).map(step => (
              <span key={step} style={{
                background: '#6366f112', border: '1px solid #6366f130',
                borderRadius: '4px', padding: '2px 8px',
                color: '#818cf8', fontSize: '10px',
              }}>
                {step}
              </span>
            ))}
          </div>
          {longest.constellation && (
            <p style={{ color: 'var(--text-6)', fontSize: '10px', marginTop: '8px',
              fontStyle: 'italic' }}>
              via {longest.constellation}
            </p>
          )}
        </div>
      )}

      {/* ── Recent Published History ── */}
      {recent.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <p style={LABEL}>Recent Published History</p>
          {recent.map((l, i) => (
            <div key={l.id || i} style={{ ...CARD, padding: '10px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '8px', marginBottom: '4px' }}>
                <span style={{ color: '#10b981', fontSize: '10px', fontWeight: 600 }}>
                  ◎ Published
                </span>
                <span style={{ color: 'var(--text-6)', fontSize: '10px' }}>
                  {fmtDate(l.publishedAt)}
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {l.observationId && (
                  <code style={{ color: '#818cf8', fontSize: '10px', fontFamily: 'monospace' }}>
                    OBS·{shortId(l.observationId)}
                  </code>
                )}
                {l.threadId && (
                  <code style={{ color: '#818cf8', fontSize: '10px', fontFamily: 'monospace' }}>
                    THR·{shortId(l.threadId)}
                  </code>
                )}
                {l.productionId && (
                  <code style={{ color: '#818cf8', fontSize: '10px', fontFamily: 'monospace' }}>
                    PRD·{shortId(l.productionId)}
                  </code>
                )}
              </div>
              {l.constellation && (
                <p style={{ color: '#a07830', fontSize: '10px', marginTop: '4px', fontStyle: 'italic' }}>
                  ✦ {l.constellation}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── All Constellations summary ── */}
      {topConst.length > 0 && (
        <div>
          <p style={LABEL}>Constellation Impact</p>
          {topConst.map(([name, count]) => (
            <BarRow key={name} label={name} count={count} max={topConst[0][1]} accent="#f59e0b" />
          ))}
        </div>
      )}

    </div>
  )
}
