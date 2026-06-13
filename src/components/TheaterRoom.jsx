import { useState } from 'react'
import { enrichForFormat, FORMATS } from '../lib/theaterEnrichment'
import { createMultiManifestTest } from '../lib/db'
import RoomSubNav from './RoomSubNav'

const THEATER_TABS = [
  { id: 'office',    label: '📦 Production Office' },
  { id: 'stage',     label: '🎭 Staging' },
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

function ProductionCard({ production, expanded, onToggle, onSave, onStage, onArchive, isMobile }) {
  const [edit, setEdit] = useState(null)
  const [saving, setSaving] = useState(false)

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
            {outputCount > 0 && (
              <span style={{ color: 'var(--text-5)', fontSize: '10px' }}>
                · {outputCount} output{outputCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-1)', fontSize: '12px', fontWeight: 500, lineHeight: 1.4 }}>
            {production.title || 'Untitled Production'}
          </p>
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
            <div style={{ display: 'flex', gap: '6px' }}>
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
        </div>
      )}
    </div>
  )
}

function ProductionOffice({ observations, productions, onCreateProduction, onUpdateProduction, onStage, isMobile }) {
  const [expandedId, setExpandedId]   = useState(null)
  const [startingId, setStartingId]   = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')

  const incomingObs = observations.filter(o =>
    o.destination === 'Theater' &&
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
  const incoming = (observations || []).filter(o => o.destination === 'Theater')
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

  const incoming = (observations || []).filter(o => o.destination === 'Theater')
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
  graduates = [], observations = [], productions = [],
  onCreateProduction, onUpdateProduction,
  apiKey, onConnectClaude, uid, isMobile,
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
          onStage={openInStaging}
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
      {view === 'published' && (
        <div className={`flex-1 overflow-y-auto ${isMobile ? 'px-4' : 'px-8'} py-6`}>
          <div style={{ maxWidth: '580px' }}>
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '12px' }}>
              Published Productions
            </p>
            <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic', lineHeight: 1.7 }}>
              Published artifacts — observations that became deliverables and were deployed.
              A produced artifact and a deployed artifact are not the same thing.
              Published is the proof that the institution acted.
              Coming soon.
            </p>
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
