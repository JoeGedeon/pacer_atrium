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
]

const CANONIZATIONS = [
  {
    id: 'aiziano-naming',
    title: 'The Naming of Aiziano',
    fields: [
      { label: 'Origin Reference',    value: 'Yanu' },
      { label: 'Canonical Character', value: 'Aiziano' },
      { label: 'Status',              value: 'Confirmed' },
      { label: 'Classification',      value: 'Foundational Character' },
    ],
    note: 'Aiziano was created in honor of Yanu. While Aiziano exists as a canonical character within Isles of the Awakening, the character’s origin remains rooted in the observations, personality, imagination, and influence of Yanu. The two are connected. One exists in reality. One exists in the mythology. Neither replaces the other.',
    closing: ['Yanu inspired.', 'Aiziano emerged.'],
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
        >Canon Layer</p>
        <h2 className="font-bold"
          style={{ fontSize: '18px', color: 'var(--text-0)', marginBottom: '6px', letterSpacing: '0.08em' }}
        >DOCTRINE</h2>
        <p className="text-xs" style={{ color: 'var(--text-3)' }}>
          Principles that became permanent. {PRINCIPLES.length} principles · {CANONIZATIONS.length} canonization{CANONIZATIONS.length !== 1 ? 's' : ''}.
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
