import { useState } from 'react'
import { requestKELRecommendation } from '../lib/kelAnalysis'
import { speakWithVoice, getVoiceConfig } from '../lib/roomVoice'
import RoomSubNav from './RoomSubNav'

// ── Constants ─────────────────────────────────────────────────────────────────

const PRIORITY_COLORS = {
  critical: '#ef4444',
  high:     '#f97316',
  standard: '#3b82f6',
  low:      '#6b7280',
}

const RISK_COLORS = {
  critical: '#ef4444',
  high:     '#f97316',
  medium:   '#f59e0b',
  low:      '#10b981',
  none:     '#6b7280',
}

const STATUS_META = {
  drafted:          { label: 'Draft',         color: '#6b7280' },
  analyzing:        { label: 'Analyzing',     color: '#3b82f6' },
  planned:          { label: 'Planned',       color: '#3b82f6' },
  pending_approval: { label: 'Awaiting Gate', color: '#f59e0b' },
  approved:         { label: 'Approved',      color: '#10b981' },
  in_progress:      { label: 'In Progress',   color: '#3b82f6' },
  completed:        { label: 'Completed',     color: '#10b981' },
  failed:           { label: 'Failed',        color: '#ef4444' },
  denied:           { label: 'Denied',        color: '#ef4444' },
  archived:         { label: 'Archived',      color: '#4b5563' },
}

const PRIORITIES     = ['critical', 'high', 'standard', 'low']
const RISK_LEVELS    = ['none', 'low', 'medium', 'high', 'critical']
const TARGET_SYSTEMS = ['pacer_atrium', 'fleetflow', 'github', 'calendar', 'external']
const EXEC_AGENTS    = ['pacer', 'vera', 'muse', 'kel', 'archivist', 'kodex']

const REQUEST_LABELS = { builder_readiness: 'Builder Readiness' }

const DOMAIN_COLORS = {
  'FleetFlow':              '#3b82f6',
  'Isles of the Awakening': '#10b981',
  'Doctrine':               '#f59e0b',
  'Content':                '#8b5cf6',
  'Archive':                '#6b7280',
}

const CONSTELLATIONS = [
  'Brand Voice Emergence',
  'Cognitive Loop Closure',
  'Distributed Continuity',
  'Governance Before Growth',
  'Infrastructure Fortification',
  'Institutional Memory',
  'Interface as Ritual',
  'Narrative Threshold',
  'Operational Trust',
  'Play Button Requirement',
  'Premature Expansion',
  'Theater/OpsCore Doctrine',
  'Threshold Manifestation',
  'Visibility Gap',
]

const FLEETFLOW_SEED = {
  title:            'FleetFlow Architecture Audit',
  intent:           'Audit the FleetFlow monolithic source and produce a modular refactor plan. The current index.html contains all business logic, UI, auth, and data operations in a single file. This command authorizes VERA to audit the structure, PACER to draft a modular extraction strategy, and K.E.L. to execute approved file operations after Human Gate review.',
  priority:         'high',
  riskLevel:        'medium',
  targetSystem:     'fleetflow',
  assignedAgent:    'pacer',
  supportingAgents: 'vera, kel, archivist',
  executionMode:    'review',
  expectedOutput:   'A modular FleetFlow source architecture with separated concerns: auth, data layer, UI components, routing, and business logic. Each module independently testable. VERA verification report confirming no regressions.',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(date) {
  if (!date) return ''
  const mins = Math.floor((Date.now() - date.getTime()) / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function domainColor(d) { return DOMAIN_COLORS[d] || '#4b5563' }

// ── Shared styles ─────────────────────────────────────────────────────────────

const LABEL_S = {
  display: 'block', color: 'var(--text-5)', fontSize: '9px',
  letterSpacing: '0.12em', textTransform: 'uppercase',
  fontWeight: 700, marginBottom: '5px',
}

const INPUT_S = {
  width: '100%', display: 'block',
  background: 'var(--bg-1)', border: '1px solid var(--border-1)',
  borderRadius: '6px', padding: '8px 12px',
  color: 'var(--text-1)', fontSize: '12px', lineHeight: 1.6,
  fontFamily: 'inherit', marginBottom: '14px', boxSizing: 'border-box',
}

const SELECT_S = { ...INPUT_S, cursor: 'pointer' }

const BTN_PRIMARY = {
  background: '#1d3a6e', border: '1px solid #3b82f640',
  color: '#93c5fd', fontSize: '12px', fontWeight: 700,
  padding: '8px 18px', borderRadius: '6px', cursor: 'pointer',
}

const BTN_GHOST = {
  background: 'none', border: '1px solid var(--border-1)',
  color: 'var(--text-4)', fontSize: '12px',
  padding: '8px 14px', borderRadius: '6px', cursor: 'pointer',
}

// ── NewCommandForm ─────────────────────────────────────────────────────────────

function NewCommandForm({ onSubmit, onCancel, seedData }) {
  const [form, setForm] = useState({
    title: '', intent: '', priority: 'standard', riskLevel: 'medium',
    targetSystem: 'pacer_atrium', assignedAgent: 'pacer',
    supportingAgents: '', executionMode: 'review', expectedOutput: '',
    patternTag: '',
    ...(seedData || {}),
  })

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }
  const canSubmit = form.title.trim() && form.intent.trim()

  function handleSubmit() {
    if (!canSubmit) return
    onSubmit({
      ...form,
      supportingAgents: form.supportingAgents
        ? form.supportingAgents.split(',').map(s => s.trim()).filter(Boolean)
        : [],
    })
  }

  return (
    <div style={{ maxWidth: '600px' }}>
      <p style={{ color: 'var(--text-5)', fontSize: '11px', marginBottom: '20px', lineHeight: 1.7 }}>
        Define the command. PACER assigns agents. Human Gate authorizes execution.
      </p>

      <label style={LABEL_S}>Command Title *</label>
      <input value={form.title} onChange={e => set('title', e.target.value)}
        placeholder="e.g. Refactor FleetFlow Source Architecture"
        style={INPUT_S} />

      <label style={LABEL_S}>Intent *</label>
      <textarea value={form.intent} onChange={e => set('intent', e.target.value)}
        placeholder="What should happen? What are the constraints? Why now?"
        rows={4} style={{ ...INPUT_S, resize: 'vertical' }} />

      <div style={{ display: 'flex', gap: '14px' }}>
        <div style={{ flex: 1 }}>
          <label style={LABEL_S}>Priority</label>
          <select value={form.priority} onChange={e => set('priority', e.target.value)} style={SELECT_S}>
            {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={LABEL_S}>Risk Level</label>
          <select value={form.riskLevel} onChange={e => set('riskLevel', e.target.value)} style={SELECT_S}>
            {RISK_LEVELS.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '14px' }}>
        <div style={{ flex: 1 }}>
          <label style={LABEL_S}>Target System</label>
          <select value={form.targetSystem} onChange={e => set('targetSystem', e.target.value)} style={SELECT_S}>
            {TARGET_SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={LABEL_S}>Execution Mode</label>
          <select value={form.executionMode} onChange={e => set('executionMode', e.target.value)} style={SELECT_S}>
            <option value="review">Review only</option>
            <option value="execution">Execution (post-approval)</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '14px' }}>
        <div style={{ flex: 1 }}>
          <label style={LABEL_S}>Lead Agent</label>
          <select value={form.assignedAgent} onChange={e => set('assignedAgent', e.target.value)} style={SELECT_S}>
            {EXEC_AGENTS.map(a => <option key={a} value={a}>{a.toUpperCase()}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={LABEL_S}>Supporting Agents (comma-separated)</label>
          <input value={form.supportingAgents} onChange={e => set('supportingAgents', e.target.value)}
            placeholder="vera, kel, archivist" style={INPUT_S} />
        </div>
      </div>

      <label style={LABEL_S}>Expected Output</label>
      <textarea value={form.expectedOutput} onChange={e => set('expectedOutput', e.target.value)}
        placeholder="What does success look like? What should be delivered?"
        rows={3} style={{ ...INPUT_S, resize: 'vertical' }} />

      <label style={LABEL_S}>Constellation Pattern (optional)</label>
      <select value={form.patternTag} onChange={e => set('patternTag', e.target.value)} style={{ ...SELECT_S, marginBottom: '20px' }}>
        <option value="">— No Pattern —</option>
        {CONSTELLATIONS.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={handleSubmit} disabled={!canSubmit}
          style={{ ...BTN_PRIMARY, opacity: canSubmit ? 1 : 0.45, cursor: canSubmit ? 'pointer' : 'default' }}>
          Create Command
        </button>
        <button onClick={onCancel} style={BTN_GHOST}>Cancel</button>
      </div>
    </div>
  )
}

// ── CommandDetail ──────────────────────────────────────────────────────────────

function CommandDetail({ cmd, onBack, onSubmitForGate, onApprove, onDeny, onComplete, onFail, onArchive, onUpdate }) {
  const [denyRationale,   setDenyRationale]   = useState('')
  const [showDeny,        setShowDeny]        = useState(false)
  const [failReason,      setFailReason]      = useState('')
  const [showFail,        setShowFail]        = useState(false)
  const [completionProof, setCompletionProof] = useState(cmd.completionProof || '')
  const [result,          setResult]          = useState(cmd.result || '')
  const [newStepLabel,    setNewStepLabel]    = useState('')
  const [newStepAgent,    setNewStepAgent]    = useState('pacer')
  const [showAddStep,     setShowAddStep]     = useState(false)
  const [analysis,        setAnalysis]        = useState(cmd.analysis || '')

  const sm    = STATUS_META[cmd.status] || { label: cmd.status, color: '#6b7280' }
  const pc    = PRIORITY_COLORS[cmd.priority] || '#6b7280'
  const rc    = RISK_COLORS[cmd.riskLevel]    || '#6b7280'
  const steps = cmd.steps || []

  function toggleStep(idx) {
    const updated = steps.map((s, i) => i === idx
      ? { ...s, status: s.status === 'completed' ? 'pending' : 'completed' }
      : s
    )
    onUpdate(cmd.id, { steps: updated })
  }

  function addStep() {
    if (!newStepLabel.trim()) return
    const updated = [...steps, {
      label: newStepLabel.trim(), assignedTo: newStepAgent,
      status: 'pending', requiresGate: false,
    }]
    onUpdate(cmd.id, { steps: updated })
    setNewStepLabel('')
    setNewStepAgent('pacer')
    setShowAddStep(false)
  }

  const badge = (label, color) => (
    <span style={{
      background: color + '15', border: `1px solid ${color}30`,
      color, fontSize: '9px', fontWeight: 700,
      letterSpacing: '0.1em', textTransform: 'uppercase',
      borderRadius: '4px', padding: '3px 8px',
    }}>{label}</span>
  )

  return (
    <div>
      <button onClick={onBack} style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 14px',
        color: 'var(--text-5)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px',
      }}>← Commands</button>

      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <h3 style={{ color: 'var(--text-0)', fontSize: '17px', fontWeight: 700, letterSpacing: '-0.01em', flex: 1, minWidth: '200px', lineHeight: 1.3 }}>
            {cmd.title}
          </h3>
          <div style={{ display: 'flex', gap: '5px', flexShrink: 0, flexWrap: 'wrap' }}>
            {badge(cmd.priority || 'standard', pc)}
            {badge((cmd.riskLevel || 'low') + ' risk', rc)}
            {badge(sm.label, sm.color)}
          </div>
        </div>
        <p style={{ color: 'var(--text-5)', fontSize: '10px' }}>
          {cmd.targetSystem}
          {cmd.executionMode && ` · ${cmd.executionMode === 'execution' ? 'Execution Mode' : 'Review Mode'}`}
          {cmd.assignedAgent && ` · ${cmd.assignedAgent.toUpperCase()}`}
          {cmd.supportingAgents?.length > 0 && ` + ${cmd.supportingAgents.join(', ').toUpperCase()}`}
          {cmd.createdAt && ` · ${timeAgo(cmd.createdAt)}`}
        </p>
      </div>

      {/* Intent */}
      <div style={{ marginBottom: '18px' }}>
        <p style={{ ...LABEL_S, marginBottom: '7px' }}>Intent</p>
        <p style={{
          color: 'var(--text-2)', fontSize: '12px', lineHeight: 1.75,
          background: 'var(--bg-2)', borderRadius: '0 8px 8px 0',
          padding: '14px', borderLeft: '3px solid var(--border-2)',
        }}>
          {cmd.intent || '—'}
        </p>
      </div>

      {/* PACER Analysis */}
      <div style={{ marginBottom: '18px' }}>
        <p style={{ ...LABEL_S, marginBottom: '7px' }}>PACER Analysis</p>
        <textarea
          value={analysis}
          onChange={e => setAnalysis(e.target.value)}
          onBlur={() => onUpdate(cmd.id, { analysis })}
          placeholder="Document analysis here: ARCHIVIST findings, KODEX rules checked, VERA risk assessment…"
          rows={4}
          style={{ ...INPUT_S, resize: 'vertical', marginBottom: '3px', borderLeft: '3px solid #3b82f640' }}
        />
        <p style={{ color: 'var(--text-6)', fontSize: '9px' }}>Saved on blur.</p>
      </div>

      {/* Steps */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <p style={LABEL_S}>Task Plan</p>
          <button onClick={() => setShowAddStep(v => !v)} style={{
            background: 'none', border: '1px solid var(--border-1)',
            color: 'var(--text-4)', fontSize: '10px', padding: '3px 10px',
            borderRadius: '5px', cursor: 'pointer',
          }}>+ Step</button>
        </div>
        {steps.length === 0 && !showAddStep && (
          <p style={{ color: 'var(--text-6)', fontSize: '11px', fontStyle: 'italic' }}>
            No steps yet. Add the first step above.
          </p>
        )}
        {steps.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: showAddStep ? '10px' : 0 }}>
            {steps.map((step, i) => {
              const done = step.status === 'completed'
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: done ? '#030906' : 'var(--bg-2)',
                  border: '1px solid var(--border-0)',
                  borderLeft: `3px solid ${done ? '#10b981' : 'var(--border-2)'}`,
                  borderRadius: '0 6px 6px 0', padding: '9px 14px',
                }}>
                  <button onClick={() => toggleStep(i)} style={{
                    width: '16px', height: '16px', borderRadius: '3px', flexShrink: 0,
                    background: done ? '#10b98120' : 'var(--bg-3)',
                    border: `1px solid ${done ? '#10b98140' : 'var(--border-2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: done ? '#10b981' : 'transparent', fontSize: '10px',
                  }}>{done ? '✓' : ''}</button>
                  <p style={{
                    flex: 1, color: done ? 'var(--text-5)' : 'var(--text-2)',
                    fontSize: '12px', lineHeight: 1.4,
                    textDecoration: done ? 'line-through' : 'none',
                  }}>{step.label}</p>
                  {step.assignedTo && (
                    <span style={{ color: 'var(--text-6)', fontSize: '9px', flexShrink: 0 }}>
                      {step.assignedTo.toUpperCase()}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
        {showAddStep && (
          <div style={{
            background: 'var(--bg-2)', border: '1px solid var(--border-1)',
            borderRadius: '8px', padding: '12px', marginTop: steps.length > 0 ? '6px' : 0,
          }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                value={newStepLabel}
                onChange={e => setNewStepLabel(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addStep()}
                placeholder="Step description…"
                style={{ ...INPUT_S, flex: 1, marginBottom: 0 }}
              />
              <select value={newStepAgent} onChange={e => setNewStepAgent(e.target.value)}
                style={{ ...SELECT_S, width: '110px', marginBottom: 0 }}>
                {EXEC_AGENTS.map(a => <option key={a} value={a}>{a.toUpperCase()}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={addStep} style={{ ...BTN_PRIMARY, fontSize: '11px', padding: '5px 12px' }}>Add</button>
              <button onClick={() => { setShowAddStep(false); setNewStepLabel('') }} style={{ ...BTN_GHOST, fontSize: '11px', padding: '5px 10px' }}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Expected output */}
      {cmd.expectedOutput && (
        <div style={{ marginBottom: '18px' }}>
          <p style={{ ...LABEL_S, marginBottom: '7px' }}>Expected Output</p>
          <p style={{ color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.7, fontStyle: 'italic' }}>
            {cmd.expectedOutput}
          </p>
        </div>
      )}

      {/* ── State-dependent action sections ── */}

      {/* Drafted: submit for gate */}
      {cmd.status === 'drafted' && (
        <div style={{ marginBottom: '18px' }}>
          <button onClick={() => onSubmitForGate(cmd.id)} style={{
            background: '#0a0e18', border: '1px solid #f59e0b40',
            color: '#f59e0b', fontSize: '12px', fontWeight: 600,
            padding: '9px 18px', borderRadius: '6px', cursor: 'pointer',
          }}>Submit for Gate Review →</button>
        </div>
      )}

      {/* Human Gate: pending_approval */}
      {cmd.status === 'pending_approval' && (
        <div style={{
          marginBottom: '18px', background: '#0a0c10',
          border: '1px solid #f59e0b30', borderLeft: '4px solid #f59e0b',
          borderRadius: '0 10px 10px 0', padding: '18px',
        }}>
          <p style={{ color: '#f59e0b', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px' }}>
            ⏸ Human Gate
          </p>
          <p style={{ color: 'var(--text-3)', fontSize: '12px', lineHeight: 1.7, marginBottom: '16px' }}>
            Review the intent and task plan. Approve to authorize agents. Denial requires a rationale.
          </p>
          {showDeny ? (
            <div>
              <textarea value={denyRationale} onChange={e => setDenyRationale(e.target.value)}
                placeholder="Why is this command denied? (required)"
                rows={3} style={{ ...INPUT_S, resize: 'vertical', borderColor: '#ef444440' }} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => { onDeny(cmd.id, cmd.title, denyRationale.trim()); setShowDeny(false); setDenyRationale('') }}
                  disabled={!denyRationale.trim()}
                  style={{
                    background: '#140808', border: '1px solid #3a1010',
                    color: denyRationale.trim() ? '#ef4444' : 'var(--text-6)',
                    fontSize: '11px', fontWeight: 600, padding: '7px 14px',
                    borderRadius: '6px', cursor: denyRationale.trim() ? 'pointer' : 'default',
                  }}>Confirm Denial</button>
                <button onClick={() => { setShowDeny(false); setDenyRationale('') }}
                  style={{ ...BTN_GHOST, fontSize: '11px', padding: '7px 12px' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => onApprove(cmd.id, cmd.title)} style={{
                background: '#041208', border: '1px solid #0a3018',
                color: '#10b981', fontSize: '12px', fontWeight: 700,
                padding: '8px 18px', borderRadius: '6px', cursor: 'pointer',
              }}>✓ Approve & Begin</button>
              <button onClick={() => setShowDeny(true)} style={{
                background: '#140808', border: '1px solid #3a1010',
                color: '#ef4444', fontSize: '12px', fontWeight: 600,
                padding: '8px 18px', borderRadius: '6px', cursor: 'pointer',
              }}>✕ Deny</button>
            </div>
          )}
        </div>
      )}

      {/* In progress */}
      {cmd.status === 'in_progress' && (
        <div style={{
          marginBottom: '18px', background: 'var(--bg-2)',
          border: '1px solid var(--border-1)', borderLeft: '4px solid #3b82f6',
          borderRadius: '0 10px 10px 0', padding: '18px',
        }}>
          <p style={{ color: '#3b82f6', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800, marginBottom: '12px' }}>
            ● In Progress
          </p>
          <label style={LABEL_S}>Completion Proof</label>
          <textarea value={completionProof} onChange={e => setCompletionProof(e.target.value)}
            placeholder="Evidence that the command was completed…"
            rows={3} style={{ ...INPUT_S, resize: 'vertical' }} />
          <label style={LABEL_S}>Result Summary</label>
          <textarea value={result} onChange={e => setResult(e.target.value)}
            placeholder="What was the outcome?"
            rows={2} style={{ ...INPUT_S, resize: 'vertical', marginBottom: '16px' }} />
          {showFail ? (
            <div>
              <textarea value={failReason} onChange={e => setFailReason(e.target.value)}
                placeholder="Why did this command fail?"
                rows={2} style={{ ...INPUT_S, resize: 'vertical', borderColor: '#ef444440' }} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => { onFail(cmd.id, cmd.title, failReason); setShowFail(false) }}
                  style={{
                    background: '#140808', border: '1px solid #3a1010', color: '#ef4444',
                    fontSize: '11px', fontWeight: 600, padding: '7px 14px', borderRadius: '6px', cursor: 'pointer',
                  }}>Confirm Failure</button>
                <button onClick={() => setShowFail(false)} style={{ ...BTN_GHOST, fontSize: '11px', padding: '7px 12px' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => onComplete(cmd.id, cmd.title, { completionProof, result })} style={{
                background: '#041208', border: '1px solid #0a3018',
                color: '#10b981', fontSize: '12px', fontWeight: 700,
                padding: '8px 18px', borderRadius: '6px', cursor: 'pointer',
              }}>✓ Mark Complete</button>
              <button onClick={() => setShowFail(true)} style={{
                background: '#140808', border: '1px solid #3a1010', color: '#ef4444',
                fontSize: '11px', padding: '7px 14px', borderRadius: '6px', cursor: 'pointer',
              }}>Mark Failed</button>
            </div>
          )}
        </div>
      )}

      {/* Completed / Failed */}
      {(cmd.status === 'completed' || cmd.status === 'failed') && (
        <div style={{
          marginBottom: '18px',
          background: cmd.status === 'completed' ? '#041208' : '#0f0404',
          border: `1px solid ${cmd.status === 'completed' ? '#10b98120' : '#ef444420'}`,
          borderLeft: `4px solid ${cmd.status === 'completed' ? '#10b981' : '#ef4444'}`,
          borderRadius: '0 10px 10px 0', padding: '18px',
        }}>
          <p style={{ color: cmd.status === 'completed' ? '#10b981' : '#ef4444', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 800, marginBottom: '12px' }}>
            {cmd.status === 'completed' ? '✓ Completed' : '✕ Failed'}
          </p>
          {cmd.completionProof && <p style={{ color: 'var(--text-3)', fontSize: '11px', lineHeight: 1.7, marginBottom: '5px' }}><strong style={{ color: 'var(--text-5)' }}>Proof:</strong> {cmd.completionProof}</p>}
          {cmd.result && <p style={{ color: 'var(--text-3)', fontSize: '11px', lineHeight: 1.7, marginBottom: '5px' }}><strong style={{ color: 'var(--text-5)' }}>Result:</strong> {cmd.result}</p>}
          {cmd.failureReason && <p style={{ color: '#ef444480', fontSize: '11px', lineHeight: 1.7, marginBottom: '5px' }}><strong style={{ color: '#ef4444' }}>Failure:</strong> {cmd.failureReason}</p>}
          {cmd.archivistLogId && <p style={{ color: 'var(--text-6)', fontSize: '9px', marginTop: '8px', letterSpacing: '0.06em' }}>ARCHIVIST logged · {cmd.archivistLogId.slice(0, 10)}…</p>}
          <button onClick={() => onArchive(cmd.id)} style={{ ...BTN_GHOST, marginTop: '14px', fontSize: '11px', padding: '6px 14px' }}>
            Archive
          </button>
        </div>
      )}

      {/* Denied */}
      {cmd.status === 'denied' && (
        <div style={{ marginBottom: '18px' }}>
          {cmd.failureReason && (
            <p style={{ color: '#ef444470', fontSize: '11px', marginBottom: '12px', lineHeight: 1.6 }}>
              Denied: {cmd.failureReason}
            </p>
          )}
          <button onClick={() => onArchive(cmd.id)} style={{ ...BTN_GHOST, fontSize: '11px', padding: '6px 14px' }}>Archive</button>
        </div>
      )}
    </div>
  )
}

// ── EvidenceLedger ────────────────────────────────────────────────────────────

function EvidenceLedger({ commands, isMobile }) {
  const active    = commands.filter(c => ['drafted','analyzing','planned','approved','in_progress'].includes(c.status)).length
  const pending   = commands.filter(c => c.status === 'pending_approval').length
  const completed = commands.filter(c => c.status === 'completed').length
  const failed    = commands.filter(c => c.status === 'failed').length

  const gateTotal    = commands.filter(c => ['approved','denied','in_progress','completed','failed'].includes(c.status)).length
  const gateApproved = commands.filter(c => ['approved','in_progress','completed'].includes(c.status)).length
  const governanceScore   = gateTotal > 0 ? Math.round((gateApproved / gateTotal) * 100) : null
  const execReliability   = (completed + failed) > 0 ? Math.round((completed / (completed + failed)) * 100) : null

  // Aggregate by patternTag
  const patternMap = {}
  commands.forEach(cmd => {
    const tag = cmd.patternTag
    if (!tag) return
    if (!patternMap[tag]) patternMap[tag] = { tag, total: 0, completed: 0, failed: 0, archived: 0, lastTitle: null, lastOutcome: null }
    patternMap[tag].total++
    if (cmd.status === 'completed') {
      patternMap[tag].completed++
      patternMap[tag].lastOutcome = 'Completed'
      patternMap[tag].lastTitle = cmd.title
    } else if (cmd.status === 'failed') {
      patternMap[tag].failed++
      if (!patternMap[tag].lastTitle) { patternMap[tag].lastOutcome = 'Failed'; patternMap[tag].lastTitle = cmd.title }
    } else if (cmd.status === 'archived') {
      patternMap[tag].archived++
    }
  })

  const patterns = Object.values(patternMap).sort((a, b) => b.total - a.total)
  const mostActive     = patterns[0]?.tag || null
  const highestSuccess = [...patterns].filter(p => p.completed > 0)
    .sort((a, b) => (b.completed / b.total) - (a.completed / a.total))[0]?.tag || null
  const highestFailure = [...patterns].filter(p => p.failed > 0)
    .sort((a, b) => b.failed - a.failed)[0]?.tag || null

  const padX = isMobile ? 'px-4' : 'px-8'

  return (
    <div className={`flex-1 overflow-y-auto ${padX} py-6`}>
      <div style={{ maxWidth: '680px' }}>

        {/* Institutional Pulse */}
        <div style={{
          background: 'var(--bg-1)', border: '1px solid var(--border-1)',
          borderRadius: '12px', padding: '20px 24px', marginBottom: '28px',
        }}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '16px' }}>
            Institutional Pulse
          </p>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {[
              { label: 'Active',       value: active,    color: '#3b82f6' },
              { label: 'Pending Gate', value: pending,   color: '#f59e0b' },
              { label: 'Completed',    value: completed, color: '#10b981' },
              { label: 'Failed',       value: failed,    color: '#ef4444' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ textAlign: 'center', flex: 1, minWidth: '60px' }}>
                <p style={{ color, fontSize: '22px', fontWeight: 700, lineHeight: 1, marginBottom: '4px' }}>{value}</p>
                <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-0)', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>Governance Score</p>
              <p style={{ fontSize: '14px', fontWeight: 700, color: governanceScore === null ? 'var(--text-6)' : governanceScore >= 80 ? '#10b981' : '#f59e0b' }}>
                {governanceScore !== null ? `${governanceScore}%` : '—'}
              </p>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>Execution Reliability</p>
              <p style={{ fontSize: '14px', fontWeight: 700, color: execReliability === null ? 'var(--text-6)' : execReliability >= 80 ? '#10b981' : '#f59e0b' }}>
                {execReliability !== null ? `${execReliability}%` : '—'}
              </p>
            </div>
          </div>

          {(mostActive || highestSuccess || highestFailure) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', paddingTop: '12px', borderTop: '1px solid var(--border-0)', marginTop: '12px' }}>
              {mostActive     && <p style={{ color: 'var(--text-5)', fontSize: '10px' }}>Most Active: <span style={{ color: 'var(--text-2)', fontWeight: 600 }}>{mostActive}</span></p>}
              {highestSuccess && <p style={{ color: 'var(--text-5)', fontSize: '10px' }}>Highest Success: <span style={{ color: '#10b981', fontWeight: 600 }}>{highestSuccess}</span></p>}
              {highestFailure && <p style={{ color: 'var(--text-5)', fontSize: '10px' }}>Highest Failure: <span style={{ color: '#ef4444', fontWeight: 600 }}>{highestFailure}</span></p>}
            </div>
          )}
        </div>

        {/* Evidence Ledger */}
        <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px' }}>
          Evidence Ledger
        </p>

        {patterns.length === 0 ? (
          <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border-0)', borderRadius: '8px', padding: '20px' }}>
            <p style={{ color: 'var(--text-4)', fontSize: '12px', lineHeight: 1.7, marginBottom: '8px' }}>
              No pattern evidence yet.
            </p>
            <p style={{ color: 'var(--text-6)', fontSize: '11px', lineHeight: 1.6 }}>
              When you create commands and tag them with a Constellation Pattern, the ledger builds a record:
              how many times a pattern generated a command, how many succeeded, which failed, and what the most recent outcome was.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {patterns.map(p => {
              const successRate = p.total > 0 ? Math.round((p.completed / p.total) * 100) : null
              const srColor = successRate === null ? 'var(--text-6)'
                : successRate >= 80 ? '#10b981'
                : successRate >= 50 ? '#f59e0b'
                : '#ef4444'
              return (
                <div key={p.tag} style={{
                  background: 'var(--bg-2)', border: '1px solid var(--border-1)',
                  borderLeft: '4px solid #6366f1', borderRadius: '0 10px 10px 0',
                  padding: '16px 20px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <p style={{ color: 'var(--text-0)', fontSize: '13px', fontWeight: 700 }}>{p.tag}</p>
                    {successRate !== null && (
                      <span style={{
                        background: srColor + '18', border: `1px solid ${srColor}30`,
                        color: srColor, fontSize: '10px', fontWeight: 700,
                        borderRadius: '5px', padding: '3px 10px', flexShrink: 0,
                      }}>{successRate}% success</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: p.lastTitle ? '8px' : 0 }}>
                    <span style={{ color: 'var(--text-5)', fontSize: '10px' }}>{p.total} command{p.total !== 1 ? 's' : ''}</span>
                    {p.completed > 0 && <span style={{ color: '#10b981', fontSize: '10px' }}>✓ {p.completed} completed</span>}
                    {p.failed    > 0 && <span style={{ color: '#ef4444', fontSize: '10px' }}>✕ {p.failed} failed</span>}
                    {p.archived  > 0 && <span style={{ color: 'var(--text-6)', fontSize: '10px' }}>{p.archived} archived</span>}
                  </div>
                  {p.lastTitle && (
                    <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.04em' }}>
                      Most Recent: <span style={{ color: 'var(--text-4)' }}>{p.lastTitle}</span> — {p.lastOutcome}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}

// ── CommandsWorkbench ──────────────────────────────────────────────────────────

function CommandsWorkbench({
  commands, isMobile,
  onCreateCommand, onSubmitForGate, onApproveCommand, onDenyCommand,
  onCompleteCommand, onFailCommand, onArchiveCommand, onUpdateCommand,
}) {
  const [cmdView,     setCmdView]     = useState('list')
  const [listFilter,  setListFilter]  = useState('active')
  const [selectedCmd, setSelectedCmd] = useState(null)
  const [seedForm,    setSeedForm]    = useState(null)

  const padX = isMobile ? 'px-4' : 'px-8'

  function openDetail(cmd) { setSelectedCmd(cmd); setCmdView('detail') }
  function openNew(seed = null) { setSeedForm(seed); setCmdView('new') }
  function backToList() { setSelectedCmd(null); setSeedForm(null); setCmdView('list') }

  async function handleCreate(data) {
    await onCreateCommand(data)
    backToList()
  }

  const GROUPS = {
    active:    c => ['drafted', 'analyzing', 'planned', 'approved', 'in_progress'].includes(c.status),
    pending:   c => c.status === 'pending_approval',
    completed: c => ['completed', 'failed'].includes(c.status),
    archive:   c => ['archived', 'denied'].includes(c.status),
  }

  const counts = Object.fromEntries(Object.entries(GROUPS).map(([k, fn]) => [k, commands.filter(fn).length]))
  const filtered = commands.filter(GROUPS[listFilter] || (() => true))

  const FILTER_TABS = [
    { id: 'active',    label: `Active (${counts.active})` },
    { id: 'pending',   label: `Gate (${counts.pending})` },
    { id: 'completed', label: `Completed (${counts.completed})` },
    { id: 'archive',   label: `Archive (${counts.archive})` },
  ]

  // New command form
  if (cmdView === 'new') {
    return (
      <div className={`flex-1 overflow-y-auto ${padX} py-5`}>
        <div style={{ maxWidth: '600px' }}>
          <button onClick={backToList} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 16px', color: 'var(--text-5)', fontSize: '11px' }}>
            ← Commands
          </button>
          <p style={{ color: 'var(--text-0)', fontSize: '15px', fontWeight: 700, marginBottom: '18px' }}>New Command</p>
          <NewCommandForm onSubmit={handleCreate} onCancel={backToList} seedData={seedForm} />
        </div>
      </div>
    )
  }

  // Command detail
  if (cmdView === 'detail' && selectedCmd) {
    const live = commands.find(c => c.id === selectedCmd.id) || selectedCmd
    return (
      <div className={`flex-1 overflow-y-auto ${padX} py-5`}>
        <div style={{ maxWidth: '680px' }}>
          <CommandDetail
            cmd={live}
            onBack={backToList}
            onSubmitForGate={onSubmitForGate}
            onApprove={onApproveCommand}
            onDeny={onDenyCommand}
            onComplete={onCompleteCommand}
            onFail={onFailCommand}
            onArchive={onArchiveCommand}
            onUpdate={onUpdateCommand}
          />
        </div>
      </div>
    )
  }

  // List view
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Filter bar */}
      <div style={{
        borderBottom: '1px solid var(--border-0)',
        display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', alignItems: 'center',
      }}>
        {FILTER_TABS.map(ft => {
          const active = listFilter === ft.id
          const hasPending = ft.id === 'pending' && counts.pending > 0
          return (
            <button key={ft.id} onClick={() => setListFilter(ft.id)} style={{
              padding: '7px 14px', background: 'none', border: 'none',
              borderBottom: `2px solid ${active ? 'var(--text-2)' : 'transparent'}`,
              color: hasPending ? '#f59e0b' : active ? 'var(--text-1)' : 'var(--text-5)',
              fontSize: '10px', fontWeight: active ? 600 : 400,
              cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
              marginBottom: '-1px', letterSpacing: '0.02em',
            }}>{ft.label}</button>
          )
        })}
        <div style={{ flex: 1 }} />
        <button onClick={() => openNew()} style={{
          margin: '4px 10px', background: '#1d3a6e', border: '1px solid #3b82f640',
          color: '#93c5fd', fontSize: '10px', fontWeight: 700,
          padding: '4px 12px', borderRadius: '5px', cursor: 'pointer', whiteSpace: 'nowrap',
        }}>+ Command</button>
      </div>

      {/* List */}
      <div className={`flex-1 overflow-y-auto ${padX} py-4`}>
        {filtered.length === 0 ? (
          commands.length === 0 ? (
            <div style={{ maxWidth: '540px', paddingTop: '8px' }}>
              <p style={{ color: 'var(--text-3)', fontSize: '13px', lineHeight: 1.7, marginBottom: '20px' }}>
                The workbench is ready. No commands yet.
              </p>
              <div style={{
                background: '#020b18', border: '1px solid #1d4ed820',
                borderLeft: '4px solid #3b82f6',
                borderRadius: '0 10px 10px 0', padding: '20px',
              }}>
                <p style={{ color: '#3b82f6', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px' }}>
                  Suggested First Command
                </p>
                <p style={{ color: 'var(--text-1)', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
                  FleetFlow Architecture Audit
                </p>
                <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.65, marginBottom: '16px' }}>
                  Audit the FleetFlow monolithic source and produce a modular refactor plan.
                  The institution's first formal command — the proof that the pipeline works.
                </p>
                <button onClick={() => openNew(FLEETFLOW_SEED)} style={{ ...BTN_PRIMARY, fontSize: '11px', padding: '7px 16px' }}>
                  Pre-fill this command →
                </button>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-5)', fontSize: '12px', paddingTop: '10px' }}>
              No commands in this category.
            </p>
          )
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxWidth: '680px' }}>
            {filtered.map(cmd => {
              const sm   = STATUS_META[cmd.status] || { label: cmd.status, color: '#6b7280' }
              const pc   = PRIORITY_COLORS[cmd.priority] || '#6b7280'
              const rc   = RISK_COLORS[cmd.riskLevel]    || '#6b7280'
              const done = (cmd.steps || []).filter(s => s.status === 'completed').length
              const tot  = (cmd.steps || []).length
              return (
                <button key={cmd.id} onClick={() => openDetail(cmd)} style={{
                  width: '100%', textAlign: 'left',
                  background: 'var(--bg-2)', border: '1px solid var(--border-1)',
                  borderLeft: `3px solid ${sm.color}`,
                  borderRadius: '0 8px 8px 0', padding: '14px 16px', cursor: 'pointer',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '6px' }}>
                    <p style={{ color: 'var(--text-1)', fontSize: '13px', fontWeight: 600, flex: 1, lineHeight: 1.3 }}>
                      {cmd.title}
                    </p>
                    <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                      <span style={{ background: pc + '15', color: pc, border: `1px solid ${pc}25`, fontSize: '8px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: '3px', padding: '2px 6px' }}>
                        {cmd.priority || 'std'}
                      </span>
                      <span style={{ background: sm.color + '15', color: sm.color, border: `1px solid ${sm.color}25`, fontSize: '8px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: '3px', padding: '2px 6px' }}>
                        {sm.label}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--text-6)', fontSize: '10px' }}>{cmd.targetSystem}</span>
                    {cmd.assignedAgent && <span style={{ color: 'var(--text-6)', fontSize: '10px' }}>· {cmd.assignedAgent.toUpperCase()}</span>}
                    {tot > 0 && <span style={{ color: 'var(--text-6)', fontSize: '10px' }}>· {done}/{tot} steps</span>}
                    {cmd.riskLevel && cmd.riskLevel !== 'none' && (
                      <span style={{ color: rc, fontSize: '9px', fontWeight: 600 }}>· {cmd.riskLevel} risk</span>
                    )}
                    {cmd.createdAt && (
                      <span style={{ color: 'var(--text-6)', fontSize: '10px', marginLeft: 'auto' }}>
                        {timeAgo(cmd.createdAt)}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── KELRoom ───────────────────────────────────────────────────────────────────

export default function KELRoom({
  observations = [], apiKey, onConnectClaude, onDecision,
  kelReviews = [], onApproveReview, onDenyReview, isMobile, voiceMode,
  threads = [],
  commands = [], onCreateCommand, onSubmitForGate, onApproveCommand, onDenyCommand,
  onCompleteCommand, onFailCommand, onArchiveCommand, onUpdateCommand,
}) {
  const [kelTab,         setKelTab]         = useState('commands')
  const [rec,            setRec]            = useState(null)
  const [reading,        setReading]        = useState(false)
  const [kelError,       setKelError]       = useState(null)
  const [decided,        setDecided]        = useState(null)
  const [denyingId,      setDenyingId]      = useState(null)
  const [denyRationale,  setDenyRationale]  = useState('')
  const [kelSpeaking,    setKelSpeaking]    = useState(false)
  const [obsIdsAtRequest, setObsIdsAtRequest] = useState([])

  const pendingReviews  = kelReviews.filter(r => r.status === 'pending')
  const commandsPending = commands.filter(c => c.status === 'pending_approval').length

  const kelTabs = [
    { id: 'commands',  label: `⚡ Commands${commandsPending > 0 ? ` · ${commandsPending}` : ''}` },
    { id: 'evidence',  label: '⬡ Evidence' },
    { id: 'recommend', label: '◎ Recommend' },
    { id: 'reviews',   label: `📋 Reviews${pendingReviews.length > 0 ? ` · ${pendingReviews.length}` : ''}` },
  ]

  const validObs = observations.filter(o => o.text && typeof o.text === 'string')
  const canRead  = !!apiKey && validObs.length >= 2

  async function handleRequest() {
    if (!canRead || reading) return
    setReading(true)
    setKelError(null)
    setRec(null)
    setDecided(null)
    setObsIdsAtRequest(validObs.map(o => o.id).filter(Boolean))
    try {
      const result = await requestKELRecommendation(validObs, apiKey, { threads, commands })
      setRec(result)
    } catch (e) {
      console.error('[KEL]', e)
      setKelError(e.message)
    } finally {
      setReading(false)
    }
  }

  function handleDecision(decision) {
    if (!rec || decided) return
    setDecided(decision)
    onDecision({ ...rec, decision, observationIds: obsIdsAtRequest })
  }

  const confidence = rec ? Math.round((rec.confidence ?? 0) * 100) : 0
  const color      = rec ? domainColor(rec.domain) : '#4b5563'
  const padX       = isMobile ? 'px-6' : 'px-8'

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-0)' }}>

      {/* Header */}
      <div className="shrink-0 px-8 pt-6 pb-4" style={{ borderBottom: '1px solid var(--border-0)' }}>
        <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
          Knowledge Execution Layer
        </p>
        <h2 style={{ fontSize: '18px', color: 'var(--text-0)', fontWeight: 700,
          letterSpacing: '0.08em', marginBottom: '4px' }}>K.E.L.</h2>
        <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic' }}>
          What is moving right now?
        </p>
      </div>

      <RoomSubNav tabs={kelTabs} activeTab={kelTab} onSelect={setKelTab} />

      {/* ── Commands tab ── */}
      {kelTab === 'commands' && (
        <CommandsWorkbench
          commands={commands}
          isMobile={isMobile}
          onCreateCommand={onCreateCommand}
          onSubmitForGate={onSubmitForGate}
          onApproveCommand={onApproveCommand}
          onDenyCommand={onDenyCommand}
          onCompleteCommand={onCompleteCommand}
          onFailCommand={onFailCommand}
          onArchiveCommand={onArchiveCommand}
          onUpdateCommand={onUpdateCommand}
        />
      )}

      {/* ── Evidence tab ── */}
      {kelTab === 'evidence' && (
        <EvidenceLedger commands={commands} isMobile={isMobile} />
      )}

      {/* ── Recommend tab ── */}
      {kelTab === 'recommend' && (
        <div className={`flex-1 overflow-y-auto ${padX} py-8`}>

          {!apiKey && (
            <div style={{ maxWidth: '440px' }}>
              <p style={{ color: 'var(--text-3)', fontSize: '13px', lineHeight: 1.7, marginBottom: '16px' }}>
                K.E.L. requires a Claude key to produce recommendations.
              </p>
              <button onClick={onConnectClaude} style={{
                background: 'none', border: '1px solid var(--border-1)',
                color: '#60a5fa', fontSize: '12px', cursor: 'pointer',
                padding: '8px 16px', borderRadius: '6px',
              }}>✦ Connect Claude</button>
            </div>
          )}

          {apiKey && validObs.length < 2 && (
            <p style={{ color: 'var(--text-4)', fontSize: '13px', lineHeight: 1.7, maxWidth: '440px' }}>
              K.E.L. needs at least 2 observations to recommend. Add more in Atrium.
            </p>
          )}

          {canRead && !rec && !reading && !kelError && (
            <div style={{ maxWidth: '520px' }}>
              <p style={{ color: 'var(--text-3)', fontSize: '13px', lineHeight: 1.7, marginBottom: '8px' }}>
                {validObs.length} observation{validObs.length !== 1 ? 's' : ''} in memory.
              </p>
              <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.7, marginBottom: '24px' }}>
                K.E.L. will read the observations and return one recommendation with reasoning.
                The decision belongs to you — K.E.L. records nothing.
              </p>
              <button onClick={handleRequest} style={{ ...BTN_PRIMARY, fontSize: '13px', padding: '10px 20px' }}>
                Request Recommendation
              </button>
            </div>
          )}

          {reading && (
            <div className="flex items-center gap-3" style={{ paddingTop: '8px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1d4ed8', animation: 'pulse-fade 1.5s infinite' }} />
              <p style={{ color: 'var(--text-3)', fontSize: '13px', fontStyle: 'italic' }}>K.E.L. is reading…</p>
            </div>
          )}

          {kelError && (
            <div style={{ maxWidth: '520px' }}>
              <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: '16px' }}>K.E.L. unavailable: {kelError}</p>
              <button onClick={handleRequest} style={{ ...BTN_GHOST, fontSize: '12px' }}>Try again</button>
            </div>
          )}

          {rec && (
            <div style={{ maxWidth: '560px' }}>
              <div className="flex items-center gap-3 mb-6">
                <span style={{ fontSize: '10px', padding: '3px 10px', borderRadius: '999px', background: `${color}18`, color, border: `1px solid ${color}35`, letterSpacing: '0.06em' }}>
                  {rec.domain}
                </span>
                <span style={{ color: 'var(--text-5)', fontSize: '10px' }}>{confidence}% confidence</span>
              </div>
              <div style={{ height: '2px', background: 'var(--border-1)', borderRadius: '2px', marginBottom: '24px' }}>
                <div style={{ height: '100%', borderRadius: '2px', width: `${confidence}%`, background: color }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>K.E.L. recommends</p>
                <p style={{ color: 'var(--text-0)', fontSize: '16px', lineHeight: 1.6, fontWeight: 500, letterSpacing: '-0.01em' }}>
                  {rec.recommendation}
                </p>
                {voiceMode && (
                  <button disabled={kelSpeaking} onClick={() => speakWithVoice(rec.recommendation, getVoiceConfig('kel'), {
                    onStart: () => setKelSpeaking(true),
                    onEnd:   () => setKelSpeaking(false),
                    onError: () => setKelSpeaking(false),
                  })} style={{ marginTop: '10px', background: 'none', border: '1px solid var(--border-1)', color: kelSpeaking ? 'var(--text-5)' : 'var(--text-3)', fontSize: '11px', padding: '5px 12px', borderRadius: '6px', cursor: kelSpeaking ? 'default' : 'pointer', fontFamily: 'inherit' }}>
                    {kelSpeaking ? '🔊 Speaking…' : '▶ Read'}
                  </button>
                )}
              </div>
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>Because</p>
                <p style={{ color: 'var(--text-2)', fontSize: '13px', lineHeight: 1.7 }}>{rec.reasoning}</p>
              </div>
              {rec.cited?.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
                  <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>Observed</p>
                  <div className="flex flex-col gap-2">
                    {rec.cited.map((c, i) => (
                      <p key={i} style={{ color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.55, paddingLeft: '10px', borderLeft: `2px solid ${color}40` }}>"{c}"</p>
                    ))}
                  </div>
                </div>
              )}
              {!decided ? (
                <div>
                  <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>Your decision</p>
                  <div className="flex gap-3 flex-wrap">
                    {[
                      { id: 'approved', label: 'Approve',  bg: '#041208', border: '#0a3018', color: '#1a7a40' },
                      { id: 'rejected', label: 'Reject',   bg: '#140808', border: '#3a1010', color: '#7a2020' },
                      { id: 'deferred', label: 'Defer',    bg: 'var(--bg-2)', border: 'var(--border-1)', color: 'var(--text-3)' },
                    ].map(opt => (
                      <button key={opt.id} onClick={() => handleDecision(opt.id)}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium"
                        style={{ background: opt.bg, border: `1px solid ${opt.border}`, color: opt.color, cursor: 'pointer' }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <p style={{ color: 'var(--text-6)', fontSize: '10px', marginTop: '10px' }}>
                    Your decision is recorded by ARCHIVIST. K.E.L. does not record outcomes.
                  </p>
                </div>
              ) : (
                <div style={{ padding: '14px 18px', borderRadius: '8px', background: 'var(--bg-2)', border: '1px solid var(--border-1)' }}>
                  <p style={{ color: 'var(--text-2)', fontSize: '12px', marginBottom: '6px' }}>
                    Decision recorded:{' '}
                    <span style={{ fontWeight: 600, color: decided === 'approved' ? '#1a7a40' : decided === 'rejected' ? '#7a2020' : 'var(--text-2)' }}>
                      {decided}
                    </span>
                  </p>
                  <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.6 }}>
                    ARCHIVIST holds the verdict. VERA will read it next time.
                  </p>
                  <button onClick={handleRequest} style={{ marginTop: '12px', background: 'none', border: 'none', color: 'var(--text-4)', fontSize: '11px', cursor: 'pointer', padding: 0 }}>
                    Request another recommendation →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Reviews tab ── */}
      {kelTab === 'reviews' && (
        <div className={`flex-1 overflow-y-auto ${padX} py-8`}>
          {pendingReviews.length === 0 ? (
            <p style={{ color: 'var(--text-5)', fontSize: '12px', lineHeight: 1.7 }}>No pending reviews.</p>
          ) : (
            <div style={{ maxWidth: '560px' }}>
              <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>
                Pending Reviews
              </p>
              <div className="flex flex-col gap-3">
                {pendingReviews.map(review => (
                  <div key={review.id} style={{ background: 'var(--bg-2)', border: '1px solid var(--border-1)', borderLeft: '3px solid #3b82f6', borderRadius: '0 8px 8px 0', padding: '14px 18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <p style={{ color: 'var(--text-2)', fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>
                          {REQUEST_LABELS[review.requestType] ?? review.requestType}
                        </p>
                        <p style={{ color: 'var(--text-6)', fontSize: '10px' }}>{timeAgo(review.createdAt)}</p>
                      </div>
                      <span style={{ background: '#3b82f615', border: '1px solid #3b82f640', borderRadius: '4px', padding: '2px 8px', color: '#3b82f6', fontSize: '9px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Pending</span>
                    </div>
                    {denyingId === review.id ? (
                      <div>
                        <p style={{ color: 'var(--text-4)', fontSize: '11px', marginBottom: '8px' }}>Rationale required before denial is recorded.</p>
                        <textarea value={denyRationale} onChange={e => setDenyRationale(e.target.value)}
                          placeholder="Why is this request denied?"
                          rows={3} style={{ ...INPUT_S, resize: 'vertical', marginBottom: '10px' }} />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button disabled={!denyRationale.trim()}
                            onClick={() => { onDenyReview(review.id, denyRationale.trim()); setDenyingId(null); setDenyRationale('') }}
                            style={{ background: '#140808', border: '1px solid #3a1010', color: denyRationale.trim() ? '#7a2020' : 'var(--text-6)', fontSize: '11px', fontWeight: 600, padding: '6px 14px', borderRadius: '6px', cursor: denyRationale.trim() ? 'pointer' : 'default' }}>
                            Confirm Denial
                          </button>
                          <button onClick={() => { setDenyingId(null); setDenyRationale('') }}
                            style={{ ...BTN_GHOST, fontSize: '11px', padding: '6px 12px' }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => onApproveReview(review.id)}
                          style={{ background: '#041208', border: '1px solid #0a3018', color: '#1a7a40', fontSize: '11px', fontWeight: 600, padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' }}>
                          Approve
                        </button>
                        <button onClick={() => { setDenyingId(review.id); setDenyRationale('') }}
                          style={{ background: '#140808', border: '1px solid #3a1010', color: '#7a2020', fontSize: '11px', fontWeight: 600, padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' }}>
                          Deny
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
