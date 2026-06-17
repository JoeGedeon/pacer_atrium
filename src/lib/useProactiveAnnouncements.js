import { useRef, useEffect } from 'react'
import { observationAttentionLevel, matchSignal } from './attentionLevel'
import { speakWithVoice } from './roomVoice'
import { PROACTIVE_ANNOUNCEMENTS } from './voicePolicy'

// How long after mount before proactive announcements start firing.
// Gives the initial Firestore batch time to arrive without treating
// existing data as "new" events.
const SETTLE_MS = 2500

export function useProactiveAnnouncements({ observations, kelDecisions, arrivalText, voiceMode, voiceConfig }) {
  const settledRef         = useRef(false)
  const prevObsIdsRef      = useRef(new Set())
  const prevDecisionIdsRef = useRef(new Set())
  const prevArrivalRef     = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => { settledRef.current = true }, SETTLE_MS)
    return () => clearTimeout(t)
  }, [])

  // Critical Attention: new observation whose attention level is critical.
  // One announcement per incoming batch to avoid stacking TTS calls.
  useEffect(() => {
    const now    = Date.now()
    const newIds = new Set(observations.map(o => o.id))

    if (settledRef.current && voiceMode) {
      for (const obs of observations) {
        if (!prevObsIdsRef.current.has(obs.id)) {
          const signal = matchSignal(obs.constellation)
          if (observationAttentionLevel(obs, { now, signal }) === 'critical') {
            speakWithVoice(PROACTIVE_ANNOUNCEMENTS.CRITICAL_ATTENTION, voiceConfig, {})
            break
          }
        }
      }
    }

    prevObsIdsRef.current = newIds
  }, [observations]) // eslint-disable-line

  // K.E.L. Command Approved: new kelDecision entry with decision === 'approved'.
  useEffect(() => {
    const newIds = new Set(kelDecisions.map(d => d.id))

    if (settledRef.current && voiceMode) {
      for (const decision of kelDecisions) {
        if (!prevDecisionIdsRef.current.has(decision.id) && decision.decision === 'approved') {
          speakWithVoice(PROACTIVE_ANNOUNCEMENTS.COMMAND_APPROVED, voiceConfig, {})
          break
        }
      }
    }

    prevDecisionIdsRef.current = newIds
  }, [kelDecisions]) // eslint-disable-line

  // Briefing Ready: arrivalText populated (or refreshed) after initial settle.
  useEffect(() => {
    if (settledRef.current && voiceMode && arrivalText && arrivalText !== prevArrivalRef.current) {
      speakWithVoice(PROACTIVE_ANNOUNCEMENTS.BRIEFING_READY, voiceConfig, {})
    }
    prevArrivalRef.current = arrivalText
  }, [arrivalText]) // eslint-disable-line
}
