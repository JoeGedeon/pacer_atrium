const MODEL = 'claude-haiku-4-5-20251001'

const PACER_CONTEXT = `You are Theater, PACER's production studio. Your role is to stage observations — to transform institutional thoughts into artifacts for audiences.

PACER Institutional Context:
- JPG Ventures LLC — systems company. Three branches from one root: preserve what matters.
- FleetFlow — moving operations software. Revenue recovery. Operational truth. The gate. The invoice. The missed charge. "Show me one job."
- PACER — governing architecture. Institutional cognition. Observation. Memory. Consequence.
- Isles of the Awakening — dark cinematic graphic novel. Haitian/Caribbean mythology, Kodex resonance. Ancient light, fractured records.
- Blue Pineapple — symbol of intellectual hospitality. Luminous, threshold, welcome, covenant.
- KODEX resonances: Blue (natural, originary, deep connection), Orange (fire, trauma, transformation), White (clarity, emergence), Void (absence made visible)
- ARCHIVIST — memory layer. Institutional preservation. Deep archive.
- Atrium — the threshold. First reception. Ancient institutional entry.
- MUSE — the spark. Discovery. The creative director upstream from Theater.
- Aiziano — foundational character, Blue Kodex, natural and deeply rooted
- Vos Jr. — Orange resonance, fire and trauma, threshold crosser

Theater does not create ideas. Theater stages them. MUSE notices. KODEX understands. Theater asks: how should the audience experience this?`

export const FORMATS = [
  {
    id: 'image',
    icon: '🎨',
    label: 'Image',
    note: 'Visual manifestation',
    available: true,
    instruction: 'Enrich this into a vivid, precise image generation prompt. Specify style, lighting, mood, composition, and atmosphere. 60-160 words. Read like a direct image generation prompt — vivid nouns and adjectives, no meta-commentary. Return only the prompt.',
    outputNote: 'Paste into DALL-E, Midjourney, Ideogram, Flux, or any image generator. The staging is the PACER contribution.',
  },
  {
    id: 'story',
    icon: '📖',
    label: 'Story',
    note: 'Written manifestation',
    available: true,
    instruction: 'Stage this as a narrative treatment: a 2-3 sentence premise establishing the world and stakes, the central tension or question, and the emotional arc (where does the audience end up?). Draw on PACER institutional context where it belongs. Return only the treatment — no preamble, no explanation.',
    outputNote: 'Narrative treatment. Develop further, hand to a collaborator, or surface back to MUSE.',
  },
  {
    id: 'infographic',
    icon: '📊',
    label: 'Infographic',
    note: 'Data manifestation',
    available: true,
    instruction: 'Structure this as an infographic outline: a bold header (one striking phrase), 5-6 key insights as tight bullets, and a one-sentence closing statement. Use PACER institutional language where it belongs. Return only the structure — no preamble, no explanation.',
    outputNote: 'Infographic structure. Drop into a slide or hand to a designer.',
  },
  {
    id: 'presentation',
    icon: '📄',
    label: 'Presentation',
    note: 'Slide manifestation',
    available: true,
    instruction: 'Outline this as a 5-slide arc: Slide 1 (Title — one striking phrase), Slides 2-4 (three beats of the core argument, one sentence each), Slide 5 (Close or call to action). Label each slide. Return only the arc — no preamble, no explanation.',
    outputNote: 'Presentation arc. One sentence per slide. Build from here.',
  },
  {
    id: 'video',
    icon: '🎬',
    label: 'Video',
    note: 'Motion Studio — coming',
    available: false,
  },
  {
    id: 'audio',
    icon: '🎵',
    label: 'Audio',
    note: 'Sound Studio — coming',
    available: false,
  },
]

export async function enrichForFormat(observation, formatId, apiKey) {
  const format = FORMATS.find(f => f.id === formatId)
  if (!format || !format.available) throw new Error('Format not available')

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
      max_tokens: 450,
      system: PACER_CONTEXT,
      messages: [{
        role: 'user',
        content: `Observation: "${observation}"\n\n${format.instruction}`,
      }],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `HTTP ${res.status}`)
  }

  const data = await res.json()
  return data.content?.[0]?.text?.trim() || observation
}

// Legacy export kept for any existing callers
export async function enrichImagePrompt(concept, creationType, apiKey) {
  return enrichForFormat(`${creationType}: ${concept}`, 'image', apiKey)
}

export const CREATION_TYPE_OPTIONS = ['Concept Art', 'Infographic', 'Character', 'Environment', 'Storyboard Frame', 'Product Mockup', 'Marketing Creative', 'Blueprint']
