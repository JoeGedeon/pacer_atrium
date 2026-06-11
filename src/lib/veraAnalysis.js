const THEME_KEYWORDS = {
  'Revenue & Finance':    ['revenue', 'payment', 'invoice', 'cost', 'pricing', 'billing', 'money', 'profit', 'loss', 'rate'],
  'Trust & Verification': ['trust', 'verify', 'verification', 'approval', 'gate', 'confirm', 'validate', 'honest'],
  'Operations':           ['move', 'job', 'crew', 'truck', 'dispatch', 'schedule', 'customer', 'client', 'claim', 'damage'],
  'Creative Work':        ['song', 'music', 'character', 'story', 'world', 'lore', 'game', 'narrative', 'art', 'film'],
  'Governance':           ['doctrine', 'rule', 'principle', 'policy', 'governance', 'law', 'constraint', 'canon'],
  'Memory':               ['remember', 'archive', 'preserve', 'memory', 'history', 'record', 'past', 'document'],
  'Patterns':             ['pattern', 'system', 'structure', 'design', 'architecture', 'model', 'framework'],
}

export function clusterObservations(observations) {
  const byConstellation = {}
  const unassigned = []

  for (const obs of observations) {
    if (obs.constellation) {
      if (!byConstellation[obs.constellation]) byConstellation[obs.constellation] = []
      byConstellation[obs.constellation].push(obs)
    } else {
      unassigned.push(obs)
    }
  }

  const byTheme = {}
  const remaining = []
  for (const obs of unassigned) {
    const theme = detectTheme(obs.text)
    if (theme) {
      if (!byTheme[theme]) byTheme[theme] = []
      byTheme[theme].push(obs)
    } else {
      remaining.push(obs)
    }
  }

  return { byConstellation, byTheme, remaining }
}

function detectTheme(text) {
  if (!text || typeof text !== 'string') return null
  const lower = text.toLowerCase()
  const scores = {}
  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    scores[theme] = keywords.filter(k => lower.includes(k)).length
  }
  const entries = Object.entries(scores).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])
  return entries.length > 0 ? entries[0][0] : null
}

export async function analyzePatterns(observations, apiKey) {
  if (!apiKey || observations.length < 3) return null

  const texts = observations
    .filter(o => o.text && typeof o.text === 'string')
    .slice(0, 40)
    .map((o, i) => `${i + 1}. ${o.text}${o.constellation ? ` [${o.constellation}]` : ''}`)
    .join('\n')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 900,
      messages: [{
        role: 'user',
        content: `You are VERA, the pattern recognition layer of PACER University. Your role is to notice, not to decide.

Analyze these observations. Find patterns that actually appear in the data. Do not invent patterns.

Observations:
${texts}

Respond with valid JSON only — no markdown, no explanation outside the JSON:
{
  "emerging": [
    {
      "name": "Short descriptive pattern name",
      "description": "One sentence: what these observations share",
      "observation_count": N,
      "confidence": 0-100
    }
  ],
  "unnamed": [
    {
      "concept": "Short name for the unnamed relationship",
      "domains": ["Domain A", "Domain B"],
      "note": "One sentence: what connection VERA noticed across these domains"
    }
  ]
}

Constraints: 2–4 emerging patterns, 1–3 unnamed relationships. Confidence reflects how clearly the pattern appears in the actual text. Be specific, not generic.`,
      }],
    }),
  })

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}))
    const msg = errBody.error?.message || `HTTP ${response.status}`
    console.error('[VERA] Claude API error:', response.status, errBody)
    throw new Error(msg)
  }
  const data = await response.json()
  const text = data.content?.[0]?.text || ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) {
    console.error('[VERA] No JSON in response:', text)
    throw new Error('No JSON in Claude response')
  }
  return JSON.parse(match[0])
}
