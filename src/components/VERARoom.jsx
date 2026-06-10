import { useState, useEffect, useRef } from 'react'
import { clusterObservations, analyzePatterns } from '../lib/veraAnalysis'

const MUSE_CONSTELLATIONS = [
  { a: 'FleetFlow',           b: 'Isles',     note: 'movement as narrative' },
  { a: 'PACER',               b: 'Doctrine',  note: 'intelligence requires governance' },
  { a: 'Blue Pineapple',      b: 'Atrium',    note: 'brand as entry point' },
  { a: 'Crossing the Bridge', b: 'Theater',   note: 'story finds its stage' },
]

function loadMuseWorks() {
  try { return JSON.parse(localStorage.getItem('muse_works') || '[]') } catch { return [] }
}

const PANEL = {
  background: 'var(--bg-0)',
  overflow: 'auto',
  padding: '20px 22px',
}

const PANEL_ALT = {
  ...PANEL,
  background: 'var(--bg-1)',
}

const PANEL_HEADER = {
  color: 'var(--text-5)',
  fontSize: '9px',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  fontWeight: 600,
  marginBottom: '16px',
}

export default function VERARoom({ observations = [], apiKey, onConnectClaude, isMobile }) {
  const [patterns,  setPatterns]  = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState(null)
  const hasAnalyzed = useRef(false)

  const { byConstellation, byTheme, remaining } = clusterObservations(observations)
  const museWorks      = loadMuseWorks()
  const obsConstellations = Object.keys(byConstellation)

  useEffect(() => {
    if (!apiKey || observations.length < 3 || hasAnalyzed.current) return
    hasAnalyzed.current = true
    setAnalyzing(true)
    analyzePatterns(observations, apiKey)
      .then(r  => { setPatterns(r); setAnalyzing(false) })
      .catch(e => { setAnalysisError(e.message); setAnalyzing(false) })
  }, []) // eslint-disable-line

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-0)' }}>

      {/* Header */}
      <div className="shrink-0 px-8 py-5" style={{ borderBottom: '1px solid var(--border-0)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '18px' }}>
          <div>
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}
            >Recognition Infrastructure</p>
            <h2 style={{ fontSize: '18px', color: 'var(--text-0)', fontWeight: 700,
              letterSpacing: '0.08em' }}
            >VERA</h2>
          </div>
          <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic' }}>
            Not deciding. Noticing.
          </p>
        </div>
      </div>

      {/* Four panels — 2×2 on desktop, single column on mobile */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gridTemplateRows: isMobile ? 'auto' : '1fr 1fr',
        gap: '1px',
        background: 'var(--border-0)',
        flex: 1,
        overflow: isMobile ? 'auto' : 'hidden',
        minHeight: 0,
      }}>

        {/* ── Panel 1: Observations — by meaning, not by time ── */}
        <div style={PANEL}>
          <p style={PANEL_HEADER}>Observations — by meaning</p>

          {observations.length === 0 ? (
            <p style={{ color: 'var(--text-6)', fontSize: '11px', lineHeight: 1.7 }}>
              No observations in Atrium yet.
            </p>
          ) : (
            <>
              {Object.entries(byConstellation).map(([name, obs]) => (
                <div key={name} style={{ marginBottom: '18px' }}>
                  <p style={{ color: '#a07830', fontSize: '10px', fontWeight: 600,
                    marginBottom: '7px' }}
                  >{name}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {obs.map(o => (
                      <p key={o.id} style={{
                        color: 'var(--text-2)', fontSize: '11px', lineHeight: 1.5,
                        paddingLeft: '10px', borderLeft: '2px solid #a0783035',
                      }}>
                        {o.text.length > 85 ? o.text.slice(0, 85) + '…' : o.text}
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
                        {o.text.length > 85 ? o.text.slice(0, 85) + '…' : o.text}
                      </p>
                    ))}
                  </div>
                </div>
              ))}

              {remaining.length > 0 && (
                <div style={{ marginBottom: '18px' }}>
                  <p style={{ color: 'var(--text-6)', fontSize: '10px', fontStyle: 'italic',
                    marginBottom: '7px' }}
                  >unclustered</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {remaining.map(o => (
                      <p key={o.id} style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.5 }}>
                        {o.text.length > 85 ? o.text.slice(0, 85) + '…' : o.text}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Panel 2: Constellations — established named patterns ── */}
        <div style={PANEL}>
          <p style={PANEL_HEADER}>Constellations — named patterns</p>

          {obsConstellations.length > 0 && (
            <>
              {obsConstellations.map(name => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '8px',
                  marginBottom: '12px' }}
                >
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

          <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '10px' }}
          >Back Wall — Muse</p>
          {MUSE_CONSTELLATIONS.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px',
              marginBottom: '9px', flexWrap: 'wrap' }}
            >
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
                textTransform: 'uppercase', marginBottom: '10px' }}
              >Works — Muse</p>
              {museWorks.filter(w => w.status !== 'shaping').map(w => (
                <p key={w.id} style={{ color: 'var(--text-4)', fontSize: '11px',
                  marginBottom: '5px' }}
                >{w.title}</p>
              ))}
            </>
          )}
        </div>

        {/* ── Panel 3: Emerging Patterns — VERA's suggestions ── */}
        <div style={PANEL_ALT}>
          <p style={PANEL_HEADER}>Emerging Patterns — VERA suggests</p>

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
              VERA needs at least 3 observations<br />before patterns emerge.
            </p>
          )}

          {analyzing && (
            <p style={{ color: 'var(--text-4)', fontSize: '11px', fontStyle: 'italic' }}>
              VERA is reading the observations…
            </p>
          )}

          {analysisError && (
            <p style={{ color: '#ef4444', fontSize: '11px' }}>
              Analysis unavailable: {analysisError}
            </p>
          )}

          {patterns?.emerging?.map((p, i) => (
            <div key={i} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between',
                alignItems: 'baseline', marginBottom: '5px' }}
              >
                <p style={{ color: 'var(--text-0)', fontSize: '12px', fontWeight: 600 }}>{p.name}</p>
                <span style={{ color: 'var(--text-4)', fontSize: '10px' }}>{p.confidence}%</span>
              </div>
              <div style={{ height: '2px', background: 'var(--border-1)', borderRadius: '2px',
                marginBottom: '8px' }}
              >
                <div style={{
                  height: '100%', borderRadius: '2px',
                  width: `${Math.min(p.confidence, 100)}%`,
                  background: p.confidence > 70 ? '#10b981'
                    : p.confidence > 40 ? '#f59e0b'
                    : '#6b7280',
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

        {/* ── Panel 4: Unnamed Relationships — VERA notices ── */}
        <div style={PANEL_ALT}>
          <p style={PANEL_HEADER}>Unnamed Relationships — VERA notices</p>

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

      </div>
    </div>
  )
}
