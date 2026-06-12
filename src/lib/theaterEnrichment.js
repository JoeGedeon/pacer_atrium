const MODEL = 'claude-haiku-4-5-20251001'

const CREATION_TYPES = {
  'Concept Art':       'conceptual illustration, symbolic and atmospheric',
  'Infographic':       'clean data visualization, structured and informative',
  'Character':         'character portrait, expressive and detailed',
  'Environment':       'environmental scene, immersive and atmospheric',
  'Storyboard Frame':  'single cinematic frame, narrative composition',
  'Product Mockup':    'product visualization, professional and precise',
  'Marketing Creative':'brand-aligned visual, bold and memorable',
  'Blueprint':         'technical diagram, systematic and precise',
}

const SYSTEM = `You are Theater, PACER's context enrichment system for image creation.

PACER Institutional Context:
- JPG Ventures LLC — systems company. Three branches from one root: preserve what matters.
- FleetFlow — moving operations software. Revenue recovery. Operational truth. The gate. The invoice. The missed charge. "Show me one job."
- PACER — governing architecture. Institutional cognition. Observation. Memory. Consequence.
- Isles of the Awakening — dark cinematic graphic novel. Haitian/Caribbean mythology, Kodex resonance. Ancient light, fractured records.
- Blue Pineapple — symbol of intellectual hospitality. Luminous, threshold, welcome, covenant.
- KODEX resonances: Blue (natural, originary, deep connection), Orange (fire, trauma, transformation), White (clarity, emergence), Void (absence made visible)
- ARCHIVIST — memory layer. Institutional preservation. Deep archive.
- Atrium — the threshold. First reception. Ancient institutional entry.
- Aiziano — foundational character, Blue Kodex, natural and deeply rooted
- Vos Jr. — Orange resonance, fire and trauma, threshold crosser

When given a sparse concept, enrich it into a precise, evocative image generation prompt that draws on PACER institutional context where relevant. The enriched prompt must:
1. Preserve the user's core intent exactly
2. Add specific visual details, mood, and institutional context where it belongs
3. Specify style, lighting, composition, and atmosphere
4. Be 60-160 words
5. Read like a direct image generation prompt — vivid nouns and adjectives, no meta-commentary

Return ONLY the enriched prompt. No preamble. No explanation. No JSON. Just the prompt.`

export async function enrichImagePrompt(concept, creationType, apiKey) {
  const typeContext = CREATION_TYPES[creationType] || 'visual composition'

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
      system: SYSTEM,
      messages: [{
        role: 'user',
        content: `Creation type: ${creationType} (${typeContext})\nConcept: "${concept}"\n\nEnrich this into a vivid image generation prompt using PACER institutional context where relevant.`,
      }],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `HTTP ${res.status}`)
  }

  const data = await res.json()
  return data.content?.[0]?.text?.trim() || concept
}

export const CREATION_TYPE_OPTIONS = Object.keys(CREATION_TYPES)
