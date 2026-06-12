// Room IDs must match LeftNav PACER_ROOMS ids.
// rooms: null → all rooms visible (creator bypass)

export const CAMPUS_TEMPLATES = {
  explorer: {
    id: 'explorer',
    name: 'Explorer',
    tagline: 'Start here. Build as you go.',
    rooms: ['atrium', 'muse', 'archive', 'settings'],
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    tagline: 'Deeper understanding. More tools.',
    rooms: ['atrium', 'muse', 'vera', 'content', 'archive', 'doctrine', 'settings'],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Your institution. Your rules.',
    rooms: ['atrium', 'muse', 'vera', 'content', 'businesscenter', 'kel', 'archive', 'doctrine', 'settings'],
  },
  fleetflow: {
    id: 'fleetflow',
    name: 'FleetFlow',
    tagline: 'Operations first. Clarity always.',
    rooms: ['atrium', 'businesscenter', 'kel', 'archive', 'settings'],
    primaryRoom: 'businesscenter',
  },
  creator: {
    id: 'creator',
    name: 'Creator',
    tagline: 'Full campus. Complete authority.',
    rooms: null,
    bypass: true,
  },
}

export const OUTCOME_OPTIONS = [
  {
    id: 'operations',
    label: 'Run Operations',
    icon: '🚚',
    desc: 'Manage crews, jobs, and revenue.',
    template: 'fleetflow',
  },
  {
    id: 'content',
    label: 'Create Content',
    icon: '🎭',
    desc: 'Turn observations into production.',
    template: 'professional',
  },
  {
    id: 'knowledge',
    label: 'Organize Knowledge',
    icon: '📚',
    desc: 'Capture what you know. Make it last.',
    template: 'professional',
  },
  {
    id: 'business',
    label: 'Grow a Business',
    icon: '💼',
    desc: 'Institutional clarity for execution.',
    template: 'enterprise',
  },
  {
    id: 'ideas',
    label: 'Develop Ideas',
    icon: '💡',
    desc: 'Start with observations. Let it grow.',
    template: 'explorer',
  },
  {
    id: 'other',
    label: 'Something Else',
    icon: '✦',
    desc: 'Find your own path.',
    template: 'explorer',
  },
]
