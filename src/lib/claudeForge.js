import { callClaude } from './anthropicProxy'

const MODEL = 'claude-haiku-4-5-20251001'

const SYSTEM = `You are PACER's Forge — the artifact manufacturing layer for JPG Ventures LLC.

You receive an approved institutional decision and manufacture a Recommended Action Package.

Return ONLY valid JSON. No markdown, no explanation.

Structure the artifact based on domain:

FleetFlow (moving industry, fleet management, field operations, logistics):
{
  "title": "Short action title (6-10 words)",
  "actionSummary": "2-3 sentence summary of what needs to happen and why",
  "taskList": ["specific task 1", "specific task 2", "specific task 3", "specific task 4"],
  "outreachDraft": "Draft message, email opening, or communication template relevant to this action",
  "successMetric": "One sentence: what does success look like when this is done?"
}

Isles of the Awakening (dark cinematic graphic novel, mythology, world-building, characters):
{
  "title": "Short concept title (4-8 words)",
  "conceptSummary": "2-3 sentence creative brief for this concept or story element",
  "nextCreativeStep": "The single most important next creative action to develop this",
  "expansionQuestions": ["question that deepens this concept", "question that tests the mythology", "question that reveals character"],
  "productionRecommendation": "One sentence: what production format should this become first (script, visual, audio, etc.)?"
}

All other domains (Business, Doctrine, Content, Strategy):
{
  "title": "Short initiative title (5-8 words)",
  "strategicSummary": "2-3 sentence overview of the strategic intent",
  "recommendedAction": "The single most important next action",
  "stakeholders": ["person or role 1", "person or role 2"],
  "followUpSteps": ["next step 1", "next step 2", "next step 3"]
}`

export async function generateForgeArtifact(thread, apiKey) {
  const lines = []
  lines.push(`Decision: ${thread.recommendation}`)
  if (thread.domain)       lines.push(`Domain: ${thread.domain}`)
  if (thread.constellation) lines.push(`Constellation: ${thread.constellation}`)
  if (thread.reasoning)    lines.push(`Reasoning: ${thread.reasoning}`)
  if (thread.observationText) lines.push(`Source: ${thread.observationText}`)

  const data = await callClaude({
    model: MODEL,
    max_tokens: 600,
    system: SYSTEM,
    messages: [{ role: 'user', content: lines.join('\n') }],
  }, apiKey)

  const raw = data.content?.[0]?.text || '{}'
  const start = raw.indexOf('{')
  const end   = raw.lastIndexOf('}')
  if (start === -1) throw new Error('No JSON in forge response')

  const result = JSON.parse(raw.slice(start, end + 1))
  if (!result.title) throw new Error('Incomplete forge response')

  // Normalize: tag with domain so renderer knows which template was used
  result.domain = thread.domain || null
  return result
}
