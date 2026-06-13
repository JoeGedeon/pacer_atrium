const crypto = require('crypto')

function decryptKey(encryptedWithTag, ivHex, secret) {
  const key = crypto.createHash('sha256').update(secret).digest()
  const iv  = Buffer.from(ivHex, 'hex')
  const [encHex, tagHex] = encryptedWithTag.split(':')
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'))
  let decrypted = decipher.update(encHex, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let body
  try { body = JSON.parse(event.body || '{}') } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const { keyBundle, anthropicBody } = body
  if (!keyBundle?.encrypted || !keyBundle?.iv || !anthropicBody) {
    return { statusCode: 400, body: JSON.stringify({ error: 'keyBundle and anthropicBody required' }) }
  }

  const secret = process.env.ENCRYPTION_SECRET
  if (!secret) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server not configured' }) }
  }

  let apiKey
  try {
    apiKey = decryptKey(keyBundle.encrypted, keyBundle.iv, secret)
  } catch {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid key bundle' }) }
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(anthropicBody),
    })
    const data = await res.json()
    return {
      statusCode: res.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  } catch (err) {
    console.error('[ai] upstream fetch failed:', err?.name, err?.message)
    return { statusCode: 502, body: JSON.stringify({ error: 'Upstream request failed' }) }
  }
}
