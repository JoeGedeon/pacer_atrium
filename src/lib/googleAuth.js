const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar.readonly',
].join(' ')

function loadGISScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) { resolve(); return }
    const existing = document.querySelector('script[src*="accounts.google.com/gsi"]')
    if (existing) { existing.addEventListener('load', resolve); return }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = resolve
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
    document.head.appendChild(script)
  })
}

export async function requestGoogleToken(clientId) {
  await loadGISScript()
  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (response) => {
        if (response.error) { reject(new Error(response.error_description || response.error)); return }
        resolve({
          access_token: response.access_token,
          expires_at: Date.now() + (response.expires_in * 1000),
        })
      },
      error_callback: (err) => reject(new Error(err.type || 'OAuth error')),
    })
    tokenClient.requestAccessToken({ prompt: 'select_account' })
  })
}

// Silent reconnect — no popup. Works when Google session is still active in browser.
// Fails on iOS Safari / Firefox ITP where third-party cookies are blocked.
// Rejects with the actual GIS error type so the caller can log and handle it.
export async function requestGoogleTokenSilent(clientId, hint) {
  await loadGISScript()
  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      hint, // email hint — GIS matches this against the active Google account session
      callback: (response) => {
        if (response.error) {
          console.warn('[PACER Google] silent auth callback error:', response.error, response.error_description)
          reject(new Error(response.error_description || response.error))
          return
        }
        resolve({
          access_token: response.access_token,
          expires_at: Date.now() + (response.expires_in * 1000),
        })
      },
      error_callback: (err) => {
        // Common values: 'immediate_failed' (ITP/no active session), 'popup_closed_by_user',
        // 'access_denied', 'popup_blocked_by_browser'
        console.warn('[PACER Google] silent auth error_callback:', err?.type, err)
        reject(new Error(err?.type || 'OAuth error'))
      },
    })
    tokenClient.requestAccessToken({ prompt: '' })
  })
}

export function revokeGoogleToken(accessToken) {
  if (!accessToken || !window.google?.accounts?.oauth2) return
  window.google.accounts.oauth2.revoke(accessToken)
}

export function isTokenExpired(tokenData) {
  if (!tokenData?.expires_at) return true
  return Date.now() > tokenData.expires_at - 60_000 // 1 min buffer
}
