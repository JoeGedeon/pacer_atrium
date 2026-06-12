// Each room has a voice that matches its authority.
export const ROOM_VOICE_CONFIG = {
  home:           { rate: 0.92, pitch: 1.0,  gender: null,     label: 'Neutral',     character: 'Calm arrival'           },
  atrium:         { rate: 0.88, pitch: 1.05, gender: 'female', label: 'Warm',        character: 'Welcoming and present'  },
  muse:           { rate: 0.96, pitch: 1.15, gender: 'female', label: 'Theatrical',  character: 'Creative and curious'   },
  vera:           { rate: 0.90, pitch: 0.95, gender: 'female', label: 'Precise',     character: 'Measured and clear'     },
  kel:            { rate: 0.84, pitch: 0.82, gender: 'male',   label: 'Operational', character: 'Firm and minimal'       },
  content:        { rate: 0.80, pitch: 0.88, gender: 'male',   label: 'Cinematic',   character: 'Slow and dramatic'      },
  businesscenter: { rate: 1.00, pitch: 0.92, gender: null,     label: 'Briefing',    character: 'Crisp cockpit cadence'  },
  archive:        { rate: 0.76, pitch: 0.86, gender: null,     label: 'Memory',      character: 'Slow and grounded'      },
  doctrine:       { rate: 0.80, pitch: 0.90, gender: null,     label: 'Formal',      character: 'Constitutional weight'  },
  settings:       { rate: 0.92, pitch: 1.0,  gender: null,     label: 'Neutral',     character: 'Calm arrival'           },
}

const ROOM_SAMPLE = {
  home:           'Good morning. PACER is ready.',
  atrium:         'Enter the Atrium. There is room. Come in with respect.',
  muse:           'Something interesting is surfacing. Let me look closer.',
  vera:           'Assessment complete. Two items require your attention.',
  kel:            'Review pending. Decision required. Proceed.',
  content:        'The curtain rises. The work is ready.',
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
  content:        'Theater',
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

// Single entry point for all speech in PACER — handles Chrome/Edge async voice loading.
export function speakWithVoice(text, config, { onEnd, onError } = {}) {
  if (!window.speechSynthesis) return
  const cfg = config || ROOM_VOICE_CONFIG.home
  window.speechSynthesis.cancel()
  const utt   = new SpeechSynthesisUtterance(text)
  utt.rate    = cfg.rate
  utt.pitch   = cfg.pitch
  if (onEnd)   utt.onend   = onEnd
  if (onError) utt.onerror = onError

  const doSpeak = () => {
    const voice = pickVoice(cfg.gender)
    if (voice) utt.voice = voice
    window.speechSynthesis.speak(utt)
  }

  if (window.speechSynthesis.getVoices().length > 0) {
    doSpeak()
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null
      doSpeak()
    }
  }
}
