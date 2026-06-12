const CONSTITUTIONAL_PRINCIPLES = [
  {
    number: 1,
    title: 'The Repository Test',
    text: 'No observation becomes institutional truth until it produces a repository consequence.',
    ratified: 'June 2026',
    note: 'An observation may be correct. A meaning may be profound. A philosophy may be beautiful. None of these advance the institution until something changes in the repository. This principle applies to itself: it was named in conversation, then given a room, because a principle that lives only in conversation violates the principle.',
  },
  {
    number: 2,
    title: 'The Last Inch Principle',
    text: 'A successful system is not measured by what it creates. A successful system is measured by what arrives.',
    ratified: 'June 2026',
    duties: [
      { n: 1, name: 'Identify the Path',      desc: 'Determine where something needs to go and what stands between origin and destination.' },
      { n: 2, name: 'Clear the Obstruction',  desc: 'Expose friction, conflicts, bottlenecks, and barriers that prevent movement.' },
      { n: 3, name: 'Protect the Cargo',      desc: 'Preserve the integrity of the observation, truth, decision, or artifact while it travels through the system.' },
      { n: 4, name: 'Document the Journey',   desc: 'Record what happened, why it happened, and how it arrived.' },
      { n: 5, name: 'Deliver the Outcome',    desc: 'Ensure the intended result reaches its destination intact and usable.' },
    ],
    note: 'Most failures do not occur at the point of creation. Most failures occur during transit. An idea can be correct and still arrive damaged. A truth can be observed and still fail to reach the people who need it. A decision can be approved and still fail in execution. The responsibility of a system is not merely to create value. The responsibility of a system is to preserve value while it moves. These duties apply equally to ideas, decisions, records, people, projects, and physical objects.',
    closing: 'The observation that enters the system should be recognizable when it leaves. Nothing important should be lost in the hallway.',
  },
]

const CANDIDATE_PRINCIPLES = [
  {
    id: 'shake-the-tree',
    text: 'What survives scrutiny is what marches.',
    inConsideration: 'June 2026',
    note: 'Rooted in thirty years of operational reality, the Marching 100 tradition, and the behavior of palm trees in Florida hurricanes. The weak preparation falls away. The excuses fall away. The inconsistency falls away. What remains is not declared worthy — it proves itself worthy by still being present. A principle earns the wall by surviving the shaking, not by being proclaimed from it. Currently in the shaking phase.',
  },
  {
    id: 'three-filters',
    text: 'Survive the storm. Survive the shake. Produce a consequence.',
    inConsideration: 'June 2026',
    note: 'Three independent domains — Florida hurricane resilience, FAMU tree-shaking culture, and repository consequence discipline — converged on the same filtering pattern without coordination. The pattern appears recurrent rather than invented. What passes all three filters probably belongs. What passes long enough probably earns the wall. The order matters: resilience first, then scrutiny, then consequence. Future builders may challenge the sequence. Good. Let them.',
  },
  {
    id: 'declared-observed',
    text: 'Declared State is what was intended. Observed State is what exists. Governance is the comparison between them.',
    inConsideration: 'June 2026',
    note: 'The gap between Declared State and Observed State is where governance begins. Without observation, intention becomes assumption. Without declaration, observation becomes noise. Institutions endure by continuously reconciling the two. A missing toggle, a missed invoice, an orphaned principle — the mechanism is the same at every scale. Recognizing the gap is governance. Restoring it is execution. Recording why it disappeared is memory. Preventing it from disappearing again is institutional learning. PACER\'s entire architecture is an attempt to perform this comparison continuously.',
  },
]

const PRINCIPLES = [
  { id: 1,  text: 'Operational Honesty is when reality and the record match.',   tag: 'Foundation'   },
  { id: 2,  text: 'Execution requires human approval.',                           tag: 'Governance'   },
  { id: 3,  text: 'Observations precede conclusions.',                            tag: 'Epistemology' },
  { id: 4,  text: 'Memory preserves context.',                                    tag: 'Architecture' },
  { id: 5,  text: 'Systems serve people.',                                        tag: 'Foundation'   },
  { id: 6,  text: 'Reality outranks assumptions.',                                tag: 'Epistemology' },
  { id: 7,  text: 'Patterns require evidence.',                                   tag: 'Epistemology' },
  { id: 8,  text: 'Transparency creates trust.',                                  tag: 'Foundation'   },
  { id: 9,  text: 'History is preserved. Canon is promoted.',                    tag: 'Preservation' },
  { id: 10, text: 'Consequences teach systems.',                                  tag: 'Architecture' },
  { id: 11, text: 'Understanding precedes optimization.',                         tag: 'Architecture' },
  { id: 12, text: 'Doctrine determines what is possible, not what is required.', tag: 'Governance'   },
]

const CANONIZATIONS = [
  {
    id: 'pacer-lifecycle',
    title: 'The Six States of a PACER Object',
    fields: [
      { label: 'State 01', value: 'Observed — noticed, received into the campus' },
      { label: 'State 02', value: 'Shaping — being worked, not yet coherent' },
      { label: 'State 03', value: 'Structured — coherent, category and form assigned' },
      { label: 'State 04', value: 'Premiere Ready — creator declares it ready' },
      { label: 'State 05', value: 'Opening Night — curtain opens, campus receives it' },
      { label: 'State 06', value: 'Published Memory — institutionalized, Archive claims it' },
    ],
    note: 'A FleetFlow incident, an Isles character, a Doctrine principle, a song, a patent, a business strategy — all move through the same six states. The lifecycle is not navigation. It is evolution. No state may be skipped. No new states may be added without a canonization decision. These six are sufficient because each represents a fundamentally different condition of existence.',
    closing: ['One lifecycle.', 'All content.'],
    realm: 'PACER University',
  },
  {
    id: 'campus-rule-001',
    title: 'PACER Campus Rule #001 — Infrastructure Is Declared Once',
    fields: [
      { label: 'Rule',    value: 'Infrastructure is declared once. Behavior is inherited everywhere.' },
      { label: 'Layer 1', value: 'Campus Infrastructure — declares reality (theme, auth, nav, design tokens)' },
      { label: 'Layer 2', value: 'Buildings — rooms inherit, they do not reinvent' },
      { label: 'Layer 3', value: 'Standalone Artifacts — may carry inline theme when disconnected from campus' },
      { label: 'Status',  value: 'Locked · In Force' },
    ],
    note: 'Authentication, navigation, theme, and institutional state are campus responsibilities. Rooms consume them. Rooms do not recreate them. A room that defines its own theme engine has admitted a raccoon to the server closet.',
    closing: ['Rooms consume.', 'Rooms do not recreate.'],
    realm: 'PACER Campus',
  },
  {
    id: 'aiziano-canon',
    title: 'Canon Record 002 — Aiziano',
    fields: [
      { label: 'Character',      value: 'Aiziano' },
      { label: 'Status',         value: 'Confirmed' },
      { label: 'Classification', value: 'Foundational Character' },
      { label: 'Kodex',          value: 'Blue · Natural' },
    ],
    note: 'Aiziano is a foundational character within Isles of the Awakening. He carries the blue Kodex resonance — natural, originary, deeply connected to the mythology of the Isles. His identity is complete within the world.',
    closing: ['Aiziano is the canonical identity.'],
    realm: 'Isles of the Awakening',
  },
]

const CHARTER_WINGS = [
  {
    id: 'threshold',
    name: 'Threshold Wing',
    rooms: [
      {
        icon: '🍍',
        name: 'Atrium',
        purpose: 'Receives observations. Makes no judgments. Rejects nothing.',
        authority: ['Intake'],
        cannot: ['Recommend', 'Approve', 'Execute', 'Manifest'],
      },
    ],
  },
  {
    id: 'cognitive',
    name: 'Cognitive Wing',
    rooms: [
      {
        icon: '🎭',
        name: 'MUSE',
        purpose: 'Inspects observations before manifestation. Creative Director. Customs Officer. Sits between Governance and Theater — part of neither.',
        authority: ['Manifest Decision', 'Routing recommendation', 'Cargo inspection', 'Timing judgment'],
        cannot: ['Create', 'Generate', 'Approve', 'Execute', 'Touch the wheel'],
      },
      {
        icon: '✨',
        name: 'VERA',
        purpose: 'Witnesses reality.',
        authority: ['Verification', 'Evidence', 'Observation integrity'],
        cannot: ['Imagine', 'Recommend', 'Execute'],
      },
      {
        icon: '📍',
        name: 'K.E.L.',
        purpose: 'Points at the map. Does not touch the wheel.',
        authority: ['Recommendation', 'Prioritization', 'Readiness review'],
        cannot: ['Approve', 'Execute', 'Override humans'],
      },
    ],
  },
  {
    id: 'production',
    name: 'Production Wing',
    rooms: [
      {
        icon: '🎬',
        name: 'Theater',
        purpose: 'Receives staged observations. Asks: how should this be experienced?',
        authority: ['Manifestation'],
        cannot: ['Govern', 'Validate', 'Execute operations'],
        studios: ['Image Studio', 'Story Studio', 'Infographic Studio', 'Presentation Studio', 'Motion Studio', 'Sound Studio'],
      },
    ],
  },
  {
    id: 'operational',
    name: 'Operational Wing',
    rooms: [
      {
        icon: '🏢',
        name: 'Business',
        purpose: 'Receives approved decisions. Asks: how does this become action?',
        authority: ['Execution bridge', 'FleetFlow integration', 'Operational deployment'],
        cannot: ['Generate doctrine', 'Rewrite recommendations'],
      },
    ],
  },
  {
    id: 'memory',
    name: 'Memory Wing',
    rooms: [
      {
        icon: '📚',
        name: 'Archivist Hall',
        purpose: 'Preserves. Retrieves. Maintains historical continuity.',
        authority: ['Preservation', 'Retrieval', 'Historical continuity'],
        cannot: ['Recommend', 'Execute', 'Manifest'],
      },
    ],
  },
  {
    id: 'governance',
    name: 'Governance Wing',
    rooms: [
      {
        icon: '📜',
        name: 'Doctrine',
        purpose: 'Holds the institutional constitution.',
        authority: ['Principles', 'Constitutional records', 'Institutional law'],
        cannot: ['Execute'],
      },
    ],
  },
]

const MUSE_MANDATE = {
  title: 'MUSE — Institutional Mandate',
  locked: 'June 2026',
  plaque: [
    'Inspect the cargo.',
    'Protect the truth.',
    'Choose the path.',
    'Recommend the journey.',
    'Do not touch the wheel.',
  ],
  role: 'Creative Director · Customs Officer',
  description: 'MUSE exists to evaluate observations before manifestation. MUSE does not create. MUSE does not approve. MUSE does not execute. MUSE inspects.',
  questions: [
    'What is this?',
    'Is it intact?',
    'Where does it belong?',
    'Should it travel?',
    'Is now the right time?',
  ],
  decisions: [
    { key: 'manifest',        label: 'Manifest',          note: 'Cargo is worth protecting through production.' },
    { key: 'do_not_manifest', label: 'Do Not Manifest',   note: 'No container preserves this intact. Do not ship damaged goods.' },
    { key: 'route_business',  label: 'Route to Business', note: 'Wrong studio for this cargo. Redirect to operational execution.' },
    { key: 'route_doctrine',  label: 'Route to Doctrine', note: 'Carries a principle or constitutional insight. Doctrine should receive it.' },
    { key: 'archive_only',    label: 'Archive Only',      note: 'Worth preserving. The destination is not ready. Timing matters.' },
  ],
  boundary: 'These are recommendations, not authorizations. The Human Gate retains authority. Theater retains execution. MUSE protects the cargo before the journey begins.',
  warning: 'The moment MUSE touches the wheel, the separation of powers collapses.',
}

const HUMAN_GATE = {
  purpose: 'Every path crosses it. The center of PACER is not Muse, not K.E.L., not Theater, not Business. The center is the Human Gate.',
  authority: ['Approve', 'Deny', 'Override', 'Escalate'],
  cannot: ['Rewrite reality'],
  note: 'Most AI systems are trying to remove the human. PACER makes the human more important. The system becomes smarter specifically because it refuses to remove accountability. In a world determined to automate responsibility out of existence, that is a surprisingly radical design choice.',
}

const TAG_COLORS = {
  Foundation:   '#f59e0b',
  Governance:   '#3b82f6',
  Epistemology: '#10b981',
  Architecture: '#8b5cf6',
  Preservation: '#06b6d4',
}

export default function DoctrineRoom({ isMobile }) {
  const px = isMobile ? '24px' : '40px'

  return (
    <div className="flex-1 flex flex-col overflow-y-auto"
      style={{ background: 'var(--bg-0)', padding: `32px ${px}` }}
    >
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
          College of Understanding
        </p>
        <h2 style={{ fontSize: '18px', color: 'var(--text-0)', fontWeight: 700,
          letterSpacing: '0.08em', marginBottom: '6px' }}>Doctrine</h2>
        <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic',
          marginBottom: '6px' }}>
          The institution governs itself.
        </p>
        <p style={{ color: 'var(--text-5)', fontSize: '11px' }}>
          {CONSTITUTIONAL_PRINCIPLES.length} constitutional
          {' · '}{CANDIDATE_PRINCIPLES.length} candidate
          {' · '}{PRINCIPLES.length} principles
          {' · '}{CANONIZATIONS.length} canonization{CANONIZATIONS.length !== 1 ? 's' : ''}
          {' · '}{CHARTER_WINGS.length} wings chartered
        </p>
      </div>

      {/* Constitutional Principles — the wall */}
      <section style={{ maxWidth: '600px', marginBottom: '40px' }}>
        <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 600, marginBottom: '16px' }}>
          Constitutional Principles
        </p>
        <div className="flex flex-col gap-4">
          {CONSTITUTIONAL_PRINCIPLES.map(p => (
            <div key={p.number} style={{
              border: '1px solid #f59e0b40',
              borderLeft: '3px solid #f59e0b',
              borderRadius: '0 10px 10px 0',
              overflow: 'hidden',
            }}>
              <div style={{ background: '#0a0800', padding: '16px 20px',
                borderBottom: '1px solid #f59e0b20' }}>
                <div style={{ display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                  <p style={{ color: '#f59e0b', fontSize: '9px', fontWeight: 700,
                    letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    Principle #{p.number} — {p.title}
                  </p>
                  <span style={{ color: 'var(--text-6)', fontSize: '9px',
                    letterSpacing: '0.08em', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    Ratified {p.ratified}
                  </span>
                </div>
                <p style={{ color: 'var(--text-0)', fontSize: '14px', fontWeight: 600,
                  lineHeight: 1.6 }}>
                  {p.text}
                </p>
                {p.duties && (
                  <div style={{ marginTop: '16px', paddingTop: '14px',
                    borderTop: '1px solid #f59e0b15' }}>
                    <p style={{ color: '#f59e0b50', fontSize: '9px', letterSpacing: '0.12em',
                      textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>
                      Five Operational Duties
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {p.duties.map(d => (
                        <div key={d.n} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <p style={{ color: '#f59e0b50', fontSize: '10px', fontWeight: 700,
                            flexShrink: 0, minWidth: '16px', paddingTop: '1px' }}>
                            {d.n}.
                          </p>
                          <div>
                            <p style={{ color: '#f59e0bcc', fontSize: '11px',
                              fontWeight: 600, marginBottom: '2px' }}>
                              {d.name}
                            </p>
                            <p style={{ color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.6 }}>
                              {d.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ background: 'var(--bg-1)', padding: '14px 20px' }}>
                <p style={{ color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.7 }}>
                  {p.note}
                </p>
                {p.closing && (
                  <p style={{ color: '#f59e0b90', fontSize: '11px', fontStyle: 'italic',
                    marginTop: '12px', lineHeight: 1.7 }}>
                    {p.closing}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Candidate Principles — in the shaking phase */}
      <section style={{ maxWidth: '600px', marginBottom: '40px' }}>
        <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
          Candidate Principles
        </p>
        <p style={{ color: 'var(--text-6)', fontSize: '10px', fontStyle: 'italic',
          marginBottom: '16px' }}>
          In the shaking phase. Not yet ratified. Not yet on the wall.
        </p>
        <div className="flex flex-col gap-4">
          {CANDIDATE_PRINCIPLES.map(p => (
            <div key={p.id} style={{
              border: '1px dashed var(--border-1)',
              borderLeft: '3px dashed var(--border-1)',
              borderRadius: '0 10px 10px 0',
              overflow: 'hidden',
            }}>
              <div style={{ background: 'var(--bg-1)', padding: '16px 20px',
                borderBottom: '1px solid var(--border-0)' }}>
                <div style={{ display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                  <p style={{ color: 'var(--text-5)', fontSize: '9px', fontWeight: 600,
                    letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                    Candidate
                  </p>
                  <span style={{ color: 'var(--text-6)', fontSize: '9px',
                    letterSpacing: '0.08em', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    In consideration since {p.inConsideration}
                  </span>
                </div>
                <p style={{ color: 'var(--text-2)', fontSize: '13px', fontWeight: 500,
                  lineHeight: 1.6, fontStyle: 'italic' }}>
                  {p.text}
                </p>
              </div>
              <div style={{ background: 'var(--bg-0)', padding: '14px 20px' }}>
                <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.7 }}>
                  {p.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Operating Principles */}
      <section style={{ maxWidth: '600px', marginBottom: '36px' }}>
        <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 600, marginBottom: '12px' }}>
          Operating Principles
        </p>
        <div className="flex flex-col gap-3">
          {PRINCIPLES.map(p => (
            <div key={p.id} className="rounded-lg"
              style={{ background: 'var(--bg-2)', border: `1px solid ${TAG_COLORS[p.tag]}18`,
                padding: '14px 18px' }}
            >
              <div className="flex items-start gap-4">
                <span className="shrink-0 font-bold"
                  style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '2px', minWidth: '18px' }}>
                  {String(p.id).padStart(2, '0')}
                </span>
                <div className="flex-1">
                  <p className="text-sm leading-relaxed"
                    style={{ color: 'var(--text-1)', marginBottom: '8px' }}>
                    {p.text}
                  </p>
                  <span className="text-xs" style={{ color: TAG_COLORS[p.tag] + '99' }}>{p.tag}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Canonization Records */}
      <section style={{ maxWidth: '600px', marginBottom: '32px' }}>
        <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 600, marginBottom: '12px' }}>
          Canonization Records
        </p>
        <div className="flex flex-col gap-4">
          {CANONIZATIONS.map(entry => (
            <div key={entry.id} className="rounded-lg"
              style={{ background: 'var(--bg-2)', border: '1px solid #10b98118', padding: '18px 20px' }}
            >
              <p style={{ color: 'var(--text-4)', fontSize: '9px', letterSpacing: '0.12em',
                textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                Doctrine Entry
              </p>
              <h3 style={{ fontSize: '13px', color: 'var(--text-0)', fontWeight: 700,
                letterSpacing: '0.08em', marginBottom: '16px' }}>
                {entry.title}
              </h3>
              <div className="flex flex-col gap-2" style={{ marginBottom: '16px' }}>
                {entry.fields.map(f => (
                  <div key={f.label} className="flex items-baseline gap-3">
                    <span style={{ color: 'var(--text-4)', fontSize: '11px',
                      flexShrink: 0, minWidth: '150px' }}>{f.label}</span>
                    <span style={{ color: 'var(--text-1)', fontSize: '11px' }}>{f.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--border-1)', paddingTop: '14px',
                marginBottom: '12px' }}>
                <p style={{ color: 'var(--text-4)', fontSize: '9px', marginBottom: '6px' }}>
                  Doctrine Note
                </p>
                <p style={{ color: 'var(--text-3)', fontSize: '12px', lineHeight: 1.7 }}>
                  {entry.note}
                </p>
              </div>
              {entry.closing.map((line, i) => (
                <p key={i} style={{ color: i === 0 ? '#10b98160' : '#10b981aa',
                  fontSize: '11px', marginTop: '4px' }}>
                  {line}
                </p>
              ))}
              <p style={{ color: 'var(--text-6)', fontSize: '10px', marginTop: '12px' }}>
                {entry.realm}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Governance Charter */}
      <section style={{ maxWidth: '600px', marginBottom: '40px' }}>
        <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
          Governance Charter
        </p>
        <p style={{ color: 'var(--text-6)', fontSize: '10px', fontStyle: 'italic',
          marginBottom: '20px' }}>
          Who is allowed to do what. Established June 2026.
        </p>

        {/* Human Gate — center of the campus */}
        <div style={{
          border: '1px solid #f59e0b40',
          borderLeft: '3px solid #f59e0b',
          borderRadius: '0 10px 10px 0',
          overflow: 'hidden',
          marginBottom: '20px',
        }}>
          <div style={{ background: '#0a0800', padding: '14px 18px',
            borderBottom: '1px solid #f59e0b20' }}>
            <p style={{ color: '#f59e0b', fontSize: '9px', fontWeight: 700,
              letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '6px' }}>
              👤 The Human Gate — Steward
            </p>
            <p style={{ color: 'var(--text-2)', fontSize: '12px', lineHeight: 1.7 }}>
              {HUMAN_GATE.purpose}
            </p>
          </div>
          <div style={{ background: 'var(--bg-1)', padding: '12px 18px',
            display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.1em',
                textTransform: 'uppercase', marginBottom: '6px' }}>Authority</p>
              <div className="flex flex-col gap-1">
                {HUMAN_GATE.authority.map(a => (
                  <p key={a} style={{ color: '#10b981', fontSize: '11px' }}>+ {a}</p>
                ))}
              </div>
            </div>
            <div>
              <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.1em',
                textTransform: 'uppercase', marginBottom: '6px' }}>Cannot</p>
              <div className="flex flex-col gap-1">
                {HUMAN_GATE.cannot.map(c => (
                  <p key={c} style={{ color: '#ef444480', fontSize: '11px' }}>− {c}</p>
                ))}
              </div>
            </div>
          </div>
          <div style={{ background: 'var(--bg-0)', padding: '12px 18px',
            borderTop: '1px solid #f59e0b20' }}>
            <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.7 }}>
              {HUMAN_GATE.note}
            </p>
          </div>
        </div>

        {/* Wings */}
        <div className="flex flex-col gap-4">
          {CHARTER_WINGS.map(wing => (
            <div key={wing.id}>
              <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.12em',
                textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>
                {wing.name}
              </p>
              <div className="flex flex-col gap-2">
                {wing.rooms.map(room => (
                  <div key={room.name} style={{
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border-1)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-0)' }}>
                      <p style={{ color: 'var(--text-1)', fontSize: '12px',
                        fontWeight: 600, marginBottom: '3px' }}>
                        {room.icon} {room.name}
                      </p>
                      <p style={{ color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.6 }}>
                        {room.purpose}
                      </p>
                      {room.studios && (
                        <p style={{ color: 'var(--text-6)', fontSize: '10px',
                          marginTop: '6px', fontStyle: 'italic' }}>
                          Contains: {room.studios.join(' · ')}
                        </p>
                      )}
                    </div>
                    <div style={{ padding: '10px 16px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.1em',
                          textTransform: 'uppercase', marginBottom: '5px' }}>Authority</p>
                        <div className="flex flex-col gap-1">
                          {room.authority.map(a => (
                            <p key={a} style={{ color: '#10b98199', fontSize: '11px' }}>+ {a}</p>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.1em',
                          textTransform: 'uppercase', marginBottom: '5px' }}>Cannot</p>
                        <div className="flex flex-col gap-1">
                          {room.cannot.map(c => (
                            <p key={c} style={{ color: '#ef444460', fontSize: '11px' }}>− {c}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MUSE Institutional Mandate */}
      <section style={{ maxWidth: '600px', marginBottom: '40px' }}>
        <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
          Room Mandates
        </p>
        <p style={{ color: 'var(--text-6)', fontSize: '10px', fontStyle: 'italic',
          marginBottom: '20px' }}>
          Constitutional law for individual rooms. Locked. Not subject to revision.
        </p>

        <div style={{
          border: '1px solid #8b5cf640',
          borderLeft: '3px solid #8b5cf6',
          borderRadius: '0 10px 10px 0',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ background: '#08050f', padding: '16px 20px',
            borderBottom: '1px solid #8b5cf620' }}>
            <div style={{ display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
              <p style={{ color: '#8b5cf6', fontSize: '9px', fontWeight: 700,
                letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                🎭 {MUSE_MANDATE.title}
              </p>
              <span style={{ color: 'var(--text-6)', fontSize: '9px',
                letterSpacing: '0.08em', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Locked {MUSE_MANDATE.locked}
              </span>
            </div>
            <p style={{ color: '#8b5cf690', fontSize: '10px', letterSpacing: '0.1em',
              textTransform: 'uppercase', marginBottom: '14px' }}>
              {MUSE_MANDATE.role}
            </p>

            {/* Wall plaque */}
            <div style={{ borderLeft: '2px solid #8b5cf640', paddingLeft: '14px',
              marginBottom: '14px' }}>
              {MUSE_MANDATE.plaque.map((line, i) => (
                <p key={i} style={{
                  color: i === 4 ? '#8b5cf6' : 'var(--text-1)',
                  fontSize: i === 4 ? '13px' : '13px',
                  fontWeight: i === 4 ? 700 : 500,
                  lineHeight: 1.9,
                  fontStyle: 'italic',
                }}>
                  {line}
                </p>
              ))}
            </div>

            <p style={{ color: 'var(--text-3)', fontSize: '12px', lineHeight: 1.7 }}>
              {MUSE_MANDATE.description}
            </p>
          </div>

          {/* Five questions */}
          <div style={{ background: 'var(--bg-1)', padding: '14px 20px',
            borderBottom: '1px solid #8b5cf615' }}>
            <p style={{ color: '#8b5cf660', fontSize: '9px', letterSpacing: '0.12em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>
              Five Questions at the Border
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {MUSE_MANDATE.questions.map((q, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'baseline' }}>
                  <span style={{ color: '#8b5cf640', fontSize: '10px',
                    fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                  <p style={{ color: 'var(--text-3)', fontSize: '12px' }}>{q}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Five decisions */}
          <div style={{ background: 'var(--bg-1)', padding: '14px 20px',
            borderBottom: '1px solid #8b5cf615' }}>
            <p style={{ color: '#8b5cf660', fontSize: '9px', letterSpacing: '0.12em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>
              Five Decisions MUSE May Return
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {MUSE_MANDATE.decisions.map(d => (
                <div key={d.key} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#8b5cf6cc', fontSize: '11px', fontWeight: 600,
                    flexShrink: 0, minWidth: '130px' }}>{d.label}</span>
                  <p style={{ color: 'var(--text-4)', fontSize: '11px',
                    lineHeight: 1.6 }}>{d.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Boundary + warning */}
          <div style={{ background: 'var(--bg-0)', padding: '14px 20px' }}>
            <p style={{ color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.7,
              marginBottom: '10px' }}>
              {MUSE_MANDATE.boundary}
            </p>
            <p style={{ color: '#8b5cf6', fontSize: '11px', fontWeight: 600,
              fontStyle: 'italic' }}>
              {MUSE_MANDATE.warning}
            </p>
          </div>
        </div>
      </section>

      <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border-1)' }}>
        <p style={{ color: 'var(--text-6)', fontSize: '11px', fontStyle: 'italic' }}>
          History is preserved. Canon is promoted.
        </p>
      </div>
    </div>
  )
}
