const PRINCIPLES = [
  {
    id: 1,
    text: 'Operational Honesty is when reality and the record match.',
    tag: 'Foundation',
  },
  {
    id: 2,
    text: 'Execution requires human approval.',
    tag: 'Governance',
  },
  {
    id: 3,
    text: 'Observations precede conclusions.',
    tag: 'Epistemology',
  },
  {
    id: 4,
    text: 'Memory preserves context.',
    tag: 'Architecture',
  },
  {
    id: 5,
    text: 'Systems serve people.',
    tag: 'Foundation',
  },
  {
    id: 6,
    text: 'Reality outranks assumptions.',
    tag: 'Epistemology',
  },
  {
    id: 7,
    text: 'Patterns require evidence.',
    tag: 'Epistemology',
  },
  {
    id: 8,
    text: 'Transparency creates trust.',
    tag: 'Foundation',
  },
  {
    id: 9,
    text: 'Consequences teach systems.',
    tag: 'Architecture',
  },
  {
    id: 10,
    text: 'Understanding precedes optimization.',
    tag: 'Architecture',
  },
]

const TAG_COLORS = {
  Foundation:   '#f59e0b',
  Governance:   '#3b82f6',
  Epistemology: '#10b981',
  Architecture: '#8b5cf6',
}

export default function DoctrineRoom() {
  return (
    <div
      className="flex-1 flex flex-col overflow-y-auto"
      style={{ background: '#090c14', padding: '32px 28px' }}
    >
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: '#1a2d4a', letterSpacing: '0.15em', marginBottom: '6px' }}
        >
          Canon Layer
        </p>
        <h2
          className="font-bold"
          style={{ fontSize: '18px', color: '#c9d3e8', marginBottom: '6px', letterSpacing: '0.08em' }}
        >
          DOCTRINE
        </h2>
        <p className="text-xs" style={{ color: '#2d3a50' }}>
          Principles that became permanent. {PRINCIPLES.length} entries.
        </p>
      </div>

      {/* Principles */}
      <div className="flex flex-col gap-3">
        {PRINCIPLES.map(p => (
          <div
            key={p.id}
            className="rounded-lg"
            style={{
              background: '#0d1117',
              border: `1px solid ${TAG_COLORS[p.tag]}18`,
              padding: '14px 18px',
            }}
          >
            <div className="flex items-start gap-4">
              <span
                className="shrink-0 font-bold"
                style={{ fontSize: '11px', color: '#1a2d4a', marginTop: '2px', minWidth: '18px' }}
              >
                {String(p.id).padStart(2, '0')}
              </span>
              <div className="flex-1">
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: '#8ea3c3', marginBottom: '8px' }}
                >
                  {p.text}
                </p>
                <span
                  className="text-xs"
                  style={{ color: TAG_COLORS[p.tag] + '99' }}
                >
                  {p.tag}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #0d1117' }}>
        <p className="text-xs" style={{ color: '#141c2e' }}>
          Doctrine entries are permanent. Observations become doctrine through deliberate promotion.
        </p>
      </div>
    </div>
  )
}
