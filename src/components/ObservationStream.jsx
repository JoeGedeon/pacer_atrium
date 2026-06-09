import { useState } from 'react'
import ObservationCard from './ObservationCard'

const OBS_TYPES = [
  { id: 'observation', label: 'Observation', icon: '👁' },
  { id: 'idea',        label: 'Idea',        icon: '💡' },
  { id: 'jobsite',     label: 'Jobsite',     icon: '🏗️' },
  { id: 'business',    label: 'Business',    icon: '💼' },
  { id: 'vision',      label: 'Vision',      icon: '🌙' },
  { id: 'comment',     label: 'Comment',     icon: '💬' },
]

const SECTION_META = {
  atrium:       { title: 'Atrium',       sub: 'The entrance room of the PACER ecosystem.' },
  notice:       { title: 'Notice',       sub: 'Receive and record what enters the system.' },
  preserve:     { title: 'Preserve',     sub: 'Protect what matters before it evaporates.' },
  translate:    { title: 'Translate',    sub: 'Transform raw observation into structured meaning.' },
  'pass-forward': { title: 'Pass Forward', sub: 'Route observations to where they belong.' },
}

export default function ObservationStream({
  observations,
  onSubmit,
  activeObservation,
  onSelectObservation,
  activeSection,
}) {
  const [text, setText] = useState('')
  const [type, setType] = useState('observation')

  function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    onSubmit({ text: text.trim(), type })
    setText('')
  }

  const meta = SECTION_META[activeSection] || SECTION_META.atrium

  return (
    <main className="flex flex-col flex-1 min-w-0" style={{ background: '#090c14' }}>
      <div
        className="px-8 py-5 border-b shrink-0"
        style={{ borderColor: '#111827' }}
      >
        <h1
          className="text-base font-semibold tracking-tight"
          style={{ color: '#c9d3e8' }}
        >
          {meta.title}
        </h1>
        <p className="text-xs mt-0.5" style={{ color: '#374151' }}>
          {meta.sub}
        </p>
      </div>

      <div
        className="px-8 pt-6 pb-5 border-b shrink-0"
        style={{ borderColor: '#0f1520' }}
      >
        <p className="text-xs mb-4" style={{ color: '#4b5563' }}>
          What have you noticed?
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {OBS_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: type === t.id ? '#1e3a5f' : '#0d1117',
                color: type === t.id ? '#93c5fd' : '#374151',
                border: `1px solid ${type === t.id ? '#1d4ed8' : '#1f2937'}`,
              }}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Enter your observation..."
            rows={4}
            className="w-full resize-none rounded-lg px-4 py-3 text-sm outline-none transition-colors"
            style={{
              background: '#0d1520',
              color: '#c9d3e8',
              border: '1px solid #1f2937',
              lineHeight: '1.65',
            }}
            onFocus={e => { e.target.style.borderColor = '#2563eb' }}
            onBlur={e => { e.target.style.borderColor = '#1f2937' }}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e)
            }}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs" style={{ color: '#1f2937' }}>
              ⌘↵ to submit
            </span>
            <button
              type="submit"
              disabled={!text.trim()}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: text.trim() ? '#1d4ed8' : '#0d1117',
                color: text.trim() ? '#e0eaff' : '#1f2937',
                border: `1px solid ${text.trim() ? '#2563eb' : '#1f2937'}`,
                cursor: text.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Receive Observation
            </button>
          </div>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-5">
        {observations.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs" style={{ color: '#1a2233' }}>
              The stream is empty. No observations have entered the system.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {observations.map(obs => (
              <ObservationCard
                key={obs.id}
                observation={obs}
                isActive={activeObservation?.id === obs.id}
                onClick={() => onSelectObservation(obs)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
