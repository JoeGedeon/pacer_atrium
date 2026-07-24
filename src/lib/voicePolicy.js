// Phase 1: Voice governance gate.
// PACER's existing voice surfaces (briefing readbacks, K.E.L. recommendations,
// doctrine narration, room summaries, manual "speak this" actions) stay as-is.
// This module governs only the one place PACER auto-speaks unprompted:
// Conversation Mode replies. Everything else routed through here stays text.

// The five approved triggers for automatic speech. Phase 1 wires up only
// EXPLICIT_BRIEFING — the others are proactive system events (Phase 2/3),
// not reachable from free-form conversational query text.
export const VOICE_TRIGGERS = {
  CRITICAL_ATTENTION:  'critical_attention',
  HUMAN_GATE_APPROVAL: 'human_gate_approval',
  NEW_BRIEFING_READY:  'new_briefing_ready',
  BROADCAST_BEGINS:    'broadcast_begins',
  EXPLICIT_BRIEFING:   'explicit_briefing',
}

const BRIEFING_REQUEST_PATTERN =
  /\b(brief(ing)?|summary|summarize|status|update|recap|overview|what'?s\s+critical|what\s+needs\s+attention|catch\s+me\s+up|where\s+(do\s+)?(we|things)\s+stand)\b/i

// Does this conversational query explicitly ask for a briefing/summary/status?
// This is the only one of the five governed triggers reachable from free text.
export function isExplicitBriefingRequest(queryText) {
  if (typeof queryText !== 'string' || !queryText.trim()) return false
  return BRIEFING_REQUEST_PATTERN.test(queryText)
}

// Gate for Conversation Mode's automatic reply speech. Everything that is not
// an explicit briefing request stays text-only — PACER answers, but does not speak.
export function shouldSpeakConversationReply(queryText) {
  return isExplicitBriefingRequest(queryText)
}

// Phase 2: Approved proactive announcement phrases.
// Exact text is institutional doctrine — do not paraphrase or "improve."
export const PROACTIVE_ANNOUNCEMENTS = {
  CRITICAL_ATTENTION: 'Critical attention item detected.',
  COMMAND_APPROVED:   'Command approved. Execution authorized.',
  BRIEFING_READY:     'Briefing ready for review.',
}
