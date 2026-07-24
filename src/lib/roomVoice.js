// Each room has a voice that matches its authority.
export const ROOM_VOICE_CONFIG = {
  home:           { rate: 0.92, pitch: 1.0,  gender: null,     label: 'Neutral',        character: 'Calm arrival'          },
  atrium:         { rate: 0.86, pitch: 1.0,  gender: 'female', label: 'Calm Command',   character: 'Composed authority'    },
  muse:           { rate: 0.96, pitch: 1.12, gender: 'female', label: 'Creative Studio', character: 'Expressive and curious' },
  vera:           { rate: 0.90, pitch: 0.95, gender: 'female', label: 'Precise',        character: 'Measured and clear'    },
  kel:            { rate: 0.82, pitch: 0.80, gender: 'male',   label: 'Formal Execution', character: 'Deliberate authority' },
  content:        { rate: 1.02, pitch: 0.90, gender: null,     label: 'Operational',    character: 'Urgent and direct'     },
  theater:        { rate: 0.94, pitch: 0.95, gender: null,     label: 'Broadcast',      character: 'Projected and ready'   },
  businesscenter: { rate: 1.00, pitch: 0.92, gender: null,     label: 'Briefing',       character: 'Crisp cockpit cadence' },
  archive:        { rate: 0.76, pitch: 0.86, gender: null,     label: 'Memory',         character: 'Slow and grounded'     },
  doctrine:       { rate: 0.80, pitch: 0.90, gender: null,     label: 'Formal',         character: 'Constitutional weight' },
  settings:       { rate: 0.92, pitch: 1.0,  gender: null,     label: 'Neutral',        character: 'Calm arrival'          },
}

const ROOM_SAMPLE = {
  home:           'Good morning. PACER is ready.',
  atrium:         'Campus is open. Three items need your attention.',
  muse:           'Something worth inspecting is surfacing. Let me look closer.',
  vera:           'Assessment complete. Two items require your attention.',
  kel:            'Review pending. Decision required. Proceed.',
  content:        'Critical attention item detected. One action clears the path.',
  theater:        'Broadcast is ready. The work is cleared for production.',
  businesscenter: 'Three priorities. Two decisions. One metric in motion.',
  archive:        'The record holds. What was captured here remains.',
  doctrine:       'Infrastructure is declared once. Behavior is inherited everywhere.',
  settings:       'Voice settings active. Everything sounds as it should.',
}

export const ROOM_DISPLAY_NAMES = {
  home:           'Home',
  atrium:         'Atrium',
  muse:           'MUSE',
  vera:           'VERA',
  kel:            'K.E.L.',
  content:        'OpsCore',
  theater:        'Theater',
  businesscenter: 'Business Center',
  archive:        'Archivist Hall',
  doctrine:       'Doctrine',
  settings:       'Settings',
}

export function getVoiceConfig(room) {
  return ROOM_VOICE_CONFIG[room] || ROOM_VOICE_CONFIG.home
}

export function getRoomSample(room) {
  return ROOM_SAMPLE[room] || ROOM_SAMPLE.home
}

const FEMALE_PATTERN = /samantha|victoria|karen|moira|fiona|zoe|allison|ava|jessica|joanna|kendra|kimberly|salli|google uk english female|google us english/i
const MALE_PATTERN   = /\balex\b|daniel|fred|\btom\b|\blee\b|oliver|david|\bmark\b|google uk english male/i

export function pickVoice(gender) {
  if (!window.speechSynthesis || !gender) return null
  const voices  = window.speechSynthesis.getVoices()
  const english = voices.filter(v => v.lang.startsWith('en'))
  const pool    = english.length ? english : voices
  const pattern = gender === 'female' ? FEMALE_PATTERN : MALE_PATTERN
  return pool.find(v => pattern.test(v.name)) || null
}

// Single entry point for all speech in PACER.
// Handles Chrome/Edge async voice loading and Safari's silent voiceschanged non-fire.
export function speakWithVoice(text, config, { onStart, onEnd, onError } = {}) {
  console.debug('[PACER voice] speakWithVoice called, text type:', typeof text, 'text length:', text?.length)
  console.debug('[PACER voice] config:', JSON.stringify(config))
  if (!window.speechSynthesis) {
    console.debug('[PACER voice] speechSynthesis unavailable')
    return
  }
  const cfg = config || ROOM_VOICE_CONFIG.home
  console.debug('[PACER voice] cfg.rate:', cfg?.rate, 'cfg.pitch:', cfg?.pitch)
  if (!cfg || cfg.rate === undefined || cfg.pitch === undefined) {
    console.error('[PACER voice] INVALID CONFIG — missing rate or pitch:', cfg)
    onError?.()
    return
  }
  window.speechSynthesis.cancel()

  if (typeof text !== 'string' || !text) {
    console.error('[PACER voice] INVALID TEXT — not a non-empty string:', text)
    onError?.()
    return
  }

  const utt   = new SpeechSynthesisUtterance(text)
  utt.rate    = cfg.rate
  utt.pitch   = cfg.pitch

  // iOS WebKit silently pauses speech after onstart without firing onpause.
  // A resume() heartbeat keeps it alive throughout the utterance.
  let keepAlive = null
  utt.onstart = () => {
    console.debug('[PACER voice] onstart fired')
    keepAlive = setInterval(() => {
      if (window.speechSynthesis.paused) window.speechSynthesis.resume()
    }, 250)
    onStart?.()
  }
  utt.onend   = () => { clearInterval(keepAlive); console.debug('[PACER voice] onend fired'); onEnd?.() }
  utt.onerror = (e) => { clearInterval(keepAlive); console.debug('[PACER voice] onerror:', e.error); onError?.() }

  const doSpeak = () => {
    const voice = pickVoice(cfg.gender)
    const vCount = window.speechSynthesis.getVoices().length
    console.debug(`[PACER voice] speak() — voices available: ${vCount}, selected: ${voice?.name || 'default'}`)
    if (voice) utt.voice = voice
    window.speechSynthesis.speak(utt)
  }

  const voices = window.speechSynthesis.getVoices()
  console.debug(`[PACER voice] init — voices: ${voices.length}, rate: ${cfg.rate}, pitch: ${cfg.pitch}`)

  if (voices.length > 0) {
    doSpeak()
  } else {
    // Safari and some mobile browsers never fire voiceschanged after initial page load.
    // Fallback: if the event hasn't fired within 300ms, speak with default voice anyway.
    let resolved = false
    const fallback = setTimeout(() => {
      if (resolved) return
      resolved = true
      window.speechSynthesis.onvoiceschanged = null
      console.debug('[PACER voice] voiceschanged timeout — speaking with default voice')
      doSpeak()
    }, 300)

    window.speechSynthesis.onvoiceschanged = () => {
      if (resolved) return
      resolved = true
      clearTimeout(fallback)
      window.speechSynthesis.onvoiceschanged = null
      console.debug('[PACER voice] voiceschanged fired')
      doSpeak()
    }
  }
}
