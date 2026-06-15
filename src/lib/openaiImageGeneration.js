export async function generateImage(prompt, openaiKeyOrBundle) {
  if (!openaiKeyOrBundle) throw new Error('No OpenAI API key configured')

  const imageBody = {
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1024',
  }

  // Legacy path: raw string key
  if (typeof openaiKeyOrBundle === 'string') {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKeyOrBundle}`,
      },
      body: JSON.stringify(imageBody),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error?.message || `OpenAI error ${res.status}`)
    }
    const data = await res.json()
    return { url: data.data[0].url, revisedPrompt: data.data[0].revised_prompt }
  }

  // Encrypted bundle path: key decrypted server-side
  const res = await fetch('/.netlify/functions/openai-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keyBundle: openaiKeyOrBundle, imageBody }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error?.message || data.error || `HTTP ${res.status}`)
  }
  const data = await res.json()
  return { url: data.data[0].url, revisedPrompt: data.data[0].revised_prompt }
}
