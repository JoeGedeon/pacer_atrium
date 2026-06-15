import { useState, useEffect } from 'react'
import { speakWithVoice, getVoiceConfig } from '../lib/roomVoice'
import RoomSubNav from './RoomSubNav'
import { generateImage } from '../lib/openaiImageGeneration'

const BUILDER_TABS = [
  { id: 'create',    label: 'Create' },
  { id: 'registry',  label: 'Registry' },
  { id: 'decisions', label: 'Decisions' },
  { id: 'outcomes',  label: 'Outcomes' },
]

const OUTCOME_SIGNAL_COLORS = { positive: '#10b981', neutral: '#6b7280', friction: '#f97316' }

// ── Artifact Renderer ──────────────────────────────────────────────────────────

function ArtifactSection({ label, children }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.12em',
        textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
        {label}
      </p>
      {children}
    </div>
  )
}

function artifactToText(artifact) {
  const domain = artifact.domain || ''
  const isFleetFlow = domain === 'FleetFlow'
  const isIsles = domain === 'Isles of the Awakening'
  const parts = [artifact.title]
  if (isFleetFlow) {
    if (artifact.actionSummary) parts.push(artifact.actionSummary)
    if (artifact.taskList?.length) parts.push('Tasks: ' + artifact.taskList.join('. '))
    if (artifact.outreachDraft) parts.push(artifact.outreachDraft)
    if (artifact.successMetric) parts.push('Success metric: ' + artifact.successMetric)
  } else if (isIsles) {
    if (artifact.conceptSummary) parts.push(artifact.conceptSummary)
    if (artifact.nextCreativeStep) parts.push(artifact.nextCreativeStep)
    if (artifact.expansionQuestions?.length) parts.push('Questions: ' + artifact.expansionQuestions.join('. '))
    if (artifact.productionRecommendation) parts.push(artifact.productionRecommendation)
  } else {
    if (artifact.strategicSummary) parts.push(artifact.strategicSummary)
    if (artifact.recommendedAction) parts.push(artifact.recommendedAction)
    if (artifact.followUpSteps?.length) parts.push('Next steps: ' + artifact.followUpSteps.join('. '))
  }
  return parts.filter(Boolean).join('. ')
}

function ForgeArtifact({ artifact }) {
  const [speaking, setSpeaking] = useState(false)
  const [copied, setCopied]     = useState(false)
  const artifactText = artifactToText(artifact)

  function handleReadAloud() {
    if (speaking) return
    speakWithVoice(artifactText, getVoiceConfig('vera'), {
      onStart: () => setSpeaking(true),
      onEnd:   () => setSpeaking(false),
      onError: () => setSpeaking(false),
    })
  }

  function handleCopy() {
    navigator.clipboard.writeText(artifactText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  function handleExport() {
    const blob = new Blob([artifactText], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `${(artifact.title || 'artifact').replace(/[^a-z0-9]/gi, '-').toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const domain = artifact.domain || ''
  const isFleetFlow = domain === 'FleetFlow'
  const isIsles     = domain === 'Isles of the Awakening'

  return (
    <div style={{
      background: 'var(--bg-3)', border: '1px solid var(--border-1)',
      borderTop: '2px solid #10b981', borderRadius: '0',
      padding: '16px 18px', marginTop: '-1px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span style={{ color: '#10b981', fontSize: '10px' }}>⚒</span>
        <p style={{ color: '#10b981', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase' }}>
          Recommended Action Package
        </p>
      </div>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <button
          onClick={handleReadAloud}
          disabled={speaking}
          style={{
            background: 'none', border: '1px solid #10b98140', borderRadius: '5px',
            padding: '4px 10px', color: speaking ? '#10b98180' : '#10b981',
            fontSize: '10px', fontWeight: 600, cursor: speaking ? 'default' : 'pointer',
            fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '4px',
          }}
        >
          {speaking ? '🔊 Reading…' : '🔊 Read Aloud'}
        </button>
        <button
          onClick={handleCopy}
          style={{
            background: 'none', border: '1px solid var(--border-1)', borderRadius: '5px',
            padding: '4px 10px', color: copied ? '#10b981' : 'var(--text-4)',
            fontSize: '10px', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {copied ? '✓ Copied' : '📋 Copy'}
        </button>
        <button
          onClick={handleExport}
          style={{
            background: 'none', border: '1px solid var(--border-1)', borderRadius: '5px',
            padding: '4px 10px', color: 'var(--text-4)',
            fontSize: '10px', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          ⬇ Export
        </button>
      </div>
      <p style={{ color: 'var(--text-0)', fontSize: '13px', fontWeight: 600,
        lineHeight: 1.5, marginBottom: '16px' }}>
        {artifact.title}
      </p>

      {isFleetFlow && (
        <>
          {artifact.actionSummary && (
            <ArtifactSection label="Action Summary">
              <p style={{ color: 'var(--text-2)', fontSize: '12px', lineHeight: 1.7 }}>
                {artifact.actionSummary}
              </p>
            </ArtifactSection>
          )}
          {artifact.taskList?.length > 0 && (
            <ArtifactSection label="Task List">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {artifact.taskList.map((task, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--text-5)', fontSize: '10px', marginTop: '2px', flexShrink: 0 }}>
                      {i + 1}.
                    </span>
                    <p style={{ color: 'var(--text-2)', fontSize: '12px', lineHeight: 1.55 }}>{task}</p>
                  </div>
                ))}
              </div>
            </ArtifactSection>
          )}
          {artifact.outreachDraft && (
            <ArtifactSection label="Outreach Draft">
              <p style={{ color: 'var(--text-2)', fontSize: '12px', lineHeight: 1.7,
                fontStyle: 'italic', paddingLeft: '10px', borderLeft: '2px solid var(--border-2)' }}>
                {artifact.outreachDraft}
              </p>
            </ArtifactSection>
          )}
          {artifact.successMetric && (
            <ArtifactSection label="Success Metric">
              <p style={{ color: '#10b981', fontSize: '12px', lineHeight: 1.6 }}>
                {artifact.successMetric}
              </p>
            </ArtifactSection>
          )}
        </>
      )}

      {isIsles && (
        <>
          {artifact.conceptSummary && (
            <ArtifactSection label="Concept Summary">
              <p style={{ color: 'var(--text-2)', fontSize: '12px', lineHeight: 1.7 }}>
                {artifact.conceptSummary}
              </p>
            </ArtifactSection>
          )}
          {artifact.nextCreativeStep && (
            <ArtifactSection label="Next Creative Step">
              <p style={{ color: 'var(--text-1)', fontSize: '12px', lineHeight: 1.6, fontWeight: 500 }}>
                {artifact.nextCreativeStep}
              </p>
            </ArtifactSection>
          )}
          {artifact.expansionQuestions?.length > 0 && (
            <ArtifactSection label="Expansion Questions">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {artifact.expansionQuestions.map((q, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--text-5)', fontSize: '10px', marginTop: '2px', flexShrink: 0 }}>?</span>
                    <p style={{ color: 'var(--text-2)', fontSize: '12px', lineHeight: 1.55, fontStyle: 'italic' }}>{q}</p>
                  </div>
                ))}
              </div>
            </ArtifactSection>
          )}
          {artifact.productionRecommendation && (
            <ArtifactSection label="Production Recommendation">
              <p style={{ color: '#a855f7', fontSize: '12px', lineHeight: 1.6 }}>
                {artifact.productionRecommendation}
              </p>
            </ArtifactSection>
          )}
        </>
      )}

      {!isFleetFlow && !isIsles && (
        <>
          {artifact.strategicSummary && (
            <ArtifactSection label="Strategic Summary">
              <p style={{ color: 'var(--text-2)', fontSize: '12px', lineHeight: 1.7 }}>
                {artifact.strategicSummary}
              </p>
            </ArtifactSection>
          )}
          {artifact.recommendedAction && (
            <ArtifactSection label="Recommended Action">
              <p style={{ color: 'var(--text-1)', fontSize: '12px', lineHeight: 1.6, fontWeight: 500 }}>
                {artifact.recommendedAction}
              </p>
            </ArtifactSection>
          )}
          {artifact.stakeholders?.length > 0 && (
            <ArtifactSection label="Stakeholders">
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {artifact.stakeholders.map((s, i) => (
                  <span key={i} style={{
                    background: 'var(--bg-2)', border: '1px solid var(--border-1)',
                    color: 'var(--text-3)', fontSize: '10px', padding: '3px 8px', borderRadius: '4px',
                  }}>{s}</span>
                ))}
              </div>
            </ArtifactSection>
          )}
          {artifact.followUpSteps?.length > 0 && (
            <ArtifactSection label="Follow-Up Steps">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {artifact.followUpSteps.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--text-5)', fontSize: '10px', marginTop: '2px', flexShrink: 0 }}>→</span>
                    <p style={{ color: 'var(--text-2)', fontSize: '12px', lineHeight: 1.55 }}>{step}</p>
                  </div>
                ))}
              </div>
            </ArtifactSection>
          )}
        </>
      )}

      <p style={{ color: 'var(--text-6)', fontSize: '10px', marginTop: '8px', fontStyle: 'italic' }}>
        Sent to OpsCore · Thread outcome recorded
      </p>
    </div>
  )
}

// ── Outcome Recording ─────────────────────────────────────────────────────────

const OUTCOME_SIGNALS = [
  { id: 'positive', label: 'Positive', color: '#10b981' },
  { id: 'neutral',  label: 'Neutral',  color: '#6b7280' },
  { id: 'friction', label: 'Friction', color: '#f97316' },
]

function OutcomeForm({ threadId, onRecordOutcome }) {
  const [note, setNote]     = useState('')
  const [signal, setSignal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState(null)

  async function handleSave() {
    if (!signal) return
    setSaving(true)
    setError(null)
    try {
      await onRecordOutcome(threadId, { outcomeNote: note.trim(), outcomeSignal: signal })
    } catch {
      setError('Save failed. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      background: 'var(--bg-2)', border: '1px solid var(--border-1)',
      borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '14px 18px',
    }}>
      <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.12em',
        textTransform: 'uppercase', fontWeight: 700, marginBottom: '10px' }}>
        Record Outcome
      </p>
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="What happened? Was the artifact used? What resulted?"
        rows={2}
        style={{
          width: '100%', background: 'var(--bg-0)', border: '1px solid var(--border-1)',
          borderRadius: '6px', color: 'var(--text-2)', fontSize: '12px', lineHeight: 1.6,
          padding: '8px 10px', marginBottom: '10px', resize: 'vertical',
          fontFamily: 'inherit', boxSizing: 'border-box',
        }}
      />
      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
        {OUTCOME_SIGNALS.map(s => {
          const selected = signal === s.id
          return (
            <button
              key={s.id}
              onClick={() => setSignal(s.id)}
              style={{
                flex: 1, padding: '5px 0', borderRadius: '5px', fontFamily: 'inherit',
                fontSize: '11px', fontWeight: selected ? 600 : 400, cursor: 'pointer',
                background: selected ? s.color + '20' : 'var(--bg-0)',
                border: `1px solid ${selected ? s.color + '80' : 'var(--border-1)'}`,
                color: selected ? s.color : 'var(--text-5)',
              }}
            >
              {s.label}
            </button>
          )
        })}
      </div>
      <button
        onClick={handleSave}
        disabled={!signal || saving}
        style={{
          background: signal ? '#0a1f1240' : 'var(--bg-0)',
          border: `1px solid ${signal ? '#10b98160' : 'var(--border-1)'}`,
          color: signal ? '#10b981' : 'var(--text-6)',
          fontSize: '11px', fontWeight: 600, padding: '6px 0', width: '100%',
          borderRadius: '6px', cursor: !signal || saving ? 'default' : 'pointer',
          fontFamily: 'inherit',
        }}
      >
        {saving ? 'Saving…' : 'Save Outcome'}
      </button>
      {error && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>{error}</p>}
    </div>
  )
}

function RecordedOutcome({ signal, note }) {
  const color = OUTCOME_SIGNALS.find(s => s.id === signal)?.color || 'var(--text-4)'
  return (
    <div style={{
      background: 'var(--bg-2)', border: '1px solid var(--border-1)',
      borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '12px 18px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: note ? '6px' : '0' }}>
        <span style={{ color, fontSize: '10px', fontWeight: 700,
          letterSpacing: '0.06em', textTransform: 'capitalize' }}>
          ◈ {signal}
        </span>
        <span style={{ color: 'var(--text-6)', fontSize: '10px' }}>outcome recorded</span>
      </div>
      {note && (
        <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.6 }}>{note}</p>
      )}
    </div>
  )
}

// ── Approved Thread Card ───────────────────────────────────────────────────────

function ThreadCard({ thread, onForge, hasApiKey, onRecordOutcome }) {
  const [forging, setForging] = useState(false)
  const [forgeError, setForgeError] = useState(null)

  async function handleForge() {
    setForgeError(null)
    setForging(true)
    try {
      await onForge(thread.id, thread)
    } catch (err) {
      setForgeError(err.message || 'Forge failed. Try again.')
    } finally {
      setForging(false)
    }
  }

  const hasArtifact = !!thread.artifact

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{
        background: 'var(--bg-2)', border: '1px solid var(--border-1)',
        borderLeft: '3px solid #10b981',
        borderRadius: hasArtifact ? '0 8px 0 0' : '0 8px 8px 0',
        borderBottom: hasArtifact ? 'none' : undefined,
        padding: '14px 18px',
      }}>
        <p style={{ color: 'var(--text-0)', fontSize: '13px', lineHeight: 1.6, marginBottom: '10px' }}>
          {thread.recommendation}
        </p>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {thread.domain && (
            <span style={{ color: 'var(--text-5)', fontSize: '10px' }}>{thread.domain}</span>
          )}
          {thread.constellation && (
            <span style={{ color: '#a07830', fontSize: '10px' }}>◈ {thread.constellation}</span>
          )}
          {hasArtifact ? (
            <span style={{ color: '#10b981', fontSize: '10px', fontWeight: 600 }}>⚒ Artifact forged</span>
          ) : (
            <span style={{ color: 'var(--text-6)', fontSize: '10px', fontStyle: 'italic' }}>
              Awaiting manufacture
            </span>
          )}
        </div>

        {!hasArtifact && (
          <div style={{ marginTop: '12px' }}>
            <button
              onClick={handleForge}
              disabled={forging || !hasApiKey}
              style={{
                background: forging ? 'var(--bg-3)' : '#0a1f1240',
                border: `1px solid ${forging ? 'var(--border-1)' : '#10b98160'}`,
                color: forging ? 'var(--text-5)' : '#10b981',
                fontSize: '11px', fontWeight: 600, padding: '6px 14px',
                borderRadius: '6px', cursor: forging || !hasApiKey ? 'default' : 'pointer',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              {forging ? (
                <>
                  <span style={{ opacity: 0.6 }}>⚒</span> Forging…
                </>
              ) : !hasApiKey ? (
                'API key required to forge'
              ) : (
                <>⚒ Forge Artifact</>
              )}
            </button>
            {forgeError && (
              <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>{forgeError}</p>
            )}
          </div>
        )}
      </div>

      {hasArtifact && <ForgeArtifact artifact={thread.artifact} />}
      {hasArtifact && (
        thread.outcomeSignal
          ? <RecordedOutcome signal={thread.outcomeSignal} note={thread.outcomeNote} />
          : <OutcomeForm threadId={thread.id} onRecordOutcome={onRecordOutcome} />
      )}
    </div>
  )
}

// ── Studio Item Detail ────────────────────────────────────────────────────────

function StudioItemDetail({ item, onUpdateArtifact, onGenerateFrom }) {
  const [notes,  setNotes]  = useState(item.notes || '')
  const [saving, setSaving] = useState(false)

  // Sync notes if item changes (switching cards)
  useEffect(() => { setNotes(item.notes || '') }, [item.id]) // eslint-disable-line

  async function handleNotesBlur() {
    if (notes === (item.notes || '')) return
    setSaving(true)
    try {
      await onUpdateArtifact(item.id, { notes })
    } finally {
      setSaving(false)
    }
  }

  const dateStr = item.generatedAt?.toDate?.().toLocaleDateString?.() ?? ''

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
      <div style={{ maxWidth: '640px' }}>

        {/* Image */}
        <div style={{ marginBottom: '20px' }}>
          <img
            src={item.url}
            alt={item.title}
            style={{ width: '100%', borderRadius: '6px', display: 'block', border: '1px solid var(--border-0)' }}
            onError={e => { e.target.style.display = 'none' }}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              style={{
                background: 'none', border: '1px solid var(--border-1)',
                color: 'var(--text-3)', fontSize: '10px', padding: '4px 12px',
                borderRadius: '5px', textDecoration: 'none', display: 'inline-block',
              }}
            >
              ↗ Open full size
            </a>
          </div>
        </div>

        {/* Title + meta */}
        <div style={{ marginBottom: '16px' }}>
          <p style={{ color: 'var(--text-0)', fontSize: '15px', fontWeight: 600, lineHeight: 1.4, marginBottom: '8px' }}>
            {item.title}
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            {item.sourceConstellation && (
              <span style={{ color: '#a07830', fontSize: '9px', fontWeight: 600 }}>
                ◈ {item.sourceConstellation}
              </span>
            )}
            {item.sourceDoctrine && (
              <span style={{ color: '#6366f1', fontSize: '9px', fontWeight: 600 }}>
                ⬡ {item.sourceDoctrine}
              </span>
            )}
            {item.sourceObservation && (
              <span style={{ color: 'var(--text-5)', fontSize: '9px' }}>
                obs · {item.sourceObservation.slice(0, 40)}
              </span>
            )}
            {dateStr && (
              <span style={{ color: 'var(--text-6)', fontSize: '9px', marginLeft: 'auto' }}>
                {dateStr}
              </span>
            )}
          </div>
        </div>

        {/* Prompt used */}
        {item.prompt && (
          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.12em',
              textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
              Prompt
            </p>
            <p style={{
              color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.65,
              background: 'var(--bg-2)', borderRadius: '0 6px 6px 0',
              padding: '10px 14px', borderLeft: '3px solid var(--border-2)',
              fontStyle: 'italic',
            }}>
              {item.prompt}
            </p>
            {item.revisedPrompt && item.revisedPrompt !== item.prompt && (
              <p style={{ color: 'var(--text-6)', fontSize: '9px', marginTop: '5px', fontStyle: 'italic', lineHeight: 1.5 }}>
                Studio interpreted: "{item.revisedPrompt.slice(0, 160)}{item.revisedPrompt.length > 160 ? '…' : ''}"
              </p>
            )}
          </div>
        )}

        {/* Notes */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.12em',
              textTransform: 'uppercase', fontWeight: 700 }}>
              Notes
            </p>
            {saving && (
              <span style={{ color: 'var(--text-6)', fontSize: '9px' }}>Saving…</span>
            )}
          </div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Add notes, context, or next steps for this work…"
            rows={4}
            style={{
              width: '100%', background: 'var(--bg-1)', border: '1px solid var(--border-1)',
              borderRadius: '6px', color: 'var(--text-2)', fontSize: '12px', lineHeight: 1.6,
              padding: '8px 10px', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
              outline: 'none',
            }}
          />
          <p style={{ color: 'var(--text-6)', fontSize: '9px', marginTop: '3px' }}>Saved on blur.</p>
        </div>

        {/* Actions */}
        {item.prompt && (
          <button
            onClick={() => onGenerateFrom(item.prompt)}
            style={{
              background: '#0f172a', border: '1px solid #3b82f660',
              color: '#93c5fd', fontSize: '11px', fontWeight: 600,
              padding: '7px 16px', borderRadius: '6px', cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ✦ Generate from this prompt
          </button>
        )}
      </div>
    </div>
  )
}

// ── Works Rail (left sidebar for Create tab) ──────────────────────────────────

function WorksRail({ studioArtifacts, activeItemId, onSelect, onNew }) {
  return (
    <div style={{
      width: '180px', flexShrink: 0,
      borderRight: '1px solid var(--border-0)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ padding: '10px 10px 8px', borderBottom: '1px solid var(--border-0)', flexShrink: 0 }}>
        <button
          onClick={onNew}
          style={{
            width: '100%', textAlign: 'left', fontFamily: 'inherit',
            background: activeItemId === null ? 'var(--bg-3)' : 'var(--bg-1)',
            border: `1px solid ${activeItemId === null ? 'var(--border-1)' : 'transparent'}`,
            borderRadius: '6px', padding: '6px 10px', cursor: 'pointer',
            color: activeItemId === null ? 'var(--text-1)' : 'var(--text-3)',
            fontSize: '11px', fontWeight: activeItemId === null ? 600 : 400,
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          <span style={{ fontSize: '12px' }}>✦</span> New Work
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
        {studioArtifacts.length === 0 && (
          <p style={{ color: 'var(--text-6)', fontSize: '9px', padding: '8px 4px', lineHeight: 1.6 }}>
            Generated images appear here.
          </p>
        )}
        {studioArtifacts.map(a => {
          const selected = a.id === activeItemId
          return (
            <button
              key={a.id}
              onClick={() => onSelect(a.id)}
              style={{
                width: '100%', fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left',
                background: selected ? 'var(--bg-3)' : 'none',
                border: `1px solid ${selected ? 'var(--border-1)' : 'transparent'}`,
                borderRadius: '6px', padding: '5px 6px', marginBottom: '3px',
                outline: 'none',
              }}
            >
              <img
                src={a.url}
                alt={a.title}
                style={{
                  width: '100%', aspectRatio: '1 / 1', objectFit: 'cover',
                  borderRadius: '4px', display: 'block', marginBottom: '4px',
                  opacity: selected ? 1 : 0.75,
                }}
                onError={e => { e.target.style.display = 'none' }}
              />
              <p style={{
                color: selected ? 'var(--text-1)' : 'var(--text-4)',
                fontSize: '9px', lineHeight: 1.3, fontWeight: selected ? 600 : 400,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {a.title}
              </p>
              {a.sourceConstellation && (
                <p style={{ color: '#a07830', fontSize: '8px', marginTop: '1px',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  ◈ {a.sourceConstellation}
                </p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function BuilderStudioRoom({ isMobile, builderReadiness, threads = [], onNavigate, onForge, apiKey, openaiApiKey, studioContext, onContextConsumed, studioArtifacts = [], onSaveArtifact, onUpdateArtifact, onRecordOutcome }) {
  const [tab,          setTab]          = useState('create')
  const [prompt,       setPrompt]       = useState(studioContext?.prompt || '')
  const [generating,   setGenerating]   = useState(false)
  const [genError,     setGenError]     = useState(null)
  const [canvas,       setCanvas]       = useState(null)
  const [history,      setHistory]      = useState([])
  const [sourceCtx,    setSourceCtx]    = useState(studioContext || null)
  const [activeItemId, setActiveItemId] = useState(null) // null = generate mode

  const px = isMobile ? 'px-6' : 'px-10'
  const approvedThreads  = threads.filter(t => t.decision === 'approved')
  const completedThreads = approvedThreads.filter(t => t.outcomeSignal)

  // Live lookup from Firestore-backed list so notes/updates reflect immediately
  const activeStudioItem = studioArtifacts.find(a => a.id === activeItemId) ?? null

  useEffect(() => {
    if (studioContext) {
      setPrompt(studioContext.prompt || '')
      setSourceCtx(studioContext)
      setActiveItemId(null)  // switch to generate mode
      setTab('create')
      onContextConsumed?.()
    }
  }, [studioContext]) // eslint-disable-line

  async function handleGenerate() {
    if (!prompt.trim() || !openaiApiKey || generating) return
    setGenerating(true)
    setGenError(null)
    try {
      const result = await generateImage(prompt.trim(), openaiApiKey)
      const item = { ...result, promptUsed: prompt.trim(), id: Date.now(), sourceCtx }
      setCanvas(item)
      setHistory(prev => [item, ...prev].slice(0, 10))
      const title = sourceCtx?.sourceConstellation || prompt.trim().slice(0, 50)
      onSaveArtifact?.({
        url:                 result.url,
        title,
        prompt:              prompt.trim(),
        revisedPrompt:       result.revisedPrompt || null,
        sourceConstellation: sourceCtx?.sourceConstellation || null,
        sourceDoctrine:      sourceCtx?.sourceDoctrine || null,
        sourceObservation:   sourceCtx?.sourceObservation || null,
      })
    } catch (err) {
      setGenError(err.message || 'Generation failed.')
    } finally {
      setGenerating(false)
    }
  }

  function handleGenerateFrom(existingPrompt) {
    setPrompt(existingPrompt)
    setActiveItemId(null)
    setCanvas(null)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-0)' }}>

      <div className={`shrink-0 ${px} pt-8 pb-6`}
        style={{ borderBottom: '1px solid var(--border-0)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginBottom: '4px' }}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 600 }}>
            The Forge
          </p>
          <span style={{
            fontSize: '9px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '2px 8px', borderRadius: '4px',
            ...(builderReadiness === 'approved'
              ? { background: '#10b98115', border: '1px solid #10b98140', color: '#10b981' }
              : builderReadiness === 'pending'
              ? { background: '#3b82f615', border: '1px solid #3b82f640', color: '#3b82f6' }
              : { background: 'var(--bg-2)', border: '1px solid var(--border-1)', color: 'var(--text-5)' }
            ),
          }}>
            {builderReadiness === 'approved' ? 'Authorized'
              : builderReadiness === 'pending' ? 'Under Review'
              : 'Pending Authorization'}
          </span>
        </div>
        <h2 style={{ fontSize: '18px', color: 'var(--text-0)', fontWeight: 700,
          letterSpacing: '0.08em', marginBottom: '6px' }}>Builder Studio</h2>
        <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic' }}>
          Knowledge enters. Evidence leaves.
        </p>
      </div>

      <RoomSubNav tabs={BUILDER_TABS} activeTab={tab} onSelect={setTab} />

      {/* ── Registry tab ── */}
      {tab === 'registry' && (
        <div className={`flex-1 overflow-y-auto ${px} py-8`}>
          <div style={{ maxWidth: '720px' }}>
            {studioArtifacts.length === 0 ? (
              <div style={{ opacity: 0.4, textAlign: 'center', paddingTop: '60px' }}>
                <span style={{ fontSize: '28px', display: 'block', marginBottom: '10px' }}>✦</span>
                <p style={{ color: 'var(--text-5)', fontSize: '12px', lineHeight: 1.6 }}>
                  No artifacts yet.<br />Generate an image in Create to start the registry.
                </p>
              </div>
            ) : (
              <>
                <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '16px' }}>
                  Artifact Registry — {studioArtifacts.length} saved
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '12px' }}>
                  {studioArtifacts.map(a => (
                    <div
                      key={a.id}
                      style={{
                        background: 'var(--bg-1)', border: '1px solid var(--border-0)',
                        borderRadius: '6px', overflow: 'hidden',
                        cursor: 'pointer',
                      }}
                      onClick={() => { setActiveItemId(a.id); setTab('create') }}
                    >
                      <img
                        src={a.url}
                        alt={a.title}
                        style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', display: 'block' }}
                        onError={e => { e.target.style.display = 'none' }}
                      />
                      <div style={{ padding: '8px 10px' }}>
                        <p style={{ color: 'var(--text-1)', fontSize: '11px', fontWeight: 600, marginBottom: '3px', lineHeight: 1.3 }}>
                          {a.title}
                        </p>
                        {a.sourceConstellation && (
                          <p style={{ color: '#a07830', fontSize: '8px', marginBottom: '2px' }}>
                            ◈ {a.sourceConstellation}
                          </p>
                        )}
                        {a.sourceDoctrine && (
                          <p style={{ color: '#6366f1', fontSize: '8px', marginBottom: '2px' }}>
                            ⬡ {a.sourceDoctrine}
                          </p>
                        )}
                        <p style={{ color: 'var(--text-6)', fontSize: '8px', marginTop: '2px' }}>
                          {a.generatedAt?.toDate?.().toLocaleDateString?.() ?? ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Create tab ── */}
      {tab === 'create' && (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Works rail — desktop only */}
          {!isMobile && (
            <WorksRail
              studioArtifacts={studioArtifacts}
              activeItemId={activeItemId}
              onSelect={setActiveItemId}
              onNew={() => setActiveItemId(null)}
            />
          )}

          {/* Canvas */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Mobile: quick switcher strip */}
            {isMobile && studioArtifacts.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', padding: '8px 12px', borderBottom: '1px solid var(--border-0)', flexShrink: 0, scrollbarWidth: 'none' }}>
                <button
                  onClick={() => setActiveItemId(null)}
                  style={{
                    flexShrink: 0, fontFamily: 'inherit', cursor: 'pointer',
                    background: activeItemId === null ? 'var(--bg-3)' : 'var(--bg-1)',
                    border: `1px solid ${activeItemId === null ? 'var(--border-1)' : 'var(--border-0)'}`,
                    borderRadius: '5px', padding: '4px 10px',
                    color: activeItemId === null ? 'var(--text-1)' : 'var(--text-4)',
                    fontSize: '10px', fontWeight: activeItemId === null ? 600 : 400,
                  }}
                >
                  ✦ New
                </button>
                {studioArtifacts.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setActiveItemId(a.id)}
                    style={{
                      flexShrink: 0, fontFamily: 'inherit', cursor: 'pointer',
                      background: activeItemId === a.id ? 'var(--bg-3)' : 'var(--bg-1)',
                      border: `1px solid ${activeItemId === a.id ? 'var(--border-1)' : 'var(--border-0)'}`,
                      borderRadius: '5px', padding: '4px 8px',
                      color: activeItemId === a.id ? 'var(--text-1)' : 'var(--text-4)',
                      fontSize: '10px', maxWidth: '120px', whiteSpace: 'nowrap',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                    }}
                  >
                    {a.title}
                  </button>
                ))}
              </div>
            )}

            {/* Detail view: selected artifact */}
            {activeStudioItem && (
              <StudioItemDetail
                item={activeStudioItem}
                onUpdateArtifact={onUpdateArtifact}
                onGenerateFrom={handleGenerateFrom}
              />
            )}

            {/* Generate view: no item selected */}
            {!activeStudioItem && (
              <>
                {/* Prompt bar */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-0)', flexShrink: 0 }}>
                  {sourceCtx?.sourceConstellation && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <span style={{ color: '#a07830', fontSize: '8px' }}>◈</span>
                      <span style={{ color: '#a07830', fontSize: '9px', fontWeight: 500 }}>{sourceCtx.sourceConstellation}</span>
                      {sourceCtx.sourceConstellationConfidence !== null && sourceCtx.sourceConstellationConfidence !== undefined && (
                        <span style={{ color: 'var(--text-6)', fontSize: '8px' }}>{sourceCtx.sourceConstellationConfidence}% confidence</span>
                      )}
                    </div>
                  )}
                  <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleGenerate() }}
                    placeholder="Describe what to create… (Ctrl+Enter to generate)"
                    rows={isMobile ? 2 : 3}
                    style={{
                      width: '100%', background: 'var(--bg-1)', border: '1px solid var(--border-1)',
                      borderRadius: '6px', color: 'var(--text-1)', fontSize: '12px', lineHeight: 1.6,
                      padding: '8px 10px', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={handleGenerate}
                      disabled={!prompt.trim() || !openaiApiKey || generating}
                      style={{
                        background: prompt.trim() && openaiApiKey && !generating ? '#0f172a' : 'var(--bg-2)',
                        border: `1px solid ${prompt.trim() && openaiApiKey && !generating ? '#3b82f660' : 'var(--border-1)'}`,
                        color: prompt.trim() && openaiApiKey && !generating ? '#93c5fd' : 'var(--text-6)',
                        fontSize: '11px', fontWeight: 600, padding: '6px 16px', borderRadius: '6px',
                        cursor: !prompt.trim() || !openaiApiKey || generating ? 'default' : 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {generating ? '⟳ Generating…' : '✦ Generate'}
                    </button>
                    {!openaiApiKey && (
                      <p style={{ color: 'var(--text-6)', fontSize: '10px', fontStyle: 'italic' }}>
                        OpenAI key required — add in Settings
                      </p>
                    )}
                    {genError && (
                      <p style={{ color: '#ef4444', fontSize: '10px' }}>{genError}</p>
                    )}
                  </div>
                </div>

                {/* Canvas area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  {generating && !canvas && (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic' }}>Studio is creating…</p>
                    </div>
                  )}
                  {!canvas && !generating && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                      <span style={{ fontSize: '36px', marginBottom: '12px', display: 'block' }}>✦</span>
                      <p style={{ color: 'var(--text-5)', fontSize: '12px', textAlign: 'center', lineHeight: 1.6 }}>
                        Canvas is empty.<br />Enter a prompt and generate.
                      </p>
                    </div>
                  )}
                  {canvas && (
                    <div style={{ width: '100%', maxWidth: '600px' }}>
                      <img
                        src={canvas.url}
                        alt="Studio creation"
                        style={{ width: '100%', borderRadius: '4px', display: 'block', border: '1px solid var(--border-0)' }}
                      />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <a
                          href={canvas.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            background: 'none', border: '1px solid var(--border-1)',
                            color: 'var(--text-3)', fontSize: '10px', padding: '4px 12px',
                            borderRadius: '5px', textDecoration: 'none', display: 'inline-block',
                          }}
                        >
                          ↗ Open full size
                        </a>
                      </div>
                      {canvas.revisedPrompt && canvas.revisedPrompt !== canvas.promptUsed && (
                        <p style={{ color: 'var(--text-6)', fontSize: '9px', marginTop: '10px', fontStyle: 'italic', lineHeight: 1.5 }}>
                          Studio interpreted: "{canvas.revisedPrompt.slice(0, 160)}{canvas.revisedPrompt.length > 160 ? '…' : ''}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Session history thumbnails */}
                  {history.length > 1 && (
                    <div style={{ width: '100%', maxWidth: '600px', paddingTop: '8px', borderTop: '1px solid var(--border-0)' }}>
                      <p style={{ color: 'var(--text-6)', fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>Session History</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {history.slice(1).map(item => (
                          <button
                            key={item.id}
                            onClick={() => setCanvas(item)}
                            style={{ background: 'none', border: '1px solid var(--border-1)', padding: '2px', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            <img
                              src={item.url}
                              alt=""
                              style={{ width: '64px', height: '64px', objectFit: 'cover', display: 'block', borderRadius: '2px' }}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Decisions tab ── */}
      {tab === 'decisions' && <div className={`flex-1 overflow-y-auto ${px} py-8`}>

        {builderReadiness === 'approved' && (
          <div style={{ maxWidth: '560px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
              <span style={{ color: '#10b981' }}>✓</span>
              <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>
                Human Gate authorization confirmed
              </span>
            </div>

            {approvedThreads.length > 0 ? (
              <div style={{ marginBottom: '32px' }}>
                <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
                  textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>
                  Approved Decisions
                </p>
                {approvedThreads.map(t => (
                  <ThreadCard
                    key={t.id}
                    thread={t}
                    onForge={onForge}
                    hasApiKey={!!apiKey}
                    onRecordOutcome={onRecordOutcome}
                  />
                ))}
              </div>
            ) : (
              <div style={{
                background: 'var(--bg-2)', border: '1px solid var(--border-1)',
                borderRadius: '8px', padding: '20px 24px', marginBottom: '32px',
              }}>
                <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic' }}>
                  No approved decisions yet. K.E.L. approvals will appear here.
                </p>
              </div>
            )}
          </div>
        )}

        {builderReadiness === 'pending' && (
          <div style={{ maxWidth: '480px' }}>
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>
              Authorization Status
            </p>
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '14px',
              background: 'var(--bg-2)', border: '1px solid #3b82f630',
              borderLeft: '3px solid #3b82f6', borderRadius: '0 8px 8px 0',
              padding: '16px 20px', marginBottom: '24px',
            }}>
              <span style={{ color: '#3b82f6', fontSize: '16px', lineHeight: 1, marginTop: '1px' }}>◌</span>
              <div>
                <p style={{ color: 'var(--text-1)', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Human Gate approval — under review
                </p>
                <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.6 }}>
                  K.E.L. has received the request and is evaluating readiness.
                  No action is required. Builder Studio opens when the decision is recorded.
                </p>
              </div>
            </div>
            <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.7 }}>
              The Human Gate is not a delay. It is the authorization that makes what is built here
              traceable. When KEL approves, the record of that approval travels with every artifact
              Builder Studio produces.
            </p>
          </div>
        )}

        {builderReadiness === 'locked' && (
          <div style={{ maxWidth: '520px' }}>
            <p style={{ color: 'var(--text-2)', fontSize: '14px', lineHeight: 1.7, marginBottom: '8px' }}>
              Builder Studio converts approved institutional decisions into executable plans.
            </p>
            <p style={{ color: 'var(--text-4)', fontSize: '12px', lineHeight: 1.7, marginBottom: '32px' }}>
              Work produced here is traceable back to the observations and decisions that authorized it.
              Every output is accountable to the record that produced it.
            </p>

            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>
              Authorization Required
            </p>
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '14px',
              background: 'var(--bg-2)', border: '1px solid var(--border-1)',
              borderRadius: '8px', padding: '16px 20px', marginBottom: '32px',
            }}>
              <span style={{ color: 'var(--text-5)', fontSize: '14px', lineHeight: 1, marginTop: '1px' }}>☐</span>
              <div>
                <p style={{ color: 'var(--text-2)', fontSize: '12px', fontWeight: 600, marginBottom: '3px' }}>
                  Human Gate approval from K.E.L.
                </p>
                <p style={{ color: 'var(--text-5)', fontSize: '11px' }}>Not yet recorded</p>
              </div>
            </div>

            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '12px' }}>
              After Authorization
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
              {[
                'Manufacture artifacts from approved KEL decisions',
                'Generate domain-specific action packages',
                'Surface artifacts in OpsCore Field View',
                'Record outcomes back to Archivist Hall',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--text-6)', fontSize: '10px', marginTop: '2px' }}>→</span>
                  <p style={{ color: 'var(--text-4)', fontSize: '12px', lineHeight: 1.55 }}>{item}</p>
                </div>
              ))}
            </div>

            {onNavigate && (
              <button
                onClick={() => onNavigate('businesscenter')}
                style={{
                  background: 'none', border: '1px solid var(--border-1)',
                  color: 'var(--text-3)', fontSize: '12px', cursor: 'pointer',
                  padding: '8px 16px', borderRadius: '6px', fontFamily: 'inherit',
                }}
              >
                Submit readiness review in Business Center →
              </button>
            )}
          </div>
        )}
      </div>}

      {/* ── Outcomes tab ── */}
      {tab === 'outcomes' && (
        <div className={`flex-1 overflow-y-auto ${px} py-8`}>
          <div style={{ maxWidth: '560px' }}>
            {completedThreads.length === 0 ? (
              <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic', lineHeight: 1.7 }}>
                No outcomes recorded yet. Forge an artifact and record the result in the Decisions tab.
              </p>
            ) : (
              <>
                <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
                  textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>
                  Recorded Outcomes — {completedThreads.length}
                </p>
                {completedThreads.map(t => {
                  const color = OUTCOME_SIGNAL_COLORS[t.outcomeSignal] || 'var(--text-4)'
                  return (
                    <div key={t.id} style={{
                      background: 'var(--bg-2)', border: '1px solid var(--border-1)',
                      borderLeft: `3px solid ${color}`,
                      borderRadius: '0 8px 8px 0', padding: '14px 18px', marginBottom: '10px',
                    }}>
                      <p style={{ color: 'var(--text-1)', fontSize: '12px', lineHeight: 1.6,
                        marginBottom: '8px' }}>
                        {t.recommendation}
                      </p>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center',
                        flexWrap: 'wrap', marginBottom: t.outcomeNote ? '8px' : '0' }}>
                        <span style={{ color, fontSize: '10px', fontWeight: 700,
                          textTransform: 'capitalize' }}>
                          ◈ {t.outcomeSignal}
                        </span>
                        {t.domain && (
                          <span style={{ color: 'var(--text-5)', fontSize: '10px' }}>{t.domain}</span>
                        )}
                        {t.artifact && (
                          <span style={{ color: '#10b981', fontSize: '10px' }}>⚒ {t.artifact.title}</span>
                        )}
                      </div>
                      {t.outcomeNote && (
                        <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.6 }}>
                          {t.outcomeNote}
                        </p>
                      )}
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
