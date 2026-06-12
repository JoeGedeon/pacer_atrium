import { useRef, useState } from 'react'
import { conversationQuery } from '../lib/claudeRouting'
import { speakWithVoice, getVoiceConfig } from '../lib/roomVoice'

// voiceState: idle | listening | thinking | speaking
const STATE_BORDER = {
  idle:      '#6366f1',
  listening: '#10b981',
  thinking:  '#6366f140',
  speaking:  '#6366f1',
}

function MicIcon({ state }) {
  if (state === 'listening') return <span style={{ fontSize: '16px', color: '#10b981' }}>●</span>
  if (state === 'thinking')  return <span style={{ fontSize: '14px', color: '#6366f180' }}>…</span>
  if (state === 'speaking')  return <span style={{ fontSize: '18px' }}>🔊</span>
  return <span style={{ fontSize: '18px' }}>🎙</span>
}

export default function PACERVoice({ apiKey, observations, institutionEvents, emailContext, calendarContext }) {
  const [voiceState, setVoiceState] = useState('idle')
  const [transcript, setTranscript] = useState('')
  const [response, setResponse]     = useState('')
  const [error, setError]           = useState(null)
  const [cardOpen, setCardOpen]     = useState(false)

  const recognitionRef = useRef(null)
  const transcriptRef  = useRef('')

  async function handleTranscriptComplete() {
    const text = transcriptRef.current.trim()
    if (!text) { setVoiceState('idle'); return }

    setVoiceState('thinking')
    try {
      console.debug('[PACER voice-in] transcript:', text)
      console.debug('[PACER voice-in] observations count:', observations?.length)
      console.debug('[PACER voice-in] apiKey present:', !!apiKey)
      const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      const context = { observations, institutionEvents, dateStr, emailContext, calendarContext }
      console.debug('[PACER voice-in] calling conversationQuery')
      const reply = await conversationQuery(text, context, [], apiKey)
      console.debug('[PACER voice-in] reply typeof:', typeof reply)
      console.debug('[PACER voice-in] reply value:', reply)
      const replyText = typeof reply === 'string' ? reply : String(reply ?? '')
      if (!replyText.trim()) {
        console.error('[PACER voice-in] reply is empty or non-string — not speaking')
        setError('No response received from campus.')
        setVoiceState('idle')
        return
      }
      setResponse(replyText)
      console.debug('[PACER voice-in] calling speakWithVoice, replyText length:', replyText.length)
      speakWithVoice(replyText, getVoiceConfig('home'), {
        onStart: () => { console.debug('[PACER voice-in] onstart'); setVoiceState('speaking') },
        onEnd:   () => { console.debug('[PACER voice-in] onend'); setVoiceState('idle') },
        onError: () => { console.debug('[PACER voice-in] speech error'); setVoiceState('idle') },
      })
    } catch (err) {
      console.error('[PACER voice-in] CRASH:', err)
      console.error('[PACER voice-in] stack:', err?.stack)
      setError(err?.message || String(err))
      setVoiceState('idle')
    }
  }

  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setError('Speech recognition is not supported on this browser.')
      setCardOpen(true)
      return
    }
    if (!apiKey) {
      setError('Connect Claude in Settings to use voice.')
      setCardOpen(true)
      return
    }

    window.speechSynthesis?.cancel()
    transcriptRef.current = ''
    setTranscript('')
    setResponse('')
    setError(null)
    setCardOpen(true)

    const rec = new SR()
    rec.lang           = 'en-US'
    rec.interimResults = true
    rec.maxAlternatives = 1

    rec.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('')
      transcriptRef.current = t
      setTranscript(t)
    }

    rec.onerror = (e) => {
      console.debug('[PACER voice-in] recognition error:', e.error)
      if (e.error !== 'no-speech') {
        setError(`Microphone error: ${e.error}`)
      }
      setVoiceState('idle')
    }

    rec.onend = () => {
      recognitionRef.current = null
      handleTranscriptComplete()
    }

    recognitionRef.current = rec
    rec.start()
    setVoiceState('listening')
    console.debug('[PACER voice-in] recognition started')
  }

  function handleButtonTap() {
    if (voiceState === 'listening') {
      recognitionRef.current?.stop()
      return
    }
    if (voiceState === 'speaking') {
      window.speechSynthesis?.cancel()
      setVoiceState('idle')
      return
    }
    if (voiceState === 'idle') {
      startListening()
    }
  }

  function dismissCard() {
    setCardOpen(false)
    setTranscript('')
    setResponse('')
    setError(null)
  }

  const stateLabel = {
    idle:      apiKey ? 'Ask PACER' : 'Connect Claude to use voice',
    listening: 'Listening — tap to stop',
    thinking:  'Reading the campus…',
    speaking:  'Speaking — tap to stop',
  }

  return (
    <>
      {/* Transcript + response card */}
      {cardOpen && (
        <div style={{
          position: 'fixed',
          bottom: '92px',
          right: '24px',
          width: 'min(340px, calc(100vw - 48px))',
          background: '#080c18',
          border: `1px solid ${STATE_BORDER[voiceState]}`,
          borderRadius: '12px',
          padding: '16px 18px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          zIndex: 999,
          transition: 'border-color 0.25s',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ color: '#6366f180', fontSize: '9px', letterSpacing: '0.14em',
              textTransform: 'uppercase', fontWeight: 600 }}>
              PACER Voice
            </p>
            <button
              onClick={dismissCard}
              style={{ background: 'none', border: 'none', color: 'var(--text-5)',
                cursor: 'pointer', fontSize: '11px', padding: '0 0 0 12px' }}
            >
              ✕
            </button>
          </div>

          {/* User transcript */}
          {(transcript || voiceState === 'listening') && (
            <div style={{ marginBottom: '10px' }}>
              <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.1em',
                textTransform: 'uppercase', marginBottom: '4px' }}>You</p>
              <p style={{ color: 'var(--text-3)', fontSize: '12px', fontStyle: 'italic', lineHeight: 1.55 }}>
                {transcript || <span style={{ color: 'var(--text-6)' }}>Waiting for speech…</span>}
              </p>
            </div>
          )}

          {/* PACER response */}
          {voiceState === 'thinking' && !response && (
            <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic' }}>
              Reading the campus…
            </p>
          )}
          {response && (
            <div style={{ borderLeft: '2px solid #6366f160', paddingLeft: '12px' }}>
              <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.1em',
                textTransform: 'uppercase', marginBottom: '4px' }}>PACER</p>
              <p style={{ color: 'var(--text-1)', fontSize: '12px', lineHeight: 1.7 }}>
                {response}
              </p>
            </div>
          )}

          {error && (
            <p style={{ color: '#f87171', fontSize: '11px', marginTop: '4px' }}>{error}</p>
          )}
        </div>
      )}

      {/* Floating mic button */}
      <button
        onClick={handleButtonTap}
        title={stateLabel[voiceState]}
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '24px',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: voiceState === 'listening' ? '#041208' : '#0a0f1e',
          border: `2px solid ${STATE_BORDER[voiceState]}`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.45)',
          transition: 'border-color 0.25s, background 0.25s',
          zIndex: 1000,
        }}
      >
        <MicIcon state={voiceState} />
      </button>
    </>
  )
}
