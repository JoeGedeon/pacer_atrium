const TEACHINGS = [
  {
    label: 'Evidence deserves a witness.',
    note: 'Proof that nobody sees is proof that disappears. Theater exists so what survived can be seen.',
  },
  {
    label: 'Lessons should travel.',
    note: 'A lesson trapped inside one person is an anecdote. A lesson that reaches the next person is inheritance.',
  },
  {
    label: 'Proof should be preserved.',
    note: 'The documentary outlasts the project. The record outlasts the deadline. Archivist Hall holds it. Theater transmits it.',
  },
  {
    label: 'What survives should be shared.',
    note: 'The graduate earns the plaque. Theater earns the obligation to tell what the plaque cannot.',
  },
]

const FLEETFLOW_ACTS = [
  { label: 'Act I',   title: 'The Problem',    note: 'Thirty years in moving. Broken communication, missed invoices, claims, repeated mistakes. The reality that kept grading the work.' },
  { label: 'Act II',  title: 'The Discipline', note: 'Observation. Memory. Accountability. Operational stewardship. The lessons learned before the software existed.' },
  { label: 'Act III', title: 'The Forge',      note: 'The building of FleetFlow. The testing. The failures. The iterations. The moments where reality said: not good enough.' },
  { label: 'Act IV',  title: 'The Graduate',   note: 'FleetFlow — not as a product. As evidence. Proof that the discipline survived contact with reality.' },
  { label: 'Act V',   title: 'The Next Builder', note: 'The door. Builder Studio. The empty plaque. The resident walking toward the forge.' },
]

export default function TheaterRoom({ isMobile }) {
  const px = isMobile ? 'px-6' : 'px-10'

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-0)' }}>

      {/* Header */}
      <div className={`shrink-0 ${px} pt-8 pb-6`}
        style={{ borderBottom: '1px solid var(--border-0)' }}>
        <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
          College of Transmission
        </p>
        <h2 style={{ fontSize: '18px', color: 'var(--text-0)', fontWeight: 700,
          letterSpacing: '0.08em', marginBottom: '6px' }}>Theater</h2>
        <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic' }}>
          Look what survived.
        </p>
      </div>

      <div className={`flex-1 overflow-y-auto ${px} py-8`}>

        {/* Discipline statement */}
        <div style={{ maxWidth: '540px', marginBottom: '36px' }}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>
            The Discipline
          </p>
          <p style={{ color: 'var(--text-2)', fontSize: '13px', lineHeight: 1.8,
            marginBottom: '10px' }}>
            Theater is not a media department. A media department says: look what we made. Theater says: look what survived. Those are different missions, and they produce fundamentally different work.
          </p>
          <p style={{ color: 'var(--text-3)', fontSize: '13px', lineHeight: 1.8 }}>
            The work has to survive. The person follows. Theater exists to transmit the proof — so the next builder knows what the discipline looks like when it has been tested by reality and held.
          </p>
        </div>

        {/* What this college teaches */}
        <div style={{ maxWidth: '540px', marginBottom: '36px' }}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>
            What This College Teaches
          </p>
          <div className="flex flex-col gap-3">
            {TEACHINGS.map(({ label, note }) => (
              <div key={label} style={{ borderLeft: '2px solid #8b5cf630', paddingLeft: '14px' }}>
                <p style={{ color: 'var(--text-1)', fontSize: '12px',
                  fontWeight: 600, marginBottom: '3px' }}>{label}</p>
                <p style={{ color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.65 }}>{note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Current Productions */}
        <div style={{ maxWidth: '600px', marginBottom: '36px' }}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>
            Productions
          </p>

          {/* FleetFlow: First Graduate — documentary in development */}
          <div style={{
            border: '1px solid var(--border-1)',
            borderLeft: '3px solid #8b5cf6',
            borderRadius: '0 10px 10px 0',
            overflow: 'hidden',
            marginBottom: '12px',
          }}>
            <div style={{
              background: 'var(--bg-2)',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-0)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start',
                justifyContent: 'space-between', gap: '12px', marginBottom: '4px' }}>
                <p style={{ color: 'var(--text-1)', fontSize: '14px', fontWeight: 700,
                  letterSpacing: '0.02em' }}>
                  FleetFlow: First Graduate
                </p>
                <span style={{
                  flexShrink: 0,
                  background: '#8b5cf615',
                  border: '1px solid #8b5cf640',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  color: '#8b5cf6',
                  fontSize: '9px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}>
                  In Development
                </span>
              </div>
              <p style={{ color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.6 }}>
                Documentary · College of Transmission
              </p>
            </div>

            <div style={{ background: 'var(--bg-1)', padding: '16px 20px' }}>
              <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.12em',
                textTransform: 'uppercase', fontWeight: 600, marginBottom: '12px' }}>
                Structure
              </p>
              <div className="flex flex-col gap-2">
                {FLEETFLOW_ACTS.map(({ label, title, note }) => (
                  <div key={label} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <p style={{
                      flexShrink: 0,
                      color: 'var(--text-6)', fontSize: '9px',
                      fontWeight: 600, letterSpacing: '0.08em',
                      textTransform: 'uppercase', paddingTop: '2px',
                      width: '36px',
                    }}>
                      {label}
                    </p>
                    <div>
                      <p style={{ color: 'var(--text-2)', fontSize: '11px',
                        fontWeight: 600, marginBottom: '2px' }}>{title}</p>
                      <p style={{ color: 'var(--text-5)', fontSize: '11px',
                        lineHeight: 1.55 }}>{note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Empty future slot */}
          <div style={{
            border: '1px dashed var(--border-0)',
            borderRadius: '10px',
            padding: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <p style={{ color: 'var(--text-6)', fontSize: '11px', fontStyle: 'italic' }}>
              The next production appears when the next graduate earns a plaque.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ maxWidth: '540px', paddingTop: '8px' }}>
          <p style={{ color: 'var(--text-6)', fontSize: '11px', fontStyle: 'italic', lineHeight: 1.7 }}>
            Knowledge becomes inheritance only when it reaches the next person.
          </p>
        </div>

      </div>
    </div>
  )
}
