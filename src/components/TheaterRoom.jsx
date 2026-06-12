import { useState } from 'react'
import { enrichImagePrompt, CREATION_TYPE_OPTIONS } from '../lib/theaterEnrichment'

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
  { label: 'Act I',   title: 'The Problem',      note: 'Thirty years in moving. Broken communication, missed invoices, claims, repeated mistakes. The reality that kept grading the work.' },
  { label: 'Act II',  title: 'The Discipline',   note: 'Observation. Memory. Accountability. Operational stewardship. The lessons learned before the software existed.' },
  { label: 'Act III', title: 'The Forge',         note: 'The building of FleetFlow. The testing. The failures. The iterations. The moments where reality said: not good enough.' },
  { label: 'Act IV',  title: 'The Graduate',      note: 'FleetFlow — not as a product. As evidence. Proof that the discipline survived contact with reality.' },
  { label: 'Act V',   title: 'The Next Builder',  note: 'The door. Builder Studio. The empty plaque. The resident walking toward the forge.' },
]

const ORDINALS = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth']
function ordinal(n) { return ORDINALS[n - 1] ?? `#${n}` }

function ImageStudio({ apiKey, onConnectClaude, isMobile }) {
  const px = isMobile ? 'px-6' : 'px-10'
  const [creationType, setCreationType] = useState('Concept Art')
  const [concept, setConcept]           = useState('')
  const [enriched, setEnriched]         = useState('')
  const [enriching, setEnriching]       = useState(false)
  const [error, setError]               = useState(null)
  const [copied, setCopied]             = useState(false)

  async function handleEnrich() {
    if (!concept.trim()) return
    setEnriching(true)
    setError(null)
    setEnriched('')
    try {
      const result = await enrichImagePrompt(concept, creationType, apiKey)
      setEnriched(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setEnriching(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(enriched).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div className={`flex-1 overflow-y-auto ${px} py-8`}>
      <div style={{ maxWidth: '580px' }}>

        {/* Explanation */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ color: 'var(--text-3)', fontSize: '13px', lineHeight: 1.8, marginBottom: '10px' }}>
            You provide the concept. PACER provides the context. Theater produces the prompt.
          </p>
          <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.7 }}>
            A sparse idea becomes institutionally enriched — carrying PACER's world, vocabulary, and visual doctrine into any image generator you use.
          </p>
        </div>

        {/* Creation type */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>
            Creation Type
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {CREATION_TYPE_OPTIONS.map(t => (
              <button
                key={t}
                onClick={() => setCreationType(t)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  background: creationType === t ? '#8b5cf6' : 'var(--bg-2)',
                  color:      creationType === t ? '#fff'    : 'var(--text-3)',
                  border:     creationType === t ? '1px solid #8b5cf6' : '1px solid var(--border-1)',
                  fontWeight: creationType === t ? 600 : 400,
                  transition: 'all 0.15s',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Concept input */}
        <div style={{ marginBottom: '16px' }}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>
            Concept
          </p>
          <textarea
            value={concept}
            onChange={e => setConcept(e.target.value)}
            placeholder="Blue Pineapple Atrium   /   FleetFlow gate   /   Aiziano in the Isles   /   etc."
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
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleEnrich() }}
          />
        </div>

        {/* Enrich button */}
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
            ✦ Connect Claude to enrich with PACER context
          </button>
        ) : (
          <button
            onClick={handleEnrich}
            disabled={!concept.trim() || enriching}
            style={{
              background: concept.trim() && !enriching ? '#7c3aed' : 'var(--bg-2)',
              border: `1px solid ${concept.trim() && !enriching ? '#8b5cf6' : 'var(--border-1)'}`,
              borderRadius: '8px', padding: '10px 20px',
              color: concept.trim() && !enriching ? '#fff' : 'var(--text-5)',
              fontSize: '12px', fontWeight: 600,
              cursor: concept.trim() && !enriching ? 'pointer' : 'default',
              marginBottom: '24px',
              transition: 'all 0.15s',
            }}
          >
            {enriching ? 'Enriching…' : '✦ Enrich with PACER'}
          </button>
        )}

        {error && (
          <p style={{ color: '#ef4444', fontSize: '11px', marginBottom: '16px' }}>{error}</p>
        )}

        {/* Enriched prompt output */}
        {enriched && (
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
                PACER-Enriched Prompt — {creationType}
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
              <p style={{ color: 'var(--text-1)', fontSize: '12px', lineHeight: 1.85 }}>
                {enriched}
              </p>
            </div>
            <div style={{ padding: '10px 16px', borderTop: '1px solid #8b5cf620' }}>
              <p style={{ color: 'var(--text-6)', fontSize: '10px', lineHeight: 1.6 }}>
                Paste this prompt into DALL-E, Midjourney, Ideogram, Flux, or any image generator.
                The enrichment is the PACER contribution. The generation step is yours.
              </p>
            </div>
          </div>
        )}

        {/* Phase indicator */}
        <div style={{
          borderTop: '1px solid var(--border-0)', paddingTop: '20px',
          display: 'flex', gap: '16px',
        }}>
          {[
            { label: 'Image Studio', status: 'active',  note: 'PACER-enriched prompts' },
            { label: 'Storyboard',   status: 'coming',  note: 'Narrative-first scene builder' },
            { label: 'Motion',       status: 'coming',  note: 'Video generation pipeline' },
            { label: 'Sound',        status: 'coming',  note: 'Voice and atmosphere' },
          ].map(({ label, status, note }) => (
            <div key={label} style={{ flex: 1 }}>
              <p style={{
                fontSize: '9px', fontWeight: 600, letterSpacing: '0.1em',
                textTransform: 'uppercase', marginBottom: '3px',
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
  )
}

export default function TheaterRoom({ graduates = [], apiKey, onConnectClaude, isMobile }) {
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
          Look what survived.
        </p>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '0', borderBottom: 'none', marginBottom: '-1px' }}>
          {[
            { id: 'productions', label: 'Productions' },
            { id: 'studio',      label: '🎨 Image Studio' },
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

      {view === 'studio' ? (
        <ImageStudio apiKey={apiKey} onConnectClaude={onConnectClaude} isMobile={isMobile} />
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
