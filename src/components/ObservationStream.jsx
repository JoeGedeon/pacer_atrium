import { useState } from 'react'
import ObservationCard from './ObservationCard'

const OBS_TYPES = [
  { id: 'text',     label: 'Text',     icon: '✍️' },
  { id: 'voice',    label: 'Voice',    icon: '🎤' },
  { id: 'image',    label: 'Image',    icon: '📸' },
  { id: 'document', label: 'Document', icon: '📄' },
  { id: 'idea',     label: 'Idea',     icon: '💡' },
]

export default function ObservationStream({
  observations,
  onSubmit,
  activeObservation,
  onSelectObservation,
}) {
  const [text, setText] = useState('')
  const [type, setType] = useState('text')
  const [constellation, setConstellation] = useState('')
  const [activeConstellation, setActiveConstellation] = useState(null)

  const constellations = [...new Set(
    observations.filter(o => o.constellation).map(o => o.constellation)
  )]

  const displayed = activeConstellation
    ? observations.filter(o => o.constellation === activeConstellation)
    : observations

  function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    onSubmit({ text: text.trim(), type, constellation: constellation.trim() || null })
    setText('')
    setConstellation('')
  }

  return (
    <main className="flex flex-col flex-1 min-w-0" style={{ background: '#090c14' }}>
      <div
        className="px-10 pt-8 pb-6 border-b shrink-0"
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

          <div className="mt-3 mb-3">
            <input
              type="text"
              list="constellation-list"
              value={constellation}
              onChange={e => setConstellation(e.target.value)}
              placeholder="Constellation (optional) — what pattern does this belong to?"
              className="w-full rounded-lg px-3 py-2 text-xs outline-none transition-colors"
              style={{
                background: '#0a0f1a',
                color: '#8899b8',
                border: '1px solid #1a2236',
              }}
              onFocus={e => { e.target.style.borderColor = '#6b4e1a' }}
              onBlur={e => { e.target.style.borderColor = '#1a2236' }}
            />
            <datalist id="constellation-list">
              {constellations.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: '#1f2937' }}>⌘↵ to submit</span>
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

      <div className="flex-1 overflow-y-auto px-10 py-5">
        {constellations.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setActiveConstellation(null)}
              className="text-xs px-2.5 py-1 rounded-full transition-all"
              style={{
                background: !activeConstellation ? '#1a2236' : 'transparent',
                color: !activeConstellation ? '#8899b8' : '#2d3a50',
                border: `1px solid ${!activeConstellation ? '#2d3a50' : '#141c2e'}`,
              }}
            >
              All
            </button>
            {constellations.map(c => (
              <button
                key={c}
                onClick={() => setActiveConstellation(activeConstellation === c ? null : c)}
                className="text-xs px-2.5 py-1 rounded-full transition-all"
                style={{
                  background: activeConstellation === c ? '#1e1208' : 'transparent',
                  color: activeConstellation === c ? '#a07830' : '#2d3a50',
                  border: `1px solid ${activeConstellation === c ? '#4a2e0a' : '#141c2e'}`,
                }}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {displayed.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-xs" style={{ color: '#141c2e' }}>
              {activeConstellation
                ? `No observations in ${activeConstellation}.`
                : 'The stream is empty.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {displayed.map(obs => (
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
