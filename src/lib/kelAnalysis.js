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

Return valid JSON only — no markdown, no explanation outside the JSON:
{
  "recommendation": "One clear sentence: what the resident should do.",
  "reasoning": "Two to three sentences explaining why, citing what you observed.",
  "domain": "FleetFlow | Isles of the Awakening | Doctrine | Content | Archive",
  "confidence": 0.85,
  "cited": ["brief excerpt from observation 1", "brief excerpt from observation 2"]
}`

export async function requestKELRecommendation(observations, apiKey, { threads = [], commands = [] } = {}) {
  if (!apiKey || observations.length < 2) return null

  const context = observations
    .filter(o => o.text && typeof o.text === 'string')
    .slice(0, 30)
    .map((o, i) => {
      const parts = [`${i + 1}. [${o.type}] ${o.text}`]
      if (o.constellation) parts.push(`  constellation: ${o.constellation}`)
      if (o.destination)   parts.push(`  routed to: ${o.destination}`)
      return parts.join('\n')
    })
    .join('\n\n')

  // Build prior decision context so KEL does not repeat approved work
  const approvedThreads  = threads.filter(t => t.decision === 'approved')
  const activeCommands   = commands.filter(c => ['drafted','analyzing','planned','pending_approval','approved','in_progress'].includes(c.status))
  const closedCommands   = commands.filter(c => ['completed','failed'].includes(c.status))

  let priorContext = ''
  if (approvedThreads.length > 0) {
    priorContext += `\n\nPrior approved decisions — do not repeat these:\n${
      approvedThreads.map((t, i) => `${i + 1}. ${t.recommendation}`).join('\n')
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

  const data = await callClaude({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    system: SYSTEM,
    messages: [{ role: 'user', content: `Observations:\n\n${context}${priorContext}` }],
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

