const CONSTITUTIONAL_PRINCIPLES = [
  {
    number: 1,
    title: 'The Repository Test',
    text: 'No observation becomes institutional truth until it produces a repository consequence.',
    ratified: 'June 2026',
    note: 'An observation may be correct. A meaning may be profound. A philosophy may be beautiful. None of these advance the institution until something changes in the repository. This principle applies to itself: it was named in conversation, then given a room, because a principle that lives only in conversation violates the principle.',
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
              </div>
              <div style={{ background: 'var(--bg-1)', padding: '14px 20px' }}>
                <p style={{ color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.7 }}>
                  {p.note}
                </p>
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

      <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border-1)' }}>
        <p style={{ color: 'var(--text-6)', fontSize: '11px', fontStyle: 'italic' }}>
          History is preserved. Canon is promoted.
        </p>
      </div>
    </div>
  )
}
