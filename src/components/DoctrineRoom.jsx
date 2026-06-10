const PRINCIPLES = [
  { id: 1,  text: 'Operational Honesty is when reality and the record match.',  tag: 'Foundation'   },
  { id: 2,  text: 'Execution requires human approval.',                          tag: 'Governance'   },
  { id: 3,  text: 'Observations precede conclusions.',                           tag: 'Epistemology' },
  { id: 4,  text: 'Memory preserves context.',                                   tag: 'Architecture' },
  { id: 5,  text: 'Systems serve people.',                                       tag: 'Foundation'   },
  { id: 6,  text: 'Reality outranks assumptions.',                               tag: 'Epistemology' },
  { id: 7,  text: 'Patterns require evidence.',                                  tag: 'Epistemology' },
  { id: 8,  text: 'Transparency creates trust.',                                 tag: 'Foundation'   },
  { id: 9,  text: 'History is preserved. Canon is promoted.',                   tag: 'Preservation' },
  { id: 10, text: 'Consequences teach systems.',                                 tag: 'Architecture' },
  { id: 11, text: 'Understanding precedes optimization.',                        tag: 'Architecture' },
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

export default function DoctrineRoom() {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto"
      style={{ background: 'var(--bg-0)', padding: '32px 28px' }}
    >
      <div style={{ marginBottom: '32px' }}>
        <p className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: 'var(--text-4)', letterSpacing: '0.15em', marginBottom: '6px' }}
        >Governing Layer</p>
        <h2 className="font-bold"
          style={{ fontSize: '18px', color: 'var(--text-0)', marginBottom: '6px', letterSpacing: '0.08em' }}
        >DOCTRINE</h2>
        <p className="text-xs" style={{ color: 'var(--text-3)', marginBottom: '4px' }}>
          Every room on the campus operates beneath these principles.
        </p>
        <p className="text-xs" style={{ color: 'var(--text-5)' }}>
          {PRINCIPLES.length} principles · {CANONIZATIONS.length} canonization{CANONIZATIONS.length !== 1 ? 's' : ''}
        </p>
      </div>

      <section style={{ marginBottom: '36px' }}>
        <p className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: 'var(--text-4)', letterSpacing: '0.12em', marginBottom: '12px' }}
        >Operating Principles</p>
        <div className="flex flex-col gap-3">
          {PRINCIPLES.map(p => (
            <div key={p.id} className="rounded-lg"
              style={{ background: 'var(--bg-2)', border: `1px solid ${TAG_COLORS[p.tag]}18`, padding: '14px 18px' }}
            >
              <div className="flex items-start gap-4">
                <span className="shrink-0 font-bold"
                  style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '2px', minWidth: '18px' }}
                >{String(p.id).padStart(2, '0')}</span>
                <div className="flex-1">
                  <p className="text-sm leading-relaxed"
                    style={{ color: 'var(--text-1)', marginBottom: '8px' }}
                  >{p.text}</p>
                  <span className="text-xs" style={{ color: TAG_COLORS[p.tag] + '99' }}>{p.tag}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <p className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: 'var(--text-4)', letterSpacing: '0.12em', marginBottom: '12px' }}
        >Canonization Records</p>
        <div className="flex flex-col gap-4">
          {CANONIZATIONS.map(entry => (
            <div key={entry.id} className="rounded-lg"
              style={{ background: 'var(--bg-2)', border: '1px solid #10b98118', padding: '18px 20px' }}
            >
              <p className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: 'var(--text-4)', letterSpacing: '0.12em', marginBottom: '4px' }}
              >Doctrine Entry</p>
              <h3 className="font-bold"
                style={{ fontSize: '13px', color: 'var(--text-0)', letterSpacing: '0.08em', marginBottom: '16px' }}
              >{entry.title}</h3>
              <div className="flex flex-col gap-2" style={{ marginBottom: '16px' }}>
                {entry.fields.map(f => (
                  <div key={f.label} className="flex items-baseline gap-3">
                    <span className="text-xs shrink-0" style={{ color: 'var(--text-4)', minWidth: '150px' }}>{f.label}</span>
                    <span className="text-xs" style={{ color: 'var(--text-1)' }}>{f.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--border-1)', paddingTop: '14px', marginBottom: '12px' }}>
                <p className="text-xs" style={{ color: 'var(--text-4)', marginBottom: '6px' }}>Doctrine Note</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-3)' }}>{entry.note}</p>
              </div>
              {entry.closing.map((line, i) => (
                <p key={i} className="text-xs"
                  style={{ color: i === 0 ? '#10b98160' : '#10b981aa', marginTop: '4px' }}
                >{line}</p>
              ))}
              <p className="text-xs" style={{ color: 'var(--text-6)', marginTop: '12px' }}>{entry.realm}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border-1)' }}>
        <p className="text-xs" style={{ color: 'var(--text-6)' }}>History is preserved. Canon is promoted.</p>
      </div>
    </div>
  )
}
