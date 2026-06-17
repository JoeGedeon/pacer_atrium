import { useState, useRef, useEffect } from 'react'
import { conversationQuery } from '../lib/claudeRouting'
import { speakWithVoice } from '../lib/roomVoice'
import { shouldSpeakConversationReply } from '../lib/voicePolicy'

const STATE_CONFIG = {
  idle:      { color: '#1d4ed8', label: 'Tap to speak',          icon: '🎤', pulse: false },
  listening: { color: '#10b981', label: 'Listening…',             icon: '⏹', pulse: true  },
  thinking:  { color: '#f59e0b', label: 'Processing…',            icon: '◎', pulse: true  },
  speaking:  { color: '#8b5cf6', label: 'Speaking — tap to stop', icon: '🔊', pulse: true  },
}

export default function ConversationMode({
  observations = [],
  institutionEvents = [],
  apiKey,
  onConnectClaude,
  isMobile,
  onSwitchToText,
  emailContext = null,
  calendarContext = null,
  voiceConfig = null,
  lineageContext = null,
}) {
  const [voiceState, setVoiceState] = useState('idle')
  const [history, setHistory]       = useState([])
  const [liveTranscript, setLiveTranscript] = useState('')
  const [error, setError]           = useState(null)
  const recognitionRef  = useRef(null)
  const historyEndRef   = useRef(null)
  const historyRef      = useRef([])
  const startTimeRef    = useRef(null)
  const gotResultRef    = useRef(false)

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
      window.speechSynthesis?.cancel()
    }
  }, [])

  useEffect(() => {
    historyRef.current = history
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  async function processQuery(text, currentHistory) {
    if (!text.trim()) { setVoiceState('idle'); return }

    setHistory(prev => [...prev, { role: 'user', text, id: Date.now() }])
    setVoiceState('thinking')
    setError(null)

    try {
      const response = await conversationQuery(
        text,
        { observations, institutionEvents, dateStr: today, emailContext, calendarContext, lineageContext },
        currentHistory,
        apiKey,
      )

      setHistory(prev => [...prev, { role: 'pacer', text: response, id: Date.now() + 1 }])
      if (shouldSpeakConversationReply(text)) {
        setVoiceState('speaking')
        speakWithVoice(response, voiceConfig, {
          onEnd:   () => setVoiceState('idle'),
          onError: () => setVoiceState('idle'),
        })
      } else {
        setVoiceState('idle')
      }
    } catch (e) {
      setError(e.message)
      setVoiceState('idle')
    }
  }

  function handleMicButton() {
    setError(null)

    if (voiceState === 'speaking') {
      window.speechSynthesis.cancel()
      setVoiceState('idle')
      return
    }
    if (voiceState === 'listening') {
      recognitionRef.current?.stop()
      setVoiceState('idle')
      setLiveTranscript('')
      return
    }
    if (voiceState === 'thinking') return

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setError('Voice input requires Chrome, Edge, or Safari 14.1+.')
      return
    }

    const recognition = new SR()
    recognition.continuous     = false
    recognition.interimResults = true
    recognition.lang           = 'en-US'
    recognition.maxAlternatives = 1
    recognitionRef.current     = recognition
    gotResultRef.current       = false

    recognition.onstart = () => {
      startTimeRef.current = Date.now()
      setVoiceState('listening')
      setLiveTranscript('')
    }

    recognition.onresult = (event) => {
      gotResultRef.current = true
      const transcript = Array.from(event.results).map(r => r[0].transcript).join('')
      setLiveTranscript(transcript)
      if (event.results[event.results.length - 1].isFinal) {
        setLiveTranscript('')
        recognition.stop()
        processQuery(transcript, historyRef.current)
      }
    }

    recognition.onerror = (event) => {
      const msg = event.error === 'not-allowed'
        ? 'Microphone access denied. Allow mic access in your browser settings.'
        : event.error === 'network'
        ? 'Speech recognition requires an internet connection.'
        : event.error === 'no-speech'
        ? null // silent — no-speech is normal
        : `Mic error: ${event.error}`
      if (msg) setError(msg)
      setVoiceState('idle')
      setLiveTranscript('')
    }

    recognition.onend = () => {
      const elapsed = Date.now() - (startTimeRef.current || 0)
      if (!gotResultRef.current && elapsed < 1500) {
        // Ended too quickly — likely browser didn't have permission yet or recognition failed to init
        setError('Microphone ended immediately. If this just loaded, try tapping again.')
      }
      setVoiceState(prev => prev === 'listening' ? 'idle' : prev)
    }

    recognition.start()
  }

  const cfg = STATE_CONFIG[voiceState]
  const px  = isMobile ? '16px' : '32px'

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      background: 'var(--bg-0)', overflow: 'hidden',
    }}>

      {/* Header */}
      <div style={{
        borderBottom: '1px solid var(--border-0)', flexShrink: 0,
        padding: `${isMobile ? '14px' : '18px'} ${px} ${isMobile ? '12px' : '14px'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>
            Atrium · Conversation Mode
          </p>
          <p style={{ color: 'var(--text-3)', fontSize: '11px' }}>
            Speak naturally. PACER listens and responds.
          </p>
        </div>
        <button
          onClick={onSwitchToText}
          style={{
            background: 'none', border: '1px solid var(--border-1)', borderRadius: '6px',
            padding: '6px 12px', color: 'var(--text-4)', fontSize: '11px',
            cursor: 'pointer', letterSpacing: '0.03em', transition: 'all 0.15s',
          }}
        >
          ← Text Mode
        </button>
      </div>

      {/* Conversation history */}
      <div style={{ flex: 1, overflowY: 'auto', padding: `20px ${px}` }}>
        {history.length === 0 && (
          <div style={{
            height: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '16px',
          }}>
            <p style={{ color: 'var(--text-5)', fontSize: '13px', lineHeight: 1.8,
              textAlign: 'center', maxWidth: '340px', fontStyle: 'italic' }}>
              "PACER, what happened yesterday?"
            </p>
            <p style={{ color: 'var(--text-6)', fontSize: '10px', letterSpacing: '0.1em',
              textTransform: 'uppercase', fontWeight: 600 }}>
              Tap the microphone to begin
            </p>
          </div>
        )}

        <div style={{
          display: 'flex', flexDirection: 'column', gap: '14px',
          maxWidth: '640px', margin: '0 auto',
        }}>
          {history.map(msg => (
            <div
              key={msg.id}
              style={{
                display: 'flex', gap: '10px', alignItems: 'flex-start',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              }}
            >
              {msg.role === 'pacer' && (
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                  background: '#0d0816', border: '1px solid #8b5cf640',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px',
                }}>
                  🍍
                </div>
              )}
              <div style={{
                maxWidth: '78%',
                background: msg.role === 'user' ? '#060d1a' : '#080512',
                border: `1px solid ${msg.role === 'user' ? '#1d4ed825' : '#8b5cf618'}`,
                borderRadius: msg.role === 'user'
                  ? '12px 12px 2px 12px'
                  : '12px 12px 12px 2px',
                padding: '10px 14px',
              }}>
                {msg.role === 'pacer' && (
                  <p style={{ color: '#8b5cf6', fontSize: '9px', fontWeight: 700,
                    letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '5px' }}>
                    PACER
                  </p>
                )}
                <p style={{
                  color: msg.role === 'user' ? 'var(--text-2)' : 'var(--text-0)',
                  fontSize: '13px', lineHeight: 1.75,
                }}>
                  {msg.text}
                </p>
              </div>
            </div>
          ))}
          <div ref={historyEndRef} />
        </div>
      </div>

      {/* Mic interface */}
      <div style={{
        borderTop: '1px solid var(--border-0)', flexShrink: 0,
        padding: isMobile ? '20px 16px' : '24px 32px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
      }}>
        {error && (
          <p style={{ color: '#ef4444', fontSize: '11px', textAlign: 'center', marginBottom: '4px' }}>
            {error}
          </p>
        )}

        {liveTranscript && (
          <p style={{
            color: '#10b981', fontSize: '12px', fontStyle: 'italic',
            textAlign: 'center', maxWidth: '440px', lineHeight: 1.5,
          }}>
            "{liveTranscript}"
          </p>
        )}

        {!apiKey ? (
          <button
            onClick={onConnectClaude}
            style={{
              background: '#0d1a2e', border: '1px solid #1d4ed8', borderRadius: '10px',
              padding: '14px 28px', color: '#93c5fd', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ✦ Connect Claude to enable Conversation Mode
          </button>
        ) : (
          <>
            <button
              onClick={handleMicButton}
              disabled={voiceState === 'thinking'}
              style={{
                width: '76px', height: '76px', borderRadius: '50%',
                background: `${cfg.color}12`,
                border: `2px solid ${cfg.color}`,
                cursor: voiceState === 'thinking' ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px', transition: 'border-color 0.3s, background 0.3s',
                animation: cfg.pulse ? 'voice-ring 1.6s ease-in-out infinite' : 'none',
                boxShadow: voiceState !== 'idle' ? `0 0 24px ${cfg.color}28` : 'none',
              }}
            >
              {cfg.icon}
            </button>
            <p style={{
              color: cfg.color, fontSize: '11px', fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              transition: 'color 0.3s',
            }}>
              {cfg.label}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
