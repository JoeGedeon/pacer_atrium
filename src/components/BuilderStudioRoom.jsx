import { useState } from 'react'
import { speakWithVoice, getVoiceConfig } from '../lib/roomVoice'
import RoomSubNav from './RoomSubNav'

const BUILDER_TABS = [
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
        Sent to Theater · Thread outcome recorded
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

// ── Main ──────────────────────────────────────────────────────────────────────

export default function BuilderStudioRoom({ isMobile, builderReadiness, threads = [], onNavigate, onForge, apiKey, onRecordOutcome }) {
  const [tab, setTab] = useState('decisions')
  const px = isMobile ? 'px-6' : 'px-10'
  const approvedThreads = threads.filter(t => t.decision === 'approved')
  const completedThreads = approvedThreads.filter(t => t.outcomeSignal)

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
                'Send production cargo to Theater',
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
