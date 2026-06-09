export default function PACERHome({ onEnter, observationCount }) {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center"
      style={{ background: '#07090f' }}
    >
      <div
        className="text-center w-full"
        style={{ maxWidth: '420px', padding: '0 24px' }}
      >
        <div style={{ fontSize: '40px', marginBottom: '20px' }}>🍍</div>

        <h1
          className="font-bold tracking-widest uppercase"
          style={{ fontSize: '22px', color: '#c9d3e8', letterSpacing: '0.25em', marginBottom: '10px' }}
        >
          PACER
        </h1>

        <p style={{ color: '#2d3a50', fontSize: '14px', marginBottom: '52px' }}>
          There is room. Come in.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => onEnter('atrium')}
            className="w-full rounded-lg text-left transition-all"
            style={{
              background: '#0d1a2e',
              border: '1px solid #1d4ed8',
              padding: '16px 20px',
              cursor: 'pointer',
            }}
          >
            <div className="flex items-center gap-4">
              <span style={{ fontSize: '20px' }}>🍍</span>
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: '#93c5fd', marginBottom: '4px' }}
                >
                  Capture Observation
                </p>
                <p style={{ fontSize: '11px', color: '#1d3a6a' }}>Enter the Atrium</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onEnter('kel')}
            className="w-full rounded-lg text-left transition-all"
            style={{
              background: '#0d1117',
              border: '1px solid #141c2e',
              padding: '16px 20px',
              cursor: 'pointer',
            }}
          >
            <div className="flex items-center gap-4">
              <span style={{ fontSize: '20px' }}>✨</span>
              <div>
                <p className="text-sm" style={{ color: '#4b5563', marginBottom: '4px' }}>
                  Explore Constellations
                </p>
                <p style={{ fontSize: '11px', color: '#1f2937' }}>Navigate through KEL</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onEnter('archive')}
            className="w-full rounded-lg text-left transition-all"
            style={{
              background: '#0d1117',
              border: '1px solid #141c2e',
              padding: '16px 20px',
              cursor: 'pointer',
            }}
          >
            <div className="flex items-center gap-4">
              <span style={{ fontSize: '20px' }}>📚</span>
              <div>
                <p className="text-sm" style={{ color: '#4b5563', marginBottom: '4px' }}>
                  Enter Archive
                </p>
                <p style={{ fontSize: '11px', color: '#1f2937' }}>Preserved observations</p>
              </div>
            </div>
          </button>

          {observationCount > 0 && (
            <button
              onClick={() => onEnter('atrium')}
              className="w-full rounded-lg text-left transition-all"
              style={{
                background: '#0d1117',
                border: '1px solid #141c2e',
                padding: '16px 20px',
                cursor: 'pointer',
              }}
            >
              <div className="flex items-center gap-4">
                <span style={{ fontSize: '20px' }}>🔵</span>
                <div>
                  <p className="text-sm" style={{ color: '#4b5563', marginBottom: '4px' }}>
                    Continue Previous Thread
                  </p>
                  <p style={{ fontSize: '11px', color: '#1f2937' }}>
                    {observationCount} observation{observationCount !== 1 ? 's' : ''} in stream
                  </p>
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
