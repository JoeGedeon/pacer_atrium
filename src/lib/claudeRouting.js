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
  const { observations = [], productions = [], institutionEvents = [], creatorLogs = [], emailContext = null, calendarContext = null } = context

  const summary = [
    `Observations: ${observations.length} total, ${observations.filter(o => !o.destination).length} unrouted, ${observations.filter(o => o.claude).length} analyzed by MUSE`,
    `Productions: ${productions.length} total, ${productions.filter(p => p.status === 'staged').length} staged, ${productions.filter(p => p.humanGateStatus === 'pending').length} awaiting Human Gate approval`,
    `Institution events this session: ${institutionEvents.slice(0, 3).map(e => e.title).join('; ') || 'none'}`,
    `Calendar entries logged: ${creatorLogs.length}`,
    emailContext    ? `Email: ${emailContext}`    : 'Email: not connected',
    calendarContext ? `Calendar: ${calendarContext}` : 'Calendar: not connected',
  ].join('\n')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 200,
      system: 'You are PACER\'s institutional intelligence delivering a personal executive briefing. Write 3-5 declarative sentences. Lead with what matters most to the person RIGHT NOW in this order: (1) if calendar events exist, name specific upcoming events with times — "You have a FleetFlow demo at 10:00 AM"; (2) if email priority items exist, name them specifically — "Two FleetFlow opportunities in inbox. One message requires a response."; (3) brief campus state — active observations, pending decisions, productions awaiting approval. Be specific, not abstract. Never say "calendar capacity available" or "email connected" — say what is actually in the calendar and inbox. No preamble. No headers. Plain prose only.',
      messages: [{ role: 'user', content: summary }],
    }),
  })

  if (!res.ok) throw new Error('Pulse failed')
  const data = await res.json()
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

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 350,
      system: CONVERSATION_SYSTEM(dateStr, recentObs, recentEvents, emailContext, calendarContext),
      messages: [
        ...historyMessages,
        { role: 'user', content: userText },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `HTTP ${res.status}`)
  }

  const data = await res.json()
  return data.content?.[0]?.text?.trim() || ''
}

export async function analyzeObservation(text, apiKey) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 600,
      system: SYSTEM,
      messages: [{ role: 'user', content: `Observation: "${text}"` }],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err.error?.message || `HTTP ${res.status}`
    console.error('[PACER routing] Claude API error:', res.status, err)
    throw new Error(msg)
  }

  const data = await res.json()
  const raw = data.content?.[0]?.text || '{}'
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
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
