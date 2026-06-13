import { useState, useRef, useEffect } from 'react'
import { getSupportedAudioMimeType } from '../lib/voiceUpload'
import RoomSubNav from './RoomSubNav'

const DESTINATION = 'Isles of the Awakening'

const ISLES_TABS = [
  { id: 'seeds',   label: 'Seeds' },
  { id: 'sprouts', label: 'Sprouts' },
  { id: 'growth',  label: 'Growth' },
  { id: 'signals', label: 'Recurring Signals' },
  { id: 'revisit', label: 'Worth Revisiting' },
]

function timeAgo(date) {
  if (!date) return ''
  const ms = date instanceof Date ? date.getTime() : new Date(date).getTime()
  const mins = Math.floor((Date.now() - ms) / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ── Voice Recorder ────────────────────────────────────────────────────────────

function VoiceRecorder({ onPlantSeed }) {
  const [isRecording, setIsRecording]   = useState(false)
  const [isUploading, setIsUploading]   = useState(false)
  const [recordError, setRecordError]   = useState(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef        = useRef([])
  const streamRef        = useRef(null)

  useEffect(() => () => {
    mediaRecorderRef.current?.stop()
    streamRef.current?.getTracks().forEach(t => t.stop())
  }, [])

  async function start() {
    setRecordError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mimeType = getSupportedAudioMimeType()
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {})
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        streamRef.current = null
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' })
        setIsUploading(true)
        try {
          await onPlantSeed(blob)
        } catch {
          setRecordError('Upload failed. Try again.')
        } finally {
          setIsUploading(false)
        }
      }

      recorder.start()
      setIsRecording(true)
    } catch {
      setRecordError('Microphone access denied. Check browser permissions.')
    }
  }

  function stop() {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  return (
    <div style={{ marginBottom: '28px' }}>
      <button
        onClick={isRecording ? stop : start}
        disabled={isUploading}
        style={{
          background: isRecording ? '#14080820' : 'none',
          border: `1px solid ${isRecording ? '#ef4444' : '#10b98160'}`,
          color: isRecording ? '#ef4444' : '#10b981',
          fontSize: '12px', fontWeight: 600, padding: '8px 18px',
          borderRadius: '6px', cursor: isUploading ? 'default' : 'pointer',
          fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '8px',
        }}
      >
        {isRecording ? (
          <>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: '#ef4444', display: 'inline-block',
              animation: 'pulse-fade 1.2s infinite',
            }} />
            Stop Recording
          </>
        ) : isUploading ? (
          'Saving seed…'
        ) : (
          <><span>🌱</span> Plant Voice Seed</>
        )}
      </button>
      {recordError && (
        <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '8px' }}>
          {recordError}
        </p>
      )}
    </div>
  )
}

// ── Seed Cards ────────────────────────────────────────────────────────────────

function SeedCard({ obs }) {
  const isVoiceRecording = obs.type === 'voice' && obs.storageUrl

  return (
    <div style={{
      background: 'var(--bg-2)', border: '1px solid var(--border-1)',
      borderRadius: '8px', padding: '12px 16px', marginBottom: '8px',
    }}>
      {isVoiceRecording ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ color: '#10b981', fontSize: '12px' }}>🎤</span>
            <span style={{ color: 'var(--text-4)', fontSize: '11px', fontWeight: 500 }}>Voice seed</span>
            <span style={{ color: 'var(--text-6)', fontSize: '10px' }}>{timeAgo(obs.timestamp)}</span>
          </div>
          <audio
            controls
            src={obs.storageUrl}
            style={{ width: '100%', height: '32px', display: 'block' }}
          />
        </>
      ) : (
        <>
          <p style={{ color: 'var(--text-2)', fontSize: '12px', lineHeight: 1.65, marginBottom: '6px' }}>
            {obs.text}
          </p>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {obs.constellation && (
              <span style={{ color: '#a07830', fontSize: '10px' }}>◈ {obs.constellation}</span>
            )}
            <span style={{ color: 'var(--text-6)', fontSize: '10px' }}>{timeAgo(obs.timestamp)}</span>
          </div>
        </>
      )}
    </div>
  )
}

function GrowthCard({ obs, onRoute, onNavigate }) {
  const claude = obs.claude || {}

  return (
    <div style={{
      background: 'var(--bg-2)', border: '1px solid var(--border-1)',
      borderLeft: '3px solid #10b98140', borderRadius: '0 8px 8px 0',
      padding: '14px 18px', marginBottom: '10px',
    }}>
      <p style={{ color: 'var(--text-1)', fontSize: '12px', lineHeight: 1.65, marginBottom: '10px' }}>
        {obs.text}
      </p>

      {claude.rationale && (
        <p style={{
          color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.6,
          fontStyle: 'italic', marginBottom: '10px', paddingLeft: '8px',
          borderLeft: '2px solid var(--border-2)',
        }}>
          {claude.rationale}
        </p>
      )}

      {obs.constellation && (
        <p style={{ color: '#a07830', fontSize: '10px', marginBottom: '10px' }}>
          ◈ {obs.constellation}
        </p>
      )}

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => onRoute(obs.id, 'OpsCore')}
          style={{
            background: '#030d1a', border: '1px solid #3b82f620',
            color: '#60a5fa', fontSize: '10px', fontWeight: 600,
            padding: '4px 10px', borderRadius: '5px', cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          → OpsCore
        </button>
        <button
          onClick={() => onNavigate('kel')}
          style={{
            background: 'var(--bg-3)', border: '1px solid var(--border-1)',
            color: 'var(--text-3)', fontSize: '10px', fontWeight: 600,
            padding: '4px 10px', borderRadius: '5px', cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          → KEL Review
        </button>
        <button
          onClick={() => onRoute(obs.id, 'Archive')}
          style={{
            background: 'var(--bg-3)', border: '1px solid var(--border-1)',
            color: 'var(--text-5)', fontSize: '10px',
            padding: '4px 10px', borderRadius: '5px', cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Archive as Reference
        </button>
      </div>
    </div>
  )
}

// ── Section Header ─────────────────────────────────────────────────────────────

function SectionHeader({ emoji, label, count, note }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <span style={{ fontSize: '14px' }}>{emoji}</span>
        <p style={{ color: 'var(--text-3)', fontSize: '11px', fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {label}
        </p>
        <span style={{ color: 'var(--text-6)', fontSize: '10px' }}>{count}</span>
      </div>
      <p style={{ color: 'var(--text-6)', fontSize: '10px', fontStyle: 'italic', paddingLeft: '22px' }}>
        {note}
      </p>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function IslesRoom({ observations = [], onRoute, onNavigate, onPlantVoiceSeed, isMobile }) {
  const [tab, setTab] = useState('seeds')
  const px = isMobile ? 'px-6' : 'px-10'

  const islesObs   = observations.filter(o => o.destination === DESTINATION)
  const seeds      = islesObs.filter(o => !o.claude)
  const withSignal = islesObs.filter(o => !!o.claude)

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-0)' }}>

      <div className={`shrink-0 ${px} pt-8 pb-6`}
        style={{ borderBottom: '1px solid var(--border-0)' }}>
        <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
          Incubation Layer
        </p>
        <h2 style={{ fontSize: '18px', color: 'var(--text-0)', fontWeight: 700,
          letterSpacing: '0.08em', marginBottom: '6px' }}>Isles</h2>
        <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic' }}>
          Where unfinished things are allowed to be alive.
        </p>
      </div>

      <RoomSubNav tabs={ISLES_TABS} activeTab={tab} onSelect={setTab} />

      <div className={`flex-1 overflow-y-auto ${px} py-8`}>
        <div style={{ maxWidth: '600px' }}>

          {tab === 'seeds' && onPlantVoiceSeed && (
            <VoiceRecorder onPlantSeed={onPlantVoiceSeed} />
          )}

          {tab === 'seeds' && seeds.length === 0 && (
            <div>
              <p style={{ color: 'var(--text-3)', fontSize: '13px', lineHeight: 1.7, marginBottom: '8px' }}>
                Nothing has arrived in Seeds yet.
              </p>
              <p style={{ color: 'var(--text-5)', fontSize: '12px', lineHeight: 1.7, marginBottom: '24px' }}>
                Plant a voice seed above, or route an observation here from Atrium.
                No structure required. No decision needed. Ideas are allowed to exist here
                without justifying themselves.
              </p>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('atrium')}
                  style={{
                    background: 'none', border: '1px solid var(--border-1)',
                    color: 'var(--text-3)', fontSize: '12px', cursor: 'pointer',
                    padding: '8px 16px', borderRadius: '6px', fontFamily: 'inherit',
                  }}
                >
                  Go to Atrium →
                </button>
              )}
            </div>
          )}

          {tab === 'seeds' && seeds.length > 0 && (
            <>
              {seeds.map(o => <SeedCard key={o.id} obs={o} />)}
              <p style={{ color: 'var(--text-6)', fontSize: '10px', fontStyle: 'italic', marginTop: '12px' }}>
                {seeds.length} seed{seeds.length !== 1 ? 's' : ''}
              </p>
            </>
          )}

          {tab === 'sprouts' && (
            <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic', lineHeight: 1.7 }}>
              Sprouts are seeds that have begun to move — observations in early MUSE analysis.
              Nothing here yet.
            </p>
          )}

          {tab === 'growth' && withSignal.length === 0 && (
            <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic', lineHeight: 1.7 }}>
              MUSE has not noticed anything here yet. Route observations through MUSE to see them grow.
            </p>
          )}

          {tab === 'growth' && withSignal.length > 0 && (
            <>
              <p style={{ color: 'var(--text-5)', fontSize: '10px', fontStyle: 'italic',
                marginBottom: '16px' }}>
                MUSE has noticed something here. Ready to move when you decide.
              </p>
              {withSignal.map(o => (
                <GrowthCard key={o.id} obs={o} onRoute={onRoute} onNavigate={onNavigate} />
              ))}
              <p style={{ color: 'var(--text-6)', fontSize: '10px', fontStyle: 'italic', marginTop: '12px' }}>
                {withSignal.length} observation{withSignal.length !== 1 ? 's' : ''} with signal
              </p>
            </>
          )}

          {tab === 'signals' && (
            <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic', lineHeight: 1.7 }}>
              Recurring signals are patterns that surface more than once across Seeds.
              Coming soon.
            </p>
          )}

          {tab === 'revisit' && (
            <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic', lineHeight: 1.7 }}>
              Observations worth revisiting are surfaced here when VERA identifies patterns.
              Coming soon.
            </p>
          )}

        </div>
      </div>
    </div>
  )
}
