import { PIPELINE_STAGES, PIPELINE_STAGE_META, STATE_META } from '../lib/pipelineStage'

// Reusable cross-room status pill. Given a { stage, state, nextAction } reading
// (see src/lib/pipelineStage.js), shows where an artifact sits in the
// Observation → Approved → Packaged → Production → Published → Archived pipeline,
// whether it's blocked / active / completed / archived, and the next available action.

export function PipelinePill({ stage, state, nextAction, tone }) {
  const stageMeta = PIPELINE_STAGE_META[stage] || PIPELINE_STAGE_META.observation
  const stateMeta = STATE_META[state] || STATE_META.active
  const color = tone || stateMeta.color

  return (
    <span
      title={nextAction ? `Next: ${nextAction}` : undefined}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        background: color + '15', border: `1px solid ${color}30`,
        borderRadius: '4px', padding: '2px 8px', flexShrink: 0,
      }}
    >
      <span style={{
        width: '5px', height: '5px', borderRadius: '50%', background: color, flexShrink: 0,
      }} />
      <span style={{ color, fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {stageMeta.label}
      </span>
      <span style={{ color, fontSize: '9px', opacity: 0.7 }}>· {stateMeta.label}</span>
    </span>
  )
}

export function PipelineStepper({ stage, state, nextAction, tone }) {
  const idx = PIPELINE_STAGES.indexOf(stage)
  const stateMeta = STATE_META[state] || STATE_META.active
  const color = tone || stateMeta.color

  return (
    <div>
      <div className="flex items-center gap-0" style={{ overflowX: 'auto' }}>
        {PIPELINE_STAGES.map((id, i) => {
          const meta = PIPELINE_STAGE_META[id]
          const past = i < idx
          const current = i === idx
          return (
            <div key={id} className="flex items-center">
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: current ? color : past ? 'var(--border-2)' : 'var(--border-0)',
                  border: current ? `2px solid ${color}` : '2px solid transparent',
                  margin: '0 auto 4px',
                }} />
                <p style={{
                  fontSize: '8px', letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: current ? color : past ? 'var(--text-4)' : 'var(--text-6)',
                  whiteSpace: 'nowrap',
                }}>{meta.label}</p>
              </div>
              {i < PIPELINE_STAGES.length - 1 && (
                <div style={{
                  width: '24px', height: '1px', flexShrink: 0, margin: '-10px 4px 0',
                  background: past ? 'var(--border-2)' : 'var(--border-0)',
                }} />
              )}
            </div>
          )
        })}
      </div>
      {nextAction && (
        <p style={{ color: 'var(--text-6)', fontSize: '9px', marginTop: '6px' }}>
          Next: <span style={{ color: 'var(--text-4)' }}>{nextAction}</span>
        </p>
      )}
    </div>
  )
}
