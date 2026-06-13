// Save a raw API key — encrypted server-side, returns keyBundle {encrypted, iv, last4}
export async function saveProviderKey(rawKey) {
  const res = await fetch('/.netlify/functions/save-key', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawKey }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to save key')
  }
  return res.json() // { encrypted, iv, last4 }
}

// Call Anthropic via server-side proxy (key never leaves the server unencrypted)
// Also accepts a raw string for backward compatibility with migrating sessions
export async function callClaude(anthropicBody, apiKeyOrBundle) {
  if (!apiKeyOrBundle) throw new Error('No API key configured')

  // Legacy path: raw string key (not yet migrated to encrypted bundle)
  if (typeof apiKeyOrBundle === 'string') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKeyOrBundle,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(anthropicBody),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error?.message || `HTTP ${res.status}`)
    }
    return res.json()
  }

  // Encrypted bundle path: key decrypted server-side, never exposed to browser
  const res = await fetch('/.netlify/functions/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keyBundle: apiKeyOrBundle, anthropicBody }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error?.message || data.error || `HTTP ${res.status}`)
  }
  return res.json()
}
