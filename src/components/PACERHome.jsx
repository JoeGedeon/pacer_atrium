// Blue Pineapple: doctrine, not decoration.
const BLUE_PINEAPPLE_FILTER = 'hue-rotate(160deg) saturate(2) brightness(1.1)'

export default function PACERHome({ onEnter, observationCount, onMorningBrief, campusStats, isMobile }) {
  return (
    <div
      className="flex-1 flex flex-col items-center overflow-y-auto"
      style={{ background: 'var(--bg-0)' }}
    >
      <div
        className="text-center w-full"
        style={{
          maxWidth: isMobile ? '420px' : '680px',
          padding: isMobile ? '48px 24px 40px' : '64px 48px 48px',
        }}
      >

        {/* Official Seal — Arrival Hall. Crest, not badge. No frame, no shadow, no elevation. */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <img
            src="/pacer-seal.png"
            alt="PACER"
            style={{ width: '88px', height: '88px', objectFit: 'contain' }}
          />
        </div>

        <p style={{ color: 'var(--text-5)', fontSize: '10px', letterSpacing: '0.12em',
          textTransform: 'uppercase', marginBottom: '20px' }}>
          Reality voted. Architecture adapted.
        </p>

        <p style={{ color: 'var(--text-2)', fontSize: '14px', marginBottom: '6px' }}>
          There is room. Come in.
        </p>

        <p style={{ color: 'var(--text-4)', fontSize: '12px', marginBottom: '32px' }}>
          Come in with respect.
        </p>

        <p style={{
          color: 'var(--text-3)', fontSize: '12px', lineHeight: 1.8,
          fontStyle: 'italic', marginBottom: '40px',
          borderTop: '1px solid var(--border-0)', borderBottom: '1px solid var(--border-0)',
          padding: '16px 0',
        }}>
          How do we preserve what matters while moving it forward?
        </p>

        <div className="flex flex-col gap-3">

          {/* Morning Brief — top action */}
          <button
            onClick={onMorningBrief}
            className="w-full rounded-lg text-left transition-all"
            style={{
              background: '#0a0f1e',
              border: '1px solid #6366f1',
              padding: '16px 20px',
              cursor: 'pointer',
            }}
          >
            <div className="flex items-center gap-4">
              <span style={{ fontSize: '20px', filter: BLUE_PINEAPPLE_FILTER }}>🍍</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#a5b4fc', marginBottom: '4px' }}>
                  Morning Brief
                </p>
                <p style={{ fontSize: '11px', color: '#3730a3' }}>
                  What requires your attention today
                </p>
              </div>
            </div>
          </button>

          {/* Capture Observation */}
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
                <p className="text-sm font-semibold" style={{ color: '#93c5fd', marginBottom: '4px' }}>
                  Capture Observation
                </p>
                <p style={{ fontSize: '11px', color: '#1d3a6a' }}>Enter the Atrium</p>
              </div>
            </div>
          </button>

          {/* Archivist Hall */}
          <button
            onClick={() => onEnter('archive')}
            className="w-full rounded-lg text-left transition-all"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border-1)', padding: '16px 20px', cursor: 'pointer' }}
          >
            <div className="flex items-center gap-4">
              <span style={{ fontSize: '20px' }}>📚</span>
              <div>
                <p className="text-sm" style={{ color: 'var(--text-2)', marginBottom: '4px' }}>Archivist Hall</p>
                <p style={{ fontSize: '11px', color: 'var(--text-5)' }}>Memory and institutional record</p>
              </div>
            </div>
          </button>

          {/* Continue thread — only when observations exist */}
          {observationCount > 0 && (
            <button
              onClick={() => onEnter('atrium')}
              className="w-full rounded-lg text-left transition-all"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--border-1)', padding: '16px 20px', cursor: 'pointer' }}
            >
              <div className="flex items-center gap-4">
                <span style={{ fontSize: '20px' }}>◎</span>
                <div>
                  <p className="text-sm" style={{ color: 'var(--text-2)', marginBottom: '4px' }}>Continue Previous Thread</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-5)' }}>
                    {observationCount} observation{observationCount !== 1 ? 's' : ''} in stream
                  </p>
                </div>
              </div>
            </button>
          )}

        </div>

        {/* Creator-only beta pulse — three numbers, nothing more */}
        {campusStats && (
          <div style={{
            marginTop: '32px',
            padding: '14px 20px',
            background: 'var(--bg-1)',
            border: '1px solid var(--border-0)',
            borderRadius: '10px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
              {[
                { label: 'Visitors',     value: campusStats.visitors     || 0 },
                { label: 'Returns',      value: campusStats.returns      || 0 },
                { label: 'Observations', value: campusStats.observations || 0 },
              ].map(({ label, value }) => (
                <div key={label} style={{ textAlign: 'center', flex: 1 }}>
                  <p style={{ color: 'var(--text-0)', fontSize: '20px', fontWeight: 700, lineHeight: 1 }}>
                    {value}
                  </p>
                  <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.12em',
                    textTransform: 'uppercase', marginTop: '5px' }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
            {/* Raw browser voice test — no PACER routing, no state, no AI */}
            <button
              onClick={() => {
                const utt = new SpeechSynthesisUtterance('PACER voice test successful.')
                console.debug('[PACER raw test] speak() called, voices:', window.speechSynthesis?.getVoices()?.length)
                window.speechSynthesis?.speak(utt)
              }}
              style={{
                width: '100%', fontFamily: 'inherit', cursor: 'pointer',
                background: 'var(--bg-0)', border: '1px solid var(--border-1)',
                borderRadius: '6px', padding: '7px 12px',
                color: 'var(--text-5)', fontSize: '10px', letterSpacing: '0.06em',
              }}
            >
              ▶ Raw Voice Test
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
