import { useState } from 'react'

const STATUS_META = {
  pending_approval: { label: 'Pending Approval', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  approved:         { label: 'Approved',         color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  in_progress:      { label: 'In Progress',      color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  completed:        { label: 'Completed',         color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  archived:         { label: 'Archived',          color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
}

const RISK_META = {
  low:    { label: 'Low Risk',    color: '#10b981' },
  medium: { label: 'Medium Risk', color: '#f59e0b' },
  high:   { label: 'High Risk',   color: '#ef4444' },
}

const PRIORITY_META = {
  low:      { label: 'Low',      color: '#6b7280' },
  medium:   { label: 'Medium',   color: '#3b82f6' },
  high:     { label: 'High',     color: '#f59e0b' },
  critical: { label: 'Critical', color: '#ef4444' },
}

const PHASE_STATUS_META = {
  pending:     { label: 'Pending',     color: '#6b7280' },
  in_progress: { label: 'In Progress', color: '#8b5cf6' },
  completed:   { label: 'Done',        color: '#10b981' },
}

const STATUS_TRANSITIONS = {
  pending_approval: ['approved'],
  approved:         ['in_progress'],
  in_progress:      ['completed'],
  completed:        ['archived'],
  archived:         [],
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.pending_approval
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: '3px',
      fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase', color: m.color, background: m.bg,
      border: `1px solid ${m.color}33`,
    }}>
      {m.label}
    </span>
  )
}

function RiskBadge({ risk }) {
  const m = RISK_META[risk] || RISK_META.medium
  return (
    <span style={{ fontSize: '11px', color: m.color, fontWeight: 600 }}>
      ▲ {m.label}
    </span>
  )
}

function PhaseDot({ status }) {
  const m = PHASE_STATUS_META[status] || PHASE_STATUS_META.pending
  return (
    <span style={{
      display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
      background: m.color, flexShrink: 0,
    }} />
  )
}

function timeAgo(date) {
  if (!date) return ''
  const mins = Math.floor((Date.now() - date.getTime()) / 60000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function CommandCard({ command, isActive, onClick }) {
  const m = STATUS_META[command.status] || STATUS_META.pending_approval
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', background: isActive ? 'var(--bg-2)' : 'none',
        border: 'none', borderBottom: '1px solid var(--border-0)',
        padding: '14px 16px', cursor: 'pointer',
        borderLeft: `3px solid ${isActive ? m.color : 'transparent'}`,
        transition: 'all 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        {command.commandNumber && (
          <span style={{ fontSize: '9px', color: 'var(--text-5)', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {command.commandNumber}
          </span>
        )}
        <StatusBadge status={command.status} />
      </div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-0)', marginBottom: '4px',
        lineHeight: 1.3 }}>
        {command.title}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {command.targetSystem && (
          <span style={{ fontSize: '10px', color: 'var(--text-4)' }}>
            ⟶ {command.targetSystem}
          </span>
        )}
        <span style={{ fontSize: '10px', color: 'var(--text-5)' }}>
          {timeAgo(command.createdAt)}
        </span>
      </div>
    </button>
  )
}

function PACERBlock({ label, value }) {
  if (!value) return null
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em',
        textTransform: 'uppercase', color: 'var(--text-5)', marginBottom: '6px' }}>
        {label}
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text-1)', lineHeight: 1.6,
        padding: '10px 12px', background: 'var(--bg-1)', borderRadius: '4px',
        border: '1px solid var(--border-0)' }}>
        {value}
      </div>
    </div>
  )
}

function PhaseTracker({ phases }) {
  if (!phases?.length) return null
  const completed = phases.filter(p => p.status === 'completed').length
  const pct = Math.round((completed / phases.length) * 100)

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '8px' }}>
        <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'var(--text-5)' }}>
          Execution Phases
        </div>
        <span style={{ fontSize: '10px', color: 'var(--text-4)' }}>
          {completed}/{phases.length} complete
        </span>
      </div>

      <div style={{ height: '3px', background: 'var(--bg-2)', borderRadius: '2px', marginBottom: '12px' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: '#10b981',
          borderRadius: '2px', transition: 'width 0.3s' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {phases.map((phase, i) => {
          const m = PHASE_STATUS_META[phase.status] || PHASE_STATUS_META.pending
          return (
            <div key={i} style={{ padding: '10px 12px', background: 'var(--bg-1)',
              border: '1px solid var(--border-0)', borderRadius: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <PhaseDot status={phase.status} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-0)' }}>
                  Phase {phase.number} — {phase.name}
                </span>
                <span style={{ fontSize: '10px', color: m.color, marginLeft: 'auto' }}>
                  {m.label}
                </span>
              </div>
              {phase.tasks?.length > 0 && (
                <ul style={{ margin: '4px 0 0 16px', padding: 0, listStyle: 'disc' }}>
                  {phase.tasks.map((task, j) => (
                    <li key={j} style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '2px' }}>
                      {task}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ArtifactList({ artifacts }) {
  const [open, setOpen] = useState(null)
  if (!artifacts?.length) return null
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em',
        textTransform: 'uppercase', color: 'var(--text-5)', marginBottom: '8px' }}>
        Artifacts ({artifacts.length})
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {artifacts.map((art, i) => (
          <div key={i} style={{ border: '1px solid var(--border-0)', borderRadius: '4px',
            overflow: 'hidden' }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{ width: '100%', textAlign: 'left', background: 'var(--bg-1)',
                border: 'none', padding: '8px 12px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-5)' }}>
                {open === i ? '▼' : '▶'}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-1)' }}>
                {art.title}
              </span>
              {art.type && (
                <span style={{ fontSize: '9px', color: 'var(--text-5)', marginLeft: 'auto',
                  textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {art.type.replace(/_/g, ' ')}
                </span>
              )}
            </button>
            {open === i && art.body && (
              <div style={{ padding: '10px 12px', background: 'var(--bg-0)',
                borderTop: '1px solid var(--border-0)', fontSize: '12px',
                color: 'var(--text-2)', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                maxHeight: '300px', overflowY: 'auto' }}>
                {art.body}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function RiskList({ risks }) {
  if (!risks?.length) return null
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em',
        textTransform: 'uppercase', color: 'var(--text-5)', marginBottom: '8px' }}>
        Risk Register ({risks.length})
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {risks.map((r, i) => {
          const m = RISK_META[r.severity] || RISK_META.medium
          return (
            <div key={i} style={{ display: 'flex', gap: '10px', padding: '8px 12px',
              background: 'var(--bg-1)', border: '1px solid var(--border-0)',
              borderRadius: '4px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', color: m.color, fontWeight: 700,
                flexShrink: 0, paddingTop: '1px' }}>
                {r.severity?.toUpperCase()}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.5 }}>
                {r.description}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ParityChecklist({ items, commandId, onToggle }) {
  if (!items?.length) return null
  const verified = items.filter(i => i.verified).length
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '8px' }}>
        <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'var(--text-5)' }}>
          Parity Checklist
        </div>
        <span style={{ fontSize: '10px', color: verified === items.length ? '#10b981' : 'var(--text-4)' }}>
          {verified}/{items.length} verified
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {items.map((item, i) => (
          <label key={item.id || i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px',
            padding: '6px 10px', background: 'var(--bg-1)', border: '1px solid var(--border-0)',
            borderRadius: '4px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={item.verified || false}
              onChange={() => onToggle && onToggle(i)}
              style={{ marginTop: '2px', flexShrink: 0 }}
            />
            <span style={{ fontSize: '12px', color: item.verified ? 'var(--text-3)' : 'var(--text-1)',
              lineHeight: 1.4,
              textDecoration: item.verified ? 'line-through' : 'none' }}>
              {item.item}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

function CommandDetail({ command, onStatusChange, onParityToggle }) {
  const p = PRIORITY_META[command.priority] || PRIORITY_META.medium
  const nextStatuses = STATUS_TRANSITIONS[command.status] || []

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px',
          flexWrap: 'wrap' }}>
          {command.commandNumber && (
            <span style={{ fontSize: '11px', color: 'var(--text-5)', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {command.commandNumber}
            </span>
          )}
          <StatusBadge status={command.status} />
          <RiskBadge risk={command.risk} />
          <span style={{ fontSize: '11px', color: p.color, fontWeight: 600 }}>
            ◆ {p.label} Priority
          </span>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-0)',
          margin: '0 0 6px', lineHeight: 1.3 }}>
          {command.title}
        </h2>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {command.targetSystem && (
            <span style={{ fontSize: '11px', color: 'var(--text-4)' }}>
              Target: <strong style={{ color: 'var(--text-2)' }}>{command.targetSystem}</strong>
            </span>
          )}
          <span style={{ fontSize: '11px', color: 'var(--text-4)' }}>
            Agent: <strong style={{ color: 'var(--text-2)' }}>{command.executionAgent || 'K.E.L.'}</strong>
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-5)' }}>
            Created {timeAgo(command.createdAt)}
          </span>
        </div>
      </div>

      <div style={{ height: '1px', background: 'var(--border-0)', marginBottom: '20px' }} />

      {/* Human Gate */}
      {nextStatuses.length > 0 && (
        <div style={{ marginBottom: '20px', padding: '14px 16px',
          background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: '6px' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#3b82f6', marginBottom: '10px' }}>
            Human Gate
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {nextStatuses.map(s => {
              const m = STATUS_META[s] || {}
              return (
                <button
                  key={s}
                  onClick={() => onStatusChange(command, s)}
                  style={{
                    padding: '6px 14px', borderRadius: '4px', border: `1px solid ${m.color}`,
                    background: m.bg, color: m.color, fontSize: '11px', fontWeight: 700,
                    letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
                    transition: 'opacity 0.15s',
                  }}
                >
                  → {m.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* PACER Language */}
      <PACERBlock label="State"             value={command.state} />
      <PACERBlock label="Constraint"        value={command.constraint} />
      <PACERBlock label="Next Action"       value={command.nextAction} />
      <PACERBlock label="Success Condition" value={command.successCondition} />

      {/* Proof Required */}
      {command.proofRequired && (
        <div style={{ marginBottom: '20px', padding: '10px 14px',
          background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: '4px' }}>
          <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#10b981' }}>
            Proof Required
          </span>
          <div style={{ fontSize: '12px', color: 'var(--text-2)', marginTop: '4px' }}>
            {command.proofRequired}
          </div>
        </div>
      )}

      <div style={{ height: '1px', background: 'var(--border-0)', marginBottom: '20px' }} />

      <PhaseTracker phases={command.phases} />
      <ParityChecklist
        items={command.parityChecklist}
        commandId={command.id}
        onToggle={idx => onParityToggle(command, idx)}
      />
      <ArtifactList artifacts={command.artifacts} />
      <RiskList risks={command.risks} />

      {/* Timestamps */}
      <div style={{ fontSize: '10px', color: 'var(--text-5)', lineHeight: 1.8,
        borderTop: '1px solid var(--border-0)', paddingTop: '16px', marginTop: '8px' }}>
        {command.approvedAt  && <div>Approved:  {command.approvedAt.toLocaleString()}</div>}
        {command.startedAt   && <div>Started:   {command.startedAt.toLocaleString()}</div>}
        {command.completedAt && <div>Completed: {command.completedAt.toLocaleString()}</div>}
      </div>
    </div>
  )
}

export default function CommandWorkbench({ commands = [], onStatusChange, onParityToggle, isMobile }) {
  const [selectedId, setSelectedId] = useState(null)

  const selected = commands.find(c => c.id === selectedId) || commands[0] || null

  const byStatus = {
    pending_approval: commands.filter(c => c.status === 'pending_approval'),
    approved:         commands.filter(c => c.status === 'approved'),
    in_progress:      commands.filter(c => c.status === 'in_progress'),
    completed:        commands.filter(c => c.status === 'completed'),
    archived:         commands.filter(c => c.status === 'archived'),
  }

  const activeGroups = ['pending_approval', 'approved', 'in_progress', 'completed', 'archived']
    .filter(s => byStatus[s].length > 0)

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', background: 'var(--bg-0)' }}>

      {/* Left — Command List */}
      {(!isMobile || !selected) && (
        <div style={{
          width: isMobile ? '100%' : '280px', flexShrink: 0,
          borderRight: '1px solid var(--border-0)', overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{ padding: '20px 16px 14px', borderBottom: '1px solid var(--border-0)',
            flexShrink: 0 }}>
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontWeight: 600, margin: '0 0 4px' }}>
              K.E.L. Workbench
            </p>
            <h2 style={{ fontSize: '16px', color: 'var(--text-0)', fontWeight: 700, margin: 0 }}>
              Commands
            </h2>
            <p style={{ fontSize: '11px', color: 'var(--text-4)', margin: '4px 0 0' }}>
              {commands.length} command{commands.length !== 1 ? 's' : ''} on record
            </p>
          </div>

          {/* Command list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {commands.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-5)',
                fontSize: '12px' }}>
                No commands recorded yet.
              </div>
            ) : (
              activeGroups.map(statusKey => (
                <div key={statusKey}>
                  <div style={{ padding: '8px 16px 4px', fontSize: '9px', fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: STATUS_META[statusKey]?.color || 'var(--text-5)',
                    background: 'var(--bg-1)', borderBottom: '1px solid var(--border-0)' }}>
                    {STATUS_META[statusKey]?.label}
                  </div>
                  {byStatus[statusKey].map(cmd => (
                    <CommandCard
                      key={cmd.id}
                      command={cmd}
                      isActive={selected?.id === cmd.id}
                      onClick={() => setSelectedId(cmd.id)}
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Right — Command Detail */}
      {(!isMobile || selected) && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selected ? (
            <>
              {isMobile && (
                <button onClick={() => setSelectedId(null)}
                  style={{ padding: '10px 16px', background: 'var(--bg-1)',
                    border: 'none', borderBottom: '1px solid var(--border-0)',
                    textAlign: 'left', cursor: 'pointer', fontSize: '12px',
                    color: 'var(--text-3)' }}>
                  ← Back to Commands
                </button>
              )}
              <CommandDetail
                command={selected}
                onStatusChange={onStatusChange}
                onParityToggle={onParityToggle}
              />
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-5)', fontSize: '13px' }}>
              Select a command to view details
            </div>
          )}
        </div>
      )}
    </div>
  )
}
