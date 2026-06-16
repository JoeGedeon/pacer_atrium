// Cross-room custody pipeline — distinct from MUSE's canonized Object Lifecycle
// (Observed → Shaping → Structured → Premiere Ready → Opening Night → Published Memory,
// CLAUDE.md "PACER Object Lifecycle", which tracks creative maturity within MUSE).
// This tracks where an artifact sits in institutional custody, room to room:
// captured → cleared by Human Gate → assembled → actively worked → live → put away.

export const PIPELINE_STAGES = ['observation', 'approved', 'packaged', 'production', 'published', 'archived']

export const PIPELINE_STAGE_META = {
  observation: { label: 'Observation' },
  approved:    { label: 'Approved' },
  packaged:    { label: 'Packaged' },
  production:  { label: 'Production' },
  published:   { label: 'Published' },
  archived:    { label: 'Archived' },
}

export const STATE_META = {
  blocked:   { label: 'Blocked',   color: '#ef4444' },
  active:    { label: 'Active',    color: '#3b82f6' },
  completed: { label: 'Completed', color: '#10b981' },
  archived:  { label: 'Archived',  color: '#6b7280' },
}

function step({ stage, state, nextAction, tone = null }) {
  return { stage, state, nextAction, tone }
}

export function observationPipelineStage(obs) {
  if (obs.resolutionStatus && obs.resolutionStatus !== 'open') {
    return step({ stage: 'archived', state: 'archived', nextAction: 'None — resolved' })
  }
  if (obs.destination) {
    return step({ stage: 'approved', state: 'active', nextAction: `Routed to ${obs.destination}` })
  }
  return step({ stage: 'observation', state: 'blocked', nextAction: 'Awaiting routing' })
}

export function museWorkPipelineStage(work) {
  switch (work.status) {
    case 'shaping':
      return step({ stage: 'observation', state: 'active', nextAction: 'Continue shaping' })
    case 'structured':
      return step({ stage: 'packaged', state: 'active', nextAction: 'Declare Premiere Ready' })
    case 'premiere_ready':
      return step({ stage: 'approved', state: 'active', nextAction: 'Open the Curtain' })
    case 'opening_night':
      return step({ stage: 'production', state: 'active', nextAction: 'Send to Archive' })
    case 'published_memory':
      return step({ stage: 'published', state: 'completed', nextAction: 'None — archived as memory' })
    default:
      return step({ stage: 'observation', state: 'active', nextAction: 'Mark Structured' })
  }
}

export function kelCommandPipelineStage(cmd) {
  switch (cmd.status) {
    case 'drafted':
    case 'analyzing':
      return step({ stage: 'observation', state: 'active', nextAction: 'Plan and submit for gate review' })
    case 'planned':
      return step({ stage: 'packaged', state: 'active', nextAction: 'Submit for Gate Review' })
    case 'pending_approval':
      return step({ stage: 'packaged', state: 'blocked', nextAction: 'Awaiting Human Gate decision' })
    case 'approved':
      return step({ stage: 'approved', state: 'active', nextAction: 'Begin execution' })
    case 'in_progress':
      return step({ stage: 'production', state: 'active', nextAction: 'Submit evidence + verdict' })
    case 'completed':
      return step({
        stage: 'published', state: 'completed',
        nextAction: 'None — closed',
        tone: cmd.verdict === 'Failed' ? '#ef4444' : null,
      })
    case 'failed':
      return step({ stage: 'published', state: 'completed', nextAction: 'Review failure evidence', tone: '#ef4444' })
    case 'denied':
      return step({ stage: 'archived', state: 'archived', nextAction: 'None — denied at Human Gate' })
    case 'archived':
      return step({ stage: 'archived', state: 'archived', nextAction: 'None' })
    default:
      return step({ stage: 'observation', state: 'active', nextAction: 'Define command' })
  }
}

export function theaterProductionPipelineStage(production) {
  if (production.publishedAt) {
    return step({ stage: 'published', state: 'completed', nextAction: 'None — live' })
  }
  if (production.status === 'archived') {
    return step({ stage: 'archived', state: 'archived', nextAction: 'None' })
  }
  if (production.humanGateStatus === 'denied') {
    return step({ stage: 'archived', state: 'blocked', nextAction: 'Revise and resubmit, or archive' })
  }
  if (production.humanGateStatus === 'approved' && production.status !== 'delivered') {
    return step({ stage: 'approved', state: 'active', nextAction: 'Publish to OpsCore' })
  }
  switch (production.status) {
    case 'incoming':
      return step({ stage: 'observation', state: 'active', nextAction: 'Start production' })
    case 'in_production':
      return step({ stage: 'production', state: 'active', nextAction: 'Stage for review' })
    case 'staged':
      return step({ stage: 'packaged', state: 'blocked', nextAction: 'Awaiting Human Gate' })
    case 'approved':
      return step({ stage: 'approved', state: 'active', nextAction: 'Publish to OpsCore' })
    case 'delivered':
      return step({ stage: 'published', state: 'completed', nextAction: 'None — delivered' })
    default:
      return step({ stage: 'observation', state: 'active', nextAction: 'Define production' })
  }
}

export function mediaAssetPipelineStage(asset) {
  if (asset.publishedAt) {
    return step({
      stage: 'published', state: 'completed',
      nextAction: asset.opsCoreSignal ? 'None — broadcasting' : 'None — reference only',
    })
  }
  if (asset.humanGateStatus === 'denied') {
    return step({ stage: 'archived', state: 'blocked', nextAction: 'Revise and resubmit' })
  }
  if (asset.humanGateStatus === 'approved') {
    return step({ stage: 'approved', state: 'active', nextAction: 'Publish asset' })
  }
  if (asset.productionId) {
    return step({ stage: 'packaged', state: 'blocked', nextAction: 'Awaiting Human Gate review' })
  }
  if (asset.transcript || asset.videoUrl || asset.audioUrl) {
    return step({ stage: 'packaged', state: 'active', nextAction: 'Submit to Human Gate' })
  }
  return step({ stage: 'observation', state: 'active', nextAction: 'Add content' })
}
