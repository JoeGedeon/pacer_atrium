import { useState, useEffect, useRef } from 'react'
import { clusterObservations, analyzePatterns } from '../lib/veraAnalysis'
import { speakWithVoice, getVoiceConfig } from '../lib/roomVoice'
import RoomSubNav from './RoomSubNav'

const MUSE_CONSTELLATIONS = [
  { a: 'FleetFlow',           b: 'Isles',     note: 'movement as narrative' },
  { a: 'PACER',               b: 'Doctrine',  note: 'intelligence requires governance' },
  { a: 'Blue Pineapple',      b: 'Atrium',    note: 'brand as entry point' },
  { a: 'Crossing the Bridge', b: 'Theater',   note: 'story finds its stage' },
]

const SECTION_LABEL = {
  color: 'var(--text-5)',
  fontSize: '9px',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  fontWeight: 600,
  marginBottom: '16px',
}

const VERA_TABS = [
  { id: 'patterns',      label: 'Patterns' },
  { id: 'constellations', label: 'Constellations' },
  { id: 'signals',       label: 'Signals' },
  { id: 'observations',  label: 'Observations' },
]

export default function VERARoom({ observations = [], museWorks = [], apiKey, onConnectClaude, isMobile, voiceMode }) {
  const [tab,           setTab]           = useState('patterns')
  const [patterns,      setPatterns]      = useState(null)
  const [analyzing,     setAnalyzing]     = useState(false)
  const [analysisError, setAnalysisError] = useState(null)
  const [veraSpeaking,  setVeraSpeaking]  = useState(false)
  const hasAnalyzed = useRef(false)

  const { byConstellation, byTheme, remaining } = clusterObservations(observations)
  const obsConstellations = Object.keys(byConstellation)

  useEffect(() => {
    if (!apiKey || observations.length < 3 || hasAnalyzed.current) return
    hasAnalyzed.current = true
    setAnalyzing(true)
    setAnalysisError(null)
    analyzePatterns(observations, apiKey)
      .then(r  => { setPatterns(r); setAnalyzing(false) })
      .catch(e => {
        setAnalysisError(e.message)
        setAnalyzing(false)
        hasAnalyzed.current = false
      })
  }, [observations.length, apiKey]) // eslint-disable-line

  const px = isMobile ? 'px-6' : 'px-8'

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-0)' }}>

      {/* Header */}
      <div className={`shrink-0 ${px} py-5`} style={{ borderBottom: '1px solid var(--border-0)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '18px' }}>
          <div>
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
              Recognition Infrastructure
            </p>
            <h2 style={{ fontSize: '18px', color: 'var(--text-0)', fontWeight: 700,
              letterSpacing: '0.08em' }}>
              VERA
            </h2>
          </div>
          <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic' }}>
            Not deciding. Noticing.
          </p>
        </div>
      </div>

      <RoomSubNav tabs={VERA_TABS} activeTab={tab} onSelect={setTab} />

      <div className={`flex-1 overflow-y-auto ${px}`} style={{ padding: '20px 22px' }}>

        {/* Patterns */}
        {tab === 'patterns' && (
          <div style={{ maxWidth: '600px' }}>
            <p style={SECTION_LABEL}>Emerging Patterns — VERA suggests</p>

            {!apiKey && (
              <div>
                <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.7,
                  fontStyle: 'italic', marginBottom: '10px' }}>
                  Pattern detection requires Claude.
                </p>
                <button onClick={onConnectClaude} style={{ background: 'none', border: 'none',
                  color: '#60a5fa', fontSize: '11px', cursor: 'pointer', padding: 0 }}>
                  ✦ Connect Claude →
                </button>
              </div>
            )}

            {apiKey && observations.length < 3 && (
              <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.7, fontStyle: 'italic' }}>
                VERA needs at least 3 observations before patterns emerge.
              </p>
            )}

            {analyzing && (
              <p style={{ color: 'var(--text-4)', fontSize: '11px', fontStyle: 'italic' }}>
                VERA is reading the observations…
              </p>
            )}

            {analysisError && (
              <div>
                <p style={{ color: '#ef4444', fontSize: '11px', marginBottom: '8px' }}>
                  {analysisError.toLowerCase().includes('invalid') || analysisError.toLowerCase().includes('api_key') || analysisError.toLowerCase().includes('auth')
                    ? 'API key is invalid or expired.'
                    : `Analysis unavailable: ${analysisError}`}
                </p>
                <button onClick={onConnectClaude} style={{ background: 'none', border: 'none',
                  color: '#60a5fa', fontSize: '11px', cursor: 'pointer', padding: 0 }}>
                  ✦ Update key in Settings →
                </button>
              </div>
            )}

            {voiceMode && patterns?.emerging?.length > 0 && !analyzing && (
              <button
                disabled={veraSpeaking}
                onClick={() => {
                  const text = patterns.emerging.map(p => `${p.name}. ${p.description}`).join(' ')
                  speakWithVoice(text, getVoiceConfig('vera'), {
                    onStart: () => setVeraSpeaking(true),
                    onEnd:   () => setVeraSpeaking(false),
                    onError: () => setVeraSpeaking(false),
                  })
                }}
                style={{
                  background: 'none', border: '1px solid var(--border-1)',
                  color: veraSpeaking ? 'var(--text-5)' : 'var(--text-3)',
                  fontSize: '11px', padding: '5px 12px', borderRadius: '6px',
                  cursor: veraSpeaking ? 'default' : 'pointer',
                  fontFamily: 'inherit', marginBottom: '16px',
                }}
              >
                {veraSpeaking ? '🔊 Speaking…' : '▶ Read patterns'}
              </button>
            )}

            {patterns?.emerging?.map((p, i) => (
              <div key={i} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between',
                  alignItems: 'baseline', marginBottom: '5px' }}>
                  <p style={{ color: 'var(--text-0)', fontSize: '12px', fontWeight: 600 }}>{p.name}</p>
                  <span style={{ color: 'var(--text-4)', fontSize: '10px' }}>{p.confidence}%</span>
                </div>
                <div style={{ height: '2px', background: 'var(--border-1)', borderRadius: '2px', marginBottom: '8px' }}>
                  <div style={{
                    height: '100%', borderRadius: '2px',
                    width: `${Math.min(p.confidence, 100)}%`,
                    background: p.confidence > 70 ? '#10b981' : p.confidence > 40 ? '#f59e0b' : '#6b7280',
                  }} />
                </div>
                <p style={{ color: 'var(--text-3)', fontSize: '11px', lineHeight: 1.65 }}>
                  {p.description}
                </p>
                <p style={{ color: 'var(--text-5)', fontSize: '10px', marginTop: '4px' }}>
                  {p.observation_count} observation{p.observation_count !== 1 ? 's' : ''}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Constellations */}
        {tab === 'constellations' && (
          <div style={{ maxWidth: '600px' }}>
            <p style={SECTION_LABEL}>Named Patterns</p>

            {obsConstellations.length > 0 && (
              <>
                {obsConstellations.map(name => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '8px',
                    marginBottom: '12px' }}>
                    <span style={{ color: '#a07830', fontSize: '11px' }}>◈</span>
                    <p style={{ color: 'var(--text-1)', fontSize: '12px', fontWeight: 500 }}>{name}</p>
                    <p style={{ color: 'var(--text-5)', fontSize: '9px' }}>
                      {byConstellation[name].length} obs
                    </p>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--border-0)', margin: '14px 0' }} />
              </>
            )}

            {obsConstellations.length === 0 && (
              <p style={{ color: 'var(--text-5)', fontSize: '12px', lineHeight: 1.7,
                fontStyle: 'italic', marginBottom: '16px' }}>
                No constellations named yet. Accept constellation suggestions in Atrium to establish patterns.
              </p>
            )}

            <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.1em',
              textTransform: 'uppercase', marginBottom: '10px' }}>
              Back Wall — MUSE
            </p>
            {MUSE_CONSTELLATIONS.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px',
                marginBottom: '9px', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--text-3)', fontSize: '11px' }}>{c.a}</span>
                <span style={{ color: 'var(--text-6)' }}>⟷</span>
                <span style={{ color: 'var(--text-3)', fontSize: '11px' }}>{c.b}</span>
                <span style={{ color: 'var(--text-6)', fontSize: '9px', fontStyle: 'italic' }}>
                  — {c.note}
                </span>
              </div>
            ))}

            {museWorks.filter(w => w.status !== 'shaping').length > 0 && (
              <>
                <div style={{ borderTop: '1px solid var(--border-0)', margin: '14px 0' }} />
                <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.1em',
                  textTransform: 'uppercase', marginBottom: '10px' }}>
                  Works — MUSE
                </p>
                {museWorks.filter(w => w.status !== 'shaping').map(w => (
                  <p key={w.id} style={{ color: 'var(--text-4)', fontSize: '11px', marginBottom: '5px' }}>
                    {w.title}
                  </p>
                ))}
              </>
            )}
          </div>
        )}

        {/* Signals — unnamed relationships */}
        {tab === 'signals' && (
          <div style={{ maxWidth: '600px' }}>
            <p style={SECTION_LABEL}>Unnamed Relationships — VERA notices</p>

            {!apiKey && (
              <div>
                <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.7,
                  fontStyle: 'italic', marginBottom: '10px' }}>
                  Relationship discovery requires Claude.
                </p>
                <button onClick={onConnectClaude} style={{ background: 'none', border: 'none',
                  color: '#60a5fa', fontSize: '11px', cursor: 'pointer', padding: 0 }}>
                  ✦ Connect Claude →
                </button>
              </div>
            )}

            {apiKey && analyzing && (
              <p style={{ color: 'var(--text-4)', fontSize: '11px', fontStyle: 'italic' }}>
                Looking for unnamed connections…
              </p>
            )}

            {patterns?.unnamed?.map((u, i) => (
              <div key={i} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-5)', fontSize: '11px' }}>?</span>
                  <p style={{ color: 'var(--text-1)', fontSize: '12px', fontWeight: 500 }}>{u.concept}</p>
                </div>
                {u.domains?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '7px' }}>
                    {u.domains.map((d, j) => (
                      <span key={j} style={{
                        fontSize: '9px', padding: '2px 8px', borderRadius: '4px',
                        background: 'var(--bg-3)', color: 'var(--text-3)',
                        border: '1px solid var(--border-1)',
                      }}>{d}</span>
                    ))}
                  </div>
                )}
                <p style={{ color: 'var(--text-3)', fontSize: '11px', lineHeight: 1.65 }}>{u.note}</p>
              </div>
            ))}

            {apiKey && !analyzing && !analysisError && patterns && !patterns?.unnamed?.length && (
              <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.7, fontStyle: 'italic' }}>
                No unnamed relationships surfaced yet.
              </p>
            )}
          </div>
        )}

        {/* Observations — by meaning */}
        {tab === 'observations' && (
          <div style={{ maxWidth: '600px' }}>
            <p style={SECTION_LABEL}>Observations — by meaning</p>

            {observations.length === 0 ? (
              <p style={{ color: 'var(--text-6)', fontSize: '11px', lineHeight: 1.7 }}>
                No observations in Atrium yet.
              </p>
            ) : (
              <>
                {Object.entries(byConstellation).map(([name, obs]) => (
                  <div key={name} style={{ marginBottom: '18px' }}>
                    <p style={{ color: '#a07830', fontSize: '10px', fontWeight: 600,
                      marginBottom: '7px' }}>
                      {name}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {obs.map(o => (
                        <p key={o.id} style={{
                          color: 'var(--text-2)', fontSize: '11px', lineHeight: 1.5,
                          paddingLeft: '10px', borderLeft: '2px solid #a0783035',
                        }}>
                          {(o.text?.length ?? 0) > 85 ? o.text.slice(0, 85) + '…' : (o.text || '')}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}

                {Object.entries(byTheme).map(([theme, obs]) => (
                  <div key={theme} style={{ marginBottom: '18px' }}>
                    <p style={{ color: 'var(--text-3)', fontSize: '10px', marginBottom: '7px' }}>
                      {theme}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {obs.map(o => (
                        <p key={o.id} style={{
                          color: 'var(--text-3)', fontSize: '11px', lineHeight: 1.5,
                          paddingLeft: '10px', borderLeft: '2px solid var(--border-2)',
                        }}>
                          {(o.text?.length ?? 0) > 85 ? o.text.slice(0, 85) + '…' : (o.text || '')}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}

                {remaining.length > 0 && (
                  <div style={{ marginBottom: '18px' }}>
                    <p style={{ color: 'var(--text-6)', fontSize: '10px', fontStyle: 'italic',
                      marginBottom: '7px' }}>
                      unclustered
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {remaining.map(o => (
                        <p key={o.id} style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.5 }}>
                          {(o.text?.length ?? 0) > 85 ? o.text.slice(0, 85) + '…' : (o.text || '')}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
