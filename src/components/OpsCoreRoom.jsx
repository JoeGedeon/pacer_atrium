import { useState, useMemo } from 'react'
import { speakWithVoice, getVoiceConfig } from '../lib/roomVoice'
import { videoEmbed, audioEmbed } from './TheaterRoom'
import RoomSubNav from './RoomSubNav'

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

const SECTION = {
  color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.12em',
  textTransform: 'uppercase', fontWeight: 700, marginBottom: '10px',
}

const px = 'px-4 md:px-6'

const OPSCORE_TABS = [
  { id: 'attention',  label: '🎯 Attention' },
  { id: 'broadcast',  label: '📡 Broadcast' },
  { id: 'assets',     label: '🎬 Assets' },
]

// ── OpsCore Environment Layer ─────────────────────────────────────────────────
// Identity declared at the room level. Campus Rule #001.

function OpsCoreEnvironment({ envState }) {
  const isLive      = envState === 'live'
  const isAttention = envState === 'attention'

  const accent   = isLive ? '#10b981' : isAttention ? '#ef4444' : '#3b82f6'
  const gridCol  = isLive ? '#10b98114' : isAttention ? '#ef444412' : '#1e3a5f1e'
  const bgBase   = isLive ? '#010f07'   : isAttention ? '#0f0402'   : '#010812'
  const sweepDur = isAttention ? '2s' : isLive ? '3.5s' : '5s'
  const label    = isLive ? 'On Air' : isAttention ? 'Attention Required' : 'Awaiting Signal'
  const dotDur   = isAttention ? '1s' : isLive ? '1.5s' : '3s'

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
      overflow: 'hidden', background: bgBase,
    }}>
      <style>{`
        @keyframes oce-sweep {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes oce-dot-pulse {
          0%, 100% { opacity: 0.2; }
          50%      { opacity: 0.7; }
        }
        @keyframes oce-glow-breathe {
          0%, 100% { opacity: 0.5; }
          50%      { opacity: 1; }
        }
        @keyframes oce-signal-flow {
          0%   { stroke-dashoffset: 60; opacity: 0; }
          15%  { opacity: 0.5; }
          85%  { opacity: 0.5; }
          100% { stroke-dashoffset: 0;  opacity: 0; }
        }
        @keyframes oce-alert-flare {
          0%, 100% { opacity: 0.04; }
          50%      { opacity: 0.13; }
        }
      `}</style>

      {/* Command grid */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <pattern id="oce-grid" width="64" height="64" patternUnits="userSpaceOnUse">
            <path d="M 64 0 L 0 0 0 64" fill="none" stroke={gridCol} strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#oce-grid)" />
      </svg>

      {/* Radar — anchored bottom-right */}
      <div style={{ position: 'absolute', right: '-100px', bottom: '-100px', width: '380px', height: '380px' }}>
        {[0, 40, 80, 130].map((inset, i) => (
          <div key={i} style={{
            position: 'absolute', inset,
            borderRadius: '50%',
            border: `1px solid ${accent}${['18','12','0d','08'][i]}`,
          }} />
        ))}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          animation: `oce-sweep ${sweepDur} linear infinite`,
        }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: '50%', height: '1px', transformOrigin: '0 0',
            background: `linear-gradient(to right, ${accent}70, ${accent}10, transparent)`,
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: '50%', height: '0', transformOrigin: '0 0',
            boxShadow: `0 0 18px 6px ${accent}18`,
          }} />
        </div>
      </div>

      {/* Telemetry dots */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {[
          { cx: '12%', cy: '22%', delay: '0s'   },
          { cx: '68%', cy: '14%', delay: '0.6s' },
          { cx: '38%', cy: '55%', delay: '1.2s' },
          { cx: '82%', cy: '38%', delay: '0.3s' },
          { cx: '20%', cy: '72%', delay: '1.8s' },
          { cx: '55%', cy: '80%', delay: '0.9s' },
        ].map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r="1.5" fill={accent}
            style={{ animation: `oce-dot-pulse 2.8s ${d.delay} ease-in-out infinite` }} />
        ))}
      </svg>

      {/* Live: signal transmission lines */}
      {isLive && (
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          {[
            { x1: '8%',  y1: '28%', x2: '35%', y2: '12%', delay: '0s',   dur: '2.4s' },
            { x1: '55%', y1: '18%', x2: '85%', y2: '32%', delay: '0.8s', dur: '2.2s' },
            { x1: '22%', y1: '62%', x2: '50%', y2: '48%', delay: '1.4s', dur: '2.6s' },
            { x1: '65%', y1: '55%', x2: '90%', y2: '68%', delay: '0.4s', dur: '2.0s' },
          ].map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke={accent} strokeWidth="0.8" strokeDasharray="5 5"
              style={{ animation: `oce-signal-flow ${l.dur} ${l.delay} linear infinite` }} />
          ))}
        </svg>
      )}

      {/* Attention: top warning glow */}
      {isAttention && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
          background: `radial-gradient(ellipse at top, ${accent}14 0%, transparent 70%)`,
          animation: 'oce-alert-flare 1.8s ease-in-out infinite',
        }} />
      )}

      {/* Top edge accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: `linear-gradient(to right, transparent 0%, ${accent}50 40%, ${accent}50 60%, transparent 100%)`,
        opacity: 0.5,
      }} />

      {/* Corner brackets */}
      <svg style={{ position: 'absolute', top: '12px', left: '16px', width: '16px', height: '16px' }} aria-hidden="true">
        <path d="M 0 12 L 0 0 L 12 0" fill="none" stroke={accent} strokeWidth="1" opacity="0.3" />
      </svg>
      <svg style={{ position: 'absolute', top: '12px', right: '16px', width: '16px', height: '16px' }} aria-hidden="true">
        <path d="M 0 0 L 12 0 L 12 12" fill="none" stroke={accent} strokeWidth="1" opacity="0.3" />
      </svg>
      <svg style={{ position: 'absolute', bottom: '12px', right: '16px', width: '16px', height: '16px' }} aria-hidden="true">
        <path d="M 0 12 L 12 12 L 12 0" fill="none" stroke={accent} strokeWidth="1" opacity="0.3" />
      </svg>
      <svg style={{ position: 'absolute', bottom: '12px', left: '16px', width: '16px', height: '16px' }} aria-hidden="true">
        <path d="M 12 0 L 0 0 L 0 12" fill="none" stroke={accent} strokeWidth="1" opacity="0.3" />
      </svg>

      {/* Status label — bottom center */}
      <div style={{
        position: 'absolute', bottom: '14px', left: 0, right: 0,
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px',
      }}>
        <span style={{
          width: '4px', height: '4px', borderRadius: '50%', background: accent,
          display: 'inline-block',
          animation: `oce-glow-breathe ${dotDur} ease-in-out infinite`,
        }} />
        <span style={{
          color: accent, fontSize: '8px', fontWeight: 700,
          letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.5,
        }}>
          {label}
        </span>
      </div>
    </div>
  )
}

// ── Broadcast Panel ──────────────────────────────────────────────────────────

function BroadcastPanel({ featuredBroadcast, isMobile }) {
  const padX = isMobile ? 'px-4' : 'px-6'

  if (!featuredBroadcast) {
    return (
      <div className="flex-1" style={{
        background: '#000', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '14px', minHeight: '60vh',
      }}>
        <p style={{ fontSize: '36px', lineHeight: 1, opacity: 0.18 }}>📡</p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontWeight: 600,
          letterSpacing: '0.04em', textTransform: 'uppercase' }}>Standby</p>
        <p style={{ color: 'rgba(255,255,255,0.16)', fontSize: '11px', textAlign: 'center',
          lineHeight: 1.65, maxWidth: '260px' }}>
          No active transmission. Publish a media asset from Theater to begin broadcasting.
        </p>
      </div>
    )
  }

  const asset   = featuredBroadcast.asset
  const isMedia = featuredBroadcast.type === 'media'
  const videoE  = videoEmbed(asset.videoUrl)
  const audioE  = isMedia ? audioEmbed(asset.audioUrl) : null

  return (
    <div className="flex-1 overflow-y-auto" style={{ display: 'flex', flexDirection: 'column', background: '#000' }}>

      {/* Live indicator bar */}
      <div style={{ padding: '10px 20px', background: '#06100a', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981',
          boxShadow: '0 0 8px #10b981', display: 'inline-block', flexShrink: 0 }} />
        <p style={{ color: '#10b981', fontSize: '9px', letterSpacing: '0.2em',
          textTransform: 'uppercase', fontWeight: 800 }}>Live Transmission</p>
        <p style={{ color: '#6ee7b7', fontSize: '9px', marginLeft: 'auto' }}>
          {new Date(asset.publishedAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </p>
      </div>

      {/* Player */}
      {videoE ? (
        <div style={{ background: '#000', flexShrink: 0 }}>
          {videoE.type === 'iframe' ? (
            <iframe src={videoE.src}
              style={{ width: '100%', aspectRatio: '16/9', border: 'none', display: 'block' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen />
          ) : (
            <video controls src={videoE.src}
              style={{ width: '100%', display: 'block', aspectRatio: '16/9', objectFit: 'contain', background: '#000' }} />
          )}
        </div>
      ) : audioE ? (
        <div style={{ background: '#0a0618', padding: '28px 24px', flexShrink: 0 }}>
          <p style={{ color: '#a855f780', fontSize: '9px', letterSpacing: '0.14em',
            textTransform: 'uppercase', fontWeight: 700, marginBottom: '14px' }}>🔊 Audio Broadcast</p>
          {audioE.type === 'iframe'
            ? <iframe src={audioE.src}
                style={{ width: '100%', height: '120px', border: 'none', display: 'block' }}
                scrolling="no" frameBorder="no" allow="autoplay" />
            : <audio controls src={audioE.src} style={{ width: '100%', display: 'block' }} />
          }
        </div>
      ) : (
        <div style={{ background: '#000', aspectRatio: '16/9', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '8px', flexShrink: 0 }}>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', fontStyle: 'italic' }}>Media file missing</p>
          <p style={{ color: 'rgba(255,255,255,0.12)', fontSize: '10px', textAlign: 'center',
            maxWidth: '240px', lineHeight: 1.6 }}>
            Open Theater → 🎬 Media to upload a file to this asset.
          </p>
        </div>
      )}

      {/* Asset identity */}
      <div className={`${padX} py-5`} style={{ background: '#000', borderTop: '1px solid #ffffff08' }}>
        <p style={{ color: '#10b981', fontSize: '9px', letterSpacing: '0.2em',
          textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>On Air</p>
        <p style={{ color: '#f8fafc', fontSize: '22px', fontWeight: 700, lineHeight: 1.2,
          letterSpacing: '-0.01em', marginBottom: '6px' }}>
          {asset.title || 'Untitled'}
        </p>
        <p style={{ color: '#4b5563', fontSize: '10px' }}>
          Published {new Date(asset.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Script — context only */}
      {(isMedia && asset.transcript) && (
        <div className={`${padX} pb-6`} style={{ background: '#000', borderTop: '1px solid #ffffff06' }}>
          <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.1em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px', paddingTop: '16px' }}>📄 Script</p>
          <p style={{ color: '#374151', fontSize: '12px', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {asset.transcript.length > 500 ? asset.transcript.slice(0, 500) + '…' : asset.transcript}
          </p>
        </div>
      )}

    </div>
  )
}

// ── Assets Panel ─────────────────────────────────────────────────────────────

function AssetsPanel({ mediaAssets, isMobile }) {
  const padX = isMobile ? 'px-4' : 'px-6'
  const published = [...mediaAssets]
    .filter(a => a.publishedAt)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))

  return (
    <div className={`flex-1 overflow-y-auto ${padX} py-5`}>
      <div style={{ maxWidth: '600px' }}>
        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: 'var(--text-1)', fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>
            Published Assets
          </p>
          <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.6 }}>
            Reference list — {published.length} asset{published.length !== 1 ? 's' : ''}.
            Upload and manage in Theater → 🎬 Media.
          </p>
        </div>
        {published.length === 0 ? (
          <div style={{ padding: '24px', background: 'var(--bg-2)', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-5)', fontSize: '12px', lineHeight: 1.7 }}>
              No published assets yet. Approve and publish from Theater → 🎬 Media.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px',
            border: '1px solid var(--border-1)', borderRadius: '8px', overflow: 'hidden' }}>
            {published.map((asset, i) => {
              const isVideo   = !!(asset.videoUrl || asset.type === 'video')
              const isAudio   = !isVideo && !!(asset.audioUrl || asset.type === 'audio')
              const typeEmoji = isVideo ? '🎬' : isAudio ? '🔊' : '📄'
              const typeText  = isVideo ? 'Video' : isAudio ? 'Audio' : 'Transcript'
              return (
                <div key={asset.id} style={{
                  background: i % 2 === 0 ? 'var(--bg-1)' : 'var(--bg-2)',
                  padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  borderTop: i > 0 ? '1px solid var(--border-0)' : 'none',
                }}>
                  <span style={{ fontSize: '13px', flexShrink: 0 }}>{typeEmoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: 'var(--text-1)', fontSize: '12px', fontWeight: 500,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {asset.title || 'Untitled'}
                    </p>
                    <p style={{ color: 'var(--text-6)', fontSize: '10px', marginTop: '1px' }}>{typeText}</p>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <p style={{ color: '#10b981', fontSize: '9px', fontWeight: 700,
                      letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>Published</p>
                    <p style={{ color: 'var(--text-6)', fontSize: '9px' }}>
                      {new Date(asset.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <p style={{ color: 'var(--text-6)', fontSize: '10px', marginTop: '16px', lineHeight: 1.6, fontStyle: 'italic' }}>
          To upload, edit, remix, or archive — open Theater → 🎬 Media.
        </p>
      </div>
    </div>
  )
}

const day  = 86400000
const week = 7 * day

export default function OpsCoreRoom({ observations = [], threads = [], productions = [], mediaAssets = [], institutionEvents = [], apiKey, onBuildBrief, isMobile }) {
  const [briefing, setBriefing]         = useState(false)
  const [view, setView]                 = useState('attention')
  const [morningBrief, setMorningBrief] = useState('')
  const [briefLoading, setBriefLoading] = useState(false)
  const [briefSpeaking, setBriefSpeaking] = useState(false)
  const now = Date.now()

  // Signal counts by type
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

  // Unrouted observations — oldest first
  const attentionQueue = useMemo(() =>
    observations
      .filter(o => !o.destination)
      .sort((a, b) => (a.timestamp?.toMillis?.() || 0) - (b.timestamp?.toMillis?.() || 0))
      .slice(0, 6)
  , [observations])

  // Constellation frequency — all of them, not just regex-matched
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
    threads.filter(t => t.recommendation && !t.outcomeAt)
  , [threads])

  // ── LEAD PRIORITY — what hits you in the face ──────────────────────────────
  const lead = useMemo(() => {
    // P0a: Published media asset — explicitly broadcast content
    const recentMedia = [...mediaAssets]
      .filter(a => a.publishedAt && a.opsCoreSignal)
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))[0]
    if (recentMedia) return {
      icon:     '📡',
      headline: 'BROADCAST READY',
      color:    '#10b981',
      bg:       '#041208',
      border:   '#10b98130',
      action:   `"${recentMedia.title || 'Untitled Asset'}" is live. Press play.`,
      source:   `Theater Media · ${new Date(recentMedia.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`,
      strength: 'High',
    }

    // P0b: Published production from Theater — survived the gate
    const recentPublished = [...productions]
      .filter(p => p.publishedAt && p.opsCoreSignal)
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))[0]
    if (recentPublished) return {
      icon:     '📡',
      headline: 'PUBLISHED ASSET READY',
      color:    '#10b981',
      bg:       '#041208',
      border:   '#10b98130',
      action:   `"${recentPublished.title || 'Untitled'}" has been approved by Human Gate and published from Theater. It is now live.`,
      source:   `Theater → OpsCore · ${new Date(recentPublished.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`,
      strength: 'High',
    }

    // P1: Approved KEL decision with no outcome yet
    const urgentKEL = threads.find(t => t.decision === 'approved' && !t.outcomeAt)
    if (urgentKEL) return {
      icon:           '⚡',
      headline:       'APPROVED ACTION PENDING',
      color:          '#10b981',
      bg:             '#041208',
      border:         '#10b98130',
      action:         urgentKEL.recommendation
        ? (urgentKEL.recommendation.length > 160 ? urgentKEL.recommendation.slice(0, 160) + '…' : urgentKEL.recommendation)
        : 'Act on this approved K.E.L. decision.',
      source:         `K.E.L. decision · ${urgentKEL.domain || 'General'}`,
      strength:       'High',
    }

    // P2: Observation unrouted for 7+ days
    const oldest = attentionQueue[0]
    if (oldest) {
      const age = now - (oldest.timestamp?.toMillis?.() || 0)
      if (age > week) return {
        icon:     '⚠',
        headline: 'ATTENTION REQUIRED',
        color:    '#f97316',
        bg:       '#1a0e05',
        border:   '#f9731630',
        action:   `${attentionQueue.length} observation${attentionQueue.length !== 1 ? 's' : ''} waiting to be routed — oldest unrouted for ${Math.floor(age / day)} days.`,
        source:   'Attention Map · Route through Atrium',
        strength: age > 14 * day ? 'High' : 'Medium',
      }
    }

    // P3: Dominant signal type
    const topSig = [...activeSignals].sort((a, b) => signalCounts[b.id] - signalCounts[a.id])[0]
    if (topSig) return {
      icon:     '◎',
      headline: topSig.label.toUpperCase(),
      color:    topSig.color,
      bg:       topSig.color + '10',
      border:   topSig.color + '25',
      action:   `${signalCounts[topSig.id]} observation${signalCounts[topSig.id] !== 1 ? 's' : ''} carry a ${topSig.label} signal. Review and route.`,
      source:   `Active Signal · ${patterns.length} constellation${patterns.length !== 1 ? 's' : ''} named`,
      strength: signalCounts[topSig.id] >= 5 ? 'High' : signalCounts[topSig.id] >= 2 ? 'Medium' : 'Low',
    }

    // P4: Unrouted observations (but not old enough to flag)
    if (attentionQueue.length > 0) return {
      icon:     '◈',
      headline: 'OBSERVATIONS AWAITING ROUTING',
      color:    '#6b7280',
      bg:       'var(--bg-2)',
      border:   'var(--border-1)',
      action:   `${attentionQueue.length} observation${attentionQueue.length !== 1 ? 's' : ''} entered but haven't been routed yet.`,
      source:   'Attention Map · Route through Atrium',
      strength: 'Low',
    }

    // All clear
    return {
      icon:     '✓',
      headline: 'ALL CLEAR',
      color:    '#6b7280',
      bg:       'var(--bg-2)',
      border:   'var(--border-1)',
      action:   observations.length === 0
        ? 'No observations in system. Reality enters through the Atrium.'
        : 'No urgent signals detected. PACER is monitoring.',
      source:   `${observations.length} observation${observations.length !== 1 ? 's' : ''} in system`,
      strength: null,
    }
  }, [threads, attentionQueue, activeSignals, signalCounts, patterns, observations, now, productions, mediaAssets])

  // Featured broadcast — media asset takes precedence over production
  // Requires actual media URL so a broken/empty asset doesn't hold the featured slot
  const featuredBroadcast = useMemo(() => {
    const recentMedia = [...mediaAssets]
      .filter(a => a.publishedAt && a.opsCoreSignal && (a.videoUrl || a.audioUrl))
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))[0]
    if (recentMedia) return { type: 'media', asset: recentMedia }
    const recentProd = [...productions]
      .filter(p => p.publishedAt && p.opsCoreSignal && p.videoUrl)
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))[0]
    if (recentProd) return { type: 'production', asset: recentProd }
    return null
  }, [mediaAssets, productions])

  // Derives from existing computed state — no new data needed
  const envState = featuredBroadcast ? 'live' : lead.strength === 'High' ? 'attention' : 'standby'

  const strengthColor = { High: '#ef4444', Medium: '#f59e0b', Low: '#6b7280' }

  function handleBrief() {
    if (briefing) return
    const parts = ['OpsCore field briefing.']
    parts.push(`Lead signal: ${lead.headline}. ${lead.action}`)
    if (attentionQueue.length > 0) {
      parts.push(`${attentionQueue.length} observation${attentionQueue.length !== 1 ? 's' : ''} awaiting routing.`)
    }
    if (pendingActions.length > 0) {
      parts.push(`${pendingActions.length} K.E.L. recommendation${pendingActions.length !== 1 ? 's' : ''} pending action.`)
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

  async function handleGenerateBrief() {
    if (briefLoading || !onBuildBrief) return
    setBriefLoading(true)
    try {
      const text = await onBuildBrief(true) // force: bypass cache
      setMorningBrief(text || '')
    } catch (e) {
      console.error('[OpsCore brief]', e)
    } finally {
      setBriefLoading(false)
    }
  }

  function handleSpeakBrief() {
    if (!morningBrief || briefSpeaking) return
    speakWithVoice(morningBrief, getVoiceConfig('vera'), {
      onStart: () => setBriefSpeaking(true),
      onEnd:   () => setBriefSpeaking(false),
      onError: () => setBriefSpeaking(false),
    })
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ position: 'relative' }}>
      <OpsCoreEnvironment envState={envState} />

      <div className="flex-1 flex flex-col overflow-hidden" style={{ position: 'relative', zIndex: 10 }}>

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

      <RoomSubNav tabs={OPSCORE_TABS} activeTab={view} onSelect={setView} />

      {view === 'broadcast' && <BroadcastPanel featuredBroadcast={featuredBroadcast} isMobile={isMobile} />}
      {view === 'assets'    && <AssetsPanel mediaAssets={mediaAssets} isMobile={isMobile} />}

      {view === 'attention' && (
      <div className={`flex-1 overflow-y-auto ${px} py-5`} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* ── MORNING BRIEF — flagship entry point ─────────────────────────── */}
        <div style={{
          background: '#020b18',
          border: '1px solid #1d4ed820',
          borderLeft: '4px solid #3b82f6',
          borderRadius: '0 10px 10px 0',
          overflow: 'hidden',
        }}>
          <div style={{ padding: isMobile ? '16px' : '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <p style={{ color: '#3b82f6', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>
                  🎙 Morning Brief
                </p>
                <p style={{ color: 'var(--text-5)', fontSize: '11px' }}>
                  {morningBrief ? 'Current as of now' : 'What happened since you were last here'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center' }}>
                {morningBrief && (
                  <button
                    onClick={handleSpeakBrief}
                    disabled={briefSpeaking}
                    style={{
                      background: briefSpeaking ? 'var(--bg-2)' : '#030d1a',
                      border: `1px solid ${briefSpeaking ? 'var(--border-1)' : '#3b82f640'}`,
                      borderRadius: '6px', padding: '7px 12px',
                      color: briefSpeaking ? 'var(--text-5)' : '#60a5fa',
                      fontSize: '11px', fontWeight: 600,
                      cursor: briefSpeaking ? 'default' : 'pointer', whiteSpace: 'nowrap',
                    }}
                  >
                    {briefSpeaking ? '🔊 Speaking…' : '🔊 Play'}
                  </button>
                )}
                <button
                  onClick={handleGenerateBrief}
                  disabled={briefLoading || !onBuildBrief}
                  style={{
                    background: briefLoading ? 'var(--bg-2)' : apiKey ? '#1d3a6e' : 'var(--bg-2)',
                    border: `1px solid ${briefLoading ? 'var(--border-1)' : apiKey ? '#3b82f660' : 'var(--border-1)'}`,
                    borderRadius: '6px', padding: '7px 16px',
                    color: briefLoading ? 'var(--text-5)' : apiKey ? '#93c5fd' : 'var(--text-5)',
                    fontSize: '11px', fontWeight: 700,
                    cursor: briefLoading || !onBuildBrief ? 'default' : 'pointer', whiteSpace: 'nowrap',
                  }}
                >
                  {briefLoading ? 'Generating…' : morningBrief ? '↺ Refresh' : '▶ Generate'}
                </button>
              </div>
            </div>

            {morningBrief && (
              <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #1d4ed815' }}>
                <p style={{ color: 'var(--text-1)', fontSize: isMobile ? '13px' : '14px', lineHeight: 1.85, fontStyle: 'italic' }}>
                  {morningBrief}
                </p>
              </div>
            )}

            {!morningBrief && !apiKey && (
              <p style={{ color: 'var(--text-6)', fontSize: '10px', marginTop: '10px' }}>
                Connect Claude in Settings to enable AI-generated briefs.
              </p>
            )}
          </div>
        </div>

        {/* ── LEAD SIGNAL / FEATURED BROADCAST — command card ─────────────── */}
        <div style={{
          background: lead.bg,
          border: `1px solid ${lead.border}`,
          borderLeft: `4px solid ${lead.color}`,
          borderRadius: '0 10px 10px 0',
          overflow: 'hidden',
        }}>
          <div style={{ padding: isMobile ? '18px 16px' : '22px 24px' }}>
            {/* Headline row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ color: lead.color, fontSize: '18px', lineHeight: 1 }}>{lead.icon}</span>
              <p style={{
                color: lead.color, fontSize: '11px', fontWeight: 800,
                letterSpacing: '0.18em', textTransform: 'uppercase',
              }}>
                {lead.headline}
              </p>
              {lead.strength && (
                <span style={{
                  background: strengthColor[lead.strength] + '15',
                  border: `1px solid ${strengthColor[lead.strength]}30`,
                  color: strengthColor[lead.strength],
                  fontSize: '9px', fontWeight: 700, borderRadius: '4px',
                  padding: '2px 7px', letterSpacing: '0.1em', textTransform: 'uppercase',
                  marginLeft: 'auto',
                }}>
                  {lead.strength}
                </span>
              )}
            </div>

            {/* Action */}
            <div style={{ marginBottom: featuredBroadcast ? '16px' : '14px' }}>
              <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                {featuredBroadcast ? 'Featured Broadcast' : 'Recommended Action'}
              </p>
              <p style={{ color: 'var(--text-0)', fontSize: isMobile ? '14px' : '15px', fontWeight: 500, lineHeight: 1.55 }}>
                {lead.action}
              </p>
            </div>
          </div>

          {/* Featured broadcast — media asset (video + audio + transcript) */}
          {featuredBroadcast?.type === 'media' && (() => {
            const asset = featuredBroadcast.asset
            const videoE = videoEmbed(asset.videoUrl)
            const audioE = audioEmbed(asset.audioUrl)
            return (
              <>
                {videoE && (
                  <div style={{ background: '#000', borderTop: `1px solid ${lead.color}20` }}>
                    {videoE.type === 'iframe' ? (
                      <iframe src={videoE.src} style={{ width: '100%', aspectRatio: '16/9', border: 'none', display: 'block' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    ) : (
                      <video controls src={videoE.src} style={{ width: '100%', display: 'block', maxHeight: '320px', objectFit: 'contain' }} />
                    )}
                  </div>
                )}
                {audioE && (
                  <div style={{ borderTop: `1px solid ${lead.color}15`, background: 'var(--bg-2)' }}>
                    {audioE.type === 'iframe' ? (
                      <iframe src={audioE.src} style={{ width: '100%', height: '120px', border: 'none', display: 'block' }} scrolling="no" frameBorder="no" allow="autoplay" />
                    ) : (
                      <audio controls src={audioE.src} style={{ width: '100%', display: 'block', padding: '12px 16px' }} />
                    )}
                  </div>
                )}
                {asset.transcript && (
                  <div style={{ borderTop: `1px solid ${lead.color}15`, padding: '14px 24px' }}>
                    <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>📄 Script</p>
                    <p style={{ color: 'var(--text-3)', fontSize: '12px', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
                      {asset.transcript.length > 400 ? asset.transcript.slice(0, 400) + '…' : asset.transcript}
                    </p>
                  </div>
                )}
              </>
            )
          })()}

          {/* Featured broadcast — published production with videoUrl */}
          {featuredBroadcast?.type === 'production' && featuredBroadcast.asset.videoUrl && (() => {
            const embed = videoEmbed(featuredBroadcast.asset.videoUrl)
            if (!embed) return null
            return (
              <div style={{ background: '#000', borderTop: `1px solid ${lead.color}20` }}>
                {embed.type === 'iframe' ? (
                  <iframe src={embed.src} style={{ width: '100%', aspectRatio: '16/9', border: 'none', display: 'block' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                ) : (
                  <video controls src={embed.src} style={{ width: '100%', display: 'block', maxHeight: '320px', objectFit: 'contain' }} />
                )}
              </div>
            )
          })()}

          {/* Source */}
          <div style={{ padding: featuredBroadcast ? '10px 24px 14px' : '0 24px 14px' }}>
            <p style={{ color: 'var(--text-6)', fontSize: '10px' }}>
              {lead.source}
            </p>
          </div>
        </div>

        {/* ── SUPPORTING: Attention Map + Emerging Patterns ────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', alignItems: 'start' }}>

          {/* ATTENTION MAP */}
          <section>
            <p style={SECTION}>Attention Map</p>
            <p style={{ color: 'var(--text-5)', fontSize: '11px', marginBottom: '10px' }}>
              Unrouted observations — oldest first.
            </p>
            {attentionQueue.length === 0 ? (
              <div style={{ background: 'var(--bg-2)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-5)', fontSize: '12px' }}>
                  {observations.length === 0 ? 'No observations yet.' : 'All observations routed.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {attentionQueue.map((obs, i) => {
                  const ts  = obs.timestamp?.toDate?.() || new Date()
                  const age = now - ts.getTime()
                  const ageLabel = age > 30 * day ? `${Math.floor(age / (30 * day))}mo ago`
                    : age > week ? `${Math.floor(age / week)}w ago`
                    : age > day  ? `${Math.floor(age / day)}d ago`
                    : 'Today'
                  const urgent = age > week
                  return (
                    <div key={obs.id} style={{
                      background: 'var(--bg-2)',
                      border: `1px solid ${urgent ? '#f9731618' : 'var(--border-0)'}`,
                      borderLeft: `3px solid ${urgent ? '#f97316' : 'var(--border-2)'}`,
                      borderRadius: '0 6px 6px 0', padding: '10px 12px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: obs.constellation ? '4px' : '0' }}>
                        {obs.constellation && (
                          <span style={{ color: '#a07830', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            ✦ {obs.constellation}
                          </span>
                        )}
                        <span style={{ color: urgent ? '#f97316' : 'var(--text-6)', fontSize: '9px', marginLeft: 'auto', flexShrink: 0 }}>
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

          {/* EMERGING PATTERNS — all constellations, no filter */}
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
                {patterns.map(([name, count], i) => {
                  const sig = matchSignal(name)
                  const barPct = Math.max(6, Math.round((count / maxPattern) * 100))
                  const isLead = i === 0
                  return (
                    <div key={name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{
                          color: sig?.color || (isLead ? '#a07830' : 'var(--text-3)'),
                          fontSize: isLead ? '12px' : '11px',
                          fontWeight: isLead ? 600 : 400,
                        }}>
                          ✦ {name}
                        </span>
                        <span style={{ color: isLead ? 'var(--text-3)' : 'var(--text-5)', fontSize: '10px' }}>
                          {count}
                        </span>
                      </div>
                      <div style={{ height: isLead ? '4px' : '3px', background: 'var(--bg-3)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${barPct}%`,
                          background: sig?.color || (isLead ? '#a07830' : 'var(--border-2)'),
                          borderRadius: '2px',
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

        </div>

        {/* ── ACTIVE SIGNALS — supporting context ──────────────────────────── */}
        {activeSignals.length > 0 && (
          <section>
            <p style={SECTION}>Active Signals</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {SIGNAL_TYPES.filter(s => signalCounts[s.id] > 0).map(sig => (
                <div key={sig.id} style={{
                  background: sig.color + '08',
                  border: `1px solid ${sig.color}25`,
                  borderLeft: `3px solid ${sig.color}`,
                  borderRadius: '0 7px 7px 0',
                  padding: '8px 14px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <span style={{ color: sig.color, fontSize: '18px', fontWeight: 700, lineHeight: 1 }}>
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
          </section>
        )}

        {/* ── SUPPORTING KEL ACTIONS — when more than one pending ─────────── */}
        {pendingActions.length > 1 && (
          <section>
            <p style={SECTION}>Additional Pending Actions</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {pendingActions.slice(1).map(thread => (
                <div key={thread.id} style={{
                  background: 'var(--bg-2)',
                  border: `1px solid ${thread.decision === 'approved' ? '#10b98118' : 'var(--border-0)'}`,
                  borderLeft: `3px solid ${thread.decision === 'approved' ? '#10b981' : 'var(--border-2)'}`,
                  borderRadius: '0 7px 7px 0', padding: '10px 14px',
                }}>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '5px', alignItems: 'center' }}>
                    {thread.decision && (
                      <span style={{
                        background: thread.decision === 'approved' ? '#10b98112' : 'var(--bg-3)',
                        border: `1px solid ${thread.decision === 'approved' ? '#10b98135' : 'var(--border-1)'}`,
                        color: thread.decision === 'approved' ? '#10b981' : 'var(--text-5)',
                        fontSize: '9px', fontWeight: 600, borderRadius: '4px', padding: '2px 6px',
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                      }}>
                        {thread.decision}
                      </span>
                    )}
                    {thread.domain && (
                      <span style={{ color: 'var(--text-5)', fontSize: '9px' }}>{thread.domain}</span>
                    )}
                  </div>
                  <p style={{ color: 'var(--text-2)', fontSize: '11px', lineHeight: 1.5 }}>
                    {(thread.recommendation || '').length > 130
                      ? thread.recommendation.slice(0, 130) + '…'
                      : thread.recommendation || '—'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <div style={{ paddingBottom: '16px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-6)', fontSize: '10px' }}>
            {observations.length} observation{observations.length !== 1 ? 's' : ''} in system
            {' · '}
            {threads.length} K.E.L. thread{threads.length !== 1 ? 's' : ''}
            {' · '}
            {patterns.length} active constellation{patterns.length !== 1 ? 's' : ''}
            {mediaAssets.length > 0 && ` · ${mediaAssets.length} media asset${mediaAssets.length !== 1 ? 's' : ''}`}
          </p>
        </div>

      </div>
      )}

      </div>
    </div>
  )
}
