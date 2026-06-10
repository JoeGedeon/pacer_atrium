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
  observations, onSubmit, activeObservation, onSelectObservation,
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
    <main className="flex flex-col flex-1 min-w-0" style={{ background: 'var(--bg-0)' }}>
      <div className="px-10 pt-8 pb-6 border-b shrink-0" style={{ borderColor: 'var(--border-1)' }}>
        <p className="text-xs mb-4" style={{ color: 'var(--text-2)' }}>What have you noticed?</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {OBS_TYPES.map(t => (
            <button key={t.id} onClick={() => setType(t.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: type === t.id ? '#1e3a5f' : 'var(--bg-2)',
                color:      type === t.id ? '#93c5fd' : 'var(--text-2)',
                border:    `1px solid ${type === t.id ? '#1d4ed8' : 'var(--border-2)'}`,
              }}
            >
              <span>{t.icon}</span>{t.label}
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
              background: 'var(--bg-input)',
              color:      'var(--text-0)',
              border:     '1px solid var(--border-2)',
              lineHeight: '1.65',
            }}
            onFocus={e  => { e.target.style.borderColor = '#2563eb' }}
            onBlur={e   => { e.target.style.borderColor = 'var(--border-2)' }}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e) }}
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
                background: 'var(--bg-1)',
                color:      'var(--text-1)',
                border:     '1px solid var(--border-1)',
              }}
              onFocus={e => { e.target.style.borderColor = '#6b4e1a' }}
              onBlur={e  => { e.target.style.borderColor = 'var(--border-1)' }}
            />
            <datalist id="constellation-list">
              {constellations.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: 'var(--text-5)' }}>⌘↵ to submit</span>
            <button
              type="submit"
              disabled={!text.trim()}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: text.trim() ? '#1d4ed8' : 'var(--bg-2)',
                color:      text.trim() ? '#e0eaff'  : 'var(--text-5)',
                border:    `1px solid ${text.trim() ? '#2563eb' : 'var(--border-2)'}`,
                cursor:     text.trim() ? 'pointer' : 'not-allowed',
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
            <button onClick={() => setActiveConstellation(null)}
              className="text-xs px-2.5 py-1 rounded-full transition-all"
              style={{
                background: !activeConstellation ? 'var(--bg-3)' : 'transparent',
                color:      !activeConstellation ? 'var(--text-1)' : 'var(--text-3)',
                border:    `1px solid ${!activeConstellation ? 'var(--border-1)' : 'var(--border-1)'}`,
              }}
            >All</button>
            {constellations.map(c => (
              <button key={c} onClick={() => setActiveConstellation(activeConstellation === c ? null : c)}
                className="text-xs px-2.5 py-1 rounded-full transition-all"
                style={{
                  background: activeConstellation === c ? '#1e1208' : 'transparent',
                  color:      activeConstellation === c ? '#a07830' : 'var(--text-3)',
                  border:    `1px solid ${activeConstellation === c ? '#4a2e0a' : 'var(--border-1)'}`,
                }}
              >{c}</button>
            ))}
          </div>
        )}

        {displayed.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-xs" style={{ color: 'var(--text-6)' }}>
              {activeConstellation ? `No observations in ${activeConstellation}.` : 'The stream is empty.'}
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
