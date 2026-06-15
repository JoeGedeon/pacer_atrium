import { useState, useEffect, useRef } from 'react'
import { clusterObservations, analyzePatterns } from '../lib/veraAnalysis'
import { speakWithVoice, getVoiceConfig } from '../lib/roomVoice'
import RoomSubNav from './RoomSubNav'

const MUSE_CONSTELLATIONS = [
  { a: 'FleetFlow',           b: 'Isles',     note: 'movement as narrative' },
  { a: 'PACER',               b: 'Doctrine',  note: 'intelligence requires governance' },
  { a: 'Blue Pineapple',      b: 'Atrium',    note: 'brand as entry point' },
  { a: 'Crossing the Bridge', b: 'OpsCore',   note: 'signal finds its field view' },
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

export default function VERARoom({ observations = [], museWorks = [], commands = [], doctrineCases = [], institutionEvents = [], apiKey, onConnectClaude, isMobile, voiceMode }) {
  const [tab,                   setTab]                   = useState('patterns')
  const [patterns,              setPatterns]              = useState(null)
  const [analyzing,             setAnalyzing]             = useState(false)
  const [analysisError,         setAnalysisError]         = useState(null)
  const [veraSpeaking,          setVeraSpeaking]          = useState(false)
  const [selectedConstellation, setSelectedConstellation] = useState(null)
  const [caseTab,               setCaseTab]               = useState('summary')
  const hasAnalyzed = useRef(false)

  const { byConstellation, byTheme, remaining } = clusterObservations(observations)
  const obsConstellations = Object.keys(byConstellation)

  function computeProfile(name) {
    const obsList   = byConstellation[name] || []
    const obs       = obsList.length
    const cmds      = commands.filter(c => c.patternTag === name)
    const cmdIds    = new Set(cmds.map(c => c.id))
    const active    = cmds.filter(c => ['drafted','analyzing','planned','approved','in_progress'].includes(c.status)).length
    const pending   = cmds.filter(c => c.status === 'pending_approval').length
    const completed = cmds.filter(c => c.status === 'completed')
    const failed    = cmds.filter(c => c.status === 'failed').length
    const successes = completed.filter(c => c.verdict === 'Success').length
    const critTotal    = completed.reduce((s, c) => s + (c.criteriaTotal    || 0), 0)
    const critAchieved = completed.reduce((s, c) => s + (c.criteriaAchieved || 0), 0)
    const successRate  = completed.length > 0 ? Math.round((successes / completed.length) * 100) : null
    const criteriaRate = critTotal > 0 ? Math.round((critAchieved / critTotal) * 100) : null

    // Algorithmic confidence score (0-100) weighted across four signals
    const obsScore      = Math.min(obs / 20, 1) * 100
    const successScore  = successRate ?? 0
    const criteriaScore = criteriaRate ?? (completed.length > 0 ? 50 : 0)
    const repeatScore   = Math.min(completed.length / 5, 1) * 100
    const confidenceScore = completed.length === 0 && obs === 0 ? null
      : Math.round(0.15 * obsScore + 0.35 * successScore + 0.30 * criteriaScore + 0.20 * repeatScore)

    const confidenceLabel = confidenceScore === null ? 'no data'
      : confidenceScore >= 80 ? 'high'
      : confidenceScore >= 60 ? 'moderate'
      : confidenceScore >= 40 ? 'emerging'
      : 'low'

    // ARCHIVIST events linked to this constellation's commands
    const events = institutionEvents
      .filter(e => cmdIds.has(e.relatedEntityId))
      .slice(0, 20)

    // Doctrine linked to this constellation
    const doctrine = doctrineCases.filter(d =>
      Array.isArray(d.relatedConstellations) && d.relatedConstellations.includes(name)
    )

    return {
      name, obs, obsList, total: cmds.length, cmds, active, pending,
      completed: completed.length, failed, successRate, critAchieved, critTotal, criteriaRate,
      confidenceScore, confidenceLabel, events, doctrine,
    }
  }

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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px' }}>
                  {obsConstellations.map(name => {
                    const open = selectedConstellation === name
                    const profile = open ? computeProfile(name) : null
                    const confColor = { rising: '#10b981', stable: '#06b6d4', falling: '#ef4444', 'no data': 'var(--text-6)' }
                    return (
                      <div key={name} style={{
                        background: open ? 'var(--bg-2)' : 'var(--bg-1)',
                        border: `1px solid ${open ? '#a0783040' : 'var(--border-0)'}`,
                        borderLeft: `3px solid ${open ? '#a07830' : 'transparent'}`,
                        borderRadius: '0 8px 8px 0',
                        overflow: 'hidden',
                      }}>
                        <button
                          onClick={() => {
                            if (open) setSelectedConstellation(null)
                            else { setSelectedConstellation(name); setCaseTab('summary') }
                          }}
                          style={{
                            width: '100%', textAlign: 'left', background: 'none', border: 'none',
                            cursor: 'pointer', padding: '10px 14px',
                            display: 'flex', alignItems: 'center', gap: '10px',
                          }}>
                          <span style={{ color: '#a07830', fontSize: '11px', flexShrink: 0 }}>◈</span>
                          <p style={{ color: 'var(--text-1)', fontSize: '12px', fontWeight: 500, flex: 1 }}>{name}</p>
                          <p style={{ color: 'var(--text-5)', fontSize: '9px', flexShrink: 0 }}>
                            {byConstellation[name].length} obs
                          </p>
                          <span style={{ color: 'var(--text-6)', fontSize: '9px', flexShrink: 0 }}>{open ? '▴' : '▾'}</span>
                        </button>

                        {open && profile && (
                          <div style={{ borderTop: '1px solid var(--border-0)' }}>

                            {/* Case file header + sub-tab nav */}
                            <div style={{ padding: '6px 14px 0 37px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <p style={{ color: 'var(--text-6)', fontSize: '8px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, flexShrink: 0 }}>
                                VERA Case File
                              </p>
                            </div>
                            <div style={{ display: 'flex', gap: '0', padding: '0 14px 0 37px', borderBottom: '1px solid var(--border-0)' }}>
                              {[
                                { id: 'summary',      label: 'Summary' },
                                { id: 'observations', label: `Obs (${profile.obs})` },
                                { id: 'commands',     label: `Cmds (${profile.total})` },
                                { id: 'events',       label: `Events (${profile.events.length})` },
                                { id: 'doctrine',     label: `Doctrine (${profile.doctrine.length})` },
                              ].map(t => (
                                <button key={t.id} onClick={() => setCaseTab(t.id)} style={{
                                  background: 'none', border: 'none', cursor: 'pointer',
                                  padding: '5px 8px 6px', fontFamily: 'inherit',
                                  fontSize: '9px', letterSpacing: '0.04em',
                                  color: caseTab === t.id ? 'var(--text-1)' : 'var(--text-6)',
                                  borderBottom: caseTab === t.id ? '2px solid #a07830' : '2px solid transparent',
                                  fontWeight: caseTab === t.id ? 600 : 400,
                                  whiteSpace: 'nowrap',
                                }}>
                                  {t.label}
                                </button>
                              ))}
                            </div>

                            <div style={{ padding: '12px 14px 14px 37px' }}>

                              {/* Summary */}
                              {caseTab === 'summary' && (
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '14px' }}>
                                    {profile.confidenceScore !== null ? (
                                      <>
                                        <span style={{
                                          color: profile.confidenceScore >= 80 ? '#10b981' : profile.confidenceScore >= 60 ? '#06b6d4' : profile.confidenceScore >= 40 ? '#f59e0b' : '#ef4444',
                                          fontSize: '22px', fontWeight: 700, lineHeight: 1,
                                        }}>{profile.confidenceScore}%</span>
                                        <span style={{ color: 'var(--text-5)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                                          {profile.confidenceLabel} confidence
                                        </span>
                                      </>
                                    ) : (
                                      <span style={{ color: 'var(--text-6)', fontSize: '11px', fontStyle: 'italic' }}>No confidence data yet</span>
                                    )}
                                  </div>
                                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                    {[
                                      { label: 'Observations', value: profile.obs,       color: 'var(--text-2)' },
                                      { label: 'Commands',     value: profile.total,     color: 'var(--text-2)' },
                                      { label: 'Active',       value: profile.active,    color: '#3b82f6' },
                                      { label: 'Completed',    value: profile.completed, color: '#10b981' },
                                      { label: 'Failed',       value: profile.failed,    color: '#ef4444' },
                                    ].filter(s => s.value > 0 || s.label === 'Observations').map(s => (
                                      <div key={s.label}>
                                        <p style={{ color: 'var(--text-6)', fontSize: '8px', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>{s.label}</p>
                                        <p style={{ color: s.color, fontSize: '16px', fontWeight: 700, lineHeight: 1 }}>{s.value}</p>
                                      </div>
                                    ))}
                                  </div>
                                  {(profile.successRate !== null || profile.criteriaRate !== null) && (
                                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                      {profile.successRate !== null && (
                                        <div>
                                          <p style={{ color: 'var(--text-6)', fontSize: '8px', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>Success Rate</p>
                                          <p style={{ color: profile.successRate >= 80 ? '#10b981' : '#f59e0b', fontSize: '13px', fontWeight: 700 }}>{profile.successRate}%</p>
                                        </div>
                                      )}
                                      {profile.criteriaRate !== null && (
                                        <div>
                                          <p style={{ color: 'var(--text-6)', fontSize: '8px', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>Criteria</p>
                                          <p style={{ color: profile.criteriaRate === 100 ? '#10b981' : '#f59e0b', fontSize: '13px', fontWeight: 700 }}>{profile.critAchieved}/{profile.critTotal}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {profile.total === 0 && profile.obs > 0 && (
                                    <p style={{ color: 'var(--text-6)', fontSize: '10px', fontStyle: 'italic', marginTop: '8px' }}>
                                      No commands tagged to this constellation yet.
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Observations */}
                              {caseTab === 'observations' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {profile.obsList.length === 0 ? (
                                    <p style={{ color: 'var(--text-6)', fontSize: '10px', fontStyle: 'italic' }}>No observations.</p>
                                  ) : profile.obsList.slice(0, 25).map(o => (
                                    <div key={o.id} style={{ borderLeft: '2px solid #a0783040', paddingLeft: '8px' }}>
                                      <p style={{ color: 'var(--text-5)', fontSize: '8px', marginBottom: '2px' }}>
                                        {o.type}{o.timestamp?.toDate ? ` · ${o.timestamp.toDate().toLocaleDateString()}` : ''}
                                      </p>
                                      <p style={{ color: 'var(--text-2)', fontSize: '11px', lineHeight: 1.5 }}>
                                        {(o.text?.length ?? 0) > 120 ? o.text.slice(0, 120) + '…' : (o.text || '')}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Commands */}
                              {caseTab === 'commands' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                  {profile.cmds.length === 0 ? (
                                    <p style={{ color: 'var(--text-6)', fontSize: '10px', fontStyle: 'italic' }}>No commands tagged to this constellation.</p>
                                  ) : profile.cmds.map(c => {
                                    const sColor = { completed: '#10b981', failed: '#ef4444', in_progress: '#3b82f6', approved: '#3b82f6', pending_approval: '#f59e0b', drafted: '#6b7280', analyzing: '#6b7280', planned: '#6b7280' }[c.status] || '#6b7280'
                                    const vColor = { 'Success': '#10b981', 'Partial Success': '#f59e0b', 'Failed': '#ef4444', 'Inconclusive': '#6b7280' }[c.verdict]
                                    return (
                                      <div key={c.id} style={{ borderLeft: '2px solid var(--border-1)', paddingLeft: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                                          <span style={{ fontSize: '8px', padding: '1px 5px', borderRadius: '3px', background: sColor + '22', color: sColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {c.status.replace(/_/g, ' ')}
                                          </span>
                                          {vColor && (
                                            <span style={{ fontSize: '8px', padding: '1px 5px', borderRadius: '3px', background: vColor + '22', color: vColor, fontWeight: 600 }}>
                                              {c.verdict}
                                            </span>
                                          )}
                                        </div>
                                        <p style={{ color: 'var(--text-1)', fontSize: '11px', fontWeight: 500, lineHeight: 1.4 }}>{c.title}</p>
                                        {c.criteriaTotal > 0 && (
                                          <p style={{ color: 'var(--text-5)', fontSize: '9px', marginTop: '2px' }}>Criteria: {c.criteriaAchieved || 0}/{c.criteriaTotal}</p>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              )}

                              {/* Events */}
                              {caseTab === 'events' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {profile.events.length === 0 ? (
                                    <p style={{ color: 'var(--text-6)', fontSize: '10px', fontStyle: 'italic' }}>No ARCHIVIST events linked to this constellation's commands.</p>
                                  ) : profile.events.map((e, i) => (
                                    <div key={e.id || i} style={{ borderLeft: '2px solid var(--border-1)', paddingLeft: '8px' }}>
                                      <p style={{ color: 'var(--text-5)', fontSize: '8px', marginBottom: '2px' }}>
                                        {e.eventType}{e.occurredAt?.toDate ? ` · ${e.occurredAt.toDate().toLocaleDateString()}` : ''}
                                      </p>
                                      <p style={{ color: 'var(--text-2)', fontSize: '11px', lineHeight: 1.4 }}>{e.title}</p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Doctrine */}
                              {caseTab === 'doctrine' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {profile.doctrine.length === 0 ? (
                                    <p style={{ color: 'var(--text-6)', fontSize: '10px', fontStyle: 'italic' }}>No doctrine cases linked to this constellation.</p>
                                  ) : profile.doctrine.map(d => (
                                    <div key={d.id} style={{ borderLeft: '2px solid #a0783040', paddingLeft: '8px' }}>
                                      <p style={{ color: 'var(--text-1)', fontSize: '11px', fontWeight: 500 }}>{d.title}</p>
                                      <p style={{ color: 'var(--text-5)', fontSize: '9px', marginTop: '2px' }}>{d.status || 'draft'}</p>
                                    </div>
                                  ))}
                                </div>
                              )}

                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div style={{ borderTop: '1px solid var(--border-0)', margin: '4px 0 14px' }} />
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
