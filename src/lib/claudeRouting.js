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
    throw new Error(err.error?.message || `HTTP ${res.status}`)
  }

  const data = await res.json()
  const raw = data.content?.[0]?.text || '{}'
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1) throw new Error('No JSON in response')

  const result = JSON.parse(raw.slice(start, end + 1))
  if (!result.destination || !result.constellation) throw new Error('Incomplete response')
  return result
}
