import { callClaude } from './anthropicProxy'

const SYSTEM = `You are PACER's contract intake analyst. Your role is to extract structured information from contracts and return it as JSON.

Rules:
- Extract only what is explicitly stated. Do not infer or guess.
- If a field is not clearly present, set it to null.
- Dates must be in YYYY-MM-DD format or null.
- Parties are the legal entities named in the agreement — not agents, signatories, or representatives.
- financialTerms: a brief summary of payment amounts, schedule, or structure. One to two sentences.
- keyObligations: the primary duties of each party. Two to three sentences.
- summary: a plain-language description of what this agreement is and what it covers. Two to three sentences.
- confidenceNote: note any fields where extraction was uncertain or required inference. If all fields are clear, set to null.

Return valid JSON only — no markdown, no explanation outside the JSON object.

Schema:
{
  "contractType": string or null,
  "effectiveDate": "YYYY-MM-DD" or null,
  "expirationDate": "YYYY-MM-DD" or null,
  "renewalDate": "YYYY-MM-DD" or null,
  "partyA": string or null,
  "partyB": string or null,
  "financialTerms": string or null,
  "keyObligations": string or null,
  "summary": string or null,
  "confidenceNote": string or null
}`

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const base64 = e.target.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function fileToText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

export async function extractContractMetadata(file, apiKey) {
  const isPDF = file.type === 'application/pdf'
  const isText = file.type.startsWith('text/') || file.name.endsWith('.txt')

  if (!isPDF && !isText) {
    throw new Error('Only PDF and plain-text files can be analyzed. Convert DOCX to PDF before uploading.')
  }

  let messageContent
  if (isPDF) {
    const base64 = await fileToBase64(file)
    messageContent = [
      {
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: base64 },
      },
      {
        type: 'text',
        text: 'Extract structured contract information from this document and return the JSON schema defined in your instructions.',
      },
    ]
  } else {
    const text = await fileToText(file)
    messageContent = [
      {
        type: 'text',
        text: `CONTRACT TEXT:\n\n${text}\n\nExtract structured contract information and return the JSON schema defined in your instructions.`,
      },
    ]
  }

  const response = await callClaude({
    model: 'claude-opus-4-5',
    max_tokens: 1024,
    system: SYSTEM,
    messages: [{ role: 'user', content: messageContent }],
  }, apiKey)

  const raw = response.content[0].text
  const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(clean)
}
