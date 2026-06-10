function loadMuseWorks() {
  try {
    return JSON.parse(localStorage.getItem('muse_works') || '[]').map(w => ({
      ...w,
      createdAt: new Date(w.createdAt),
      _source: 'muse',
    }))
  } catch { return [] }
}

function formatDate(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const STATUS_LABELS = {
  routed:           'Routed',
  received:         'Received',
  opening_night:    'Opening Night',
  published_memory: 'Published Memory',
}

const STATUS_COLORS = {
  routed:           '#3b82f6',
  received:         'var(--text-4)',
  opening_night:    '#10b981',
  published_memory: '#06b6d4',
}

const CAT_ICONS = {
  music:         '🎵',
  visual:        '🎨',
  lore:          '📖',
  worldbuilding: '🌎',
  characters:    '🎭',
  productions:   '🎬',
}

export default function ArchiveRoom({ observations = [] }) {
  const works = loadMuseWorks().filter(
    w => w.status === 'published_memory' || w.status === 'opening_night'
  )

  // Routed observations (have a destination) form the observation record
  const routedObs = observations.filter(o => o.destination || o.status === 'routed')

  // Merge into a single timeline, sorted newest first
  const timeline = [
    ...works.map(w => ({
      id: `muse-${w.id}`,
      kind: 'work',
      title: w.title,
      category: w.category,
      status: w.status,
      notes: w.notes,
      timestamp: w.createdAt,
    })),
    ...routedObs.map(o => ({
      id: `obs-${o.id}`,
      kind: 'observation',
      text: o.text,
      type: o.type,
      destination: o.destination,
      constellation: o.constellation,
      status: o.status,
      timestamp: o.timestamp instanceof Date ? o.timestamp : new Date(o.timestamp),
    })),
  ].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-0)' }}>

      {/* Header */}
      <div className="shrink-0 px-10 pt-8 pb-5" style={{ borderBottom: '1px solid var(--border-0)' }}>
        <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}
        >Preservation Layer</p>
        <h2 style={{ fontSize: '18px', color: 'var(--text-0)', fontWeight: 700,
          letterSpacing: '0.08em', marginBottom: '6px' }}
        >ARCHIVE</h2>
        <p style={{ color: 'var(--text-3)', fontSize: '12px', marginBottom: '4px' }}>
          What the campus has institutionalized.
        </p>
        <p style={{ color: 'var(--text-5)', fontSize: '11px' }}>
          {timeline.length} record{timeline.length !== 1 ? 's' : ''} ·{' '}
          {works.length} published work{works.length !== 1 ? 's' : ''} ·{' '}
          {routedObs.length} routed observation{routedObs.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-10 py-6">
        {timeline.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <div style={{ textAlign: 'center', maxWidth: '300px' }}>
              <p style={{ color: 'var(--text-4)', fontSize: '13px', marginBottom: '8px' }}>
                The Archive is empty.
              </p>
              <p style={{ color: 'var(--text-6)', fontSize: '11px', lineHeight: 1.7 }}>
                Routed observations and published works<br />will appear here in order of time.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {timeline.map((entry, i) => {
              const isWork = entry.kind === 'work'
              const color  = isWork
                ? STATUS_COLORS[entry.status] || 'var(--text-3)'
                : STATUS_COLORS[entry.status] || (entry.destination ? '#3b82f6' : 'var(--text-4)')

              return (
                <div key={entry.id} style={{ display: 'flex', gap: '20px', marginBottom: '0' }}>
                  {/* Timeline spine */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                    width: '16px', flexShrink: 0 }}
                  >
                    <div style={{
                      width: '7px', height: '7px', borderRadius: '50%', marginTop: '16px',
                      background: color, flexShrink: 0,
                    }} />
                    {i < timeline.length - 1 && (
                      <div style={{ flex: 1, width: '1px', background: 'var(--border-0)', marginTop: '4px' }} />
                    )}
                  </div>

                  {/* Entry content */}
                  <div style={{ flex: 1, paddingBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-5)', paddingTop: '14px' }}>
                        {formatDate(entry.timestamp)} · {formatTime(entry.timestamp)}
                      </span>
                      <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: '999px',
                        background: `${color}15`, color, border: `1px solid ${color}28`,
                        marginTop: '12px',
                      }}>
                        {isWork
                          ? (STATUS_LABELS[entry.status] || entry.status)
                          : (entry.destination || STATUS_LABELS[entry.status] || 'Received')}
                      </span>
                    </div>

                    <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-1)',
                      borderRadius: '8px', padding: '14px 18px' }}
                    >
                      {isWork ? (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span style={{ fontSize: '12px' }}>{CAT_ICONS[entry.category] || '🎭'}</span>
                            <p style={{ fontSize: '13px', color: 'var(--text-0)', fontWeight: 600 }}>
                              {entry.title}
                            </p>
                          </div>
                          {entry.notes && (
                            <p style={{ fontSize: '12px', color: 'var(--text-3)', lineHeight: 1.6,
                              maxHeight: '72px', overflow: 'hidden',
                              maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                            }}>{entry.notes}</p>
                          )}
                        </>
                      ) : (
                        <>
                          <p style={{ fontSize: '13px', color: 'var(--text-1)', lineHeight: 1.6,
                            marginBottom: entry.constellation ? '8px' : 0 }}
                          >
                            {entry.text?.length > 200
                              ? entry.text.slice(0, 200) + '…'
                              : entry.text}
                          </p>
                          {entry.constellation && (
                            <p style={{ fontSize: '10px', color: '#a07830' }}>
                              {entry.constellation}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0" style={{ borderTop: '1px solid var(--border-0)', padding: '14px 40px' }}>
        <p style={{ color: 'var(--text-6)', fontSize: '11px', fontStyle: 'italic' }}>
          Archive answers: what do we know? Constellations answer: what does it mean?
        </p>
      </div>
    </div>
  )
}
