import { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useTheme } from '../hooks/useTheme'
import ThemeToggle from './ThemeToggle'

function friendlyError(code) {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':   return 'Email or password is incorrect. Use "Forgot password?" to reset.'
    case 'auth/weak-password':        return 'Password must be at least 6 characters.'
    case 'auth/invalid-email':        return 'Please enter a valid email address.'
    case 'auth/too-many-requests':    return 'Too many attempts. Wait a moment and try again.'
    default:                          return 'Something went wrong. Please try again.'
  }
}

export default function AuthGate({ onSignIn, onSignUp }) {
  const { theme, setTheme } = useTheme()
  const [mode, setMode]         = useState('signin')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [working, setWorking]   = useState(false)
  const [resetSent, setResetSent] = useState(false)

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
      if (err.code === 'auth/email-already-in-use') setError('__already_exists__')
      else setError(friendlyError(err.code))
    } finally {
      setWorking(false)
    }
  }

  async function forgotPassword() {
    const e = email.trim()
    if (!e) { setError('Enter your email address first.'); return }
    setWorking(true)
    setError('')
    try {
      await sendPasswordResetEmail(auth, e)
      setResetSent(true)
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setWorking(false)
    }
  }

  function switchMode(next) {
    setMode(next)
    setPassword('')
    setError('')
    setResetSent(false)
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

  const canSubmit = !working && !!email.trim() && !!password

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
              ? 'Sign in to enter the campus. First time? Create an account below.'
              : 'New here? Create your account. Already have one? Sign in below.'}
          </p>
        </div>

        <div style={{
          background: 'var(--bg-1)', borderRadius: '12px',
          border: '1px solid var(--border-1)', padding: '24px',
        }}>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); setResetSent(false) }}
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

          {error === '__already_exists__' ? (
            <p style={{ fontSize: '11px', marginBottom: '10px', marginTop: '-2px', color: '#ef4444' }}>
              That email already has an account.{' '}
              <button
                onClick={() => switchMode('signin')}
                style={{ background: 'none', border: 'none', padding: 0, color: '#60a5fa',
                  cursor: 'pointer', fontSize: '11px', textDecoration: 'underline' }}
              >Sign in instead →</button>
            </p>
          ) : error && (
            <p style={{ color: '#ef4444', fontSize: '11px', marginBottom: '10px', marginTop: '-2px' }}
            >{error}</p>
          )}

          {resetSent && (
            <p style={{ color: '#22c55e', fontSize: '11px', marginBottom: '10px', marginTop: '-2px' }}
            >Reset email sent. Check your inbox.</p>
          )}

          <button
            onClick={submit}
            disabled={!canSubmit}
            style={{
              width: '100%', padding: '10px', borderRadius: '8px', fontSize: '13px',
              fontWeight: 500, border: 'none', marginBottom: '8px', marginTop: '4px',
              background: canSubmit ? '#1d4ed8' : 'var(--bg-3)',
              color:      canSubmit ? '#e0eaff' : 'var(--text-4)',
              cursor:     canSubmit ? 'pointer'  : 'not-allowed',
            }}
          >
            {working ? '…' : mode === 'signin' ? 'Enter the Atrium' : 'Create Account'}
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
              style={{ background: 'none', border: 'none', fontSize: '11px',
                color: 'var(--text-4)', cursor: 'pointer', padding: '4px 0' }}
            >
              {mode === 'signin' ? 'New here? Create an account →' : '← Back to sign in'}
            </button>

            {mode === 'signin' && (
              <button
                onClick={forgotPassword}
                disabled={working}
                style={{ background: 'none', border: 'none', fontSize: '11px',
                  color: 'var(--text-5)', cursor: 'pointer', padding: '4px 0' }}
              >
                Forgot password?
              </button>
            )}
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
          <ThemeToggle theme={theme} onThemeChange={setTheme} />
        </div>

        <p style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-6)', marginTop: '12px' }}>
          Your data lives in your account. Nobody else can see it.
        </p>
      </div>
    </div>
  )
}
