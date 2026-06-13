const crypto = require('crypto')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let body
  try { body = JSON.parse(event.body || '{}') } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const { rawKey } = body
  if (!rawKey || typeof rawKey !== 'string' || rawKey.length < 10) {
    return { statusCode: 400, body: JSON.stringify({ error: 'rawKey required' }) }
  }

  const secret = process.env.ENCRYPTION_SECRET
  if (!secret) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server not configured' }) }
  }

  try {
    const key = crypto.createHash('sha256').update(secret).digest()
    const iv  = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
    let encrypted = cipher.update(rawKey, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const tag = cipher.getAuthTag().toString('hex')

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        encrypted: `${encrypted}:${tag}`,
        iv: iv.toString('hex'),
        last4: rawKey.slice(-4),
      }),
    }
  } catch {
    return { statusCode: 500, body: JSON.stringify({ error: 'Encryption failed' }) }
  }
}
