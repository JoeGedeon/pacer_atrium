import { callClaude } from './anthropicProxy'

const SYSTEM = `You are KEL, PACER's recommendation engine.

PACER is the observation and preservation system for JPG Ventures:
- FleetFlow: moving industry SaaS — operations, fleet, drivers, customers, labor, disputes
- Isles of the Awakening: dark cinematic graphic novel — mythology, characters, Kodex, lore
- Doctrine: cross-institutional principles, philosophy, permanent frameworks
- Content: external publishing — social, video, essays, brand voice
- Archive: preservation without active routing

Your role: read the observations and produce exactly ONE actionable recommendation for the resident.

Constraints you must honor:
- You recommend. You do not act.
- One recommendation. Make it count.
- Be specific: "Audit the broker onboarding checklist" beats "improve processes."
- Ground every recommendation in specific observations you can cite.
- If prior approved decisions or active commands are provided, check them FIRST. Do not repeat a recommendation that is already approved, in progress, or has an active command. Find the next highest-leverage item the institution has not yet addressed.
- If everything you would recommend is already approved or in progress, say so directly: report the most important outstanding action — e.g., "Execute the approved command", "Review evidence for the in-progress command", or "Await outcome of approved work before next recommendation."
- If institutional precedent is provided, check it BEFORE generating a new recommendation. When a pattern has a proven resolution, recommend the next step in that pattern's evolution — not a repeat of the resolved step. Cite the precedent in your reasoning. Referencing proven institutional history is stronger than generating a novel suggestion.

Return valid JSON only — no markdown, no explanation outside the JSON:
{
  "recommendation": "One clear sentence: what the resident should do.",
  "reasoning": "Two to three sentences explaining why, citing what you observed.",
  "domain": "FleetFlow | Isles of the Awakening | Doctrine | Content | Archive",
  "confidence": 0.85,
  "cited": ["brief excerpt from observation 1", "brief excerpt from observation 2"]
}`

export async function requestKELRecommendation(observations, apiKey, { threads = [], commands = [], localApprovedRecs = [], approvedThreadObsIds = new Set() } = {}) {
  if (!apiKey || observations.length < 2) return null

  // Resolved constellations: patterns with a completed+successful command.
  const resolvedConstellations = new Set(
    commands
      .filter(c => c.status === 'completed' && ['Success', 'Partial Success'].includes(c.verdict) && c.patternTag)
      .map(c => c.patternTag)
  )

  const textObs = observations.filter(o => o.text && typeof o.text === 'string' && o.status !== 'seed')

  // K.E.L. closure rule — applied BEFORE count, compression, and prompt construction.
  // An observation is closed if: its id is in an approved thread, OR it is routed to a resolved constellation.
  const kelVisibleObs = textObs.filter(o =>
    !(o.id && approvedThreadObsIds.has(o.id)) &&
    !(o.destination && resolvedConstellations.has(o.constellation))
  )

  // Historical obs go to background context only — not open work.
  const historicalObs = textObs.filter(o =>
    (o.id && approvedThreadObsIds.has(o.id)) ||
    (o.destination && resolvedConstellations.has(o.constellation))
  )

  if (kelVisibleObs.length < 2 && textObs.length < 2) return null

  const feedObs = kelVisibleObs.length >= 2 ? kelVisibleObs : textObs

  // Separate tagged and untagged from the visible feed.
  const taggedObs = feedObs.filter(o => o.constellation)

  // Deduplicate untagged observations before count, before prompt.
  // Normalize: lowercase, strip punctuation, collapse whitespace, first 160 chars.
  const seenKeys = new Set()
  const dedupedUntagged = []
  for (const o of feedObs.filter(o => !o.constellation)) {
    const key = o.text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 160)
    if (!seenKeys.has(key)) { seenKeys.add(key); dedupedUntagged.push(o) }
  }

  // Compress: group tagged observations by constellation, send untagged individually.
  const constellationGroups = {}
  for (const o of taggedObs.slice(0, 25)) {
    if (!constellationGroups[o.constellation]) constellationGroups[o.constellation] = []
    constellationGroups[o.constellation].push(o)
  }

  const constellationLines = Object.entries(constellationGroups).map(([name, obs]) => {
    const routed   = obs.filter(o => o.destination)
    const excerpt  = obs[0].text.slice(0, 120)
    const extra    = obs.length > 1 ? ` (+${obs.length - 1} more observation${obs.length > 2 ? 's' : ''})` : ''
    const routeTag = routed.length > 0 ? ` · routed to: ${[...new Set(routed.map(o => o.destination))].join(', ')}` : ''
    return `◈ ${name} (${obs.length} obs${routeTag})\n  "${excerpt}${obs[0].text.length > 120 ? '…' : ''}"${extra}`
  })

  const untaggedLines = dedupedUntagged.slice(0, 8).map((o, i) => {
    const parts = [`${i + 1}. [${o.type}] ${o.text.slice(0, 150)}${o.text.length > 150 ? '…' : ''}`]
    if (o.destination) parts.push(`  routed to: ${o.destination}`)
    return parts.join('\n')
  })

  const context = [
    constellationLines.length > 0 ? `Named constellations:\n${constellationLines.join('\n\n')}` : '',
    untaggedLines.length > 0     ? `Untagged observations:\n${untaggedLines.join('\n\n')}` : '',
  ].filter(Boolean).join('\n\n')

  const activeCommands = commands.filter(c => ['drafted','analyzing','planned','pending_approval','approved','in_progress'].includes(c.status))
  const closedCommands = commands.filter(c => ['completed','failed'].includes(c.status))

  let priorContext = ''

  // Merge Firestore-persisted approvals + session-local approvals (bridges async listener gap)
  const persistedApprovals = threads.filter(t => t.decision === 'approved').map(t => t.recommendation)
  const allApprovedRecs = [...new Set([...persistedApprovals, ...localApprovedRecs])]
  if (allApprovedRecs.length > 0) {
    priorContext += `\n\nPrior approved decisions — do not repeat these:\n${
      allApprovedRecs.map((r, i) => `${i + 1}. ${r}`).join('\n')
    }`
  }

  if (activeCommands.length > 0) {
    priorContext += `\n\nActive commands currently in flight:\n${
      activeCommands.map((c, i) => `${i + 1}. [${c.status}] ${c.title}${c.intent ? ': ' + c.intent.slice(0, 120) : ''}`).join('\n')
    }`
  }
  if (closedCommands.length > 0) {
    priorContext += `\n\nClosed commands — these are COMPLETE, do not generate evidence review recommendations for these:\n${
      closedCommands.map((c, i) => `${i + 1}. [${c.status}] ${c.title}${c.result ? ' — ' + c.result.slice(0, 80) : ''}`).join('\n')
    }`
  }

  // Historical observations — background context only, not open work
  if (historicalObs.length > 0) {
    priorContext += `\n\nAlready acted on (approved decision exists — do NOT use as basis for new recommendation):\n${
      historicalObs.slice(0, 12).map((o, i) => `${i + 1}. ${o.text.slice(0, 80)}`).join('\n')
    }`
  }

  // Institutional precedent — patterns with proven resolution
  const precedentMap = {}
  commands
    .filter(c => c.status === 'completed' && c.patternTag && ['Success', 'Partial Success'].includes(c.verdict))
    .forEach(c => {
      if (!precedentMap[c.patternTag]) precedentMap[c.patternTag] = []
      precedentMap[c.patternTag].push(c)
    })
  if (Object.keys(precedentMap).length > 0) {
    priorContext += `\n\nInstitutional precedent — patterns with proven resolution (reference before inventing new approaches):\n${
      Object.entries(precedentMap).map(([tag, cmds]) => {
        const best = cmds.find(c => c.verdict === 'Success') || cmds[0]
        const crit = best.criteriaTotal > 0 ? `, criteria: ${best.criteriaAchieved}/${best.criteriaTotal}` : ''
        const successCount = cmds.filter(c => c.verdict === 'Success').length
        const rate = Math.round((successCount / cmds.length) * 100)
        return `- ${tag}: ${cmds.length} resolution(s), ${rate}% Success rate — e.g. "${best.title}" (${best.verdict}${crit})`
      }).join('\n')
    }`
  }

  const activeCount = taggedObs.length + dedupedUntagged.length
  const data = await callClaude({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    system: SYSTEM,
    messages: [{ role: 'user', content: `New unresolved observations (${activeCount} not yet acted on):\n\n${context}${priorContext}` }],
  }, apiKey)

  const raw = data.content?.[0]?.text || ''
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) {
    console.error('[KEL] No JSON in response:', raw)
    throw new Error('No JSON in response')
  }
  const result = JSON.parse(match[0])
  if (!result.recommendation || !result.domain) throw new Error('Incomplete response')
  return result
}
