import { useState, useMemo } from 'react'
import { speakWithVoice, getVoiceConfig } from '../lib/roomVoice'

const SIGNAL_TYPES = [
  { id: 'revenue',       label: 'Revenue Risk',       color: '#ef4444', pattern: /revenue|finance|billing|money|cost|price|budget/i },
  { id: 'communication', label: 'Communication Risk',  color: '#f59e0b', pattern: /communication|clarity|feedback|message|signal|voice|expression/i },
  { id: 'safety',        label: 'Safety Risk',         color: '#f97316', pattern: /safety|risk|compliance|warning|danger|liability/i },
  { id: 'friction',      label: 'Customer Friction',   color: '#a855f7', pattern: /customer|friction|service|client|satisfaction|complaint/i },
  { id: 'process',       label: 'Process Drift',       color: '#3b82f6', pattern: /process|workflow|system|operation|drift|procedure|efficiency/i },
]

function matchSignal(constellation) {
  if (!constellation) return null
  for (const sig of SIGNAL_TYPES) {
    if (sig.pattern.test(constellation)) return sig
  }
  return null
}

const px = 'px-4 md:px-6'
const SECTION = {
  color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.12em',
  textTransform: 'uppercase', fontWeight: 700, marginBottom: '10px',
}

export default function OpsCoreRoom({ observations = [], threads = [], isMobile }) {
  const [briefing, setBriefing] = useState(false)

  const now = Date.now()
  const day  = 86400000
  const week = 7  * day
  const month = 30 * day

  const signalCounts = useMemo(() => {
    const counts = {}
    for (const sig of SIGNAL_TYPES) counts[sig.id] = 0
    for (const obs of observations) {
      const sig = matchSignal(obs.constellation)
      if (sig) counts[sig.id]++
    }
    return counts
  }, [observations])

  const activeSignals = SIGNAL_TYPES.filter(s => signalCounts[s.id] > 0)
  const totalSignals  = SIGNAL_TYPES.reduce((sum, s) => sum + signalCounts[s.id], 0)

  // Unrouted observations — oldest first (most overdue at top)
  const attentionQueue = useMemo(() =>
    observations
      .filter(o => !o.destination)
      .sort((a, b) => (a.timestamp?.toMillis?.() || 0) - (b.timestamp?.toMillis?.() || 0))
      .slice(0, 6)
  , [observations])

  // Constellation frequency
  const patterns = useMemo(() => {
    const freq = {}
    for (const obs of observations) {
      if (obs.constellation) freq[obs.constellation] = (freq[obs.constellation] || 0) + 1
    }
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [observations])

  const maxPattern = patterns[0]?.[1] || 1

  // KEL threads awaiting outcome
  const pendingActions = useMemo(() =>
    threads.filter(t => t.recommendation && !t.outcomeAt).slice(0, 4)
  , [threads])

  function handleBrief() {
    if (briefing) return
    const parts = ['OpsCore field briefing.']
    if (totalSignals > 0) {
      parts.push(`${totalSignals} signal${totalSignals !== 1 ? 's' : ''} detected across ${activeSignals.length} categor${activeSignals.length !== 1 ? 'ies' : 'y'}.`)
      for (const sig of activeSignals) {
        parts.push(`${sig.label}: ${signalCounts[sig.id]} observation${signalCounts[sig.id] !== 1 ? 's' : ''}.`)
      }
    } else {
      parts.push('No classified signals detected.')
    }
    if (attentionQueue.length > 0) {
      parts.push(`${attentionQueue.length} observation${attentionQueue.length !== 1 ? 's' : ''} awaiting routing.`)
      const oldest = attentionQueue[0]
      if (oldest?.text) parts.push(`Oldest unrouted: "${oldest.text.slice(0, 80)}".`)
    }
    if (pendingActions.length > 0) {
      parts.push(`${pendingActions.length} K.E.L. recommendation${pendingActions.length !== 1 ? 's' : ''} pending action.`)
      const first = pendingActions[0]
      if (first?.recommendation) parts.push(`First: ${first.recommendation.slice(0, 100)}.`)
    }
    if (patterns.length > 0) {
      parts.push(`Leading pattern: ${patterns[0][0]}, appearing ${patterns[0][1]} time${patterns[0][1] !== 1 ? 's' : ''}.`)
    }
    parts.push('End of briefing.')
    speakWithVoice(parts.join(' '), getVoiceConfig('vera'), {
      onStart: () => setBriefing(true),
      onEnd:   () => setBriefing(false),
      onError: () => setBriefing(false),
    })
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Header */}
      <div className={`shrink-0 ${px} pt-5 pb-4`} style={{ borderBottom: '1px solid var(--border-1)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <h1 style={{ color: 'var(--text-0)', fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              OpsCore Field View
            </h1>
            <p style={{ color: 'var(--text-5)', fontSize: '12px', marginTop: '3px' }}>
              What deserves attention right now?
            </p>
          </div>
          <button
            onClick={handleBrief}
            disabled={briefing}
            style={{
              background: briefing ? 'var(--bg-2)' : '#030d1a',
              border: `1px solid ${briefing ? 'var(--border-1)' : '#3b82f640'}`,
              borderRadius: '7px', padding: '8px 14px',
              color: briefing ? 'var(--text-5)' : '#60a5fa',
              fontSize: '11px', fontWeight: 600,
              cursor: briefing ? 'default' : 'pointer', whiteSpace: 'nowrap',
            }}
          >
            {briefing ? '🔊 Briefing…' : '🔊 Brief Me'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={`flex-1 overflow-y-auto ${px} py-6`} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* ACTIVE SIGNALS */}
        <section>
          <p style={SECTION}>Active Signals</p>
          {activeSignals.length === 0 ? (
            <div style={{ background: 'var(--bg-2)', borderRadius: '8px', padding: '18px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-5)', fontSize: '12px' }}>
                No classified signals yet.{' '}
                {observations.length === 0
                  ? 'Observations enter through the Atrium.'
                  : `${observations.length} observation${observations.length !== 1 ? 's' : ''} in system — VERA names the patterns.`}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {SIGNAL_TYPES.filter(s => signalCounts[s.id] > 0).map(sig => (
                <div key={sig.id} style={{
                  background: sig.color + '10',
                  border: `1px solid ${sig.color}30`,
                  borderLeft: `3px solid ${sig.color}`,
                  borderRadius: '0 8px 8px 0',
                  padding: '10px 16px',
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <span style={{ color: sig.color, fontSize: '22px', fontWeight: 700, lineHeight: 1 }}>
                    {signalCounts[sig.id]}
                  </span>
                  <div>
                    <p style={{ color: sig.color, fontSize: '11px', fontWeight: 600 }}>{sig.label}</p>
                    <p style={{ color: 'var(--text-5)', fontSize: '10px' }}>
                      {signalCounts[sig.id]} observation{signalCounts[sig.id] !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Two-column: Attention Map + Emerging Patterns */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', alignItems: 'start' }}>

          {/* ATTENTION MAP */}
          <section>
            <p style={SECTION}>Attention Map</p>
            <p style={{ color: 'var(--text-5)', fontSize: '11px', marginBottom: '10px' }}>
              Observations awaiting routing — oldest first.
            </p>
            {attentionQueue.length === 0 ? (
              <div style={{ background: 'var(--bg-2)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-5)', fontSize: '12px' }}>
                  {observations.length === 0
                    ? 'No observations in system.'
                    : 'All observations have been routed.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {attentionQueue.map((obs, i) => {
                  const ts    = obs.timestamp?.toDate?.() || new Date()
                  const age   = now - ts.getTime()
                  const ageLabel = age > month ? `${Math.floor(age / month)}mo ago`
                    : age > week  ? `${Math.floor(age / week)}w ago`
                    : age > day   ? `${Math.floor(age / day)}d ago`
                    : 'Today'
                  const isOldest = i === 0
                  return (
                    <div key={obs.id} style={{
                      background: 'var(--bg-2)',
                      border: `1px solid ${isOldest ? '#ef444420' : 'var(--border-0)'}`,
                      borderLeft: `3px solid ${isOldest ? '#ef4444' : 'var(--border-2)'}`,
                      borderRadius: '0 6px 6px 0', padding: '10px 12px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: obs.constellation ? '4px' : '0' }}>
                        {obs.constellation && (
                          <span style={{ color: '#a07830', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            ✦ {obs.constellation}
                          </span>
                        )}
                        <span style={{ color: isOldest ? '#ef4444' : 'var(--text-6)', fontSize: '9px', marginLeft: 'auto', flexShrink: 0 }}>
                          {ageLabel}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-2)', fontSize: '11px', lineHeight: 1.5 }}>
                        {(obs.text || '').length > 90 ? obs.text.slice(0, 90) + '…' : (obs.text || '—')}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* EMERGING PATTERNS */}
          <section>
            <p style={SECTION}>Emerging Patterns</p>
            <p style={{ color: 'var(--text-5)', fontSize: '11px', marginBottom: '10px' }}>
              What is becoming true.
            </p>
            {patterns.length === 0 ? (
              <div style={{ background: 'var(--bg-2)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-5)', fontSize: '12px' }}>
                  No constellations yet. VERA names patterns as observations arrive.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {patterns.map(([name, count]) => {
                  const sig = matchSignal(name)
                  const barPct = Math.max(6, Math.round((count / maxPattern) * 100))
                  return (
                    <div key={name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: sig?.color || '#a07830', fontSize: '11px', fontWeight: 500 }}>
                          ✦ {name}
                        </span>
                        <span style={{ color: 'var(--text-5)', fontSize: '10px' }}>{count}</span>
                      </div>
                      <div style={{ height: '3px', background: 'var(--bg-3)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${barPct}%`,
                          background: sig?.color || '#a07830', borderRadius: '2px',
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

        </div>

        {/* RECOMMENDED ACTIONS */}
        <section>
          <p style={SECTION}>Recommended Actions</p>
          <p style={{ color: 'var(--text-5)', fontSize: '11px', marginBottom: '10px' }}>
            K.E.L. decisions awaiting outcome.
          </p>
          {pendingActions.length === 0 ? (
            <div style={{ background: 'var(--bg-2)', borderRadius: '8px', padding: '18px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-5)', fontSize: '12px' }}>
                {threads.length === 0
                  ? 'No K.E.L. threads yet. Decisions are generated from approved observations.'
                  : 'No pending actions — all K.E.L. decisions have been acted on.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
              {pendingActions.map(thread => (
                <div key={thread.id} style={{
                  background: 'var(--bg-2)',
                  border: `1px solid ${thread.decision === 'approved' ? '#10b98118' : 'var(--border-0)'}`,
                  borderLeft: `3px solid ${thread.decision === 'approved' ? '#10b981' : 'var(--border-2)'}`,
                  borderRadius: '0 8px 8px 0', padding: '12px 14px',
                }}>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '7px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {thread.decision && (
                      <span style={{
                        background: thread.decision === 'approved' ? '#10b98115' : 'var(--bg-3)',
                        border: `1px solid ${thread.decision === 'approved' ? '#10b98140' : 'var(--border-1)'}`,
                        color: thread.decision === 'approved' ? '#10b981' : 'var(--text-5)',
                        fontSize: '9px', fontWeight: 600, borderRadius: '4px', padding: '2px 7px',
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                      }}>
                        {thread.decision}
                      </span>
                    )}
                    {thread.domain && (
                      <span style={{ color: 'var(--text-5)', fontSize: '9px' }}>{thread.domain}</span>
                    )}
                  </div>
                  <p style={{ color: 'var(--text-1)', fontSize: '12px', lineHeight: 1.55 }}>
                    {(thread.recommendation || '').length > 130
                      ? thread.recommendation.slice(0, 130) + '…'
                      : thread.recommendation || '—'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <div style={{ paddingBottom: '16px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-6)', fontSize: '10px' }}>
            {observations.length} observation{observations.length !== 1 ? 's' : ''} in system
            {' · '}
            {threads.length} K.E.L. thread{threads.length !== 1 ? 's' : ''}
            {' · '}
            {patterns.length} active constellation{patterns.length !== 1 ? 's' : ''}
          </p>
        </div>

      </div>
    </div>
  )
}
