import { useState, useMemo } from 'react'
import RoomSubNav from './RoomSubNav'
import { speakWithVoice, getVoiceConfig } from '../lib/roomVoice'

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
  {
    number: 3,
    title: 'Memory Serves the Person',
    text: 'Treat records as evidence that people were here.',
    ratified: 'June 2026',
    note: 'Records are not the purpose of the institution. Records are the witness of an encounter, an observation, a decision, a lesson, a contribution, or a life intersecting with the institution. The institution does not exist to accumulate records. The institution exists to serve people. Memory is valuable because people are valuable. Data is valuable because experience occurred. When trade-offs appear, the institution chooses the person before the record.',
    test: {
      question: 'Does this help memory serve the person?',
      yes: 'Proceed.',
      no: 'Stop.',
    },
    closing: 'Memory serves the person. The person does not serve the memory.',
  },
]

const CANDIDATE_PRINCIPLES = [
  {
    id: 'reality-voted',
    text: 'Reality voted. Architecture adapted.',
    inConsideration: 'June 2026',
    note: 'The institution was built in conversation, then tested in production. When the first users arrived, the roadmap changed — not because the architecture was wrong, but because reality is always the most accurate observer in the room. A principle earns the wall by surviving contact with actual humans. Plans that never meet friction are theories, not principles. The order of operations is not: design, then learn. It is: design, ship, observe, adapt. The institution does not resist this. The institution depends on it. Currently in the shaking phase.',
  },
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

const DOCTRINE_TABS = [
  { id: 'principles',    label: 'Principles' },
  { id: 'canonizations', label: 'Canonizations' },
  { id: 'charter',       label: 'Charter' },
  { id: 'review',        label: '⚖ Review' },
  { id: 'weights',       label: 'Weights' },
]

const ARTICLES = [
  'Article I: Institutional Identity',
  'Article II: Provenance Requirement',
  'Article III: Chain Preservation',
  'Article IV: Human Accountability',
  'Article V: Challenge Rights',
  'Article VI: Reputation',
  'Article VII: Correction and Memory',
  'Article VIII: Forecast Transparency',
  'Preamble',
]

const ORIGIN_ROOMS = [
  'Atrium', 'MUSE', 'VERA', 'K.E.L.', 'Theater',
  'OpsCore', 'Archivist Hall', 'Business Center', 'Doctrine', 'Other',
]

const STATUS_LABELS = {
  proposed:     { label: 'Proposed',             color: '#6b7280' },
  under_review: { label: 'Under Review',         color: '#3b82f6' },
  standing:     { label: 'Standing Established', color: '#10b981' },
  no_standing:  { label: 'No Standing',          color: '#ef4444' },
  overturned:   { label: 'Overturned',           color: '#f59e0b' },
}

const CONSTITUTIONAL_TEST = [
  'Does it preserve provenance?',
  'Does it preserve challenge rights?',
  'Does it preserve correction history?',
  'Does it preserve chain integrity?',
  'Does it require constitutional standing before it may act?',
]

const EMPTY_FORM = {
  title: '', originRoom: '', triggerEvent: '', articlesInvolved: [],
  summary: '', facts: '', evidence: '', conflictingPrinciples: '',
  risks: '', holding: '', conditions: '', limitations: '', reasoning: '',
}

function CaseIntakeForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  function set(key, val) { setForm(prev => ({ ...prev, [key]: val })) }

  function toggleArticle(a) {
    setForm(prev => ({
      ...prev,
      articlesInvolved: prev.articlesInvolved.includes(a)
        ? prev.articlesInvolved.filter(x => x !== a)
        : [...prev.articlesInvolved, a],
    }))
  }

  async function handleSubmit() {
    if (!form.title.trim()) return
    setSaving(true)
    try { await onSubmit(form) } finally { setSaving(false) }
  }

  const inputStyle = {
    width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border-1)',
    borderRadius: '6px', padding: '8px 10px', color: 'var(--text-1)',
    fontSize: '12px', fontFamily: 'inherit', resize: 'vertical',
  }
  const labelStyle = { color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.12em',
    textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px', display: 'block' }

  return (
    <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border-1)',
      borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
      <p style={{ color: 'var(--text-3)', fontSize: '11px', fontWeight: 600,
        marginBottom: '20px', letterSpacing: '0.06em' }}>NEW CONSTITUTIONAL CASE</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <span style={labelStyle}>Case Title *</span>
          <input style={inputStyle} value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="Brief identifying title for this case" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <span style={labelStyle}>Origin Room</span>
            <select style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.originRoom} onChange={e => set('originRoom', e.target.value)}>
              <option value="">Select…</option>
              {ORIGIN_ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <span style={labelStyle}>Trigger Event</span>
            <input style={inputStyle} value={form.triggerEvent}
              onChange={e => set('triggerEvent', e.target.value)}
              placeholder="What forced interpretation?" />
          </div>
        </div>

        <div>
          <span style={labelStyle}>Articles in Tension</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {ARTICLES.map(a => {
              const active = form.articlesInvolved.includes(a)
              return (
                <button key={a} onClick={() => toggleArticle(a)} style={{
                  background: active ? '#3b82f620' : 'var(--bg-2)',
                  border: `1px solid ${active ? '#3b82f6' : 'var(--border-1)'}`,
                  color: active ? '#3b82f6' : 'var(--text-4)',
                  fontSize: '10px', padding: '3px 8px', borderRadius: '4px',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  {a}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <span style={labelStyle}>Summary</span>
          <textarea rows={2} style={inputStyle} value={form.summary}
            onChange={e => set('summary', e.target.value)}
            placeholder="One-sentence statement of the constitutional question" />
        </div>

        <div>
          <span style={labelStyle}>Facts</span>
          <textarea rows={3} style={inputStyle} value={form.facts}
            onChange={e => set('facts', e.target.value)}
            placeholder="Operational circumstances that produced this case" />
        </div>

        <div>
          <span style={labelStyle}>Evidence</span>
          <textarea rows={2} style={inputStyle} value={form.evidence}
            onChange={e => set('evidence', e.target.value)}
            placeholder="What data or observations are in the record?" />
        </div>

        <div>
          <span style={labelStyle}>Conflicting Principles</span>
          <textarea rows={2} style={inputStyle} value={form.conflictingPrinciples}
            onChange={e => set('conflictingPrinciples', e.target.value)}
            placeholder="How do the involved articles pull against each other?" />
        </div>

        <div>
          <span style={labelStyle}>Risks</span>
          <textarea rows={2} style={inputStyle} value={form.risks}
            onChange={e => set('risks', e.target.value)}
            placeholder="What breaks if we get this interpretation wrong?" />
        </div>

        <div style={{ borderTop: '1px solid var(--border-1)', paddingTop: '14px' }}>
          <p style={{ ...labelStyle, color: '#3b82f680', marginBottom: '12px' }}>
            DECISION (may be completed later)
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <span style={labelStyle}>Holding</span>
              <textarea rows={2} style={inputStyle} value={form.holding}
                onChange={e => set('holding', e.target.value)}
                placeholder="The decision in one or two sentences" />
            </div>
            <div>
              <span style={labelStyle}>Conditions</span>
              <textarea rows={2} style={inputStyle} value={form.conditions}
                onChange={e => set('conditions', e.target.value)}
                placeholder="What must be true for this holding to apply?" />
            </div>
            <div>
              <span style={labelStyle}>Limitations</span>
              <textarea rows={2} style={inputStyle} value={form.limitations}
                onChange={e => set('limitations', e.target.value)}
                placeholder="Where does this holding not extend?" />
            </div>
            <div>
              <span style={labelStyle}>Reasoning</span>
              <textarea rows={3} style={inputStyle} value={form.reasoning}
                onChange={e => set('reasoning', e.target.value)}
                placeholder="Why this interpretation rather than another?" />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
          <button onClick={onCancel} style={{
            background: 'none', border: '1px solid var(--border-1)',
            color: 'var(--text-4)', fontSize: '11px', padding: '7px 14px',
            borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit',
          }}>Cancel</button>
          <button onClick={handleSubmit} disabled={!form.title.trim() || saving} style={{
            background: '#3b82f6', border: 'none', color: '#fff',
            fontSize: '11px', padding: '7px 16px', borderRadius: '6px',
            cursor: form.title.trim() && !saving ? 'pointer' : 'default',
            fontFamily: 'inherit', opacity: form.title.trim() && !saving ? 1 : 0.5,
          }}>
            {saving ? 'Opening…' : 'Open Case'}
          </button>
        </div>
      </div>
    </div>
  )
}

function CaseCard({ c, onUpdate }) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing]   = useState(false)
  const [form, setForm]         = useState(null)
  const [saving, setSaving]     = useState(false)
  const status = STATUS_LABELS[c.status] || STATUS_LABELS.proposed
  const caseId = `CASE-${String(c.caseNumber || 0).padStart(3, '0')}`

  function startEdit() {
    setForm({
      holding: c.holding || '', conditions: c.conditions || '',
      limitations: c.limitations || '', reasoning: c.reasoning || '',
    })
    setEditing(true)
  }

  async function saveEdit() {
    setSaving(true)
    try { await onUpdate(c.id, form) } finally { setSaving(false); setEditing(false) }
  }

  async function advance(newStatus, extra = {}) {
    setSaving(true)
    try {
      await onUpdate(c.id, {
        status: newStatus,
        ...extra,
        ...(newStatus === 'standing'    ? { establishedAt: new Date().toISOString() } : {}),
        ...(newStatus === 'no_standing' ? { establishedAt: new Date().toISOString() } : {}),
        ...(newStatus === 'overturned'  ? { overturnedAt:  new Date().toISOString() } : {}),
      })
    } finally { setSaving(false) }
  }

  const inputStyle = {
    width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border-1)',
    borderRadius: '6px', padding: '8px 10px', color: 'var(--text-1)',
    fontSize: '12px', fontFamily: 'inherit', resize: 'vertical',
  }

  return (
    <div style={{
      border: `1px solid ${c.status === 'standing' ? '#10b98130' : c.status === 'no_standing' ? '#ef444430' : 'var(--border-1)'}`,
      borderLeft: `3px solid ${status.color}`,
      borderRadius: '0 10px 10px 0',
      overflow: 'hidden',
      marginBottom: '12px',
    }}>
      {/* Summary row */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ padding: '12px 16px', cursor: 'pointer', background: 'var(--bg-1)',
          display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: 'var(--text-5)', fontSize: '10px', fontWeight: 700,
          flexShrink: 0, minWidth: '72px' }}>{caseId}</span>
        <span style={{ color: 'var(--text-1)', fontSize: '12px', fontWeight: 500, flex: 1 }}>
          {c.title}
        </span>
        <span style={{
          fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
          background: status.color + '20', color: status.color, flexShrink: 0,
        }}>
          {status.label}
        </span>
        <span style={{ color: 'var(--text-5)', fontSize: '11px', flexShrink: 0 }}>
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {expanded && (
        <div style={{ background: 'var(--bg-0)', padding: '16px 20px' }}>
          {/* Metadata */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px',
            marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid var(--border-0)' }}>
            {c.originRoom && (
              <div>
                <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.1em',
                  textTransform: 'uppercase', marginBottom: '3px' }}>Origin</p>
                <p style={{ color: 'var(--text-3)', fontSize: '11px' }}>{c.originRoom}</p>
              </div>
            )}
            {c.triggerEvent && (
              <div>
                <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.1em',
                  textTransform: 'uppercase', marginBottom: '3px' }}>Trigger</p>
                <p style={{ color: 'var(--text-3)', fontSize: '11px' }}>{c.triggerEvent}</p>
              </div>
            )}
            {c.articlesInvolved?.length > 0 && (
              <div>
                <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.1em',
                  textTransform: 'uppercase', marginBottom: '6px' }}>Articles in Tension</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {c.articlesInvolved.map(a => (
                    <span key={a} style={{
                      fontSize: '10px', padding: '2px 7px', borderRadius: '4px',
                      background: '#3b82f615', color: '#3b82f6aa',
                    }}>{a}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Facts / Summary / Evidence */}
          {[
            { key: 'summary', label: 'Summary' },
            { key: 'facts', label: 'Facts' },
            { key: 'evidence', label: 'Evidence' },
            { key: 'conflictingPrinciples', label: 'Conflicting Principles' },
            { key: 'risks', label: 'Risks' },
          ].filter(f => c[f.key]).map(f => (
            <div key={f.key} style={{ marginBottom: '12px' }}>
              <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.1em',
                textTransform: 'uppercase', marginBottom: '4px' }}>{f.label}</p>
              <p style={{ color: 'var(--text-3)', fontSize: '12px', lineHeight: 1.7 }}>{c[f.key]}</p>
            </div>
          ))}

          {/* Decision */}
          {(c.holding || c.conditions || c.limitations || c.reasoning || editing) && (
            <div style={{ borderTop: '1px solid var(--border-0)', paddingTop: '14px',
              marginTop: '4px', marginBottom: '14px' }}>
              <p style={{ color: '#3b82f680', fontSize: '9px', letterSpacing: '0.12em',
                textTransform: 'uppercase', fontWeight: 600, marginBottom: '12px' }}>Decision</p>
              {editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { key: 'holding', label: 'Holding', rows: 2 },
                    { key: 'conditions', label: 'Conditions', rows: 2 },
                    { key: 'limitations', label: 'Limitations', rows: 2 },
                    { key: 'reasoning', label: 'Reasoning', rows: 3 },
                  ].map(f => (
                    <div key={f.key}>
                      <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.12em',
                        textTransform: 'uppercase', fontWeight: 600, marginBottom: '5px' }}>{f.label}</p>
                      <textarea rows={f.rows} style={inputStyle}
                        value={form[f.key]}
                        onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setEditing(false)} style={{
                      background: 'none', border: '1px solid var(--border-1)',
                      color: 'var(--text-4)', fontSize: '11px', padding: '5px 12px',
                      borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit',
                    }}>Cancel</button>
                    <button onClick={saveEdit} disabled={saving} style={{
                      background: '#3b82f6', border: 'none', color: '#fff',
                      fontSize: '11px', padding: '5px 14px', borderRadius: '6px',
                      cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit',
                    }}>{saving ? 'Saving…' : 'Save Decision'}</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { key: 'holding', label: 'Holding' },
                    { key: 'conditions', label: 'Conditions' },
                    { key: 'limitations', label: 'Limitations' },
                    { key: 'reasoning', label: 'Reasoning' },
                  ].filter(f => c[f.key]).map(f => (
                    <div key={f.key}>
                      <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.1em',
                        textTransform: 'uppercase', marginBottom: '4px' }}>{f.label}</p>
                      <p style={{ color: 'var(--text-2)', fontSize: '12px', lineHeight: 1.7 }}>{c[f.key]}</p>
                    </div>
                  ))}
                  {!editing && (
                    <button onClick={startEdit} style={{
                      alignSelf: 'flex-start', background: 'none',
                      border: '1px solid var(--border-1)', color: 'var(--text-4)',
                      fontSize: '10px', padding: '4px 10px', borderRadius: '5px',
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}>Edit Decision</button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Status transitions */}
          {!editing && (
            <div style={{ borderTop: '1px solid var(--border-0)', paddingTop: '12px' }}>
              <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.1em',
                textTransform: 'uppercase', marginBottom: '10px' }}>Status</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                {c.status === 'proposed' && (
                  <>
                    <button onClick={() => advance('under_review')} disabled={saving} style={{
                      background: '#3b82f620', border: '1px solid #3b82f6',
                      color: '#3b82f6', fontSize: '11px', padding: '5px 12px',
                      borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit',
                    }}>Advance to Review</button>
                    {!c.holding && (
                      <button onClick={startEdit} style={{
                        background: 'none', border: '1px solid var(--border-1)',
                        color: 'var(--text-4)', fontSize: '11px', padding: '5px 12px',
                        borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit',
                      }}>Add Decision</button>
                    )}
                  </>
                )}
                {c.status === 'under_review' && (
                  <>
                    <button onClick={() => advance('standing')} disabled={saving} style={{
                      background: '#10b98120', border: '1px solid #10b981',
                      color: '#10b981', fontSize: '11px', padding: '5px 12px',
                      borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit',
                    }}>⚖ Establish Standing</button>
                    <button onClick={() => advance('no_standing')} disabled={saving} style={{
                      background: '#ef444420', border: '1px solid #ef4444',
                      color: '#ef4444', fontSize: '11px', padding: '5px 12px',
                      borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
                    }}>✕ No Standing Established</button>
                  </>
                )}
                {c.status === 'standing' && (
                  <button onClick={() => advance('overturned')} disabled={saving} style={{
                    background: 'none', border: '1px solid #f59e0b60',
                    color: '#f59e0b80', fontSize: '10px', padding: '4px 10px',
                    borderRadius: '5px', cursor: 'pointer', fontFamily: 'inherit',
                  }}>Overturn</button>
                )}
                {(c.establishedAt || c.overturnedAt) && (
                  <span style={{ color: 'var(--text-6)', fontSize: '10px' }}>
                    {c.status === 'standing' && `Standing since ${new Date(c.establishedAt).toLocaleDateString()}`}
                    {c.status === 'no_standing' && `Closed ${new Date(c.establishedAt).toLocaleDateString()}`}
                    {c.status === 'overturned' && `Overturned ${new Date(c.overturnedAt).toLocaleDateString()}`}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ReviewTab({ doctrineCases, onCreateCase, onUpdateCase }) {
  const [showForm, setShowForm] = useState(false)
  const [subview, setSubview]   = useState('cases') // 'cases' | 'precedent' | 'test'

  const activeCases    = useMemo(() => doctrineCases.filter(c => c.status === 'proposed' || c.status === 'under_review'), [doctrineCases])
  const standingCases  = useMemo(() => doctrineCases.filter(c => c.status === 'standing'), [doctrineCases])
  const closedCases    = useMemo(() => doctrineCases.filter(c => c.status === 'no_standing' || c.status === 'overturned'), [doctrineCases])

  async function handleCreate(data) {
    await onCreateCase(data)
    setShowForm(false)
  }

  const subBtnStyle = (active) => ({
    background: 'none', border: 'none',
    borderBottom: `2px solid ${active ? 'var(--text-2)' : 'transparent'}`,
    color: active ? 'var(--text-1)' : 'var(--text-5)',
    fontSize: '11px', fontWeight: active ? 600 : 400, padding: '8px 14px',
    cursor: 'pointer', fontFamily: 'inherit', marginBottom: '-1px',
  })

  return (
    <div style={{ maxWidth: '680px' }}>
      {/* Preamble */}
      <div style={{ background: 'var(--bg-1)', border: '1px solid #3b82f620',
        borderLeft: '3px solid #3b82f6', borderRadius: '0 8px 8px 0',
        padding: '14px 18px', marginBottom: '24px' }}>
        <p style={{ color: '#3b82f6', fontSize: '9px', fontWeight: 700,
          letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>
          Preamble
        </p>
        <p style={{ color: 'var(--text-2)', fontSize: '13px', lineHeight: 1.7, fontStyle: 'italic' }}>
          An institution is not defined by the accuracy of its conclusions.
          It is defined by the integrity of its corrections.
        </p>
      </div>

      {/* Sub-navigation */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-1)', marginBottom: '20px' }}>
        <button style={subBtnStyle(subview === 'cases')}    onClick={() => setSubview('cases')}>
          Cases ({activeCases.length})
        </button>
        <button style={subBtnStyle(subview === 'precedent')} onClick={() => setSubview('precedent')}>
          Precedent ({standingCases.length})
        </button>
        <button style={subBtnStyle(subview === 'test')}     onClick={() => setSubview('test')}>
          Constitutional Test
        </button>
        {closedCases.length > 0 && (
          <button style={subBtnStyle(subview === 'closed')} onClick={() => setSubview('closed')}>
            Closed ({closedCases.length})
          </button>
        )}
      </div>

      {/* Cases subview */}
      {subview === 'cases' && (
        <>
          {showForm
            ? <CaseIntakeForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
            : (
              <button onClick={() => setShowForm(true)} style={{
                background: 'none', border: '1px dashed var(--border-1)',
                color: 'var(--text-4)', fontSize: '11px', padding: '8px 16px',
                borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit',
                marginBottom: '20px', width: '100%',
              }}>
                + Open New Case
              </button>
            )
          }
          {activeCases.length === 0 && !showForm && (
            <p style={{ color: 'var(--text-6)', fontSize: '12px', fontStyle: 'italic', lineHeight: 1.7 }}>
              No active cases. The constitution accumulates only as fast as operational reality produces cases.
            </p>
          )}
          {activeCases.map(c => (
            <CaseCard key={c.id} c={c} onUpdate={onUpdateCase} />
          ))}
        </>
      )}

      {/* Precedent subview */}
      {subview === 'precedent' && (
        <>
          {standingCases.length === 0 ? (
            <p style={{ color: 'var(--text-6)', fontSize: '12px', fontStyle: 'italic', lineHeight: 1.7 }}>
              No precedent established yet. A principle gains standing only after operational reality produces a case requiring interpretation.
            </p>
          ) : (
            <>
              <p style={{ color: 'var(--text-5)', fontSize: '10px', fontStyle: 'italic',
                marginBottom: '16px', lineHeight: 1.7 }}>
                Standing Established decisions are institutional precedent.
                Future rooms may cite them without requiring new constitutional review.
              </p>
              {standingCases.map(c => (
                <CaseCard key={c.id} c={c} onUpdate={onUpdateCase} />
              ))}
            </>
          )}
        </>
      )}

      {/* Constitutional Test subview */}
      {subview === 'test' && (
        <div>
          <p style={{ color: 'var(--text-5)', fontSize: '10px', fontStyle: 'italic',
            marginBottom: '20px', lineHeight: 1.7 }}>
            Before a new room, feature, or capability ships, it must pass this test.
            If any answer fails, the feature requires Doctrine Review before it may proceed.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {CONSTITUTIONAL_TEST.map((q, i) => (
              <div key={i} style={{
                background: 'var(--bg-2)', border: '1px solid var(--border-1)',
                borderRadius: '8px', padding: '14px 16px',
                display: 'flex', gap: '14px', alignItems: 'flex-start',
              }}>
                <span style={{ color: '#3b82f660', fontSize: '11px',
                  fontWeight: 700, flexShrink: 0, minWidth: '20px', paddingTop: '1px' }}>
                  {i + 1}.
                </span>
                <p style={{ color: 'var(--text-2)', fontSize: '12px', lineHeight: 1.6 }}>{q}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '20px', background: 'var(--bg-1)', border: '1px solid var(--border-1)',
            borderRadius: '8px', padding: '14px 16px' }}>
            <p style={{ color: '#ef444470', fontSize: '9px', letterSpacing: '0.12em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>
              If any answer is no
            </p>
            <p style={{ color: 'var(--text-3)', fontSize: '12px', lineHeight: 1.7 }}>
              The feature does not ship until a case is opened, reviewed, and standing is established.
              A feature that cannot satisfy constitutional review has no standing to produce institutional output.
            </p>
          </div>
          <div style={{ marginTop: '12px', background: 'var(--bg-1)', border: '1px solid var(--border-1)',
            borderRadius: '8px', padding: '14px 16px' }}>
            <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.12em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>
              Constitutional Review vs. Content Moderation
            </p>
            <p style={{ color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.7 }}>
              Content moderation filters output. Constitutional review determines what kinds of rooms
              are permitted to produce output in the first place. The distinction is architectural.
            </p>
          </div>
        </div>
      )}

      {/* Closed subview */}
      {subview === 'closed' && closedCases.length > 0 && (
        <>
          <p style={{ color: 'var(--text-5)', fontSize: '10px', fontStyle: 'italic',
            marginBottom: '16px', lineHeight: 1.7 }}>
            Closed cases remain in the record. A wrong conclusion that was later closed
            is more trustworthy than a system that pretends it was always right.
          </p>
          {closedCases.map(c => (
            <CaseCard key={c.id} c={c} onUpdate={onUpdateCase} />
          ))}
        </>
      )}
    </div>
  )
}

export default function DoctrineRoom({ isMobile, voiceMode, doctrineCases = [], onCreateCase, onUpdateCase }) {
  const [tab, setTab]         = useState('principles')
  const [speaking, setSpeaking] = useState(null)
  const px = isMobile ? '24px' : '40px'

  function readText(text, key) {
    if (speaking === key) return
    speakWithVoice(text, getVoiceConfig('vera'), {
      onStart: () => setSpeaking(key),
      onEnd:   () => setSpeaking(null),
      onError: () => setSpeaking(null),
    })
  }

  function principleText(p) {
    let t = `Principle ${p.number}: ${p.title}. ${p.text}.`
    if (p.note) t += ` ${p.note}`
    if (p.closing) t += ` ${p.closing}`
    return t
  }

  const fullDoctrineText = [
    ...CONSTITUTIONAL_PRINCIPLES.map(p => principleText(p)),
    ...CANDIDATE_PRINCIPLES.map(p => `Candidate principle: ${p.text}. ${p.note}`),
    ...PRINCIPLES.map(p => `Principle ${p.id}: ${p.text}`),
  ].join(' ')

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-0)' }}>

      {/* Header */}
      <div className="shrink-0" style={{ borderBottom: '1px solid var(--border-0)',
        padding: `20px ${px} 16px` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img
              src="/pacer-seal.png"
              alt="PACER Official Seal"
              style={{ width: '48px', height: '48px', objectFit: 'contain', flexShrink: 0 }}
            />
            <div>
              <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
                textTransform: 'uppercase', fontWeight: 600, marginBottom: '3px' }}>
                College of Understanding
              </p>
              <h2 style={{ fontSize: '18px', color: 'var(--text-0)', fontWeight: 700,
                letterSpacing: '0.08em', marginBottom: '3px' }}>Doctrine</h2>
              <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic' }}>
                Principles governing memory, understanding, and action.
              </p>
            </div>
          </div>
          <button
            onClick={() => readText(fullDoctrineText, 'doctrine')}
            disabled={speaking === 'doctrine'}
            style={{
              background: 'none', border: '1px solid var(--border-1)',
              color: speaking === 'doctrine' ? 'var(--text-5)' : 'var(--text-3)',
              fontSize: '11px', padding: '5px 12px', borderRadius: '6px',
              cursor: speaking === 'doctrine' ? 'default' : 'pointer',
              fontFamily: 'inherit', flexShrink: 0,
            }}
          >
            {speaking === 'doctrine' ? '🔊 Reading…' : '▶ Read Doctrine'}
          </button>
        </div>
      </div>

      <RoomSubNav tabs={DOCTRINE_TABS} activeTab={tab} onSelect={setTab} />

      <div className="flex-1 overflow-y-auto" style={{ padding: `24px ${px} 40px` }}>

      {tab === 'principles' && (<>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.08em' }}>
                      Ratified {p.ratified}
                    </span>
                    <button
                      onClick={() => readText(principleText(p), `p${p.number}`)}
                      disabled={speaking === `p${p.number}`}
                      style={{
                        background: 'none', border: '1px solid #f59e0b30',
                        color: speaking === `p${p.number}` ? '#f59e0b60' : '#f59e0b80',
                        fontSize: '9px', padding: '2px 7px', borderRadius: '4px',
                        cursor: speaking === `p${p.number}` ? 'default' : 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {speaking === `p${p.number}` ? '🔊' : '▶'}
                    </button>
                  </div>
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
                {p.test && (
                  <div style={{ marginTop: '14px', paddingTop: '14px',
                    borderTop: '1px solid #f59e0b15' }}>
                    <p style={{ color: '#f59e0b50', fontSize: '9px', letterSpacing: '0.12em',
                      textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>
                      The Test
                    </p>
                    <p style={{ color: 'var(--text-2)', fontSize: '12px', fontStyle: 'italic',
                      marginBottom: '8px' }}>{p.test.question}</p>
                    <div style={{ display: 'flex', gap: '24px' }}>
                      <p style={{ color: '#10b981', fontSize: '11px' }}>If yes — {p.test.yes}</p>
                      <p style={{ color: '#ef4444aa', fontSize: '11px' }}>If no — {p.test.no}</p>
                    </div>
                  </div>
                )}
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
      </>)}

      {tab === 'canonizations' && (<>
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
      </>)}

      {tab === 'charter' && (<>
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

      </>)}

      {tab === 'review' && (
        <ReviewTab
          doctrineCases={doctrineCases}
          onCreateCase={onCreateCase}
          onUpdateCase={onUpdateCase}
        />
      )}

      {tab === 'weights' && (
        <div style={{ maxWidth: '600px' }}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '12px' }}>
            Doctrine Weights
          </p>
          <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic', lineHeight: 1.7 }}>
            Doctrine weights express institutional priorities as a 0.0–1.0 scale.
            When principles conflict, weights determine what governs. Coming soon.
          </p>
        </div>
      )}

      <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border-1)' }}>
        <p style={{ color: 'var(--text-6)', fontSize: '11px', fontStyle: 'italic' }}>
          History is preserved. Canon is promoted.
        </p>
      </div>

      </div>
    </div>
  )
}
