import { useState, useRef } from 'react'
import { enrichForFormat, FORMATS } from '../lib/theaterEnrichment'
import { createMultiManifestTest } from '../lib/db'
import { uploadMediaVideo, uploadMediaAudio } from '../lib/mediaUpload'
import RoomSubNav from './RoomSubNav'
import { speakWithVoice, getVoiceConfig } from '../lib/roomVoice'
import { theaterProductionPipelineStage, mediaAssetPipelineStage } from '../lib/pipelineStage'
import { PipelinePill } from './PipelinePill'
import LineageChain from './LineageChain'

export function videoEmbed(url) {
  if (!url) return null
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (yt) return { type: 'iframe', src: `https://www.youtube.com/embed/${yt[1]}` }
  const vi = url.match(/(?:vimeo\.com\/)(\d+)/)
  if (vi) return { type: 'iframe', src: `https://player.vimeo.com/video/${vi[1]}` }
  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)) return { type: 'video', src: url }
  return null
}

export function audioEmbed(url) {
  if (!url) return null
  if (/soundcloud\.com\//.test(url)) return {
    type: 'iframe',
    src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23a855f7&inverse=false&auto_play=false&show_user=true`,
  }
  if (/\.(mp3|wav|ogg|m4a|aac|opus|flac)(\?|$)/i.test(url)) return { type: 'audio', src: url }
  return null
}

function AudioPlayer({ url }) {
  const embed = audioEmbed(url)
  if (!embed) return null
  if (embed.type === 'iframe') {
    return (
      <iframe
        src={embed.src}
        style={{ width: '100%', height: '120px', border: 'none', display: 'block' }}
        allow="autoplay"
        scrolling="no"
        frameBorder="no"
      />
    )
  }
  return (
    <audio
      controls
      src={embed.src}
      style={{ width: '100%', display: 'block' }}
    />
  )
}

const MEDIA_ERR_LABELS = {
  1: 'Playback aborted.',
  2: 'Network error — check your connection or the file URL.',
  3: 'Codec not supported by this browser (try H.264 MP4).',
  4: 'Format not supported or source unavailable.',
}

function VideoPlayer({ url, large }) {
  const [videoError, setVideoError] = useState(null)
  const embed = videoEmbed(url)
  if (!embed) return null
  if (embed.type === 'iframe') {
    return (
      <iframe
        src={embed.src}
        style={{ width: '100%', aspectRatio: '16/9', border: 'none', display: 'block' }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    )
  }
  return (
    <div style={{ position: 'relative', background: '#000' }}>
      {videoError && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '8px',
          background: '#0a0010', zIndex: 2, padding: '16px',
        }}>
          <p style={{ color: '#ef4444', fontSize: '11px', fontWeight: 700 }}>⚠ Playback Error</p>
          <p style={{ color: '#fca5a5', fontSize: '11px', textAlign: 'center', lineHeight: 1.6 }}>
            {MEDIA_ERR_LABELS[videoError.code] || videoError.message || 'Unknown playback error.'}
          </p>
          <p style={{ color: '#7f1d1d', fontSize: '10px' }}>Error code {videoError.code}</p>
        </div>
      )}
      <video
        controls
        src={embed.src}
        onError={e => { console.error('[VideoPlayer] error:', e.target.error); setVideoError(e.target.error) }}
        onPlay={() => setVideoError(null)}
        style={{
          width: '100%', display: 'block', objectFit: 'contain', background: '#000',
          aspectRatio: large ? '16/9' : undefined,
          maxHeight: large ? '600px' : '260px',
        }}
      />
    </div>
  )
}

const SCENE_TYPES = [
  { id: 'intro',          label: 'Intro',          order: 0, color: '#3b82f6' },
  { id: 'proof',          label: 'Proof',           order: 1, color: '#10b981' },
  { id: 'emotional_beat', label: 'Emotional Beat',  order: 2, color: '#a855f7' },
  { id: 'product_demo',   label: 'Product Demo',    order: 3, color: '#f59e0b' },
  { id: 'transition',     label: 'Transition',      order: 4, color: '#6b7280' },
  { id: 'outro',          label: 'Outro',           order: 5, color: '#06b6d4' },
]

const THEATER_TABS = [
  { id: 'office',    label: '📦 Production Office' },
  { id: 'stage',     label: '🎭 Staging' },
  { id: 'media',     label: '🎬 Media' },
  { id: 'remix',     label: '✂️ Remix Board' },
  { id: 'published', label: 'Published' },
  { id: 'archive',   label: 'Archive' },
  { id: 'about',     label: 'About' },
]

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_META = {
  incoming:      { label: 'Incoming',      color: '#3b82f6', bg: '#060d1a' },
  in_production: { label: 'In Production', color: '#f59e0b', bg: '#100900' },
  staged:        { label: 'Staged',        color: '#8b5cf6', bg: '#0a0616' },
  approved:      { label: 'Approved',      color: '#10b981', bg: '#041208' },
  delivered:     { label: 'Delivered',     color: '#06b6d4', bg: '#001520' },
  archived:      { label: 'Archived',      color: '#374151', bg: 'var(--bg-1)' },
}

const STUDIO_OPTIONS = [
  { id: '',             label: 'Unassigned'        },
  { id: 'image',        label: '🎨 Image Studio'   },
  { id: 'story',        label: '📖 Story Studio'   },
  { id: 'infographic',  label: '📊 Infographic'    },
  { id: 'presentation', label: '📄 Presentation'   },
  { id: 'video',        label: '🎬 Video Studio'   },
  { id: 'multi',        label: '🎭 Multi-Format'   },
]

const TEACHINGS = [
  { label: 'Evidence deserves a witness.', note: 'Proof that nobody sees is proof that disappears. Theater exists so what survived can be seen.' },
  { label: 'Lessons should travel.', note: 'A lesson trapped inside one person is an anecdote. A lesson that reaches the next person is inheritance.' },
  { label: 'Proof should be preserved.', note: 'The documentary outlasts the project. The record outlasts the deadline. Archivist Hall holds it. Theater transmits it.' },
  { label: 'What survives should be shared.', note: 'The graduate earns the plaque. Theater earns the obligation to tell what the plaque cannot.' },
]

const FLEETFLOW_ACTS = [
  { label: 'Act I',   title: 'The Problem',     note: 'Thirty years in moving. Broken communication, missed invoices, claims, repeated mistakes.' },
  { label: 'Act II',  title: 'The Discipline',  note: 'Observation. Memory. Accountability. Operational stewardship.' },
  { label: 'Act III', title: 'The Forge',        note: 'The building of FleetFlow. The testing. The failures. The iterations.' },
  { label: 'Act IV',  title: 'The Graduate',     note: 'FleetFlow — not as a product. As evidence. Proof that the discipline survived contact with reality.' },
  { label: 'Act V',   title: 'The Next Builder', note: 'The door. Builder Studio. The empty plaque. The resident walking toward the forge.' },
]

const PRESERVATION_OPTIONS = [
  { id: 'preserved', label: 'Preserved', color: '#10b981' },
  { id: 'shifted',   label: 'Shifted',   color: '#f59e0b' },
  { id: 'drifted',   label: 'Drifted',   color: '#ef4444' },
]

const LIVE_FORMATS = FORMATS.filter(f => f.available)
const ORDINALS = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth']
function ordinal(n) { return ORDINALS[n - 1] ?? `#${n}` }

// ── Shared components ─────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.incoming
  return (
    <span style={{
      background: meta.bg, border: `1px solid ${meta.color}50`,
      borderRadius: '4px', padding: '2px 8px',
      color: meta.color, fontSize: '9px', fontWeight: 700,
      letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0,
    }}>
      {meta.label}
    </span>
  )
}

// ── Production Office ─────────────────────────────────────────────────────────

function IncomingCard({ observation, onStart, starting }) {
  return (
    <div style={{
      background: 'var(--bg-2)', border: '1px solid var(--border-1)',
      borderLeft: '3px solid #3b82f640', borderRadius: '0 8px 8px 0',
      padding: '12px 16px', display: 'flex', alignItems: 'flex-start',
      justifyContent: 'space-between', gap: '12px',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {(observation.constellation || observation.claude?.destination) && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            {observation.constellation && (
              <span style={{ color: '#a07830', fontSize: '9px', fontWeight: 600 }}>
                ✦ {observation.constellation}
              </span>
            )}
            {observation.claude?.destination && (
              <span style={{ color: 'var(--text-5)', fontSize: '9px' }}>
                → {observation.claude.destination}
              </span>
            )}
          </div>
        )}
        <p style={{ color: 'var(--text-2)', fontSize: '12px', lineHeight: 1.55 }}>
          {(observation.text || '').length > 100
            ? observation.text.slice(0, 100) + '…'
            : observation.text || '—'}
        </p>
        <p style={{ color: 'var(--text-6)', fontSize: '10px', marginTop: '4px' }}>
          {observation.timestamp instanceof Date
            ? observation.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : ''}
        </p>
      </div>
      <button
        onClick={() => onStart(observation)}
        disabled={starting}
        style={{
          flexShrink: 0, background: '#060d1a', border: '1px solid #1d4ed860',
          borderRadius: '6px', padding: '7px 14px', color: '#60a5fa',
          fontSize: '11px', fontWeight: 600, cursor: starting ? 'default' : 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {starting ? '…' : 'Start Production →'}
      </button>
    </div>
  )
}

function productionToNarration(production) {
  const meta = STATUS_META[production.status] || STATUS_META.incoming
  const studioLabel = STUDIO_OPTIONS.find(s => s.id === (production.studio || ''))?.label
  const parts = [`Production: ${production.title || 'Untitled'}.`]
  parts.push(`Status: ${meta.label}.`)
  if (production.sourceText) parts.push(`Origin observation: "${production.sourceText.slice(0, 200)}".`)
  if (production.sourceConstellation) parts.push(`Constellation: ${production.sourceConstellation}.`)
  if (studioLabel && production.studio) parts.push(`Studio: ${studioLabel}.`)
  if (production.deliveryDestination) parts.push(`Delivery destination: ${production.deliveryDestination}.`)
  if (production.humanGateStatus) parts.push(`Human Gate: ${production.humanGateStatus}.`)
  if (production.notes) parts.push(production.notes)
  const outputCount = Object.keys(production.outputs || {}).length
  if (outputCount > 0) parts.push(`${outputCount} output format${outputCount !== 1 ? 's' : ''} produced.`)
  return parts.filter(Boolean).join(' ')
}

function ProductionCard({ production, expanded, onToggle, onSave, onStage, onArchive, onPublish, isMobile }) {
  const [edit, setEdit] = useState(null)
  const [saving, setSaving] = useState(false)
  const [narrating, setNarrating] = useState(false)
  const [publishing, setPublishing] = useState(false)

  async function handlePublish() {
    if (publishing || !onPublish) return
    setPublishing(true)
    try {
      await onPublish(production.id, production.title || 'Untitled Production')
    } finally {
      setPublishing(false)
    }
  }

  function handleNarrate() {
    if (narrating) return
    const script = productionToNarration(production)
    speakWithVoice(script, getVoiceConfig('vera'), {
      onStart: () => setNarrating(true),
      onEnd:   () => setNarrating(false),
      onError: () => setNarrating(false),
    })
  }

  function handleToggle() {
    if (expanded) {
      setEdit(null)
      onToggle(null)
    } else {
      setEdit({
        title:               production.title               || '',
        status:              production.status              || 'in_production',
        studio:              production.studio              || '',
        deliveryDestination: production.deliveryDestination || '',
        humanGateStatus:     production.humanGateStatus     || '',
        notes:               production.notes              || '',
        videoUrl:            production.videoUrl            || '',
      })
      onToggle(production.id)
    }
  }

  async function handleSave() {
    setSaving(true)
    await onSave(production.id, {
      title:               edit.title || 'Untitled Production',
      status:              edit.status,
      studio:              edit.studio              || null,
      deliveryDestination: edit.deliveryDestination || null,
      humanGateStatus:     edit.humanGateStatus     || null,
      notes:               edit.notes,
      videoUrl:            edit.videoUrl            || null,
    })
    setSaving(false)
  }

  const meta = STATUS_META[production.status] || STATUS_META.incoming
  const outputCount = Object.keys(production.outputs || {}).length
  const studioLabel = STUDIO_OPTIONS.find(s => s.id === (production.studio || ''))?.label

  return (
    <div style={{
      border: `1px solid ${expanded ? meta.color + '35' : 'var(--border-1)'}`,
      borderLeft: `3px solid ${meta.color}`,
      borderRadius: '0 8px 8px 0', overflow: 'hidden', transition: 'border-color 0.15s',
    }}>
      {/* Header row */}
      <button
        onClick={handleToggle}
        style={{
          width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
          background: expanded ? meta.bg : 'var(--bg-2)',
          padding: '12px 16px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '10px',
          transition: 'background 0.15s',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <StatusBadge status={production.status} />
            {studioLabel && production.studio && (
              <span style={{ color: 'var(--text-5)', fontSize: '10px' }}>{studioLabel}</span>
            )}
            {production.publishedAt && (
              <span style={{ color: '#10b981', fontSize: '10px', fontWeight: 600 }}>📡 OpsCore</span>
            )}
            {outputCount > 0 && (
              <span style={{ color: 'var(--text-5)', fontSize: '10px' }}>
                · {outputCount} output{outputCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-1)', fontSize: '12px', fontWeight: 500, lineHeight: 1.4, marginBottom: '5px' }}>
            {production.title || 'Untitled Production'}
          </p>
          <PipelinePill {...theaterProductionPipelineStage(production)} />
        </div>
        <span style={{ color: 'var(--text-5)', fontSize: '11px', flexShrink: 0 }}>
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      {/* Expanded detail */}
      {expanded && edit && (
        <div style={{ padding: '16px', borderTop: `1px solid ${meta.color}20`, background: 'var(--bg-1)' }}>

          {/* Title */}
          <div style={{ marginBottom: '14px' }}>
            <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.12em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '5px' }}>Title</p>
            <input
              value={edit.title}
              onChange={e => setEdit(p => ({ ...p, title: e.target.value }))}
              style={{
                width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border-2)',
                borderRadius: '6px', padding: '8px 12px', color: 'var(--text-0)',
                fontSize: '13px', fontFamily: 'inherit', outline: 'none',
              }}
            />
          </div>

          {/* Origin */}
          <div style={{
            background: 'var(--bg-2)', border: '1px solid var(--border-0)',
            borderRadius: '6px', padding: '12px 14px', marginBottom: '14px',
          }}>
            <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.12em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>Origin</p>
            <p style={{ color: 'var(--text-3)', fontSize: '11px', lineHeight: 1.65, marginBottom: '6px', fontStyle: 'italic' }}>
              "{(production.sourceText || 'No source text').length > 130
                ? production.sourceText.slice(0, 130) + '…'
                : production.sourceText || 'No source text'}"
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {production.sourceConstellation && (
                <span style={{ color: '#a07830', fontSize: '10px' }}>✦ {production.sourceConstellation}</span>
              )}
              {production.manifestDecision && (
                <span style={{ color: 'var(--text-5)', fontSize: '10px' }}>Route: {production.manifestDecision}</span>
              )}
            </div>
          </div>

          {/* Status + Studio */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '10px', marginBottom: '12px',
          }}>
            <div>
              <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.12em',
                textTransform: 'uppercase', fontWeight: 600, marginBottom: '5px' }}>Status</p>
              <select
                value={edit.status}
                onChange={e => setEdit(p => ({ ...p, status: e.target.value }))}
                style={{
                  width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border-2)',
                  borderRadius: '6px', padding: '7px 10px', color: 'var(--text-1)',
                  fontSize: '11px', fontFamily: 'inherit', outline: 'none',
                }}
              >
                {Object.entries(STATUS_META).map(([id, m]) => (
                  <option key={id} value={id}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.12em',
                textTransform: 'uppercase', fontWeight: 600, marginBottom: '5px' }}>Studio</p>
              <select
                value={edit.studio}
                onChange={e => setEdit(p => ({ ...p, studio: e.target.value }))}
                style={{
                  width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border-2)',
                  borderRadius: '6px', padding: '7px 10px', color: 'var(--text-1)',
                  fontSize: '11px', fontFamily: 'inherit', outline: 'none',
                }}
              >
                {STUDIO_OPTIONS.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Delivery destination */}
          <div style={{ marginBottom: '12px' }}>
            <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.12em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '5px' }}>Delivery Destination</p>
            <input
              value={edit.deliveryDestination}
              onChange={e => setEdit(p => ({ ...p, deliveryDestination: e.target.value }))}
              placeholder="Broker outreach, FleetFlow marketing, Social media…"
              style={{
                width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border-2)',
                borderRadius: '6px', padding: '8px 12px', color: 'var(--text-1)',
                fontSize: '12px', fontFamily: 'inherit', outline: 'none',
              }}
            />
          </div>

          {/* Human Gate */}
          <div style={{ marginBottom: '14px' }}>
            <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.12em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '7px' }}>Human Gate</p>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { id: 'pending',  label: 'Pending',  color: '#f59e0b' },
                { id: 'approved', label: 'Approved', color: '#10b981' },
                { id: 'denied',   label: 'Denied',   color: '#ef4444' },
              ].map(gate => (
                <button
                  key={gate.id}
                  onClick={() => setEdit(p => ({
                    ...p, humanGateStatus: p.humanGateStatus === gate.id ? '' : gate.id,
                  }))}
                  style={{
                    padding: '5px 12px', borderRadius: '5px', fontSize: '11px',
                    fontWeight: 600, cursor: 'pointer',
                    background: edit.humanGateStatus === gate.id ? gate.color + '15' : 'var(--bg-2)',
                    border: `1px solid ${edit.humanGateStatus === gate.id ? gate.color : 'var(--border-2)'}`,
                    color: edit.humanGateStatus === gate.id ? gate.color : 'var(--text-4)',
                  }}
                >
                  {gate.label}
                </button>
              ))}
            </div>
          </div>

          {/* Outputs list */}
          {outputCount > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.12em',
                textTransform: 'uppercase', fontWeight: 600, marginBottom: '7px' }}>
                Outputs ({outputCount})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {Object.entries(production.outputs).map(([fmtId, out]) => {
                  const fmt = FORMATS.find(f => f.id === fmtId)
                  return (
                    <div key={fmtId} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      background: 'var(--bg-2)', borderRadius: '5px', padding: '6px 10px',
                    }}>
                      <span style={{ fontSize: '12px' }}>{fmt?.icon || '📦'}</span>
                      <p style={{ color: 'var(--text-2)', fontSize: '11px', fontWeight: 500 }}>
                        {fmt?.label || fmtId}
                      </p>
                      {out.savedAt && (
                        <p style={{ color: 'var(--text-6)', fontSize: '10px', marginLeft: 'auto' }}>
                          {new Date(out.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Video URL */}
          <div style={{ marginBottom: '12px' }}>
            <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.12em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '5px' }}>Video URL</p>
            <input
              value={edit.videoUrl}
              onChange={e => setEdit(p => ({ ...p, videoUrl: e.target.value }))}
              placeholder="YouTube, Vimeo, or direct .mp4 link…"
              style={{
                width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border-2)',
                borderRadius: '6px', padding: '8px 12px', color: 'var(--text-1)',
                fontSize: '12px', fontFamily: 'inherit', outline: 'none',
              }}
            />
          </div>

          {/* Video preview */}
          {production.videoUrl && (
            <div style={{ marginBottom: '14px', borderRadius: '8px', overflow: 'hidden',
              border: '1px solid var(--border-1)', background: '#000' }}>
              <VideoPlayer url={production.videoUrl} />
            </div>
          )}

          {/* Notes */}
          <div style={{ marginBottom: '14px' }}>
            <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.12em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '5px' }}>Notes</p>
            <textarea
              value={edit.notes}
              onChange={e => setEdit(p => ({ ...p, notes: e.target.value }))}
              placeholder="Production notes, direction, context…"
              rows={2}
              style={{
                width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border-2)',
                borderRadius: '6px', padding: '8px 12px', color: 'var(--text-1)',
                fontSize: '12px', fontFamily: 'inherit', resize: 'vertical', outline: 'none',
              }}
            />
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex', gap: '8px', justifyContent: 'space-between',
            paddingTop: '10px', borderTop: '1px solid var(--border-0)',
          }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                onClick={handleNarrate}
                disabled={narrating}
                style={{
                  background: narrating ? 'var(--bg-2)' : '#030d1a',
                  border: `1px solid ${narrating ? 'var(--border-1)' : '#3b82f640'}`,
                  borderRadius: '6px', padding: '7px 12px',
                  color: narrating ? 'var(--text-5)' : '#60a5fa',
                  fontSize: '11px', fontWeight: 600,
                  cursor: narrating ? 'default' : 'pointer',
                }}
              >
                {narrating ? '🔊 Narrating…' : '🔊 Narrate'}
              </button>
              <button
                onClick={() => onStage(production.sourceText)}
                style={{
                  background: '#0a0616', border: '1px solid #8b5cf640', borderRadius: '6px',
                  padding: '7px 14px', color: '#8b5cf6', fontSize: '11px', fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                🎭 Stage This
              </button>
              {production.status !== 'archived' && (
                <button
                  onClick={() => onArchive(production.id)}
                  style={{
                    background: 'none', border: '1px solid var(--border-1)', borderRadius: '6px',
                    padding: '7px 12px', color: 'var(--text-5)', fontSize: '11px', cursor: 'pointer',
                  }}
                >
                  Archive
                </button>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: saving ? 'var(--bg-2)' : '#041208',
                border: `1px solid ${saving ? 'var(--border-1)' : '#10b98140'}`,
                borderRadius: '6px', padding: '7px 16px',
                color: saving ? 'var(--text-5)' : '#10b981',
                fontSize: '11px', fontWeight: 600, cursor: saving ? 'default' : 'pointer',
              }}
            >
              {saving ? 'Saving…' : 'Save ✓'}
            </button>
          </div>

          {/* Publish gate — only when Human Gate approved and not yet published */}
          {production.humanGateStatus === 'approved' && !production.publishedAt && (
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #10b98118' }}>
              <button
                onClick={handlePublish}
                disabled={publishing}
                style={{
                  width: '100%', background: publishing ? 'var(--bg-2)' : '#041208',
                  border: `1px solid ${publishing ? 'var(--border-1)' : '#10b98140'}`,
                  borderRadius: '7px', padding: '10px 16px',
                  color: publishing ? 'var(--text-5)' : '#10b981',
                  fontSize: '12px', fontWeight: 700,
                  cursor: publishing ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {publishing ? 'Publishing…' : '📡 Publish to OpsCore'}
              </button>
            </div>
          )}

          {/* Published confirmation */}
          {production.publishedAt && (
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #10b98115',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 600 }}>✓ Published to OpsCore</span>
              <span style={{ color: 'var(--text-6)', fontSize: '10px' }}>
                · {new Date(production.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}

        </div>
      )}
    </div>
  )
}

function ProductionOffice({ observations, productions, onCreateProduction, onUpdateProduction, onPublish, onStage, isMobile }) {
  const [expandedId, setExpandedId]   = useState(null)
  const [startingId, setStartingId]   = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')

  const incomingObs = observations.filter(o =>
    o.destination === 'Theater' || o.destination === 'OpsCore' &&
    !productions.some(p => p.sourceObservationId === o.id)
  )

  const filtered = statusFilter === 'all'
    ? productions
    : productions.filter(p => p.status === statusFilter)

  const counts = {
    incoming:      incomingObs.length,
    in_production: productions.filter(p => p.status === 'in_production').length,
    staged:        productions.filter(p => p.status === 'staged').length,
    approved:      productions.filter(p => p.status === 'approved').length,
  }

  async function handleStartProduction(obs) {
    setStartingId(obs.id)
    try {
      await onCreateProduction({
        title:               (obs.text || '').slice(0, 60) + ((obs.text || '').length > 60 ? '…' : ''),
        sourceObservationId: obs.id,
        sourceText:          obs.text || '',
        sourceConstellation: obs.constellation || null,
        manifestDecision:    obs.claude?.destination || null,
        status:              'in_production',
      })
    } finally {
      setStartingId(null)
    }
  }

  async function handleSave(id, patch) {
    await onUpdateProduction(id, patch)
  }

  async function handleArchive(id) {
    await onUpdateProduction(id, { status: 'archived' })
    setExpandedId(null)
  }

  const px = isMobile ? 'px-4' : 'px-8'

  return (
    <div className={`flex-1 overflow-y-auto ${px} py-6`}>
      <div style={{ maxWidth: '680px' }}>

        {/* Status summary */}
        <div style={{
          display: 'flex', gap: isMobile ? '8px' : '16px', marginBottom: '24px', flexWrap: 'wrap',
        }}>
          {[
            { key: 'all',          label: 'All',          count: productions.length },
            { key: 'incoming',     label: 'Incoming',     count: counts.incoming    },
            { key: 'in_production',label: 'In Production',count: counts.in_production },
            { key: 'staged',       label: 'Staged',       count: counts.staged      },
            { key: 'approved',     label: 'Approved',     count: counts.approved    },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              style={{
                background: statusFilter === f.key ? 'var(--bg-3)' : 'transparent',
                border: `1px solid ${statusFilter === f.key ? 'var(--border-2)' : 'var(--border-0)'}`,
                borderRadius: '6px', padding: '5px 10px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              <span style={{
                color: statusFilter === f.key ? 'var(--text-0)' : 'var(--text-4)',
                fontSize: '11px', fontWeight: 600,
              }}>
                {f.count}
              </span>
              <span style={{
                color: statusFilter === f.key ? 'var(--text-2)' : 'var(--text-5)',
                fontSize: '10px', letterSpacing: '0.05em',
              }}>
                {f.label}
              </span>
            </button>
          ))}
        </div>

        {/* Incoming queue */}
        {incomingObs.length > 0 && statusFilter === 'all' && (
          <div style={{ marginBottom: '24px' }}>
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>
              Incoming — {incomingObs.length} awaiting production
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {incomingObs.map(obs => (
                <IncomingCard
                  key={obs.id}
                  observation={obs}
                  onStart={handleStartProduction}
                  starting={startingId === obs.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Productions list */}
        {filtered.length > 0 ? (
          <div style={{ marginBottom: '24px' }}>
            {statusFilter === 'all' && productions.length > 0 && (
              <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
                textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>
                Productions — {productions.length}
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {filtered.map(prod => (
                <ProductionCard
                  key={prod.id}
                  production={prod}
                  expanded={expandedId === prod.id}
                  onToggle={setExpandedId}
                  onSave={handleSave}
                  onStage={concept => onStage(concept)}
                  onArchive={handleArchive}
                  onPublish={onPublish}
                  isMobile={isMobile}
                />
              ))}
            </div>
          </div>
        ) : (
          incomingObs.length === 0 && (
            <div style={{
              border: '1px dashed var(--border-0)', borderRadius: '10px',
              padding: '28px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '8px',
            }}>
              <p style={{ color: 'var(--text-5)', fontSize: '12px', textAlign: 'center' }}>
                The production office is empty.
              </p>
              <p style={{ color: 'var(--text-6)', fontSize: '11px', textAlign: 'center' }}>
                Route observations to Theater in Atrium, or create productions from MUSE manifests.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  )
}

// ── Staging Wing ──────────────────────────────────────────────────────────────

function SingleManifest({ observations, productions, apiKey, onConnectClaude, onSaveToProduction, initialConcept, isMobile }) {
  const [formatId, setFormatId]     = useState('image')
  const [concept, setConcept]       = useState(initialConcept || '')
  const [staged, setStaged]         = useState('')
  const [staging, setStaging]       = useState(false)
  const [error, setError]           = useState(null)
  const [copied, setCopied]         = useState(false)
  const [linkedProdId, setLinkedProdId] = useState('')
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)

  const selectedFormat = FORMATS.find(f => f.id === formatId)
  const incoming = (observations || []).filter(o => o.destination === 'Theater' || o.destination === 'OpsCore')
  const activeProdOptions = (productions || []).filter(p => p.status !== 'archived')

  async function handleStage() {
    if (!concept.trim()) return
    setStaging(true); setError(null); setStaged(''); setSaved(false)
    try {
      const result = await enrichForFormat(concept, formatId, apiKey)
      setStaged(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setStaging(false)
    }
  }

  async function handleSaveToProduction() {
    if (!staged || !linkedProdId || saving) return
    setSaving(true)
    try {
      await onSaveToProduction(linkedProdId, formatId, staged)
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(staged).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div style={{ maxWidth: '580px' }}>
      {incoming.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>
            Incoming — {incoming.length} staged
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {incoming.map(obs => (
              <button key={obs.id} onClick={() => { setConcept(obs.text || ''); setStaged('') }}
                style={{
                  textAlign: 'left', background: concept === obs.text ? '#0a0616' : 'var(--bg-2)',
                  border: `1px solid ${concept === obs.text ? '#a855f7' : 'var(--border-1)'}`,
                  borderLeft: `3px solid ${concept === obs.text ? '#a855f7' : '#a855f720'}`,
                  borderRadius: '0 8px 8px 0', padding: '9px 12px', cursor: 'pointer',
                }}>
                <p style={{ color: 'var(--text-2)', fontSize: '11px', lineHeight: 1.5 }}>
                  {(obs.text?.length ?? 0) > 80 ? obs.text.slice(0, 80) + '…' : (obs.text || '')}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 600, marginBottom: '7px' }}>Observation</p>
        <textarea
          value={concept}
          onChange={e => { setConcept(e.target.value); setStaged('') }}
          placeholder="Enter the observation to stage…"
          rows={3}
          style={{
            width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border-1)',
            borderRadius: '8px', padding: '11px 14px', color: 'var(--text-1)',
            fontSize: '13px', lineHeight: 1.6, resize: 'vertical', outline: 'none', fontFamily: 'inherit',
          }}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleStage() }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>Format</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {FORMATS.map(f => (
            <button key={f.id} onClick={() => f.available && setFormatId(f.id)} disabled={!f.available}
              style={{
                padding: '7px 12px', borderRadius: '7px', fontSize: '11px',
                cursor: f.available ? 'pointer' : 'default',
                background: formatId === f.id ? '#7c3aed' : f.available ? 'var(--bg-2)' : 'var(--bg-1)',
                color: formatId === f.id ? '#fff' : f.available ? 'var(--text-3)' : 'var(--text-6)',
                border: `1px solid ${formatId === f.id ? '#8b5cf6' : f.available ? 'var(--border-1)' : 'var(--border-0)'}`,
                fontWeight: formatId === f.id ? 600 : 400, opacity: f.available ? 1 : 0.5,
              }}>
              {f.icon} {f.label}
              {!f.available && <span style={{ fontSize: '8px', marginLeft: '4px', opacity: 0.6 }}>soon</span>}
            </button>
          ))}
        </div>
      </div>

      {!apiKey ? (
        <button onClick={onConnectClaude} style={{
          background: '#0d1a2e', border: '1px solid #1d4ed8', borderRadius: '8px',
          padding: '10px 20px', color: '#93c5fd', fontSize: '12px', fontWeight: 600,
          cursor: 'pointer', marginBottom: '20px',
        }}>✦ Connect Claude to stage</button>
      ) : (
        <button onClick={handleStage} disabled={!concept.trim() || staging} style={{
          background: concept.trim() && !staging ? '#7c3aed' : 'var(--bg-2)',
          border: `1px solid ${concept.trim() && !staging ? '#8b5cf6' : 'var(--border-1)'}`,
          borderRadius: '8px', padding: '10px 20px',
          color: concept.trim() && !staging ? '#fff' : 'var(--text-5)',
          fontSize: '12px', fontWeight: 600,
          cursor: concept.trim() && !staging ? 'pointer' : 'default', marginBottom: '20px',
        }}>
          {staging ? 'Staging…' : '🎭 Stage this'}
        </button>
      )}

      {error && <p style={{ color: '#ef4444', fontSize: '11px', marginBottom: '12px' }}>{error}</p>}

      {staged && (
        <div style={{
          background: 'var(--bg-2)', border: '1px solid #8b5cf640',
          borderLeft: '3px solid #8b5cf6', borderRadius: '0 10px 10px 0',
          overflow: 'hidden', marginBottom: '20px',
        }}>
          <div style={{ padding: '9px 14px', borderBottom: '1px solid #8b5cf620',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ color: '#8b5cf6', fontSize: '9px', fontWeight: 700,
              letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {selectedFormat?.icon} {selectedFormat?.label} — Staged
            </p>
            <button onClick={handleCopy} style={{
              background: 'none', border: '1px solid #8b5cf640', borderRadius: '4px',
              padding: '2px 9px', color: copied ? '#10b981' : '#8b5cf6',
              fontSize: '9px', fontWeight: 600, cursor: 'pointer',
            }}>
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div style={{ padding: '14px' }}>
            <p style={{ color: 'var(--text-1)', fontSize: '12px', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>
              {staged}
            </p>
          </div>

          {/* Save to production */}
          {activeProdOptions.length > 0 && (
            <div style={{ padding: '10px 14px', borderTop: '1px solid #8b5cf610',
              display: 'flex', gap: '6px', alignItems: 'center' }}>
              <select
                value={linkedProdId}
                onChange={e => { setLinkedProdId(e.target.value); setSaved(false) }}
                style={{
                  flex: 1, background: 'var(--bg-1)', border: '1px solid var(--border-1)',
                  borderRadius: '5px', padding: '5px 8px', color: 'var(--text-3)',
                  fontSize: '10px', fontFamily: 'inherit', outline: 'none',
                }}
              >
                <option value=''>Save to production…</option>
                {activeProdOptions.map(p => (
                  <option key={p.id} value={p.id}>{p.title || 'Untitled'}</option>
                ))}
              </select>
              {linkedProdId && (
                <button onClick={handleSaveToProduction} disabled={saving || saved} style={{
                  background: saved ? '#041208' : '#0a0616', flexShrink: 0,
                  border: `1px solid ${saved ? '#10b98140' : '#8b5cf640'}`,
                  borderRadius: '5px', padding: '5px 10px',
                  color: saved ? '#10b981' : '#8b5cf6',
                  fontSize: '10px', fontWeight: 600, cursor: saving || saved ? 'default' : 'pointer',
                }}>
                  {saving ? '…' : saved ? '✓ Saved' : 'Save'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ManifestPanel({ format, manifest, onScore }) {
  const [copied, setCopied] = useState(false)
  const scoreColor = manifest?.score ? PRESERVATION_OPTIONS.find(o => o.id === manifest.score)?.color : null

  return (
    <div style={{
      background: 'var(--bg-2)',
      border: `1px solid ${scoreColor ? scoreColor + '40' : 'var(--border-1)'}`,
      borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '9px 12px', borderBottom: '1px solid var(--border-0)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scoreColor ? scoreColor + '08' : 'transparent',
      }}>
        <p style={{ color: scoreColor || 'var(--text-3)', fontSize: '11px', fontWeight: 600 }}>
          {format.icon} {format.label}
        </p>
        {manifest?.status === 'done' && (
          <button onClick={() => { navigator.clipboard.writeText(manifest?.output || '').then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800) }) }}
            style={{ background: 'none', border: '1px solid var(--border-1)', borderRadius: '4px',
              padding: '2px 8px', color: copied ? '#10b981' : 'var(--text-5)', fontSize: '9px', cursor: 'pointer' }}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
      <div style={{ padding: '12px', flex: 1, minHeight: '100px', maxHeight: '180px', overflowY: 'auto' }}>
        {!manifest && <p style={{ color: 'var(--text-6)', fontSize: '11px', fontStyle: 'italic' }}>Waiting…</p>}
        {manifest?.status === 'loading' && (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%',
              background: '#8b5cf6', animation: 'pulse-fade 1.5s infinite' }} />
            <p style={{ color: 'var(--text-5)', fontSize: '11px' }}>Staging…</p>
          </div>
        )}
        {manifest?.status === 'done' && (
          <p style={{ color: 'var(--text-2)', fontSize: '11px', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
            {manifest.output}
          </p>
        )}
        {manifest?.status === 'error' && (
          <p style={{ color: '#ef4444', fontSize: '11px' }}>{manifest.output}</p>
        )}
      </div>
      {manifest?.status === 'done' && (
        <div style={{ padding: '7px 12px', borderTop: '1px solid var(--border-0)', display: 'flex', gap: '4px' }}>
          {PRESERVATION_OPTIONS.map(opt => (
            <button key={opt.id} onClick={() => onScore(format.id, opt.id)} style={{
              flex: 1, padding: '3px 0', borderRadius: '4px', fontSize: '9px', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.1s',
              background: manifest.score === opt.id ? opt.color + '18' : 'transparent',
              border: `1px solid ${manifest.score === opt.id ? opt.color : 'var(--border-1)'}`,
              color: manifest.score === opt.id ? opt.color : 'var(--text-5)',
            }}>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function MultiManifestView({ observations, apiKey, onConnectClaude, uid, isMobile }) {
  const [concept, setConcept]     = useState('')
  const [manifests, setManifests] = useState(null)
  const [running, setRunning]     = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [archived, setArchived]   = useState(false)

  const incoming = (observations || []).filter(o => o.destination === 'Theater' || o.destination === 'OpsCore')
  const allDone = manifests && LIVE_FORMATS.every(f => manifests[f.id]?.status !== 'loading')
  const scoredCount    = manifests ? LIVE_FORMATS.filter(f => manifests[f.id]?.score).length : 0
  const preservedCount = manifests ? LIVE_FORMATS.filter(f => manifests[f.id]?.score === 'preserved').length : 0
  const shiftedCount   = manifests ? LIVE_FORMATS.filter(f => manifests[f.id]?.score === 'shifted').length : 0
  const driftedCount   = manifests ? LIVE_FORMATS.filter(f => manifests[f.id]?.score === 'drifted').length : 0
  const allScored = allDone && scoredCount === LIVE_FORMATS.length

  async function runAll() {
    if (!concept.trim() || running || !apiKey) return
    setRunning(true); setArchived(false)
    const initial = {}
    LIVE_FORMATS.forEach(f => { initial[f.id] = { status: 'loading', output: '', score: null } })
    setManifests(initial)
    await Promise.all(LIVE_FORMATS.map(async f => {
      try {
        const result = await enrichForFormat(concept, f.id, apiKey)
        setManifests(prev => ({ ...prev, [f.id]: { status: 'done', output: result, score: null } }))
      } catch (e) {
        setManifests(prev => ({ ...prev, [f.id]: { status: 'error', output: e.message, score: null } }))
      }
    }))
    setRunning(false)
  }

  function setScore(formatId, score) {
    setManifests(prev => ({ ...prev, [formatId]: { ...prev[formatId], score } }))
  }

  async function archiveTest() {
    if (!allScored || !uid || archiving) return
    setArchiving(true)
    try {
      const results = {}
      LIVE_FORMATS.forEach(f => {
        results[f.id] = { formatLabel: f.label, output: manifests[f.id]?.output || '', score: manifests[f.id]?.score || null }
      })
      await createMultiManifestTest(uid, { observationText: concept, results, preservedCount, totalCount: LIVE_FORMATS.length })
      setArchived(true)
    } catch (e) {
      console.error('[Multi-Manifest archive]', e)
    } finally {
      setArchiving(false)
    }
  }

  return (
    <div>
      {incoming.length > 0 && !concept && (
        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>
            Incoming — {incoming.length}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {incoming.map(obs => (
              <button key={obs.id} onClick={() => { setConcept(obs.text || ''); setManifests(null) }}
                style={{ textAlign: 'left', background: 'var(--bg-2)', border: '1px solid var(--border-1)',
                  borderLeft: '3px solid #a855f720', borderRadius: '0 8px 8px 0',
                  padding: '9px 12px', cursor: 'pointer' }}>
                <p style={{ color: 'var(--text-2)', fontSize: '11px', lineHeight: 1.5 }}>
                  {(obs.text?.length ?? 0) > 80 ? obs.text.slice(0, 80) + '…' : (obs.text || '')}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: '14px' }}>
        <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 600, marginBottom: '7px' }}>Source Truth</p>
        <textarea
          value={concept}
          onChange={e => { setConcept(e.target.value); setManifests(null); setArchived(false) }}
          placeholder="Every format will stage from this single source."
          rows={3}
          style={{
            width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border-1)',
            borderRadius: '8px', padding: '11px 14px', color: 'var(--text-1)',
            fontSize: '13px', lineHeight: 1.6, resize: 'vertical', outline: 'none', fontFamily: 'inherit',
          }}
        />
      </div>

      {concept.trim() && (
        <div style={{
          background: '#0a0800', border: '1px solid #f59e0b30', borderLeft: '3px solid #f59e0b',
          borderRadius: '0 8px 8px 0', padding: '10px 14px', marginBottom: '16px',
        }}>
          <p style={{ color: '#f59e0b60', fontSize: '9px', letterSpacing: '0.12em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '5px' }}>Source Truth · Origin: Atrium</p>
          <p style={{ color: 'var(--text-2)', fontSize: '12px', lineHeight: 1.7 }}>{concept}</p>
        </div>
      )}

      {!apiKey ? (
        <button onClick={onConnectClaude} style={{
          background: '#0d1a2e', border: '1px solid #1d4ed8', borderRadius: '8px',
          padding: '10px 20px', color: '#93c5fd', fontSize: '12px', fontWeight: 600,
          cursor: 'pointer', marginBottom: '20px',
        }}>✦ Connect Claude to run Multi-Manifest</button>
      ) : (
        <button onClick={runAll} disabled={!concept.trim() || running} style={{
          background: concept.trim() && !running ? '#7c3aed' : 'var(--bg-2)',
          border: `1px solid ${concept.trim() && !running ? '#8b5cf6' : 'var(--border-1)'}`,
          borderRadius: '8px', padding: '10px 20px',
          color: concept.trim() && !running ? '#fff' : 'var(--text-5)',
          fontSize: '12px', fontWeight: 600, cursor: concept.trim() && !running ? 'pointer' : 'default',
          marginBottom: '20px',
        }}>
          {running ? 'Staging all formats…' : '🎭 Run Multi-Manifest'}
        </button>
      )}

      {manifests && (
        <>
          <div style={{
            display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '8px', marginBottom: '16px',
          }}>
            {LIVE_FORMATS.map(f => (
              <ManifestPanel key={f.id} format={f} manifest={manifests[f.id]} onScore={setScore} />
            ))}
          </div>

          {allDone && (
            <div style={{
              background: 'var(--bg-2)', border: '1px solid var(--border-1)',
              borderRadius: '8px', padding: '14px 16px', marginBottom: '14px',
            }}>
              <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
                textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>
                Cargo Preservation Review
              </p>
              {scoredCount < LIVE_FORMATS.length ? (
                <p style={{ color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.6 }}>
                  Score each format — did it preserve the Source Truth?
                </p>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: '18px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    {[
                      { label: 'Preserved', count: preservedCount, color: '#10b981' },
                      { label: 'Shifted',   count: shiftedCount,   color: '#f59e0b' },
                      { label: 'Drifted',   count: driftedCount,   color: '#ef4444' },
                    ].map(({ label, count, color }) => (
                      <div key={label}>
                        <p style={{ color, fontSize: '20px', fontWeight: 700, lineHeight: 1 }}>{count}</p>
                        <p style={{ color: color + '80', fontSize: '9px', letterSpacing: '0.1em',
                          textTransform: 'uppercase', fontWeight: 600 }}>{label}</p>
                      </div>
                    ))}
                  </div>
                  <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.65,
                    fontStyle: 'italic', marginBottom: '12px' }}>
                    {preservedCount === LIVE_FORMATS.length
                      ? 'Constitutional Principle #2 holds. The cargo arrived intact.'
                      : driftedCount > 0
                        ? `${driftedCount} format${driftedCount > 1 ? 's' : ''} lost the cargo. The hallway failed.`
                        : `${shiftedCount} format${shiftedCount > 1 ? 's' : ''} shifted but did not drift.`}
                  </p>
                  {!archived ? (
                    <button onClick={archiveTest} disabled={archiving} style={{
                      background: archiving ? 'var(--bg-1)' : '#041208',
                      border: `1px solid ${archiving ? 'var(--border-1)' : '#0a3018'}`,
                      borderRadius: '6px', padding: '7px 14px',
                      color: archiving ? 'var(--text-5)' : '#1a7a40',
                      fontSize: '11px', fontWeight: 600, cursor: archiving ? 'default' : 'pointer',
                    }}>
                      {archiving ? 'Archiving…' : '📚 Archive to ARCHIVIST'}
                    </button>
                  ) : (
                    <p style={{ color: '#10b981', fontSize: '11px', fontWeight: 600 }}>
                      ✓ Archived — ARCHIVIST has recorded this test
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function StagingWing({ observations, productions, apiKey, onConnectClaude, onSaveToProduction, initialConcept, uid, isMobile }) {
  const px = isMobile ? 'px-4' : 'px-8'
  const [mode, setMode] = useState('single')

  return (
    <div className={`flex-1 overflow-y-auto ${px} py-6`}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px',
        maxWidth: mode === 'multi' ? '900px' : '580px' }}>
        {[
          { id: 'single', label: 'Single Manifest' },
          { id: 'multi',  label: '🧪 Multi-Manifest' },
        ].map(m => (
          <button key={m.id} onClick={() => setMode(m.id)} style={{
            padding: '5px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer',
            background: mode === m.id ? '#7c3aed' : 'var(--bg-2)',
            color:      mode === m.id ? '#fff'    : 'var(--text-4)',
            border:     `1px solid ${mode === m.id ? '#8b5cf6' : 'var(--border-1)'}`,
            fontWeight: mode === m.id ? 600 : 400,
          }}>{m.label}</button>
        ))}
        {mode === 'multi' && (
          <p style={{ color: 'var(--text-6)', fontSize: '10px', alignSelf: 'center',
            marginLeft: '8px', fontStyle: 'italic' }}>
            Constitutional test — Principle #2
          </p>
        )}
      </div>

      <div style={{ maxWidth: mode === 'multi' ? '900px' : '580px' }}>
        {mode === 'single'
          ? <SingleManifest
              observations={observations}
              productions={productions}
              apiKey={apiKey}
              onConnectClaude={onConnectClaude}
              onSaveToProduction={onSaveToProduction}
              initialConcept={initialConcept}
              isMobile={isMobile}
            />
          : <MultiManifestView
              observations={observations}
              apiKey={apiKey}
              onConnectClaude={onConnectClaude}
              uid={uid}
              isMobile={isMobile}
            />
        }
      </div>
    </div>
  )
}

// ── Screening Room — Featured Broadcast + standby ─────────────────────────────

function StandbyCard() {
  return (
    <div style={{
      marginBottom: '28px', background: 'var(--bg-1)',
      border: '1px solid #a855f718', borderLeft: '3px solid #a855f730',
      borderRadius: '0 10px 10px 0', padding: '36px 20px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a855f740' }} />
        <p style={{ color: '#a855f750', fontSize: '9px', fontWeight: 700,
          letterSpacing: '0.15em', textTransform: 'uppercase' }}>Standby</p>
      </div>
      <p style={{ color: 'var(--text-5)', fontSize: '13px', textAlign: 'center',
        fontStyle: 'italic', lineHeight: 1.7 }}>
        No broadcast scheduled.
      </p>
      <p style={{ color: 'var(--text-6)', fontSize: '11px', textAlign: 'center',
        lineHeight: 1.65, maxWidth: '320px' }}>
        The transmission begins when the first media asset is approved and published from this Theater.
      </p>
    </div>
  )
}

function FeaturedBroadcast({ mediaAssets, productions }) {
  // Accept newest published asset — video or audio, type-aware (honest about missing URLs)
  const featuredAsset = mediaAssets
    .filter(a => a.publishedAt && (a.videoUrl || a.audioUrl || a.type === 'video' || a.type === 'audio'))
    .sort((a, b) => (b.publishedAt > a.publishedAt ? 1 : -1))[0] || null

  const featuredProd = !featuredAsset
    ? (productions || [])
        .filter(p => p.publishedAt && p.videoUrl)
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))[0] || null
    : null

  if (!featuredAsset && !featuredProd) return <StandbyCard />

  const item = featuredAsset || featuredProd
  const isAsset = !!featuredAsset
  const pubDate = item.publishedAt ? new Date(item.publishedAt) : null
  const bodyText = isAsset ? item.transcript : item.notes

  const isVideo = isAsset ? !!(item.videoUrl || item.type === 'video') : !!item.videoUrl
  const isAudio = isAsset && !isVideo && !!(item.audioUrl || item.type === 'audio')
  const hasMedia = isVideo ? !!item.videoUrl : isAudio ? !!item.audioUrl : true

  const typeLabel = isVideo ? '🎬 Video' : isAudio ? '🔊 Audio' : '🎬 Video'

  return (
    <div style={{
      marginBottom: '28px', border: '1px solid #a855f730',
      borderLeft: '3px solid #a855f7', borderRadius: '0 10px 10px 0',
      overflow: 'hidden', background: '#05021a',
    }}>
      {/* Header bar */}
      <div style={{
        padding: '10px 16px', background: '#08041e',
        borderBottom: '1px solid #a855f720',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%',
            background: '#a855f7', boxShadow: '0 0 8px #a855f7' }} />
          <p style={{ color: '#a855f7', fontSize: '9px', fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase' }}>Featured Broadcast</p>
        </div>
        {pubDate && (
          <p style={{ color: 'var(--text-6)', fontSize: '9px' }}>
            {pubDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        )}
      </div>

      {/* Player area */}
      {!hasMedia ? (
        <div style={{
          background: '#000', aspectRatio: '16/9', maxHeight: '380px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '10px',
        }}>
          <p style={{ fontSize: '28px', lineHeight: 1 }}>{isVideo ? '🎬' : '🔊'}</p>
          <p style={{ color: '#a855f780', fontSize: '13px', fontStyle: 'italic' }}>Media file missing</p>
          <p style={{ color: '#a855f750', fontSize: '10px', textAlign: 'center', maxWidth: '260px', lineHeight: 1.6 }}>
            Open this asset in the Media Library and upload a {isVideo ? 'video' : 'audio'} file to broadcast it here.
          </p>
        </div>
      ) : isVideo ? (
        <div style={{ background: '#000' }}>
          <VideoPlayer url={item.videoUrl} large />
        </div>
      ) : (
        <div style={{ background: '#0a0618', padding: '28px 24px 20px' }}>
          <p style={{ color: '#a855f7', fontSize: '9px', letterSpacing: '0.14em',
            textTransform: 'uppercase', fontWeight: 700, marginBottom: '14px' }}>
            🔊 Audio Broadcast
          </p>
          <AudioPlayer url={item.audioUrl} />
        </div>
      )}

      {/* Info below player */}
      <div style={{ padding: '18px 20px' }}>
        <p style={{ color: '#e2e8f0', fontSize: '16px', fontWeight: 700,
          marginBottom: '5px', lineHeight: 1.3 }}>
          {item.title || 'Untitled Broadcast'}
        </p>
        {pubDate && (
          <p style={{ color: '#a855f780', fontSize: '10px', marginBottom: '10px' }}>
            Published {pubDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        )}
        {bodyText && (
          <p style={{ color: 'var(--text-4)', fontSize: '12px', lineHeight: 1.7, marginBottom: '12px' }}>
            {bodyText.length > 240 ? bodyText.slice(0, 240) + '…' : bodyText}
          </p>
        )}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{
            background: '#a855f710', border: '1px solid #a855f730', borderRadius: '4px',
            padding: '2px 8px', color: '#a855f7', fontSize: '9px',
            fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            {typeLabel}
          </span>
          <span style={{
            background: '#10b98110', border: '1px solid #10b98130', borderRadius: '4px',
            padding: '2px 8px', color: '#10b981', fontSize: '9px',
            fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            📡 Broadcasting
          </span>
          {!isAsset && item.deliveryDestination && (
            <span style={{ color: 'var(--text-6)', fontSize: '9px' }}>{item.deliveryDestination}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Media Wing ────────────────────────────────────────────────────────────────

function AssetCard({ asset, productions = [], onUpdate, onPublish, onCreateProduction, onSendToMuse, expanded, onToggle, uid, isMobile }) {
  const [edit, setEdit] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [publishing, setPublishing] = useState(false)
  const [promoting, setPromoting] = useState(null) // null | 'create' | 'attach'
  const [attachTarget, setAttachTarget] = useState('')
  const [videoUploading, setVideoUploading] = useState(false)
  const [audioUploading, setAudioUploading] = useState(false)
  const [videoUploadError, setVideoUploadError] = useState(null)
  const [audioUploadError, setAudioUploadError] = useState(null)
  const videoInputRef = useRef(null)
  const audioInputRef = useRef(null)

  function handleToggle() {
    if (expanded) { setEdit(null); onToggle(null) }
    else {
      setEdit({
        title:           asset.title           || '',
        videoUrl:        asset.videoUrl        || '',
        audioUrl:        asset.audioUrl        || '',
        transcript:      asset.transcript      || '',
        humanGateStatus: asset.humanGateStatus || '',
        sceneType:       asset.sceneType       || '',
        mood:            asset.mood            || '',
        pacing:          asset.pacing          || '',
        usableMoments:   asset.usableMoments   || '',
        suggestedUse:    asset.suggestedUse    || '',
        tags:            asset.tags            || '',
        remixNotes:      asset.remixNotes      || '',
      })
      onToggle(asset.id)
    }
  }

  async function handleVideoUpload(e) {
    const file = e.target.files?.[0]
    if (!file || !uid) return
    setVideoUploading(true)
    setVideoUploadError(null)
    try {
      const url = await uploadMediaVideo(file, uid)
      setEdit(p => ({ ...p, videoUrl: url }))
    } catch (err) {
      console.error('[AssetCard] video upload:', err)
      setVideoUploadError(err?.code || err?.message || 'Upload failed')
    }
    finally { setVideoUploading(false); e.target.value = '' }
  }

  async function handleAudioUpload(e) {
    const file = e.target.files?.[0]
    if (!file || !uid) return
    setAudioUploading(true)
    setAudioUploadError(null)
    try {
      const url = await uploadMediaAudio(file, uid)
      setEdit(p => ({ ...p, audioUrl: url }))
    } catch (err) {
      console.error('[AssetCard] audio upload:', err)
      setAudioUploadError(err?.code || err?.message || 'Upload failed')
    }
    finally { setAudioUploading(false); e.target.value = '' }
  }

  async function handleSave() {
    if (!edit || saving) return
    setSaving(true)
    setSaveError(null)
    console.log('[AssetCard] handleSave called', { id: asset.id, ...edit })
    try {
      await onUpdate(asset.id, {
        title:           edit.title           || 'Untitled Asset',
        videoUrl:        edit.videoUrl        || null,
        audioUrl:        edit.audioUrl        || null,
        transcript:      edit.transcript      || '',
        humanGateStatus: edit.humanGateStatus || null,
        type:            edit.videoUrl ? 'video' : edit.audioUrl ? 'audio' : 'transcript',
        sceneType:       edit.sceneType       || null,
        mood:            edit.mood            || null,
        pacing:          edit.pacing          || null,
        usableMoments:   edit.usableMoments   || null,
        suggestedUse:    edit.suggestedUse    || null,
        tags:            edit.tags            || null,
        remixNotes:      edit.remixNotes      || null,
      })
      console.log('[AssetCard] save succeeded')
    } catch (err) {
      console.error('[AssetCard] save failed:', err)
      setSaveError(err?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  async function handlePublish() {
    if (publishing || !onPublish) return
    setPublishing(true)
    try { await onPublish(asset.id, asset.title || 'Untitled Asset') }
    finally { setPublishing(false) }
  }

  async function handleCreateProduction() {
    if (promoting || !onCreateProduction) return
    setPromoting('create')
    try {
      const newId = await onCreateProduction({
        title:      asset.title || 'Untitled Production',
        sourceText: asset.transcript || '',
        status:     'incoming',
        notes:      `Promoted from media asset "${asset.title || 'Untitled Asset'}".`,
      })
      if (newId) await onUpdate(asset.id, { productionId: newId })
    } finally { setPromoting(null) }
  }

  async function handleAttachToProduction() {
    if (promoting || !attachTarget) return
    setPromoting('attach')
    try { await onUpdate(asset.id, { productionId: attachTarget }) }
    finally { setPromoting(null); setAttachTarget('') }
  }

  async function handleToggleReference() {
    await onUpdate(asset.id, { opsCoreSignal: asset.opsCoreSignal === false ? true : false })
  }

  const gateColor = { pending: '#f59e0b', approved: '#10b981', denied: '#ef4444' }

  return (
    <div style={{
      border: `1px solid ${expanded ? '#a855f735' : 'var(--border-1)'}`,
      borderLeft: `3px solid ${asset.publishedAt ? '#10b981' : '#a855f7'}`,
      borderRadius: '0 8px 8px 0', overflow: 'hidden',
    }}>
      <button
        onClick={handleToggle}
        style={{
          width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
          background: expanded ? '#08031a' : 'var(--bg-2)',
          padding: '12px 16px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '10px',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
            {asset.videoUrl && <span style={{ color: '#a855f7', fontSize: '10px' }}>🎬 Video</span>}
            {asset.audioUrl && <span style={{ color: '#a855f7', fontSize: '10px' }}>🔊 Audio</span>}
            {asset.transcript && <span style={{ color: '#a855f7', fontSize: '10px' }}>📄 Script</span>}
            {asset.humanGateStatus && (
              <span style={{ color: gateColor[asset.humanGateStatus] || 'var(--text-5)', fontSize: '10px', fontWeight: 600 }}>
                👤 {asset.humanGateStatus}
              </span>
            )}
            {asset.publishedAt && (
              <span style={{ color: '#10b981', fontSize: '10px', fontWeight: 600 }}>📡 OpsCore</span>
            )}
          </div>
          <p style={{ color: expanded ? '#e2e8f0' : 'var(--text-1)', fontSize: '12px', fontWeight: 500, lineHeight: 1.4, marginBottom: '5px' }}>
            {asset.title || 'Untitled Asset'}
          </p>
          <PipelinePill {...mediaAssetPipelineStage(asset)} />
        </div>
        <span style={{ color: 'var(--text-5)', fontSize: '11px', flexShrink: 0 }}>
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      {expanded && edit && (
        <div>

          {/* ── PLAYER FIRST — see it before you edit it ──────────────────── */}
          {(edit.videoUrl || asset.videoUrl) && (
            <div style={{ background: '#000', borderTop: '1px solid #a855f720' }}>
              <VideoPlayer url={edit.videoUrl || asset.videoUrl} />
            </div>
          )}

          {(edit.audioUrl || asset.audioUrl) && (
            <div style={{ borderTop: '1px solid #a855f710', background: 'var(--bg-2)', padding: '12px 16px' }}>
              <p style={{ color: '#a855f7', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>🔊 Audio</p>
              <AudioPlayer url={edit.audioUrl || asset.audioUrl} />
            </div>
          )}

          {(edit.transcript || asset.transcript) && (
            <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border-0)', background: 'var(--bg-1)' }}>
              <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>📄 Script</p>
              <p style={{ color: 'var(--text-3)', fontSize: '12px', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
                {(edit.transcript || asset.transcript).length > 300
                  ? (edit.transcript || asset.transcript).slice(0, 300) + '…'
                  : (edit.transcript || asset.transcript)}
              </p>
            </div>
          )}

          {/* ── EDIT FIELDS — below the player ───────────────────────────── */}
          <div style={{ padding: '16px', borderTop: '1px solid var(--border-0)', background: 'var(--bg-1)' }}>

            {/* Title */}
            <div style={{ marginBottom: '12px' }}>
              <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '5px' }}>Title</p>
              <input
                value={edit.title}
                onChange={e => setEdit(p => ({ ...p, title: e.target.value }))}
                style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border-2)', borderRadius: '6px', padding: '8px 12px', color: 'var(--text-0)', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }}
              />
            </div>

            {/* Video URL + upload */}
            <div style={{ marginBottom: '10px' }}>
              <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '5px' }}>🎬 Video URL</p>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  value={edit.videoUrl}
                  onChange={e => { setEdit(p => ({ ...p, videoUrl: e.target.value })); setVideoUploadError(null) }}
                  placeholder="YouTube, Vimeo, or .mp4 link…"
                  style={{ flex: 1, background: 'var(--bg-2)', border: '1px solid var(--border-2)', borderRadius: '6px', padding: '7px 10px', color: 'var(--text-1)', fontSize: '11px', fontFamily: 'inherit', outline: 'none' }}
                />
                <input ref={videoInputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={handleVideoUpload} />
                <button onClick={() => videoInputRef.current?.click()} disabled={videoUploading}
                  style={{ flexShrink: 0, background: 'var(--bg-2)', border: '1px solid var(--border-2)', borderRadius: '6px', padding: '7px 12px', color: videoUploading ? 'var(--text-5)' : '#a855f7', fontSize: '11px', cursor: videoUploading ? 'default' : 'pointer' }}>
                  {videoUploading ? 'Uploading…' : 'Upload'}
                </button>
              </div>
            </div>

            {videoUploadError && (
              <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '3px', marginBottom: '6px' }}>
                ⚠ Video upload failed — {videoUploadError}
              </p>
            )}

            {/* Audio URL + upload */}
            <div style={{ marginBottom: '12px' }}>
              <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '5px' }}>🔊 Audio URL</p>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  value={edit.audioUrl}
                  onChange={e => { setEdit(p => ({ ...p, audioUrl: e.target.value })); setAudioUploadError(null) }}
                  placeholder="SoundCloud or .mp3 link…"
                  style={{ flex: 1, background: 'var(--bg-2)', border: '1px solid var(--border-2)', borderRadius: '6px', padding: '7px 10px', color: 'var(--text-1)', fontSize: '11px', fontFamily: 'inherit', outline: 'none' }}
                />
                <input ref={audioInputRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleAudioUpload} />
                <button onClick={() => audioInputRef.current?.click()} disabled={audioUploading}
                  style={{ flexShrink: 0, background: 'var(--bg-2)', border: '1px solid var(--border-2)', borderRadius: '6px', padding: '7px 12px', color: audioUploading ? 'var(--text-5)' : '#a855f7', fontSize: '11px', cursor: audioUploading ? 'default' : 'pointer' }}>
                  {audioUploading ? 'Uploading…' : 'Upload'}
                </button>
              </div>
            </div>
            {audioUploadError && (
              <p style={{ color: '#ef4444', fontSize: '10px', marginTop: '-8px', marginBottom: '8px' }}>
                ⚠ Audio upload failed — {audioUploadError}
              </p>
            )}

            {/* Transcript / Script */}
            <div style={{ marginBottom: '12px' }}>
              <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '5px' }}>📄 Script / Transcript</p>
              <textarea
                value={edit.transcript}
                onChange={e => setEdit(p => ({ ...p, transcript: e.target.value }))}
                placeholder="Write or paste the script, transcript, or supporting text…"
                rows={4}
                style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border-2)', borderRadius: '6px', padding: '8px 12px', color: 'var(--text-1)', fontSize: '12px', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
              />
            </div>

            {/* Human Gate */}
            <div style={{ marginBottom: '14px' }}>
              <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '7px' }}>👤 Human Gate</p>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { id: 'pending',  label: 'Pending',  color: '#f59e0b' },
                  { id: 'approved', label: 'Approved', color: '#10b981' },
                  { id: 'denied',   label: 'Denied',   color: '#ef4444' },
                ].map(gate => (
                  <button
                    key={gate.id}
                    onClick={() => setEdit(p => ({ ...p, humanGateStatus: p.humanGateStatus === gate.id ? '' : gate.id }))}
                    style={{
                      padding: '5px 12px', borderRadius: '5px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                      background: edit.humanGateStatus === gate.id ? gate.color + '15' : 'var(--bg-2)',
                      border: `1px solid ${edit.humanGateStatus === gate.id ? gate.color : 'var(--border-2)'}`,
                      color: edit.humanGateStatus === gate.id ? gate.color : 'var(--text-4)',
                    }}
                  >
                    {gate.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Remix Layer */}
            <div style={{ marginBottom: '14px', paddingTop: '14px', borderTop: '1px solid #a855f715' }}>
              <p style={{ color: '#a855f780', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '10px' }}>✂️ Remix Layer</p>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Scene Type</p>
                  <select
                    value={edit.sceneType}
                    onChange={e => setEdit(p => ({ ...p, sceneType: e.target.value }))}
                    style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border-2)', borderRadius: '6px', padding: '7px 10px', color: 'var(--text-1)', fontSize: '11px', fontFamily: 'inherit', outline: 'none' }}
                  >
                    <option value="">Unclassified</option>
                    {SCENE_TYPES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Pacing</p>
                  <select
                    value={edit.pacing}
                    onChange={e => setEdit(p => ({ ...p, pacing: e.target.value }))}
                    style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border-2)', borderRadius: '6px', padding: '7px 10px', color: 'var(--text-1)', fontSize: '11px', fontFamily: 'inherit', outline: 'none' }}
                  >
                    <option value="">Unset</option>
                    <option value="slow">Slow</option>
                    <option value="medium">Medium</option>
                    <option value="fast">Fast</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Mood</p>
                <input
                  value={edit.mood}
                  onChange={e => setEdit(p => ({ ...p, mood: e.target.value }))}
                  placeholder="e.g. authoritative, warm, urgent…"
                  style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border-2)', borderRadius: '6px', padding: '7px 10px', color: 'var(--text-1)', fontSize: '11px', fontFamily: 'inherit', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Usable Moments</p>
                <textarea
                  value={edit.usableMoments}
                  onChange={e => setEdit(p => ({ ...p, usableMoments: e.target.value }))}
                  placeholder="0:12 — key proof moment. 0:45 — quote worth clipping. 1:20 — strong close."
                  rows={2}
                  style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border-2)', borderRadius: '6px', padding: '7px 10px', color: 'var(--text-1)', fontSize: '11px', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Suggested Use</p>
                <input
                  value={edit.suggestedUse}
                  onChange={e => setEdit(p => ({ ...p, suggestedUse: e.target.value }))}
                  placeholder="Lead with this for broker outreach. Follow the intro clip."
                  style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border-2)', borderRadius: '6px', padding: '7px 10px', color: 'var(--text-1)', fontSize: '11px', fontFamily: 'inherit', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Tags</p>
                <input
                  value={edit.tags}
                  onChange={e => setEdit(p => ({ ...p, tags: e.target.value }))}
                  placeholder="fleetflow, broker, proof, 2026…"
                  style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border-2)', borderRadius: '6px', padding: '7px 10px', color: 'var(--text-1)', fontSize: '11px', fontFamily: 'inherit', outline: 'none' }}
                />
              </div>

              <div>
                <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Remix Notes</p>
                <textarea
                  value={edit.remixNotes}
                  onChange={e => setEdit(p => ({ ...p, remixNotes: e.target.value }))}
                  placeholder="How this clip should be cut, sequenced, or repurposed…"
                  rows={2}
                  style={{ width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border-2)', borderRadius: '6px', padding: '7px 10px', color: 'var(--text-1)', fontSize: '11px', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
                />
              </div>
            </div>

            {/* Save */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-0)', gap: '12px' }}>
              {saveError ? (
                <p style={{ color: '#ef4444', fontSize: '11px' }}>⚠ {saveError}</p>
              ) : <span />}
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  background: saving ? 'var(--bg-2)' : '#041208',
                  border: `1px solid ${saving ? 'var(--border-1)' : '#10b98140'}`,
                  borderRadius: '6px', padding: '7px 16px',
                  color: saving ? 'var(--text-5)' : '#10b981',
                  fontSize: '11px', fontWeight: 600, cursor: saving ? 'default' : 'pointer',
                }}
              >
                {saving ? 'Saving…' : 'Save ✓'}
              </button>
            </div>

            {/* Publish gate — approved and not yet published */}
            {edit.humanGateStatus === 'approved' && !asset.publishedAt && (
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #10b98118' }}>
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  style={{
                    width: '100%', background: publishing ? 'var(--bg-2)' : '#041208',
                    border: `1px solid ${publishing ? 'var(--border-1)' : '#10b98140'}`,
                    borderRadius: '7px', padding: '10px 16px',
                    color: publishing ? 'var(--text-5)' : '#10b981',
                    fontSize: '12px', fontWeight: 700, cursor: publishing ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}
                >
                  {publishing ? 'Publishing…' : '📡 Broadcast on OpsCore'}
                </button>
              </div>
            )}

            {/* Published confirmation */}
            {asset.publishedAt && (
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #10b98115', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 600 }}>✓ Broadcasting on OpsCore</span>
                <span style={{ color: 'var(--text-6)', fontSize: '10px' }}>
                  · {new Date(asset.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                {asset.opsCoreSignal === false && (
                  <span style={{ color: 'var(--text-6)', fontSize: '10px', fontStyle: 'italic' }}>· reference only</span>
                )}
              </div>
            )}

            {/* Promotion — manual bridge from media asset to production. Publishing an
                asset never creates or publishes a production; that step stays a human choice. */}
            {asset.publishedAt && (
              <div style={{ marginTop: '10px', paddingTop: '14px', borderTop: '1px solid #10b98118' }}>
                <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.12em',
                  textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
                  Promotion
                </p>

                {asset.productionId ? (
                  <p style={{ color: '#10b981', fontSize: '11px', marginBottom: '10px' }}>
                    ✓ Attached to production — {productions.find(p => p.id === asset.productionId)?.title || 'Untitled'}
                  </p>
                ) : (
                  <>
                    <p style={{ color: 'var(--text-5)', fontSize: '10px', lineHeight: 1.6, marginBottom: '10px' }}>
                      Ready to attach to a production.
                    </p>
                    <button
                      onClick={handleCreateProduction}
                      disabled={!!promoting || !onCreateProduction}
                      style={{
                        width: '100%', marginBottom: '8px',
                        background: promoting === 'create' ? 'var(--bg-2)' : 'var(--bg-2)',
                        border: '1px solid var(--border-2)', borderRadius: '6px', padding: '8px 12px',
                        color: promoting ? 'var(--text-5)' : 'var(--text-2)',
                        fontSize: '11px', fontWeight: 600, cursor: promoting ? 'default' : 'pointer',
                      }}
                    >
                      {promoting === 'create' ? 'Creating…' : '🎬 Create Production from Asset'}
                    </button>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                      <select
                        value={attachTarget}
                        onChange={e => setAttachTarget(e.target.value)}
                        style={{ flex: 1, background: 'var(--bg-2)', border: '1px solid var(--border-2)',
                          borderRadius: '6px', padding: '7px 10px', color: 'var(--text-1)',
                          fontSize: '11px', fontFamily: 'inherit', outline: 'none' }}
                      >
                        <option value="">Attach to existing production…</option>
                        {productions.map(p => (
                          <option key={p.id} value={p.id}>{p.title || 'Untitled'}</option>
                        ))}
                      </select>
                      <button
                        onClick={handleAttachToProduction}
                        disabled={!attachTarget || !!promoting}
                        style={{
                          flexShrink: 0, background: 'var(--bg-2)', border: '1px solid var(--border-2)',
                          borderRadius: '6px', padding: '7px 12px',
                          color: attachTarget && !promoting ? 'var(--text-2)' : 'var(--text-6)',
                          fontSize: '11px', fontWeight: 600, cursor: attachTarget && !promoting ? 'pointer' : 'default',
                        }}
                      >
                        {promoting === 'attach' ? '…' : 'Attach'}
                      </button>
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  <button
                    onClick={() => onSendToMuse?.(asset)}
                    disabled={!onSendToMuse}
                    style={{
                      flex: 1, background: 'var(--bg-2)', border: '1px solid var(--border-2)',
                      borderRadius: '6px', padding: '7px 10px', color: 'var(--text-3)',
                      fontSize: '10px', fontWeight: 600, cursor: onSendToMuse ? 'pointer' : 'default',
                    }}
                  >
                    ✦ Send to MUSE for Packaging
                  </button>
                  <button
                    onClick={handleToggleReference}
                    style={{
                      flex: 1, background: 'var(--bg-2)', border: '1px solid var(--border-2)',
                      borderRadius: '6px', padding: '7px 10px', color: 'var(--text-3)',
                      fontSize: '10px', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    {asset.opsCoreSignal === false ? '📡 Restore to Broadcast' : '📎 Send to OpsCore as Reference'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  )
}

function MediaWing({ mediaAssets, productions, onCreateMediaAsset, onUpdateMediaAsset, onPublishMediaAsset, onCreateProduction, onSendToMuse, uid, isMobile }) {
  const [expandedId, setExpandedId] = useState(null)
  const [form, setForm] = useState({ title: '', videoUrl: '', audioUrl: '', transcript: '' })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)
  const [videoUploading, setVideoUploading] = useState(false)
  const [audioUploading, setAudioUploading] = useState(false)
  const [videoUploadStatus, setVideoUploadStatus] = useState(null)
  const [audioUploadStatus, setAudioUploadStatus] = useState(null)
  const [videoUploadErrMsg, setVideoUploadErrMsg] = useState(null)
  const [audioUploadErrMsg, setAudioUploadErrMsg] = useState(null)
  const videoInputRef = useRef(null)
  const audioInputRef = useRef(null)

  async function handleVideoUpload(e) {
    const file = e.target.files?.[0]
    if (!file || !uid) return
    console.log('[MediaWing] video selected —', file.name, file.type, file.size, 'bytes | uid:', uid)
    setVideoUploading(true)
    setVideoUploadStatus('uploading')
    setVideoUploadErrMsg(null)
    try {
      const url = await uploadMediaVideo(file, uid)
      // Title: user-typed > filename > timestamp fallback (never empty on iOS)
      const fileTitle = (file.name || '').replace(/\.[^.]+$/, '').trim()
      const title = form.title.trim() || fileTitle ||
        `Video ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      console.log('[MediaWing] upload OK — auto-saving, title:', title)
      setVideoUploadStatus('saving')
      const id = await onCreateMediaAsset({
        title,
        videoUrl:   url,
        audioUrl:   form.audioUrl  || null,
        transcript: form.transcript || '',
        type:       'video',
      })
      console.log('[MediaWing] asset saved, id:', id)
      setForm({ title: '', videoUrl: '', audioUrl: '', transcript: '' })
      setVideoUploadStatus('saved')
    } catch (err) {
      console.error('[MediaWing] video upload/save failed:', err?.code, err?.message)
      setVideoUploadStatus('error')
      setVideoUploadErrMsg(err?.code || err?.message || 'Unknown error')
    } finally { setVideoUploading(false); e.target.value = '' }
  }

  async function handleAudioUpload(e) {
    const file = e.target.files?.[0]
    if (!file || !uid) return
    console.log('[MediaWing] audio selected —', file.name, file.type, file.size, 'bytes | uid:', uid)
    setAudioUploading(true)
    setAudioUploadStatus('uploading')
    setAudioUploadErrMsg(null)
    try {
      const url = await uploadMediaAudio(file, uid)
      const fileTitle = (file.name || '').replace(/\.[^.]+$/, '').trim()
      const title = form.title.trim() || fileTitle ||
        `Audio ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      console.log('[MediaWing] upload OK — auto-saving, title:', title)
      setAudioUploadStatus('saving')
      const id = await onCreateMediaAsset({
        title,
        videoUrl:   form.videoUrl || null,
        audioUrl:   url,
        transcript: form.transcript || '',
        type:       'audio',
      })
      console.log('[MediaWing] asset saved, id:', id)
      setForm({ title: '', videoUrl: '', audioUrl: '', transcript: '' })
      setAudioUploadStatus('saved')
    } catch (err) {
      console.error('[MediaWing] audio upload/save failed:', err?.code, err?.message)
      setAudioUploadStatus('error')
      setAudioUploadErrMsg(err?.code || err?.message || 'Unknown error')
    } finally { setAudioUploading(false); e.target.value = '' }
  }

  async function handleCreate() {
    console.log('[MediaWing] handleCreate fired', { title: form.title, titleTrim: form.title.trim(), creating })
    if (!form.title.trim() || creating) return
    setCreating(true)
    setCreateError(null)
    console.log('[MediaWing] handleCreate proceeding to write', { title: form.title, videoUrl: form.videoUrl, audioUrl: form.audioUrl })
    try {
      const id = await onCreateMediaAsset({
        title:      form.title,
        videoUrl:   form.videoUrl  || null,
        audioUrl:   form.audioUrl  || null,
        transcript: form.transcript || '',
        type:       form.videoUrl ? 'video' : form.audioUrl ? 'audio' : 'transcript',
      })
      console.log('[MediaWing] asset created, id:', id)
      setForm({ title: '', videoUrl: '', audioUrl: '', transcript: '' })
      setVideoUploadStatus(null)
      setAudioUploadStatus(null)
    } catch (err) {
      console.error('[MediaWing] createMediaAsset failed:', err)
      setCreateError(err?.message || 'Save failed — check console for details')
    } finally { setCreating(false) }
  }

  const px = isMobile ? 'px-4' : 'px-8'

  return (
    <div className={`flex-1 overflow-y-auto ${px} py-6`}>
      <div style={{ maxWidth: '640px' }}>

        {/* Featured Broadcast — always first */}
        <FeaturedBroadcast mediaAssets={mediaAssets} productions={productions || []} />

        {/* Media Library */}
        {mediaAssets.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.12em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>
              Media Library — {mediaAssets.length} asset{mediaAssets.length !== 1 ? 's' : ''}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {mediaAssets.map(asset => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  productions={productions || []}
                  onUpdate={onUpdateMediaAsset}
                  onPublish={onPublishMediaAsset}
                  onCreateProduction={onCreateProduction}
                  onSendToMuse={onSendToMuse}
                  expanded={expandedId === asset.id}
                  onToggle={setExpandedId}
                  uid={uid}
                  isMobile={isMobile}
                />
              ))}
            </div>
          </div>
        )}

        {/* Add to Library — upload form at bottom */}
        <div style={{
          background: 'var(--bg-2)', border: '1px solid #a855f720',
          borderLeft: '3px solid #a855f7', borderRadius: '0 10px 10px 0',
          padding: '16px 18px', marginBottom: '24px',
        }}>
          <div style={{ marginBottom: '14px' }}>
            <p style={{ color: '#a855f7', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>
              Add to Library
            </p>
          </div>

          {/* Title — required */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <p style={{ color: '#a855f7', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
                Title <span style={{ color: '#f59e0b' }}>*</span>
              </p>
              {!form.title.trim() && (videoUploadStatus === 'complete' || audioUploadStatus === 'complete' || form.videoUrl || form.audioUrl) && (
                <p style={{ color: '#f59e0b', fontSize: '9px', fontWeight: 600 }}>Required to save</p>
              )}
            </div>
            <input
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Asset title (required to save)…"
              style={{
                width: '100%', background: 'var(--bg-1)',
                border: `1px solid ${!form.title.trim() && (videoUploadStatus === 'complete' || audioUploadStatus === 'complete') ? '#f59e0b60' : 'var(--border-2)'}`,
                borderRadius: '6px', padding: '8px 12px', color: 'var(--text-0)', fontSize: '13px', fontFamily: 'inherit', outline: 'none',
              }}
              onKeyDown={e => { if (e.key === 'Enter' && form.title.trim()) handleCreate() }}
            />
          </div>

          {/* Video URL + upload */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
            <input
              value={form.videoUrl}
              onChange={e => { setForm(p => ({ ...p, videoUrl: e.target.value })); setVideoUploadStatus(null) }}
              placeholder="🎬 Video URL (YouTube, Vimeo, .mp4)…"
              style={{ flex: 1, background: 'var(--bg-1)', border: '1px solid var(--border-2)', borderRadius: '6px', padding: '7px 10px', color: 'var(--text-1)', fontSize: '11px', fontFamily: 'inherit', outline: 'none' }}
            />
            <input ref={videoInputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={handleVideoUpload} />
            <button
              onClick={() => videoInputRef.current?.click()}
              disabled={videoUploading}
              style={{ flexShrink: 0, background: 'var(--bg-1)', border: '1px solid var(--border-2)', borderRadius: '6px', padding: '7px 12px', color: videoUploading ? 'var(--text-5)' : '#a855f7', fontSize: '11px', cursor: videoUploading ? 'default' : 'pointer' }}
            >
              {videoUploading ? 'Uploading…' : '↑ Upload'}
            </button>
          </div>
          {videoUploadStatus && (
            <p style={{
              color: videoUploadStatus === 'complete' ? '#10b981' : videoUploadStatus === 'error' ? '#ef4444' : '#a855f7',
              fontSize: '10px', marginBottom: '8px',
            }}>
              {videoUploadStatus === 'uploading' ? '⟳ Uploading to storage…'
                : videoUploadStatus === 'saving'   ? '⟳ Saving to library…'
                : videoUploadStatus === 'saved'    ? '✓ Saved to Media Library.'
                : `⚠ Upload failed — ${videoUploadErrMsg || 'unknown error'}`}
            </p>
          )}

          {/* Audio URL + upload */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '4px', marginTop: videoUploadStatus ? '0' : '8px' }}>
            <input
              value={form.audioUrl}
              onChange={e => { setForm(p => ({ ...p, audioUrl: e.target.value })); setAudioUploadStatus(null) }}
              placeholder="🔊 Audio URL (SoundCloud, .mp3)…"
              style={{ flex: 1, background: 'var(--bg-1)', border: '1px solid var(--border-2)', borderRadius: '6px', padding: '7px 10px', color: 'var(--text-1)', fontSize: '11px', fontFamily: 'inherit', outline: 'none' }}
            />
            <input ref={audioInputRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleAudioUpload} />
            <button
              onClick={() => audioInputRef.current?.click()}
              disabled={audioUploading}
              style={{ flexShrink: 0, background: 'var(--bg-1)', border: '1px solid var(--border-2)', borderRadius: '6px', padding: '7px 12px', color: audioUploading ? 'var(--text-5)' : '#a855f7', fontSize: '11px', cursor: audioUploading ? 'default' : 'pointer' }}
            >
              {audioUploading ? 'Uploading…' : '↑ Upload'}
            </button>
          </div>
          {audioUploadStatus && (
            <p style={{
              color: audioUploadStatus === 'complete' ? '#10b981' : audioUploadStatus === 'error' ? '#ef4444' : '#a855f7',
              fontSize: '10px', marginBottom: '8px',
            }}>
              {audioUploadStatus === 'uploading' ? '⟳ Uploading to storage…'
                : audioUploadStatus === 'saving'   ? '⟳ Saving to library…'
                : audioUploadStatus === 'saved'    ? '✓ Saved to Media Library.'
                : `⚠ Upload failed — ${audioUploadErrMsg || 'unknown error'}`}
            </p>
          )}

          {/* Live preview — appears as soon as a valid URL is entered */}
          {(form.videoUrl || form.audioUrl) && (
            <div style={{ marginBottom: '12px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #a855f720' }}>
              {form.videoUrl && (
                <div style={{ background: '#000' }}>
                  <VideoPlayer url={form.videoUrl} />
                </div>
              )}
              {form.audioUrl && (
                <div style={{ background: 'var(--bg-1)', padding: '10px 14px' }}>
                  <AudioPlayer url={form.audioUrl} />
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                console.log('[MediaWing] Save button clicked', { title: form.title, disabled: !form.title.trim() || creating })
                handleCreate()
              }}
              disabled={!form.title.trim() || creating}
              style={{
                background: form.title.trim() && !creating ? '#7c3aed' : 'var(--bg-1)',
                border: `1px solid ${form.title.trim() && !creating ? '#a855f7' : 'var(--border-1)'}`,
                borderRadius: '7px', padding: '8px 18px',
                color: form.title.trim() && !creating ? '#fff' : 'var(--text-5)',
                fontSize: '11px', fontWeight: 600, cursor: form.title.trim() && !creating ? 'pointer' : 'default',
              }}
            >
              {creating ? 'Saving…' : 'Save Media Asset'}
            </button>
            {!form.title.trim() && !creating && (form.videoUrl || form.audioUrl || form.transcript) && (
              <p style={{ color: '#f59e0b', fontSize: '10px' }}>↑ Enter a title to save</p>
            )}
            {createError && (
              <p style={{ color: '#ef4444', fontSize: '11px', lineHeight: 1.5 }}>
                ⚠ {createError}
              </p>
            )}
          </div>
        </div>


      </div>
    </div>
  )
}

// ── Remix Board ───────────────────────────────────────────────────────────────

function RemixBoard({ mediaAssets, isMobile }) {
  const px = isMobile ? 'px-4' : 'px-8'

  const published = [...mediaAssets]
    .filter(a => a.publishedAt && (a.videoUrl || a.audioUrl))
    .sort((a, b) => {
      const oA = SCENE_TYPES.find(s => s.id === a.sceneType)?.order ?? 99
      const oB = SCENE_TYPES.find(s => s.id === b.sceneType)?.order ?? 99
      if (oA !== oB) return oA - oB
      return new Date(a.publishedAt) - new Date(b.publishedAt)
    })

  const unclassified = published.filter(a => !a.sceneType)

  if (published.length === 0) {
    return (
      <div className={`flex-1 overflow-y-auto ${px} py-6`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '360px' }}>
          <p style={{ fontSize: '36px', marginBottom: '12px' }}>✂️</p>
          <p style={{ color: 'var(--text-2)', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Remix Board is empty.</p>
          <p style={{ color: 'var(--text-5)', fontSize: '12px', lineHeight: 1.7 }}>
            Publish media assets from the 🎬 Media tab, then add Remix metadata to each one to build the board.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex-1 overflow-y-auto ${px} py-6`}>
      <div style={{ maxWidth: '640px' }}>
        <p style={{ color: 'var(--text-5)', fontSize: '11px', marginBottom: '3px' }}>
          {published.length} published asset{published.length !== 1 ? 's' : ''} in sequence.
        </p>
        <p style={{ color: 'var(--text-6)', fontSize: '10px', marginBottom: '24px', fontStyle: 'italic' }}>
          Sequence is ordered by scene type, then publish date. Edit Remix fields in 🎬 Media to reposition.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {published.map((asset, i) => {
            const sceneMeta = SCENE_TYPES.find(s => s.id === asset.sceneType)
            const isVideo = !!(asset.videoUrl || asset.type === 'video')
            const tagList = asset.tags ? asset.tags.split(',').map(t => t.trim()).filter(Boolean) : []
            const next = published[i + 1]
            const nextScene = next ? SCENE_TYPES.find(s => s.id === next.sceneType) : null

            return (
              <div key={asset.id}>
                <div style={{
                  border: `1px solid ${sceneMeta ? sceneMeta.color + '30' : '#a855f720'}`,
                  borderLeft: `3px solid ${sceneMeta ? sceneMeta.color : '#a855f760'}`,
                  borderRadius: '0 10px 10px 0',
                  overflow: 'hidden',
                  background: 'var(--bg-1)',
                }}>
                  {/* Header */}
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-0)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
                        {sceneMeta ? (
                          <span style={{
                            background: sceneMeta.color + '12', border: `1px solid ${sceneMeta.color}30`,
                            borderRadius: '4px', padding: '2px 8px',
                            color: sceneMeta.color, fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                          }}>
                            {sceneMeta.label}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-6)', fontSize: '9px', fontStyle: 'italic' }}>unclassified</span>
                        )}
                        {asset.pacing && (
                          <span style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            {asset.pacing}
                          </span>
                        )}
                        {asset.mood && (
                          <span style={{ color: 'var(--text-4)', fontSize: '10px', fontStyle: 'italic' }}>{asset.mood}</span>
                        )}
                        <span style={{ color: 'var(--text-6)', fontSize: '9px', marginLeft: 'auto' }}>
                          {isVideo ? '🎬' : '🔊'}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-0)', fontSize: '14px', fontWeight: 600, lineHeight: 1.3 }}>
                        {asset.title || 'Untitled'}
                      </p>
                    </div>
                    <p style={{ color: 'var(--text-6)', fontSize: '10px', flexShrink: 0, paddingTop: '16px' }}>
                      {new Date(asset.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  {/* Remix metadata */}
                  {(asset.usableMoments || asset.suggestedUse || asset.remixNotes) && (
                    <div style={{ padding: '12px 18px', borderBottom: tagList.length > 0 ? '1px solid var(--border-0)' : 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {asset.usableMoments && (
                        <div>
                          <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '3px' }}>Usable Moments</p>
                          <p style={{ color: 'var(--text-3)', fontSize: '11px', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{asset.usableMoments}</p>
                        </div>
                      )}
                      {asset.suggestedUse && (
                        <div>
                          <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '3px' }}>Suggested Use</p>
                          <p style={{ color: 'var(--text-3)', fontSize: '11px', lineHeight: 1.6 }}>{asset.suggestedUse}</p>
                        </div>
                      )}
                      {asset.remixNotes && (
                        <div>
                          <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '3px' }}>Remix Notes</p>
                          <p style={{ color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.6, fontStyle: 'italic' }}>{asset.remixNotes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  {tagList.length > 0 && (
                    <div style={{ padding: '8px 18px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {tagList.map(tag => (
                        <span key={tag} style={{
                          background: 'var(--bg-2)', border: '1px solid var(--border-1)',
                          borderRadius: '4px', padding: '2px 8px',
                          color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.06em',
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Transition connector */}
                {next && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 18px' }}>
                    <div style={{ height: '1px', flex: 1, background: 'var(--border-0)' }} />
                    <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0 }}>
                      {nextScene ? `→ ${nextScene.label}` : '→ next'}
                    </p>
                    <div style={{ height: '1px', flex: 1, background: 'var(--border-0)' }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {unclassified.length > 0 && (
          <div style={{ marginTop: '20px', padding: '12px 16px', background: 'var(--bg-2)', border: '1px dashed var(--border-1)', borderRadius: '8px' }}>
            <p style={{ color: 'var(--text-5)', fontSize: '10px', lineHeight: 1.65 }}>
              {unclassified.length} asset{unclassified.length !== 1 ? 's' : ''} without a scene type appear at the end.
              Open each in 🎬 Media and set the Remix Layer fields to position them correctly.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── About ─────────────────────────────────────────────────────────────────────

function AboutTab({ graduates, isMobile }) {
  const px = isMobile ? 'px-4' : 'px-8'
  return (
    <div className={`flex-1 overflow-y-auto ${px} py-6`}>
      <div style={{ maxWidth: '540px', marginBottom: '32px' }}>
        <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 600, marginBottom: '12px' }}>The Discipline</p>
        <p style={{ color: 'var(--text-2)', fontSize: '13px', lineHeight: 1.8, marginBottom: '10px' }}>
          Theater is not a media department. A media department says: look what we made. Theater says: look what survived. Those are different missions, and they produce fundamentally different work.
        </p>
        <p style={{ color: 'var(--text-3)', fontSize: '13px', lineHeight: 1.8 }}>
          The work has to survive. The person follows. Theater exists to transmit the proof — so the next builder knows what the discipline looks like when it has been tested by reality and held.
        </p>
      </div>

      <div style={{ maxWidth: '540px', marginBottom: '32px' }}>
        <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 600, marginBottom: '12px' }}>What This College Teaches</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {TEACHINGS.map(({ label, note }) => (
            <div key={label} style={{ borderLeft: '2px solid #8b5cf630', paddingLeft: '14px' }}>
              <p style={{ color: 'var(--text-1)', fontSize: '12px', fontWeight: 600, marginBottom: '3px' }}>{label}</p>
              <p style={{ color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.65 }}>{note}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '600px', marginBottom: '32px' }}>
        <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 600, marginBottom: '12px' }}>
          FleetFlow: First Graduate — Structure
        </p>
        <div style={{ border: '1px solid var(--border-1)', borderLeft: '3px solid #8b5cf6',
          borderRadius: '0 10px 10px 0', overflow: 'hidden' }}>
          <div style={{ background: 'var(--bg-1)', padding: '14px 18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {FLEETFLOW_ACTS.map(({ label, title, note }) => (
                <div key={label} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <p style={{ flexShrink: 0, color: 'var(--text-6)', fontSize: '9px', fontWeight: 600,
                    letterSpacing: '0.08em', textTransform: 'uppercase', paddingTop: '2px', width: '36px' }}>
                    {label}
                  </p>
                  <div>
                    <p style={{ color: 'var(--text-2)', fontSize: '11px', fontWeight: 600, marginBottom: '2px' }}>{title}</p>
                    <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.55 }}>{note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {graduates.length > 0 && (
        <div style={{ maxWidth: '600px', marginBottom: '20px' }}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>
            Graduate Productions
          </p>
          {graduates.map(g => (
            <div key={g.id} style={{ border: '1px solid var(--border-1)', borderLeft: '3px solid #8b5cf6',
              borderRadius: '0 10px 10px 0', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{ background: 'var(--bg-2)', padding: '14px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '3px' }}>
                  <p style={{ color: 'var(--text-1)', fontSize: '13px', fontWeight: 700 }}>
                    {g.productionTitle || `${g.graduateName}: ${ordinal(g.sequence)} Graduate`}
                  </p>
                  <span style={{ background: '#8b5cf615', border: '1px solid #8b5cf640', borderRadius: '4px',
                    padding: '2px 8px', color: '#8b5cf6', fontSize: '9px', fontWeight: 600,
                    letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0 }}>
                    {g.evaluationStatus === 'active' ? 'Active' : 'In Development'}
                  </span>
                </div>
                {g.tagline && <p style={{ color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.6 }}>{g.tagline}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ maxWidth: '540px' }}>
        <p style={{ color: 'var(--text-6)', fontSize: '11px', fontStyle: 'italic', lineHeight: 1.7 }}>
          Knowledge becomes inheritance only when it reaches the next person.
        </p>
      </div>
    </div>
  )
}

// ── Theater Room ──────────────────────────────────────────────────────────────

export default function TheaterRoom({
  graduates = [], observations = [], productions = [], mediaAssets = [],
  onCreateProduction, onUpdateProduction, onPublish,
  onCreateMediaAsset, onUpdateMediaAsset, onPublishMediaAsset, onSendToMuse,
  apiKey, onConnectClaude, uid, isMobile,
  lineage = [],
}) {
  const px = isMobile ? 'px-4' : 'px-8'
  const [view, setView] = useState('office')
  const [stagingConcept, setStagingConcept] = useState('')

  function openInStaging(concept) {
    setStagingConcept(concept)
    setView('stage')
  }

  async function handleSaveToProduction(productionId, formatId, text) {
    await onUpdateProduction(productionId, {
      [`outputs.${formatId}`]: { text, savedAt: Date.now() },
    })
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-0)' }}>

      {/* Header */}
      <div className={`shrink-0 ${px} pt-6 pb-5`} style={{ borderBottom: '1px solid var(--border-0)' }}>
        <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 600, marginBottom: '3px' }}>
          College of Transmission
        </p>
        <h2 style={{ fontSize: '18px', color: 'var(--text-0)', fontWeight: 700,
          letterSpacing: '0.08em', marginBottom: '4px' }}>Theater</h2>
        <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic' }}>
          The production office knows everything. The audience sees what survives.
        </p>
      </div>

      <RoomSubNav tabs={THEATER_TABS} activeTab={view} onSelect={setView} />

      {view === 'office' && (
        <ProductionOffice
          observations={observations}
          productions={productions}
          onCreateProduction={onCreateProduction}
          onUpdateProduction={onUpdateProduction}
          onPublish={onPublish}
          onStage={openInStaging}
          isMobile={isMobile}
        />
      )}
      {view === 'media' && (
        <MediaWing
          mediaAssets={mediaAssets}
          productions={productions}
          onCreateMediaAsset={onCreateMediaAsset}
          onUpdateMediaAsset={onUpdateMediaAsset}
          onPublishMediaAsset={onPublishMediaAsset}
          onCreateProduction={onCreateProduction}
          onSendToMuse={onSendToMuse}
          uid={uid}
          isMobile={isMobile}
        />
      )}
      {view === 'stage' && (
        <StagingWing
          observations={observations}
          productions={productions}
          apiKey={apiKey}
          onConnectClaude={onConnectClaude}
          onSaveToProduction={handleSaveToProduction}
          initialConcept={stagingConcept}
          uid={uid}
          isMobile={isMobile}
        />
      )}
      {view === 'remix' && (
        <RemixBoard mediaAssets={mediaAssets} isMobile={isMobile} />
      )}
      {view === 'published' && (
        <div className={`flex-1 overflow-y-auto ${isMobile ? 'px-4' : 'px-8'} py-6`}>
          <div style={{ maxWidth: '580px' }}>
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
              Published to OpsCore
            </p>
            <p style={{ color: 'var(--text-6)', fontSize: '11px', marginBottom: '20px' }}>
              These survived Theater review. They are now live in OpsCore Field View.
            </p>
            {productions.filter(p => p.publishedAt).length === 0 ? (
              <div style={{ background: 'var(--bg-2)', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic', lineHeight: 1.7 }}>
                  No published productions yet. When a Human Gate-approved production is published,
                  it appears here and in OpsCore.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {productions
                  .filter(p => p.publishedAt)
                  .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
                  .map(p => {
                    const chain = lineage.find(l => l.productionId === p.id) ?? null
                    return (
                      <div key={p.id} style={{
                        background: '#041208',
                        border: '1px solid #10b98125',
                        borderLeft: '3px solid #10b981',
                        borderRadius: '0 8px 8px 0', padding: '14px 16px',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '6px' }}>
                          <p style={{ color: 'var(--text-0)', fontSize: '13px', fontWeight: 600 }}>
                            {p.title || 'Untitled Production'}
                          </p>
                          <span style={{ color: '#10b981', fontSize: '9px', fontWeight: 700,
                            letterSpacing: '0.1em', flexShrink: 0 }}>
                            {new Date(p.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        {p.deliveryDestination && (
                          <p style={{ color: 'var(--text-5)', fontSize: '11px' }}>
                            Destination: {p.deliveryDestination}
                          </p>
                        )}
                        {p.notes && (
                          <p style={{ color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.5, marginTop: '4px' }}>
                            {p.notes.length > 120 ? p.notes.slice(0, 120) + '…' : p.notes}
                          </p>
                        )}
                        <p style={{ color: '#10b981', fontSize: '10px', marginTop: '8px', fontWeight: 600 }}>
                          ✓ Live in OpsCore Field View
                        </p>
                        <LineageChain lineage={chain} />
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      )}
      {view === 'archive' && (
        <div className={`flex-1 overflow-y-auto ${isMobile ? 'px-4' : 'px-8'} py-6`}>
          <div style={{ maxWidth: '580px' }}>
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '12px' }}>
              Archived Productions
            </p>
            <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic', lineHeight: 1.7 }}>
              Productions that ran their course, were superseded, or were set aside.
              The record remains. Coming soon.
            </p>
          </div>
        </div>
      )}
      {view === 'about' && (
        <AboutTab graduates={graduates} isMobile={isMobile} />
      )}
    </div>
  )
}
