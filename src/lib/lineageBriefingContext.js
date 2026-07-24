// Pure function — derives a compact briefing block from existing lineage[] and observations[].
// No Firestore reads, no writes, no side effects.
// Returns a string block for injection into system prompts and morning brief context.
// The pulse layer consumes insights, not records.

export function lineageBriefingContext(lineage = [], observations = []) {
  if (lineage.length === 0) return null

  const total = lineage.length

  // Top constellations by publication count
  const constCounts = {}
  for (const l of lineage) {
    if (l.constellation) constCounts[l.constellation] = (constCounts[l.constellation] || 0) + 1
  }
  const topConst = Object.entries(constCounts).sort((a, b) => b[1] - a[1])

  // Most influential observation by publication count
  const obsCounts = {}
  for (const l of lineage) {
    if (l.observationId) obsCounts[l.observationId] = (obsCounts[l.observationId] || 0) + 1
  }
  const topObs = Object.entries(obsCounts).sort((a, b) => b[1] - a[1])

  // Observation-to-publication conversion rate
  const publishedObsIds = new Set(lineage.filter(l => l.observationId).map(l => l.observationId))
  const conversionRate = observations.length > 0
    ? Math.round((publishedObsIds.size / observations.length) * 100)
    : null

  // Recent publication trend (last 30 days)
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
  const recentCount = lineage.filter(l => {
    const t = l.publishedAt instanceof Date ? l.publishedAt : new Date(l.publishedAt || 0)
    return t.getTime() > cutoff
  }).length

  const lines = [`Publication Lineage (${total} total):`]

  if (topConst.length > 0) {
    const [name, count] = topConst[0]
    const pct = Math.round((count / total) * 100)
    lines.push(`Top constellation: ${name} — ${count} of ${total} publications (${pct}%)`)
    if (topConst[1]) {
      const [name2, count2] = topConst[1]
      lines.push(`Second: ${name2} — ${count2} publication${count2 !== 1 ? 's' : ''}`)
    }
  }

  if (topObs.length > 0) {
    const [id, count] = topObs[0]
    const short   = id.slice(0, 4).toUpperCase()
    const pct     = Math.round((count / total) * 100)
    const obs     = observations.find(o => o.id === id)
    const snippet = obs?.text
      ? ` ("${obs.text.length > 60 ? obs.text.slice(0, 60) + '…' : obs.text}")`
      : ''
    lines.push(`Most influential observation: ${short}${snippet} — seeded ${count} of ${total} publications (${pct}%)`)
  }

  if (conversionRate !== null) {
    lines.push(`Conversion rate: ${conversionRate}% of observations have reached publication (${publishedObsIds.size} of ${observations.length})`)
  }

  lines.push(
    recentCount > 0
      ? `Recent publications: ${recentCount} in the past 30 days`
      : `No publications in the past 30 days`
  )

  return lines.join('\n')
}
