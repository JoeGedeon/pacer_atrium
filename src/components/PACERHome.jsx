// Blue Pineapple: doctrine, not decoration.
const BLUE_PINEAPPLE_FILTER = 'hue-rotate(160deg) saturate(2) brightness(1.1)'

// Constellation — memory pathways, not a map.
// Hub at index 6 (KODEX) — shifted right to align with the atmospheric orb
// behind the E-R arc of the seal. Nodes converge toward that anchor, not center.
const NODES = [
  [14, 15], [78, 10], [90, 44], [68, 82],   // 0-3
  [20, 76], [7, 55],  [64, 32], [42, 68],   // 4-7  (hub moved: 50,38 → 64,32)
  [72, 18], [35, 25], [82, 60], [28, 52],   // 8-11 (MUSE moved: 62,22 → 72,18)
  [56, 90],                                  // 12
]
const EDGES = [
  [0, 6], [1, 8], [8, 6], [6, 2], [6, 7],  // original arms
  [3, 7], [4, 7], [5, 4], [5, 0],           // original periphery
  [9, 6], [10, 2], [11, 7], [12, 7],        // new branches
  [10, 3], [9, 0],                           // long connectors
]

// Campus landmarks — one symbol per room. Faint glyphs, not labels.
// Null entries are ambient connectors with no named destination.
const NODE_GLYPH = [
  '🛡',  // 0  VERA — sentinel
  '💼',  // 1  Business
  '🎭',  // 2  Theater
  '🏝',  // 3  Isles
  '📚',  // 4  Archivist Hall
  '⚖',   // 5  Doctrine
  '🧭',  // 6  KODEX — compass of the campus
  '⚒',   // 7  K.E.L. Forge
  '🎨',  // 8  MUSE
  '🍍',  // 9  Atrium
  null,   // 10 ambient
  null,   // 11 ambient
  null,   // 12 ambient
]

// Per-node pulse config: [duration(s), beginDelay(s), minOpacity, maxOpacity]
// Hub (index 6) is brightest and fastest. VERA (0) barely moves.
const NODE_PULSE = [
  [9.0, 0.0,  0.4, 0.70],  // 0  VERA — sentinel, almost still
  [5.5, 1.2,  0.4, 0.88],  // 1  Business
  [6.0, 0.7,  0.4, 0.85],  // 2  Theater
  [7.0, 2.1,  0.3, 0.80],  // 3  Isles — organic drift
  [7.5, 0.4,  0.5, 0.85],  // 4  Archivist — memory never sleeps
  [8.0, 3.0,  0.4, 0.88],  // 5  Doctrine — slow, deliberate
  [4.8, 0.0,  0.5, 1.00],  // 6  KODEX hub — brightest
  [4.5, 1.8,  0.5, 0.95],  // 7  KEL Forge — quick pulse
  [5.5, 2.5,  0.4, 0.90],  // 8  MUSE
  [5.0, 0.5,  0.4, 1.00],  // 9  Atrium — warm welcome
  [6.5, 3.5,  0.4, 0.80],  // 10
  [7.5, 1.0,  0.4, 0.80],  // 11
  [6.5, 4.0,  0.3, 0.75],  // 12
]

// Fixed atmospheric layer — mounts with PACERHome, unmounts on navigation.
// No interaction, no scroll effect. Environmental storytelling.
function CampusAtmosphere() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>

      {/* Giant blue pineapple — the spirit behind the crest.                        */}
      {/* Spine centered with seal pineapple. left:48% corrects a ~20-25px visual   */}
      {/* rightward drift from emoji bounding box asymmetry. All three axes should   */}
      {/* share one vertical: pineapple crown → seal pineapple → mission center.    */}
      <div style={{
        position: 'absolute',
        top: '35%', left: '48%',
        transform: 'translate(-50%, -50%)',
        fontSize: '500px', lineHeight: 1,
        filter: BLUE_PINEAPPLE_FILTER,
        opacity: 0.025,
        userSelect: 'none',
      }}>🍍</div>

      {/* Palm silhouette — upper right, counterweight to the centered pineapple */}
      <div style={{
        position: 'absolute',
        top: '-30px', right: '-20px',
        fontSize: '260px', lineHeight: 1,
        opacity: 0.035,
        transform: 'rotate(12deg)',
        userSelect: 'none',
      }}>🌴</div>

      {/* Constellation + maritime arcs */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <defs>
          {/* Soft glow filter for pulsing nodes */}
          <filter id="node-glow" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.0" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Navigation arcs — very faint, like old maritime charts */}
        <g fill="none" stroke="#6366f1" strokeWidth="0.09" opacity="0.05">
          <path d="M 0 22 Q 50 8 100 22" />
          <path d="M 0 78 Q 50 92 100 78" />
          <path d="M 20 0 Q 8 50 20 100" />
        </g>

        {/* Static edges */}
        <g stroke="#6366f1" strokeWidth="0.12" opacity="0.09">
          {EDGES.map(([a, b], i) => (
            <line key={i}
              x1={NODES[a][0]} y1={NODES[a][1]}
              x2={NODES[b][0]} y2={NODES[b][1]}
            />
          ))}
        </g>

        {/* Breathing nodes — each on its own rhythm */}
        {NODES.map(([cx, cy], i) => {
          const isHub = i === 6
          const r = isHub ? 1.0 : 0.62
          const [dur, begin, minOp, maxOp] = NODE_PULSE[i] || [6, 0, 0.4, 0.8]
          const rPeak = r * (isHub ? 1.65 : 1.4)
          const durStr = `${dur}s`
          const beginStr = `${begin}s`
          return (
            <circle key={i} cx={cx} cy={cy} fill="#6366f1"
              filter={isHub ? 'url(#node-glow)' : undefined}
            >
              <animate attributeName="r"
                values={`${r};${rPeak};${r}`}
                dur={durStr} begin={beginStr}
                repeatCount="indefinite" calcMode="ease" />
              <animate attributeName="opacity"
                values={`${minOp};${maxOp};${minOp}`}
                dur={durStr} begin={beginStr}
                repeatCount="indefinite" calcMode="ease" />
            </circle>
          )
        })}

        {/* Campus landmark glyphs — carved into the background, not announced */}
        <g fontSize="4" textAnchor="middle" dominantBaseline="central"
          opacity="0.07" style={{ userSelect: 'none', pointerEvents: 'none' }}>
          {NODES.map(([cx, cy], i) => {
            const glyph = NODE_GLYPH[i]
            if (!glyph) return null
            const isHub = i === 6
            return (
              <text key={i} x={cx} y={cy}
                fontSize={isHub ? '5' : '4'}>
                {glyph}
              </text>
            )
          })}
        </g>
      </svg>

    </div>
  )
}

export default function PACERHome({ onEnter, observationCount, onMorningBrief, campusStats, isMobile, googleStatus, onReconnectGoogle, debugUid, debugEmail, debugProjectId, institutionStatus }) {
  return (
    <div
      className="flex-1 flex flex-col items-center overflow-y-auto"
      style={{ background: 'var(--bg-0)' }}
    >
      <CampusAtmosphere />

      <div
        className="text-center w-full"
        style={{
          maxWidth: isMobile ? '420px' : '680px',
          padding: isMobile ? '48px 24px 40px' : '64px 48px 48px',
          position: 'relative',
          zIndex: 1,
        }}
      >

        {/* Seal — architecture, not branding. Large enough to feel like a building. */}
        {/* opacity: 1.0 — the PNG's translucent cream center handles atmosphere bleed. */}
        {/* The outer ring and doctrine arc must be fully legible at all times.        */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '48px' }}>
          <img
            src="/pacer-seal.png"
            alt="PACER"
            style={{
              width: isMobile ? '230px' : '350px',
              height: isMobile ? '230px' : '350px',
              objectFit: 'contain',
              opacity: 1.0,
            }}
          />
        </div>

        <p style={{
          color: 'var(--text-1)', fontSize: '13px', lineHeight: 1.8,
          fontStyle: 'italic', marginBottom: '40px',
          marginTop: '4px',
        }}>
          How do we preserve what matters while moving it forward?
        </p>

        {/* Google reconnect notice — shown only when session expired and manual reconnect needed */}
        {googleStatus === 'reconnect-required' && onReconnectGoogle && (
          <button
            onClick={onReconnectGoogle}
            style={{
              width: '100%', textAlign: 'left', fontFamily: 'inherit',
              background: '#1c1400', border: '1px solid #92400e',
              borderRadius: '8px', padding: '10px 16px', cursor: 'pointer',
              marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px',
            }}
          >
            <span style={{ fontSize: '14px' }}>↺</span>
            <div>
              <p style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 600, marginBottom: '2px' }}>
                Google session expired
              </p>
              <p style={{ color: '#92400e', fontSize: '10px' }}>
                Tap to restore calendar and email access
              </p>
            </div>
          </button>
        )}

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

        {/* Institution status pulse — visible when commands exist */}
        {institutionStatus && institutionStatus.total > 0 && (
          <div style={{
            marginTop: '14px',
            padding: '10px 16px',
            background: 'var(--bg-1)',
            border: '1px solid var(--border-0)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '8px', flexWrap: 'wrap',
          }}>
            {[
              { label: 'Active',       value: institutionStatus.active,    color: '#3b82f6' },
              { label: 'Pending Gate', value: institutionStatus.pending,   color: '#f59e0b' },
              { label: 'Completed',    value: institutionStatus.completed, color: '#10b981' },
            ].map(({ label, value, color }, i) => (
              <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {i > 0 && <span style={{ color: 'var(--border-1)', fontSize: '10px' }}>·</span>}
                <span style={{ color: 'var(--text-5)', fontSize: '10px' }}>
                  {label}:{' '}<span style={{ color, fontWeight: 700 }}>{value}</span>
                </span>
              </span>
            ))}
          </div>
        )}

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

            {/* Auth/project debug strip — creator only, shows live session state */}
            <div style={{
              marginTop: '10px', padding: '8px 10px',
              background: 'var(--bg-0)', border: '1px solid var(--border-0)',
              borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '3px',
            }}>
              <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.1em',
                textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                Session Debug
              </p>
              <p style={{ color: debugUid ? '#10b981' : '#ef4444', fontSize: '9px', fontFamily: 'monospace' }}>
                uid: {debugUid ? `${debugUid.slice(0, 8)}…${debugUid.slice(-4)}` : 'NOT SIGNED IN'}
              </p>
              <p style={{ color: 'var(--text-5)', fontSize: '9px', fontFamily: 'monospace' }}>
                email: {debugEmail || '—'}
              </p>
              <p style={{ color: 'var(--text-5)', fontSize: '9px', fontFamily: 'monospace' }}>
                project: {debugProjectId || '—'}
              </p>
              <p style={{ color: observationCount > 0 ? '#10b981' : '#f59e0b', fontSize: '9px', fontFamily: 'monospace' }}>
                observations: {observationCount}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
