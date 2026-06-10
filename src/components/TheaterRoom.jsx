const SECTIONS = [
  {
    id: 'productions',
    label: 'Productions',
    icon: '🎥',
    hint: 'Films · Commercials · Cinematics',
    color: '#ef4444',
    count: 3,
  },
  {
    id: 'soundtracks',
    label: 'Soundtracks',
    icon: '🎵',
    hint: 'Original music · Scores · Audio',
    color: '#8b5cf6',
    count: 3,
  },
  {
    id: 'visuals',
    label: 'Visual Assets',
    icon: '🎨',
    hint: 'Concept art · Storyboards · Renders',
    color: '#10b981',
    count: 4,
  },
  {
    id: 'scripts',
    label: 'Scripts · Voice',
    icon: '🎤',
    hint: 'Scripts · Dialogue · Voice sessions',
    color: '#f59e0b',
    count: 2,
  },
]

export default function TheaterRoom() {
  return (
    <div
      className="flex-1 flex flex-col overflow-y-auto"
      style={{ background: '#07080e' }}
    >
      {/* Header */}
      <div style={{ padding: '32px 28px 0' }}>
        <p
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: '#1a2d4a', letterSpacing: '0.15em', marginBottom: '6px' }}
        >
          Publishing Layer
        </p>
        <h2
          className="font-bold"
          style={{ fontSize: '18px', color: '#c9d3e8', marginBottom: '6px', letterSpacing: '0.08em' }}
        >
          THEATER
        </h2>
        <p className="text-xs" style={{ color: '#2d3a50', marginBottom: '28px' }}>
          Where thinking becomes experience.
        </p>
      </div>

      {/* Featured Screen */}
      <div style={{ padding: '0 28px 32px' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            paddingTop: '56.25%',
            background: '#050709',
            borderRadius: '10px',
            border: '1px solid #1a0a0a',
            boxShadow: '0 0 40px #ef444408, inset 0 0 60px #000000cc',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                border: '1px solid #ef444430',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '18px', paddingLeft: '3px' }}>▶️</span>
            </div>
            <p
              className="text-xs"
              style={{ color: '#1a2030', letterSpacing: '0.1em' }}
            >
              No featured production loaded.
            </p>
          </div>
        </div>

        <p
          className="text-xs"
          style={{ color: '#1a2d4a', marginTop: '10px', textAlign: 'center', letterSpacing: '0.08em' }}
        >
          Featured Production
        </p>
      </div>

      {/* Content Sections */}
      <div style={{ padding: '0 28px 40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {SECTIONS.map(section => (
          <section key={section.id}>
            <div className="flex items-center gap-3" style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '14px' }}>{section.icon}</span>
              <p
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: '#1a2d4a', letterSpacing: '0.12em' }}
              >
                {section.label}
              </p>
              <p className="text-xs" style={{ color: '#111827' }}>{section.hint}</p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${section.count}, 1fr)`,
                gap: '8px',
              }}
            >
              {Array.from({ length: section.count }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: '#0a0d14',
                    border: `1px solid ${section.color}10`,
                    borderRadius: '8px',
                    aspectRatio: section.id === 'visuals' ? '1' : section.id === 'scripts' ? '2/1' : '16/9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '10px', color: '#111827' }}>□</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
