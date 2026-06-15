import { useState, useEffect } from 'react'
import { listenKELDecisions } from '../lib/db'
import RoomSubNav from './RoomSubNav'
import { speakWithVoice, getVoiceConfig } from '../lib/roomVoice'

const ARCHIVE_TABS = [
  { id: 'timeline',  label: 'Timeline' },
  { id: 'threads',   label: 'Threads' },
  { id: 'decisions', label: 'Decisions' },
  { id: 'outcomes',  label: 'Outcomes' },
  { id: 'search',    label: 'Search' },
]

const OUTCOME_COLORS = { positive: '#10b981', neutral: '#6b7280', friction: '#f97316' }

function formatDate(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function toDate(v) {
  return v instanceof Date ? v : new Date(v || Date.now())
}

function getPeriod(date) {
  const now = new Date()
  const d = toDate(date)
  const diffDays = (now - d) / 86400000
  if (d.toDateString() === now.toDateString()) return 'Today'
  if (diffDays < 7)   return 'This Week'
  if (diffDays < 30)  return 'This Month'
  if (diffDays < 365) return 'This Year'
  return 'Origins'
}

const PERIOD_ORDER = ['Today', 'This Week', 'This Month', 'This Year', 'Origins']

const DECISION_STYLES = {
  approved: { bg: '#041208', border: '#0a3018', color: '#1a7a40', label: 'Approved' },
  rejected: { bg: '#140808', border: '#3a1010', color: '#7a2020', label: 'Rejected' },
  deferred: { bg: 'var(--bg-2)', border: 'var(--border-1)', color: 'var(--text-3)', label: 'Deferred' },
}

const EVENT_STYLES = {
  // Builder / governance
  builder_review_requested: { bg: '#0a0d14', border: '#1e3a5f', color: '#3b82f6', label: 'Review Requested' },
  builder_review_approved:  { bg: '#041208', border: '#0a3018', color: '#10b981', label: 'Review Approved'  },
  builder_review_denied:    { bg: '#140808', border: '#3a1010', color: '#ef4444', label: 'Review Denied'    },
  graduate_added:           { bg: '#0a0a04', border: '#3a3010', color: '#f59e0b', label: 'Graduate Added'   },
  // Commands
  command_created:          { bg: '#0a0d14', border: '#1e3a5f', color: '#3b82f6', label: 'Command Created'  },
  command_approved:         { bg: '#041208', border: '#0a3018', color: '#10b981', label: 'Command Approved' },
  command_denied:           { bg: '#140808', border: '#3a1010', color: '#ef4444', label: 'Command Denied'   },
  command_completed:        { bg: '#041208', border: '#0a3018', color: '#10b981', label: 'Command Completed'},
  command_failed:           { bg: '#140808', border: '#3a1010', color: '#ef4444', label: 'Command Failed'   },
  // Observations
  observation_tagged:       { bg: '#0f0e08', border: '#3a3010', color: '#a07830', label: 'Observation Tagged'},
  // Studio
  artwork_created:          { bg: '#0d0a1f', border: '#2d1f5f', color: '#6366f1', label: 'Artwork Created'  },
  // Content / Theater
  forge_artifact_created:   { bg: '#041208', border: '#0a3018', color: '#10b981', label: 'Artifact Forged'  },
  production_published:     { bg: '#0a0d14', border: '#1e3a5f', color: '#3b82f6', label: 'Production Live'  },
  media_asset_published:    { bg: '#0a0d14', border: '#1e3a5f', color: '#3b82f6', label: 'Asset Published'  },
  outcome_recorded:         { bg: '#0a0a04', border: '#3a3010', color: '#f59e0b', label: 'Outcome Recorded' },
  // Doctrine
  doctrine_updated:         { bg: '#0f0e08', border: '#3a2010', color: '#f59e0b', label: 'Doctrine Updated' },
}

function eventStyle(type) {
  return EVENT_STYLES[type] || { bg: 'var(--bg-2)', border: 'var(--border-1)', color: '#f59e0b', label: 'Institution' }
}

const CAT_ICONS = {
  music: '🎵', visual: '🎨', lore: '📖',
  worldbuilding: '🌎', characters: '🎭', productions: '🎬',
}

function TimelineEntry({ entry, isLast }) {
  const isObs      = entry.kind === 'observation'
  const isWork     = entry.kind === 'work'
  const isDecision = entry.kind === 'decision'
  const isEvent    = entry.kind === 'event'
  const ds = isDecision ? (DECISION_STYLES[entry.decision] || DECISION_STYLES.deferred) : null
  const es = isEvent    ? eventStyle(entry.eventType) : null

  const dotColor = isEvent
    ? (es?.color || '#f59e0b')
    : isDecision
    ? (ds?.color || '#f59e0b')
    : isWork
    ? '#8b5cf6'
    : entry.destination ? '#3b82f6' : 'var(--border-1)'

  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: '12px', flexShrink: 0 }}>
        <div style={{ width: '7px', height: '7px', borderRadius: '50%',
          marginTop: '14px', background: dotColor, flexShrink: 0 }} />
        {!isLast && (
          <div style={{ flex: 1, width: '1px', background: 'var(--border-0)',
            marginTop: '4px', minHeight: '16px' }} />
        )}
      </div>

      <div style={{ flex: 1, paddingBottom: '14px' }}>
        <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.06em',
          paddingTop: '12px', marginBottom: '5px' }}>
          {isEvent ? 'GOVERNANCE' : isDecision ? 'KEL DECISION' : isWork ? 'WORK' : 'FIRST OBSERVED'}
          {' · '}{formatDate(entry.timestamp)}{' · '}{formatTime(entry.timestamp)}
        </p>

        {isEvent ? (
          <div style={{ background: es.bg, border: `1px solid ${es.border}`,
            borderRadius: '8px', padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: '999px',
                fontWeight: 600, color: es.color, border: `1px solid ${es.border}` }}>
                {es.label}
              </span>
            </div>
            <p style={{ color: 'var(--text-1)', fontSize: '12px', fontWeight: 600,
              marginBottom: entry.description ? '5px' : 0 }}>
              {entry.title}
            </p>
            {entry.description && (
              <p style={{ color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.6 }}>
                {entry.description}
              </p>
            )}
          </div>
        ) : isDecision ? (
          <div style={{ background: ds.bg, border: `1px solid ${ds.border}`,
            borderRadius: '8px', padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: '999px',
                fontWeight: 600, color: ds.color, border: `1px solid ${ds.border}` }}>
                {ds.label}
              </span>
              <span style={{ color: 'var(--text-5)', fontSize: '10px' }}>{entry.domain}</span>
            </div>
            <p style={{ color: 'var(--text-2)', fontSize: '12px', lineHeight: 1.6 }}>
              {entry.recommendation}
            </p>
          </div>
        ) : isWork ? (
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-1)',
            borderRadius: '8px', padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px' }}>{CAT_ICONS[entry.category] || '🎭'}</span>
              <p style={{ fontSize: '13px', color: 'var(--text-0)', fontWeight: 600 }}>{entry.title}</p>
            </div>
            {entry.notes && (
              <p style={{ fontSize: '12px', color: 'var(--text-3)', lineHeight: 1.6,
                maxHeight: '60px', overflow: 'hidden',
                maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }}>
                {entry.notes}
              </p>
            )}
          </div>
        ) : (
          <div style={{
            background: 'var(--bg-2)',
            border: entry.constellation
              ? '1px solid var(--border-1)'
              : '1px solid var(--border-0)',
            borderLeft: entry.constellation ? '3px solid #a0783050' : undefined,
            borderRadius: entry.constellation ? '0 8px 8px 0' : '8px',
            padding: '12px 16px',
          }}>
            <p style={{ fontSize: '13px', color: 'var(--text-1)', lineHeight: 1.6,
              marginBottom: (entry.constellation || entry.destination) ? '6px' : 0 }}>
              {(entry.text?.length ?? 0) > 200
                ? entry.text.slice(0, 200) + '…'
                : (entry.text || '')}
            </p>
            {entry.constellation && (
              <p style={{ fontSize: '9px', color: '#a07830', letterSpacing: '0.1em' }}>
                ✦ {entry.constellation}
              </p>
            )}
            {entry.destination && (
              <p style={{ fontSize: '10px', color: 'var(--text-5)', marginTop: '3px' }}>
                → {entry.destination}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ArchiveRoom({ observations = [], museWorks = [], institutionEvents = [], forgeThreads = [], uid, isMobile }) {
  const [kelDecisions, setKelDecisions] = useState([])
  const [view, setView]                 = useState('timeline')

  useEffect(() => {
    if (!uid) return
    return listenKELDecisions(uid, setKelDecisions)
  }, [uid])

  const publishedWorks = museWorks.filter(
    w => w.status === 'published_memory' || w.status === 'opening_night'
  )

  const allEntries = [
    ...observations
      .filter(o => o.text)
      .map(o => ({
        id: `obs-${o.id}`, kind: 'observation',
        text: o.text, type: o.type,
        destination: o.destination, constellation: o.constellation,
        status: o.status,
        timestamp: toDate(o.timestamp),
      })),
    ...publishedWorks.map(w => ({
      id: `muse-${w.id}`, kind: 'work',
      title: w.title, category: w.category,
      status: w.status, notes: w.notes,
      timestamp: toDate(w.createdAt),
    })),
    ...kelDecisions.map(k => ({
      id: `kel-${k.id}`, kind: 'decision',
      recommendation: k.recommendation, domain: k.domain, decision: k.decision,
      timestamp: toDate(k.decidedAt),
    })),
    ...institutionEvents.map(e => ({
      id: `evt-${e.id}`, kind: 'event',
      eventType: e.eventType, title: e.title, description: e.description,
      timestamp: toDate(e.createdAt),
    })),
  ].sort((a, b) => b.timestamp - a.timestamp)

  // Group by period for timeline view
  const byPeriod = {}
  for (const entry of allEntries) {
    const p = getPeriod(entry.timestamp)
    if (!byPeriod[p]) byPeriod[p] = []
    byPeriod[p].push(entry)
  }

  // Group by constellation for threads view
  const constThreads = {}
  for (const obs of observations) {
    if (!obs.text || !obs.constellation) continue
    if (!constThreads[obs.constellation]) constThreads[obs.constellation] = []
    constThreads[obs.constellation].push(obs)
  }
  const threadKeys = Object.keys(constThreads).sort((a, b) => constThreads[b].length - constThreads[a].length)
  const unthreaded = observations.filter(o => o.text && !o.constellation)
  const outcomeThreads = forgeThreads.filter(t => t.outcomeSignal)

  const px = isMobile ? 'px-6' : 'px-10'

  const [timelineSpeaking, setTimelineSpeaking] = useState(false)

  function playTimeline() {
    if (timelineSpeaking || allEntries.length === 0) return
    const reversed = [...allEntries].reverse()
    const script = reversed.map(entry => {
      const dateStr = entry.timestamp.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
      if (entry.kind === 'observation') {
        let s = `${dateStr}. Observation entered Atrium.`
        if (entry.text) s += ` "${entry.text.slice(0, 100)}".`
        if (entry.destination) s += ` Routed to ${entry.destination}.`
        if (entry.constellation) s += ` Constellation: ${entry.constellation}.`
        return s
      }
      if (entry.kind === 'decision') {
        return `${dateStr}. K.E.L. decision: ${entry.decision}. ${entry.recommendation || ''}.`
      }
      if (entry.kind === 'event') {
        return `${dateStr}. ${entry.title}. ${entry.description || ''}`
      }
      if (entry.kind === 'work') {
        return `${dateStr}. Work published: ${entry.title}.`
      }
      return ''
    }).filter(Boolean).join(' ')
    speakWithVoice(script, getVoiceConfig('vera'), {
      onStart: () => setTimelineSpeaking(true),
      onEnd:   () => setTimelineSpeaking(false),
      onError: () => setTimelineSpeaking(false),
    })
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-0)' }}>

      {/* Header */}
      <div className={`shrink-0 ${px} pt-8 pb-5`}
        style={{ borderBottom: '1px solid var(--border-0)' }}>
        <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
          College of Memory
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '18px', color: 'var(--text-0)', fontWeight: 700,
              letterSpacing: '0.08em', marginBottom: '5px' }}>Archivist Hall</h2>
            <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic' }}>
              The past is still speaking.
            </p>
            <p style={{ color: 'var(--text-6)', fontSize: '10px', marginTop: '6px' }}>
              {allEntries.length} record{allEntries.length !== 1 ? 's' : ''} ·{' '}
              {kelDecisions.length} decision{kelDecisions.length !== 1 ? 's' : ''} ·{' '}
              {threadKeys.length} thread{threadKeys.length !== 1 ? 's' : ''} ·{' '}
              {outcomeThreads.length} outcome{outcomeThreads.length !== 1 ? 's' : ''}
            </p>
          </div>
          {allEntries.length > 0 && (
            <button
              onClick={playTimeline}
              disabled={timelineSpeaking}
              style={{
                flexShrink: 0, background: 'none',
                border: '1px solid var(--border-1)', borderRadius: '7px',
                padding: '7px 13px', cursor: timelineSpeaking ? 'default' : 'pointer',
                color: timelineSpeaking ? 'var(--text-4)' : 'var(--text-3)',
                fontSize: '11px', fontWeight: 600, fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              {timelineSpeaking ? '🔊 Playing…' : '▶ Play Timeline'}
            </button>
          )}
        </div>
      </div>

      <RoomSubNav tabs={ARCHIVE_TABS} activeTab={view} onSelect={setView} />

      {/* Content */}
      <div className={`flex-1 overflow-y-auto ${px} py-6`}>
        {allEntries.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <div style={{ textAlign: 'center', maxWidth: '320px' }}>
              <p style={{ color: 'var(--text-4)', fontSize: '13px', marginBottom: '8px' }}>
                Archivist Hall is listening.
              </p>
              <p style={{ color: 'var(--text-6)', fontSize: '11px', lineHeight: 1.7 }}>
                Observations, decisions, and published works<br />
                will appear here as the institution builds its history.
              </p>
            </div>
          </div>
        ) : view === 'decisions' ? (
          <div>
            {kelDecisions.length === 0 ? (
              <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic', lineHeight: 1.7 }}>
                No KEL decisions recorded yet.
              </p>
            ) : (
              kelDecisions.map(k => {
                const ds = DECISION_STYLES[k.decision] || DECISION_STYLES.deferred
                return (
                  <div key={k.id} style={{ background: ds.bg, border: `1px solid ${ds.border}`,
                    borderRadius: '8px', padding: '12px 16px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px' }}>
                      <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: '999px',
                        fontWeight: 600, color: ds.color, border: `1px solid ${ds.border}` }}>
                        {ds.label}
                      </span>
                      {k.domain && (
                        <span style={{ color: 'var(--text-5)', fontSize: '10px' }}>{k.domain}</span>
                      )}
                      <span style={{ color: 'var(--text-6)', fontSize: '10px', marginLeft: 'auto' }}>
                        {formatDate(k.decidedAt)}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-2)', fontSize: '12px', lineHeight: 1.6 }}>
                      {k.recommendation}
                    </p>
                  </div>
                )
              })
            )}
          </div>
        ) : view === 'outcomes' ? (
          <div>
            {outcomeThreads.length === 0 ? (
              <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic', lineHeight: 1.7 }}>
                No outcomes recorded yet. Record outcomes in Builder Studio after forging artifacts.
              </p>
            ) : (
              outcomeThreads.map(t => {
                const color = OUTCOME_COLORS[t.outcomeSignal] || 'var(--text-4)'
                return (
                  <div key={t.id} style={{
                    background: 'var(--bg-2)', border: '1px solid var(--border-1)',
                    borderLeft: `3px solid ${color}`,
                    borderRadius: '0 8px 8px 0', padding: '14px 18px', marginBottom: '8px',
                  }}>
                    <p style={{ color: 'var(--text-1)', fontSize: '12px', lineHeight: 1.6,
                      marginBottom: '8px' }}>
                      {t.recommendation}
                    </p>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center',
                      flexWrap: 'wrap', marginBottom: t.outcomeNote ? '6px' : '0' }}>
                      <span style={{ color, fontSize: '10px', fontWeight: 700, textTransform: 'capitalize' }}>
                        ◈ {t.outcomeSignal}
                      </span>
                      {t.domain && <span style={{ color: 'var(--text-5)', fontSize: '10px' }}>{t.domain}</span>}
                    </div>
                    {t.outcomeNote && (
                      <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.6 }}>
                        {t.outcomeNote}
                      </p>
                    )}
                  </div>
                )
              })
            )}
          </div>
        ) : view === 'search' ? (
          <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic', lineHeight: 1.7 }}>
            Full-text search across all records. Coming soon.
          </p>
        ) : view === 'timeline' ? (
          <div>
            {PERIOD_ORDER.filter(p => byPeriod[p]?.length).map(period => (
              <div key={period} style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px',
                  marginBottom: '16px' }}>
                  <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
                    textTransform: 'uppercase', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {period}
                  </p>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border-0)' }} />
                  <p style={{ color: 'var(--text-6)', fontSize: '9px', whiteSpace: 'nowrap' }}>
                    {byPeriod[period].length}
                  </p>
                </div>
                <div className="flex flex-col">
                  {byPeriod[period].map((entry, i) => (
                    <TimelineEntry
                      key={entry.id}
                      entry={entry}
                      isLast={i === byPeriod[period].length - 1}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Threads view
          <div>
            {threadKeys.length === 0 && unthreaded.length === 0 ? (
              <p style={{ color: 'var(--text-5)', fontSize: '12px', lineHeight: 1.7 }}>
                No constellations yet. Accept constellation suggestions in Atrium to create threads.
              </p>
            ) : (
              <>
                {threadKeys.map(constellation => {
                  const sorted = [...constThreads[constellation]]
                    .sort((a, b) => toDate(a.timestamp) - toDate(b.timestamp))
                  return (
                    <div key={constellation} style={{ marginBottom: '32px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px',
                        marginBottom: '12px' }}>
                        <p style={{ color: '#a07830', fontSize: '10px',
                          letterSpacing: '0.1em', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          ✦ {constellation}
                        </p>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border-0)' }} />
                        <p style={{ color: 'var(--text-6)', fontSize: '9px', whiteSpace: 'nowrap' }}>
                          {sorted.length} signal{sorted.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {sorted.map((obs, i) => (
                          <div key={obs.id} style={{
                            background: 'var(--bg-2)',
                            border: '1px solid var(--border-1)',
                            borderLeft: '3px solid #a0783050',
                            borderRadius: '0 8px 8px 0',
                            padding: '12px 16px',
                          }}>
                            <p style={{ color: 'var(--text-6)', fontSize: '9px',
                              letterSpacing: '0.08em', marginBottom: '4px' }}>
                              {i === 0 ? 'FIRST SIGNAL' : `SIGNAL ${i + 1}`}
                              {' · '}{formatDate(obs.timestamp)}
                            </p>
                            <p style={{ color: 'var(--text-1)', fontSize: '12px', lineHeight: 1.6 }}>
                              {(obs.text?.length ?? 0) > 200
                                ? obs.text.slice(0, 200) + '…'
                                : (obs.text || '')}
                            </p>
                            {obs.destination && (
                              <p style={{ color: 'var(--text-5)', fontSize: '10px', marginTop: '5px' }}>
                                → {obs.destination}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}

                {unthreaded.length > 0 && (
                  <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px',
                      marginBottom: '12px' }}>
                      <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
                        textTransform: 'uppercase', fontWeight: 600 }}>Unthreaded</p>
                      <div style={{ flex: 1, height: '1px', background: 'var(--border-0)' }} />
                      <p style={{ color: 'var(--text-6)', fontSize: '9px' }}>{unthreaded.length}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {unthreaded.slice(0, 20).map(obs => (
                        <div key={obs.id} style={{
                          background: 'var(--bg-1)', border: '1px solid var(--border-0)',
                          borderRadius: '8px', padding: '10px 14px',
                        }}>
                          <p style={{ color: 'var(--text-6)', fontSize: '9px', marginBottom: '3px' }}>
                            {formatDate(obs.timestamp)}
                          </p>
                          <p style={{ color: 'var(--text-3)', fontSize: '12px', lineHeight: 1.5 }}>
                            {(obs.text?.length ?? 0) > 140
                              ? obs.text.slice(0, 140) + '…'
                              : (obs.text || '')}
                          </p>
                        </div>
                      ))}
                      {unthreaded.length > 20 && (
                        <p style={{ color: 'var(--text-5)', fontSize: '11px', padding: '4px 0' }}>
                          +{unthreaded.length - 20} more unthreaded signals
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0" style={{ borderTop: '1px solid var(--border-0)',
        padding: '12px 40px' }}>
        <p style={{ color: 'var(--text-6)', fontSize: '11px', fontStyle: 'italic' }}>
          Lessons survive the people who learned them.
        </p>
      </div>
    </div>
  )
}
