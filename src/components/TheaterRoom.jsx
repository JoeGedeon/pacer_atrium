import { useState } from 'react'
import { enrichForFormat, FORMATS } from '../lib/theaterEnrichment'

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
  { label: 'Act I',   title: 'The Problem',     note: 'Thirty years in moving. Broken communication, missed invoices, claims, repeated mistakes. The reality that kept grading the work.' },
  { label: 'Act II',  title: 'The Discipline',  note: 'Observation. Memory. Accountability. Operational stewardship. The lessons learned before the software existed.' },
  { label: 'Act III', title: 'The Forge',        note: 'The building of FleetFlow. The testing. The failures. The iterations. The moments where reality said: not good enough.' },
  { label: 'Act IV',  title: 'The Graduate',     note: 'FleetFlow — not as a product. As evidence. Proof that the discipline survived contact with reality.' },
  { label: 'Act V',   title: 'The Next Builder', note: 'The door. Builder Studio. The empty plaque. The resident walking toward the forge.' },
]

const ORDINALS = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth']
function ordinal(n) { return ORDINALS[n - 1] ?? `#${n}` }

function ProductionWing({ observations, apiKey, onConnectClaude, isMobile }) {
  const px = isMobile ? 'px-6' : 'px-10'
  const [formatId, setFormatId] = useState('image')
  const [concept, setConcept]   = useState('')
  const [staged, setStaged]     = useState('')
  const [staging, setStaging]   = useState(false)
  const [error, setError]       = useState(null)
  const [copied, setCopied]     = useState(false)

  const incoming = (observations || []).filter(o => o.destination === 'Theater')

  const selectedFormat = FORMATS.find(f => f.id === formatId)

  async function handleStage() {
    if (!concept.trim()) return
    setStaging(true)
    setError(null)
    setStaged('')
    try {
      const result = await enrichForFormat(concept, formatId, apiKey)
      setStaged(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setStaging(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(staged).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div className={`flex-1 overflow-y-auto ${px} py-8`}>
      <div style={{ maxWidth: '580px' }}>

        {/* Incoming Briefs */}
        {incoming.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>
              Incoming — {incoming.length} staged for production
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {incoming.map(obs => (
                <button
                  key={obs.id}
                  onClick={() => setConcept(obs.text || '')}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: concept === obs.text ? '#130a20' : 'var(--bg-2)',
                    border: `1px solid ${concept === obs.text ? '#a855f7' : 'var(--border-1)'}`,
                    borderLeft: `3px solid ${concept === obs.text ? '#a855f7' : '#a855f740'}`,
                    borderRadius: '0 8px 8px 0',
                    padding: '10px 14px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <p style={{ color: '#a855f7', fontSize: '9px', fontWeight: 600,
                      letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      Staged from Atrium
                    </p>
                    <p style={{ color: 'var(--text-6)', fontSize: '9px' }}>
                      {obs.constellation || obs.type || 'observation'}
                    </p>
                  </div>
                  <p style={{ color: 'var(--text-2)', fontSize: '11px', lineHeight: 1.5 }}>
                    {(obs.text?.length ?? 0) > 90 ? obs.text.slice(0, 90) + '…' : (obs.text || '')}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Framing */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ color: 'var(--text-3)', fontSize: '13px', lineHeight: 1.8, marginBottom: '10px' }}>
            The stage is ready.
          </p>
          <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.7 }}>
            MUSE notices. KODEX understands. Theater asks: how should the audience experience this?
            Bring an observation — Theater stages it.
          </p>
        </div>

        {/* Observation input */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>
            Observation
          </p>
          <textarea
            value={concept}
            onChange={e => setConcept(e.target.value)}
            placeholder="FleetFlow ↔ Isles = movement as narrative   /   Blue Pineapple threshold   /   Governance is the comparison between declared and observed state"
            rows={3}
            style={{
              width: '100%',
              background: 'var(--bg-2)',
              border: '1px solid var(--border-1)',
              borderRadius: '8px',
              padding: '12px 14px',
              color: 'var(--text-1)',
              fontSize: '13px',
              lineHeight: 1.6,
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
            }}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleStage() }}
          />
        </div>

        {/* Format selection */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>
            How should this be performed?
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {FORMATS.map(f => (
              <button
                key={f.id}
                onClick={() => f.available && setFormatId(f.id)}
                disabled={!f.available}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  cursor: f.available ? 'pointer' : 'default',
                  background: formatId === f.id ? '#7c3aed' : f.available ? 'var(--bg-2)' : 'var(--bg-1)',
                  color: formatId === f.id ? '#fff' : f.available ? 'var(--text-3)' : 'var(--text-6)',
                  border: `1px solid ${formatId === f.id ? '#8b5cf6' : f.available ? 'var(--border-1)' : 'var(--border-0)'}`,
                  fontWeight: formatId === f.id ? 600 : 400,
                  transition: 'all 0.15s',
                  opacity: f.available ? 1 : 0.5,
                }}
              >
                {f.icon} {f.label}
                {!f.available && (
                  <span style={{ fontSize: '9px', marginLeft: '5px', opacity: 0.6 }}>soon</span>
                )}
              </button>
            ))}
          </div>
          {selectedFormat?.available && (
            <p style={{ color: 'var(--text-6)', fontSize: '10px', marginTop: '8px', fontStyle: 'italic' }}>
              {selectedFormat.note}
            </p>
          )}
        </div>

        {/* Stage button */}
        {!apiKey ? (
          <button
            onClick={onConnectClaude}
            style={{
              background: '#0d1a2e', border: '1px solid #1d4ed8',
              borderRadius: '8px', padding: '10px 20px',
              color: '#93c5fd', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', marginBottom: '24px',
            }}
          >
            ✦ Connect Claude to stage with PACER
          </button>
        ) : (
          <button
            onClick={handleStage}
            disabled={!concept.trim() || staging}
            style={{
              background: concept.trim() && !staging ? '#7c3aed' : 'var(--bg-2)',
              border: `1px solid ${concept.trim() && !staging ? '#8b5cf6' : 'var(--border-1)'}`,
              borderRadius: '8px', padding: '10px 20px',
              color: concept.trim() && !staging ? '#fff' : 'var(--text-5)',
              fontSize: '12px', fontWeight: 600,
              cursor: concept.trim() && !staging ? 'pointer' : 'default',
              marginBottom: '24px',
              transition: 'all 0.15s',
            }}
          >
            {staging ? 'Staging…' : '🎭 Stage this'}
          </button>
        )}

        {error && (
          <p style={{ color: '#ef4444', fontSize: '11px', marginBottom: '16px' }}>{error}</p>
        )}

        {/* Staged output */}
        {staged && (
          <div style={{
            background: 'var(--bg-2)',
            border: '1px solid #8b5cf640',
            borderLeft: '3px solid #8b5cf6',
            borderRadius: '0 10px 10px 0',
            overflow: 'hidden',
            marginBottom: '24px',
          }}>
            <div style={{
              padding: '10px 16px',
              borderBottom: '1px solid #8b5cf620',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <p style={{ color: '#8b5cf6', fontSize: '9px', fontWeight: 700,
                letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                {selectedFormat?.icon} {selectedFormat?.label} — Staged for Production
              </p>
              <button
                onClick={handleCopy}
                style={{
                  background: 'none', border: '1px solid #8b5cf640',
                  borderRadius: '4px', padding: '3px 10px',
                  color: copied ? '#10b981' : '#8b5cf6',
                  fontSize: '9px', fontWeight: 600, cursor: 'pointer',
                  letterSpacing: '0.08em',
                }}
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div style={{ padding: '16px' }}>
              <p style={{ color: 'var(--text-1)', fontSize: '12px', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>
                {staged}
              </p>
            </div>
            {selectedFormat?.outputNote && (
              <div style={{ padding: '10px 16px', borderTop: '1px solid #8b5cf620' }}>
                <p style={{ color: 'var(--text-6)', fontSize: '10px', lineHeight: 1.6 }}>
                  {selectedFormat.outputNote}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Studio roadmap */}
        <div style={{ borderTop: '1px solid var(--border-0)', paddingTop: '20px' }}>
          <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.12em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '12px' }}>
            Production Wing
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {[
              { label: 'Image Studio',        status: 'active',  note: 'Visual manifestation' },
              { label: 'Story Studio',         status: 'active',  note: 'Written manifestation' },
              { label: 'Infographic Studio',   status: 'active',  note: 'Data manifestation' },
              { label: 'Presentation Studio',  status: 'active',  note: 'Slide manifestation' },
              { label: 'Motion Studio',        status: 'active',  note: 'Video manifestation' },
              { label: 'Sound Studio',         status: 'coming',  note: 'Voice and atmosphere' },
            ].map(({ label, status, note }) => (
              <div key={label} style={{ minWidth: '140px' }}>
                <p style={{
                  fontSize: '9px', fontWeight: 600, letterSpacing: '0.1em',
                  textTransform: 'uppercase', marginBottom: '2px',
                  color: status === 'active' ? '#8b5cf6' : 'var(--text-6)',
                }}>
                  {label}
                </p>
                <p style={{ color: 'var(--text-6)', fontSize: '10px' }}>{note}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default function TheaterRoom({ graduates = [], observations = [], apiKey, onConnectClaude, isMobile }) {
  const px = isMobile ? 'px-6' : 'px-10'
  const [view, setView] = useState('productions')

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-0)' }}>

      {/* Header */}
      <div className={`shrink-0 ${px} pt-8 pb-0`}
        style={{ borderBottom: '1px solid var(--border-0)' }}>
        <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
          College of Transmission
        </p>
        <h2 style={{ fontSize: '18px', color: 'var(--text-0)', fontWeight: 700,
          letterSpacing: '0.08em', marginBottom: '6px' }}>Theater</h2>
        <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic',
          marginBottom: '16px' }}>
          Where thoughts become visible.
        </p>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '0', borderBottom: 'none', marginBottom: '-1px' }}>
          {[
            { id: 'productions', label: 'Productions' },
            { id: 'stage',       label: '🎭 Production Wing' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${view === tab.id ? '#8b5cf6' : 'transparent'}`,
                padding: '8px 16px',
                color: view === tab.id ? '#8b5cf6' : 'var(--text-4)',
                fontSize: '12px',
                fontWeight: view === tab.id ? 600 : 400,
                cursor: 'pointer',
                letterSpacing: '0.03em',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {view === 'stage' ? (
        <ProductionWing observations={observations} apiKey={apiKey} onConnectClaude={onConnectClaude} isMobile={isMobile} />
      ) : (
        <div className={`flex-1 overflow-y-auto ${px} py-8`}>

          {/* Discipline statement */}
          <div style={{ maxWidth: '540px', marginBottom: '36px' }}>
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>
              The Discipline
            </p>
            <p style={{ color: 'var(--text-2)', fontSize: '13px', lineHeight: 1.8, marginBottom: '10px' }}>
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

          {/* Productions */}
          <div style={{ maxWidth: '600px', marginBottom: '36px' }}>
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>
              Productions
            </p>

            {/* FleetFlow: First Graduate */}
            <div style={{
              border: '1px solid var(--border-1)', borderLeft: '3px solid #8b5cf6',
              borderRadius: '0 10px 10px 0', overflow: 'hidden', marginBottom: '12px',
            }}>
              <div style={{ background: 'var(--bg-2)', padding: '16px 20px',
                borderBottom: '1px solid var(--border-0)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start',
                  justifyContent: 'space-between', gap: '12px', marginBottom: '4px' }}>
                  <p style={{ color: 'var(--text-1)', fontSize: '14px', fontWeight: 700,
                    letterSpacing: '0.02em' }}>
                    FleetFlow: First Graduate
                  </p>
                  <span style={{
                    flexShrink: 0, background: '#8b5cf615', border: '1px solid #8b5cf640',
                    borderRadius: '4px', padding: '2px 8px', color: '#8b5cf6',
                    fontSize: '9px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
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
                        flexShrink: 0, color: 'var(--text-6)', fontSize: '9px',
                        fontWeight: 600, letterSpacing: '0.08em',
                        textTransform: 'uppercase', paddingTop: '2px', width: '36px',
                      }}>
                        {label}
                      </p>
                      <div>
                        <p style={{ color: 'var(--text-2)', fontSize: '11px',
                          fontWeight: 600, marginBottom: '2px' }}>{title}</p>
                        <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.55 }}>{note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Graduate registry productions */}
            {graduates.map(g => (
              <div key={g.id} style={{
                border: '1px solid var(--border-1)', borderLeft: '3px solid #8b5cf6',
                borderRadius: '0 10px 10px 0', overflow: 'hidden', marginBottom: '12px',
              }}>
                <div style={{ background: 'var(--bg-2)', padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start',
                    justifyContent: 'space-between', gap: '12px', marginBottom: '4px' }}>
                    <p style={{ color: 'var(--text-1)', fontSize: '14px', fontWeight: 700,
                      letterSpacing: '0.02em' }}>
                      {g.productionTitle || `${g.graduateName}: ${ordinal(g.sequence)} Graduate`}
                    </p>
                    <span style={{
                      flexShrink: 0, background: '#8b5cf615', border: '1px solid #8b5cf640',
                      borderRadius: '4px', padding: '2px 8px', color: '#8b5cf6',
                      fontSize: '9px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                    }}>
                      {g.evaluationStatus === 'active' ? 'Active' : 'In Development'}
                    </span>
                  </div>
                  {g.tagline && (
                    <p style={{ color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.6 }}>
                      {g.tagline}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Empty slot */}
            <div style={{
              border: '1px dashed var(--border-0)', borderRadius: '10px',
              padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
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
      )}
    </div>
  )
}
