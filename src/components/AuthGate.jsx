import { useState } from 'react'

function friendlyError(code) {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':  return 'Email or password is incorrect.'
    case 'auth/email-already-in-use': return 'An account with this email already exists.'
    case 'auth/weak-password':        return 'Password must be at least 6 characters.'
    case 'auth/invalid-email':        return 'Please enter a valid email address.'
    case 'auth/too-many-requests':    return 'Too many attempts. Wait a moment and try again.'
    default:                          return 'Something went wrong. Please try again.'
  }
}

export default function AuthGate({ onSignIn, onSignUp }) {
  const [mode, setMode]         = useState('signin')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [working, setWorking]   = useState(false)

  async function submit() {
    const e = email.trim()
    const p = password
    if (!e || !p) return
    setWorking(true)
    setError('')
    try {
      if (mode === 'signin') await onSignIn(e, p)
      else                   await onSignUp(e, p)
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setWorking(false)
    }
  }

  const inputStyle = {
    width: '100%',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-2)',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    color: 'var(--text-0)',
    outline: 'none',
    marginBottom: '8px',
    boxSizing: 'border-box',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-0)',
    }}>
      <div style={{ width: '360px', padding: '0 24px' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '28px', marginBottom: '10px' }}>🍍</div>
          <h1 style={{ fontSize: '14px', color: 'var(--text-0)', fontWeight: 700,
            letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '6px' }}
          >PACER ATRIUM</h1>
          <p style={{ fontSize: '11px', color: 'var(--text-5)' }}>
            {mode === 'signin'
              ? 'Sign in to enter the campus.'
              : 'Create an account to join the campus.'}
          </p>
        </div>

        <div style={{
          background: 'var(--bg-1)', borderRadius: '12px',
          border: '1px solid var(--border-1)', padding: '24px',
        }}>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            placeholder="Email"
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') submit() }}
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = '#2563eb' }}
            onBlur={e  => { e.target.style.borderColor = 'var(--border-2)' }}
          />
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            placeholder="Password"
            onKeyDown={e => { if (e.key === 'Enter') submit() }}
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = '#2563eb' }}
            onBlur={e  => { e.target.style.borderColor = 'var(--border-2)' }}
          />

          {error && (
            <p style={{ color: '#ef4444', fontSize: '11px', marginBottom: '10px',
              marginTop: '-2px' }}
            >{error}</p>
          )}

          <button
            onClick={submit}
            disabled={working || !email.trim() || !password}
            style={{
              width: '100%', padding: '10px', borderRadius: '8px', fontSize: '13px',
              fontWeight: 500, border: 'none', marginBottom: '10px', marginTop: '4px',
              background: (working || !email.trim() || !password) ? 'var(--bg-3)' : '#1d4ed8',
              color:      (working || !email.trim() || !password) ? 'var(--text-4)' : '#e0eaff',
              cursor:     (working || !email.trim() || !password) ? 'not-allowed' : 'pointer',
            }}
          >
            {working ? '…' : mode === 'signin' ? 'Enter the Atrium' : 'Create Account'}
          </button>

          <button
            onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError('') }}
            style={{ width: '100%', background: 'none', border: 'none', fontSize: '11px',
              color: 'var(--text-4)', cursor: 'pointer', padding: '4px' }}
          >
            {mode === 'signin'
              ? 'New here? Create an account →'
              : '← Back to sign in'}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-6)',
          marginTop: '16px' }}
        >Your data lives in your account. Nobody else can see it.</p>
      </div>
    </div>
  )
}
