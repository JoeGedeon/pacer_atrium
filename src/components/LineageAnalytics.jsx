// Pure derived analytics layer over lineage[] state.
// No Firestore reads, no writes, no side effects, no AI calls.
// mode='operational' → OpsCore framing: "What should we do more of?"
// mode='historical'  → Archivist Hall framing: narrative institutional memory

import { useMemo } from 'react'

function shortId(id) {
  return id ? id.slice(0, 4).toUpperCase() : '—'
}

function fmtDate(d) {
  if (!d) return ''
  const date = d instanceof Date ? d : new Date(d)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function gapPhrase(ms) {
  const days = Math.floor(ms / 86400000)
  if (days < 1)   return 'less than a day'
  if (days === 1) return 'one day'
  if (days < 7)   return `${days} days`
  const weeks = Math.floor(days / 7)
  if (days < 30)  return `${weeks} week${weeks !== 1 ? 's' : ''}`
  const months = Math.floor(days / 30)
  if (days < 365) return `${months} month${months !== 1 ? 's' : ''}`
  const years = Math.floor(days / 365)
  return `${years} year${years !== 1 ? 's' : ''}`
}

// ── Shared style tokens ─────────────────────────────────────────────────────

const LABEL = {
  fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase',
  fontWeight: 700, color: 'var(--text-6)', marginBottom: '10px',
}

const CARD = {
  background: '#04080f', border: '1px solid #6366f118',
  borderRadius: '8px', padding: '16px 18px', marginBottom: '10px',
}

// ── Operational-mode sub-components ─────────────────────────────────────────

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

// ── Historical-mode sub-components ──────────────────────────────────────────

const STEP_LABEL = {
  observation: 'Observation',
  command:     'K.E.L. Command',
  thread:      'Thread',
  muse:        'MUSE',
  production:  'Production',
  asset:       'Asset',
}

const STEP_ACCENT = {
  observation: '#6366f1',
  command:     '#0ea5e9',
  thread:      '#8b5cf6',
  muse:        '#a855f7',
  production:  '#3b82f6',
  asset:       '#10b981',
}

const FIELD_MAP = {
  observation: 'observationId',
  command:     'commandId',
  thread:      'threadId',
  muse:        'museWorkId',
  production:  'productionId',
  asset:       'assetId',
}

function PathTrace({ path = [], record }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap',
      gap: '4px', marginBottom: '14px' }}>
      {path.map((step, i) => {
        const id     = record[FIELD_MAP[step]]
        const accent = STEP_ACCENT[step] || '#6366f1'
        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{
              background: `${accent}18`, border: `1px solid ${accent}40`,
              borderRadius: '4px', padding: '3px 9px',
              color: accent, fontSize: '10px', fontWeight: 600, whiteSpace: 'nowrap',
            }}>
              {STEP_LABEL[step]}
              {id && (
                <code style={{ opacity: 0.65, marginLeft: '5px', fontFamily: 'monospace', fontSize: '9px' }}>
                  {shortId(id)}
                </code>
              )}
            </span>
            {i < path.length - 1 && (
              <span style={{ color: 'var(--text-6)', fontSize: '10px' }}>→</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function NarrativeCard({ eyebrow, headline, accent = '#6366f1', children }) {
  return (
    <div style={{
      background: '#030710',
      border: '1px solid #ffffff08',
      borderLeft: `3px solid ${accent}`,
      borderRadius: '0 8px 8px 0',
      padding: '18px 20px',
      marginBottom: '14px',
    }}>
      <p style={{
        color: accent, fontSize: '9px', letterSpacing: '0.16em',
        textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px', opacity: 0.85,
      }}>
        {eyebrow}
      </p>
      <p style={{ color: 'var(--text-1)', fontSize: '14px', fontWeight: 700,
        letterSpacing: '-0.01em', marginBottom: '12px', lineHeight: 1.3 }}>
        {headline}
      </p>
      {children}
    </div>
  )
}

function Prose({ children }) {
  return (
    <p style={{ color: 'var(--text-4)', fontSize: '12px', lineHeight: 1.8 }}>
      {children}
    </p>
  )
}

function ObsQuote({ text }) {
  if (!text) return null
  const excerpt = text.length > 200 ? text.slice(0, 200) + '…' : text
  return (
    <div style={{
      borderLeft: '2px solid #6366f130', paddingLeft: '12px', marginBottom: '12px',
    }}>
      <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.75, fontStyle: 'italic' }}>
        "{excerpt}"
      </p>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

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

    // Promotion funnel
    const total = lineage.length
    const funnel = {
      observation: lineage.filter(l => l.observationId).length,
      command:     lineage.filter(l => l.commandId).length,
      thread:      lineage.filter(l => l.threadId).length,
      muse:        lineage.filter(l => l.museWorkId).length,
      production:  lineage.filter(l => l.productionId).length,
      asset:       lineage.filter(l => l.assetId).length,
    }

    // Journey: record with most steps (most complete path)
    const journey = [...lineage].sort((a, b) => (b.path?.length ?? 0) - (a.path?.length ?? 0))[0]

    // First published (earliest publishedAt)
    const byDate = [...lineage]
      .filter(l => l.publishedAt)
      .sort((a, b) => {
        const ta = a.publishedAt instanceof Date ? a.publishedAt : new Date(a.publishedAt)
        const tb = b.publishedAt instanceof Date ? b.publishedAt : new Date(b.publishedAt)
        return ta - tb
      })
    const firstPublished = byDate[0] || null

    // Longest seed-to-publish gap — cross-references observations[] for original timestamp
    const withGap = lineage
      .filter(l => l.observationId && l.publishedAt)
      .map(l => {
        const obs = observations.find(o => o.id === l.observationId)
        if (!obs?.timestamp) return null
        const obsTime = obs.timestamp instanceof Date ? obs.timestamp : new Date(obs.timestamp)
        const pubTime = l.publishedAt instanceof Date ? l.publishedAt : new Date(l.publishedAt)
        const gapMs = pubTime - obsTime
        if (gapMs <= 0) return null
        return { record: l, gapMs, obsTimestamp: obsTime }
      })
      .filter(Boolean)
      .sort((a, b) => b.gapMs - a.gapMs)
    const longestGap = withGap[0] || null

    // Turning point: the most influential observation's full text
    const turningPointId  = topObs[0]?.[0] || null
    const turningPointObs = turningPointId
      ? observations.find(o => o.id === turningPointId) || null
      : null

    return {
      topObs, topConst, conversionRate, funnel, total,
      journey, firstPublished, longestGap, turningPointObs, publishedObsIds,
    }
  }, [lineage, observations])

  if (lineage.length === 0) {
    return (
      <div style={{ padding: '48px 24px', maxWidth: '480px', margin: '0 auto' }}>
        <p style={{ color: 'var(--text-4)', fontSize: '13px', marginBottom: '8px', lineHeight: 1.7 }}>
          Your institution has not yet produced a published outcome worth preserving.
        </p>
        <p style={{ color: 'var(--text-6)', fontSize: '11px', lineHeight: 1.75 }}>
          Completed commands, published productions, and documented successes become lineage records. The first finished outcome will appear here.
        </p>
      </div>
    )
  }

  if (!metrics) return null

  const { topObs, topConst, conversionRate, funnel, total,
    journey, firstPublished, longestGap, turningPointObs, publishedObsIds } = metrics

  // ── Operational mode ─────────────────────────────────────────────────────

  if (mode === 'operational') {
    const maxObs   = topObs[0]?.[1]   || 1
    const maxConst = topConst[0]?.[1] || 1

    return (
      <div style={{ padding: '20px 0' }}>

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
            sub={`${publishedObsIds.size} unique observations reached publish`}
            accent="#10b981"
          />
        </div>

        {topConst.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <p style={LABEL}>Top Constellations</p>
            {topConst.map(([name, count]) => (
              <BarRow key={name} label={name} count={count} max={maxConst} accent="#f59e0b" />
            ))}
          </div>
        )}

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

        <div style={{ marginBottom: '12px' }}>
          <p style={LABEL}>Promotion Funnel</p>
          <div style={{ ...CARD, padding: '8px 18px' }}>
            <FunnelStep label="Originated from Observation" count={funnel.observation} total={total} accent="#6366f1" />
            <FunnelStep label="Executed as K.E.L. Command" count={funnel.command}     total={total} accent="#0ea5e9" />
            <FunnelStep label="Promoted through Thread"     count={funnel.thread}      total={total} accent="#8b5cf6" />
            <FunnelStep label="Developed in MUSE Work"      count={funnel.muse}        total={total} accent="#a855f7" />
            <FunnelStep label="Packaged as Production"      count={funnel.production}  total={total} accent="#3b82f6" />
            <FunnelStep label="Published as Asset"          count={funnel.asset}       total={total} accent="#10b981" />
          </div>
        </div>

      </div>
    )
  }

  // ── Historical mode — narrative institutional memory ──────────────────────

  const topConst1 = topConst[0]
  const topObs1   = topObs[0]

  // Historically notable: prefer longest gap (shows patience), fall back to first publication
  const notable = longestGap
    ? { type: 'gap',   ...longestGap }
    : firstPublished
    ? { type: 'first', record: firstPublished }
    : null

  return (
    <div style={{ padding: '20px 0' }}>

      {/* ── 1. Publication Journey ── */}
      {journey && (
        <NarrativeCard
          eyebrow="◎ Publication Journey"
          headline={
            journey.constellation
              ? `${journey.constellation} · ${journey.path?.length ?? 0}-step path`
              : `${journey.path?.length ?? 0}-step publication`
          }
          accent="#6366f1"
        >
          <PathTrace path={journey.path ?? []} record={journey} />
          <Prose>
            {[
              journey.observationId                         && 'An observation entered the system.',
              journey.threadId                              && 'It was promoted through a thread.',
              journey.museWorkId                            && 'MUSE developed it into structured work.',
              journey.productionId                          && 'Theater packaged it as a production.',
              journey.assetId                               && 'It was published as a media asset.',
              journey.constellation                         && `Throughout its journey, it carried the ${journey.constellation} signal.`,
              journey.publishedAt                           && `Published ${fmtDate(journey.publishedAt)}.`,
            ].filter(Boolean).join(' ')}
          </Prose>
        </NarrativeCard>
      )}

      {/* ── 2. Dominant Constellation ── */}
      {topConst1 && (
        <NarrativeCard
          eyebrow="✦ The Dominant Signal"
          headline={topConst1[0]}
          accent="#f59e0b"
        >
          <Prose>
            {(() => {
              const count = topConst1[1]
              const pct   = Math.round((count / total) * 100)
              const out   = [`The institution has returned to this signal ${count} time${count !== 1 ? 's' : ''}.`]
              if (pct === 100 && total > 1)  out.push('Every published work traces back to this constellation.')
              else if (pct >= 50)            out.push(`${pct}% of all publications carry this pattern — more than any other signal in the system.`)
              else if (count >= 3)           out.push('No other signal has appeared as frequently.')
              if (topConst[1]) out.push(`${topConst[1][0]} follows with ${topConst[1][1]}.`)
              return out.join(' ')
            })()}
          </Prose>
        </NarrativeCard>
      )}

      {/* ── 3. The Turning Point ── */}
      {topObs1 && (
        <NarrativeCard
          eyebrow="◈ The Turning Point"
          headline={`Observation ${shortId(topObs1[0])}`}
          accent="#818cf8"
        >
          <ObsQuote text={turningPointObs?.text} />
          <Prose>
            {(() => {
              const count = topObs1[1]
              const pct   = Math.round((count / total) * 100)
              const out   = [
                `This observation seeded ${count} publication${count !== 1 ? 's' : ''} — ${pct}% of everything the institution has published.`,
              ]
              if (turningPointObs?.timestamp) {
                const d = turningPointObs.timestamp instanceof Date
                  ? turningPointObs.timestamp
                  : new Date(turningPointObs.timestamp)
                out.push(`First recorded ${fmtDate(d)}.`)
              }
              if (turningPointObs?.constellation) {
                out.push(`It carried the ${turningPointObs.constellation} constellation.`)
              }
              return out.join(' ')
            })()}
          </Prose>
        </NarrativeCard>
      )}

      {/* ── 4. Historically Notable Chain ── */}
      {notable && notable.type === 'gap' && (
        <NarrativeCard
          eyebrow="⌖ Longest Journey"
          headline={`${gapPhrase(notable.gapMs)} from observation to publication`}
          accent="#10b981"
        >
          <Prose>
            {(() => {
              const r   = notable.record
              const out = [
                `This work spent ${gapPhrase(notable.gapMs)} between first observation and publication — longer than any other in the system.`,
              ]
              if (notable.obsTimestamp) out.push(`Observation recorded ${fmtDate(notable.obsTimestamp)}.`)
              if (r.publishedAt)        out.push(`Published ${fmtDate(r.publishedAt)}.`)
              if (r.constellation)      out.push(`It carried the ${r.constellation} signal throughout.`)
              return out.join(' ')
            })()}
          </Prose>
        </NarrativeCard>
      )}

      {notable && notable.type === 'first' && (
        <NarrativeCard
          eyebrow="◌ First Publication"
          headline={`Published ${fmtDate(notable.record.publishedAt)}`}
          accent="#10b981"
        >
          <Prose>
            {(() => {
              const r   = notable.record
              const out = ['This was the institution\'s first published work.']
              if (r.observationId) out.push(`It originated from Observation ${shortId(r.observationId)}.`)
              if (r.constellation) out.push(`It carried the ${r.constellation} signal.`)
              if (r.path?.length)  out.push(`It completed ${r.path.length} step${r.path.length !== 1 ? 's' : ''} to reach publication.`)
              return out.join(' ')
            })()}
          </Prose>
        </NarrativeCard>
      )}

    </div>
  )
}
