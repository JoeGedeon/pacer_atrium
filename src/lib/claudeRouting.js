import { callClaude } from './anthropicProxy'

const MODEL = 'claude-haiku-4-5-20251001'

const SYSTEM = `You are PACER's routing intelligence inside PACER Atrium.

PACER is the observation and preservation system for JPG Ventures — a Georgia LLC with two primary divisions:
1. FleetFlow — moving industry SaaS: field operations, fleet management, drivers, job sites, labor productivity, customer disputes, claims, gate verification, documentation failures, crew behavior
2. Isles of the Awakening — dark cinematic graphic novel: Haitian/Caribbean mythology, Kodex resonance, characters Aiziano (blue/natural Kodex) and Vos Jr. (orange/fire/trauma), world-building, lore

PACER destinations:
- FleetFlow: Moving industry operations, logistics, field work, driver behavior, customers, labor
- Isles of the Awakening: World-building, characters, mythology, Kodex, lore fragments, narrative beats
- Doctrine: Cross-institutional principles, philosophy, permanent lessons, constitutional frameworks
- Content: External publishing assets — social media, video, music, essays, brand voice, audience-facing
- Archive: Worth preserving, no clear destination yet

Constellation: 2–4 words naming the UNDERLYING PATTERN. Look past the surface topic. "Operational Trust" beats "Accountability Problem." "Threshold Crossing" beats "Change." Be specific and evocative.

Return ONLY valid JSON. No markdown, no explanation:
{
  "medium": "text | voice | image | document | idea",
  "destination": "FleetFlow | Isles of the Awakening | Doctrine | Content | Archive",
  "secondaryDestination": "FleetFlow | Isles of the Awakening | Doctrine | Content | Archive | null",
  "secondaryConfidence": 0.38,
  "constellation": "Pattern Name",
  "confidence": 0.88,
  "reason": "One sentence explaining the routing decision.",
  "suggestions": ["question 1", "question 2", "question 3"]
}

secondaryDestination: the next most likely destination, or null if no meaningful secondary.
secondaryConfidence: confidence score for the secondary destination (0.0 to 1.0).`

const CONVERSATION_SYSTEM = (dateStr, recentObs, recentEvents, emailContext, calendarContext) =>
  `You are PACER — the institutional intelligence for JPG Ventures LLC, a Georgia company.

JPG Ventures has two primary divisions:
- FleetFlow: Moving industry SaaS — fleet ops, job management, driver behavior, claims, documentation
- Isles of the Awakening: Dark cinematic graphic novel — Haitian/Caribbean mythology, characters Aiziano and Vos Jr.

PACER is also a living campus. Rooms: Atrium (observations), MUSE (manifestation decisions), VERA (pattern recognition), Theater (production), Business Center (cockpit), KEL (governance), Archivist Hall (memory), Doctrine (constitutional principles).

You are speaking directly to your founder. Respond conversationally with institutional clarity and presence. Keep responses to 2-4 sentences unless asked for detail. Do not use markdown, bullets, or headers — plain prose only (this is voice output). Be direct and specific. Reference actual data from the context when answering questions about what has happened.

Today: ${dateStr}
${calendarContext ? `\nToday's Calendar:\n${calendarContext}` : ''}
${emailContext ? `\nInbox Status:\n${emailContext}` : ''}

Recent Observations (newest first):
${recentObs || 'None recorded yet.'}

Recent Institution Events:
${recentEvents || 'None recorded yet.'}`

export async function generateInstitutionalPulse(context, apiKey) {
  const { observations = [], productions = [], institutionEvents = [], creatorLogs = [], kelReviews = [], emailContext = null, calendarContext = null } = context

  // PACER institutional data always leads — Google is enrichment, not a dependency
  const museDone    = observations.filter(o => o.claude && !o.destination)
  const unanalyzed  = observations.filter(o => !o.claude && !o.destination)
  const routed      = observations.filter(o => !!o.destination)
  const pendingGate = productions.filter(p => p.humanGateStatus === 'pending')
  const staged      = productions.filter(p => p.status === 'staged')
  const pendingKEL  = kelReviews.filter(r => r.status === 'pending')

  const lines = []
  lines.push(`Observations: ${observations.length} total — ${museDone.length} analyzed by MUSE awaiting routing, ${unanalyzed.length} not yet analyzed, ${routed.length} routed`)
  lines.push(`Productions: ${productions.length} total — ${staged.length} staged, ${pendingGate.length} awaiting Human Gate approval`)
  if (pendingKEL.length > 0) lines.push(`KEL Reviews: ${pendingKEL.length} pending (${pendingKEL.map(r => r.requestType).join(', ')})`)
  if (institutionEvents.length > 0) {
    lines.push(`Recent events: ${institutionEvents.slice(0, 3).map(e => e.title).join('; ')}`)
  }
  // Google context appended only when available — omitted entirely if not connected
  if (calendarContext) lines.push(`\nGoogle Calendar: ${calendarContext}`)
  if (emailContext)    lines.push(`Gmail: ${emailContext}`)
  const summary = lines.join('\n')

  const data = await callClaude({
    model: MODEL,
    max_tokens: 180,
    system: 'You are PACER, the institutional intelligence for JPG Ventures. Deliver a morning brief in exactly four sentences — no more, no fewer. Sentence 1: highest priority, stated as a directive starting with "Your highest priority is..." Sentence 2: secondary priority — the next most important action. Sentence 3: the bottleneck — what is currently blocking institutional flow. Sentence 4: one specific forward recommendation ("Route those items before your first call." "Clear the Human Gate before staging the next production."). If calendar data is provided, weave the most important event into one of the four sentences naturally. Never hedge. Never say what is missing. Never say "I cannot see." No preamble. No headers. Plain prose only. Speak as the institution itself — compressed, decisive, authoritative.',
    messages: [{ role: 'user', content: summary }],
  }, apiKey)

  return data.content?.[0]?.text?.trim() || ''
}

export async function conversationQuery(userText, context, history, apiKey) {
  const { observations = [], institutionEvents = [], dateStr = '', emailContext = null, calendarContext = null } = context

  const recentObs = observations.slice(0, 12).map(o => {
    const date = o.timestamp instanceof Date
      ? o.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : ''
    return `[${date}] ${o.type}: "${(o.text || '').slice(0, 80)}" → ${o.destination || 'unrouted'}${o.constellation ? ` (${o.constellation})` : ''}`
  }).join('\n')

  const recentEvents = institutionEvents.slice(0, 6).map(e => {
    const date = e.createdAt instanceof Date
      ? e.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : ''
    return `[${date}] ${e.title}: ${(e.description || '').slice(0, 100)}`
  }).join('\n')

  const historyMessages = history.slice(-6).map(msg => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.text,
  }))

  const data = await callClaude({
    model: MODEL,
    max_tokens: 350,
    system: CONVERSATION_SYSTEM(dateStr, recentObs, recentEvents, emailContext, calendarContext),
    messages: [
      ...historyMessages,
      { role: 'user', content: userText },
    ],
  }, apiKey)

  return data.content?.[0]?.text?.trim() || ''
}

export async function analyzeObservation(text, apiKey) {
  const data = await callClaude({
    model: MODEL,
    max_tokens: 600,
    system: SYSTEM,
    messages: [{ role: 'user', content: `Observation: "${text}"` }],
  }, apiKey)

  const raw = data.content?.[0]?.text || '{}'
  const start = raw.indexOf('{')
  const end   = raw.lastIndexOf('}')
  if (start === -1) {
    console.error('[PACER routing] No JSON in response:', raw)
    throw new Error('No JSON in response')
  }

  const result = JSON.parse(raw.slice(start, end + 1))
  if (!result.destination || !result.constellation) {
    console.error('[PACER routing] Incomplete response:', result)
    throw new Error('Incomplete response')
  }
  return result
}
