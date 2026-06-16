// Attention hierarchy — a third, independent question from the two lifecycles
// locked in CLAUDE.md's Governance Rule (operational custody, creative maturity).
// This one answers: how urgent is this signal right now? It reads only existing
// observation/pattern fields (timestamp, constellation, destination) — no new
// Firestore fields, no new lifecycle, no bespoke badge system. Visual tones below
// reuse colors already established elsewhere in OpsCore (red/amber/gray).

export const ATTENTION_LEVELS = ['critical', 'emerging', 'background']

export const ATTENTION_LEVEL_META = {
  critical:   { label: 'Critical',   color: '#ef4444' },
  emerging:   { label: 'Emerging',   color: '#f59e0b' },
  background: { label: 'Background', color: '#6b7280' },
}

export function attentionLevelRank(level) {
  return ATTENTION_LEVELS.indexOf(level)
}

// listenObservations() (src/lib/db.js) resolves Firestore Timestamps to plain
// Date objects before components see them — but they remain Timestamps in a
// couple of other read paths. Accept either shape here.
export function toMillis(value, fallback = Date.now()) {
  if (!value) return fallback
  if (typeof value.toMillis === 'function') return value.toMillis()
  if (value instanceof Date) return value.getTime()
  return fallback
}

const day  = 86400000
const week = 7 * day

// Revenue and safety risk outrank communication/friction, which outrank process
// drift — the same severity ordering already implied by SIGNAL_TYPES' colors.
const SIGNAL_WEIGHT = { revenue: 2, safety: 2, communication: 1, friction: 1, process: 0 }

export function observationAttentionLevel(obs, { now = Date.now(), signal = null } = {}) {
  const age = now - toMillis(obs.timestamp, now)
  const weight = signal ? (SIGNAL_WEIGHT[signal.id] ?? 0) : 0
  if (age > week || weight >= 2) return 'critical'
  if (age > day || weight >= 1) return 'emerging'
  return 'background'
}

export function patternAttentionLevel(count, maxCount, signal = null) {
  const weight = signal ? (SIGNAL_WEIGHT[signal.id] ?? 0) : 0
  const share = maxCount ? count / maxCount : 0
  if (weight >= 2 || share >= 0.6) return 'critical'
  if (weight >= 1 || share >= 0.3 || count >= 2) return 'emerging'
  return 'background'
}
