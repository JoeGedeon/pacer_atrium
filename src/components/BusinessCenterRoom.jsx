import { useState, useEffect, useRef } from 'react'
import { generateInstitutionalPulse } from '../lib/claudeRouting'

const FLEETFLOW_URL = import.meta.env.VITE_FLEETFLOW_URL || null

// ── Constants ─────────────────────────────────────────────────────────────────

const TEACHINGS = [
  { label: 'Visibility',             note: "What you can't see, you can't manage. Operations require clear sight lines — into jobs, revenue, labor, and process." },
  { label: 'Accountability',         note: 'Processes have owners. Owners have consequences. Accountability is not punishment — it is protection.' },
  { label: 'Consequence',            note: 'Small failures compound. Name them early, before they become disputes, claims, or lost revenue.' },
  { label: 'Operational Stewardship',note: 'Protect the operation the way you protect what it carries. The work is in your custody.' },
  { label: 'Process Discipline',     note: 'Consistency reduces error. Error exposes gaps. Gaps become the next expensive lesson.' },
]

const ENTRY_TYPES = [
  { id: 'insight',   label: 'Insight',        icon: '🍍' },
  { id: 'market',    label: 'Market Signal',  icon: '📡' },
  { id: 'build',     label: 'Build Event',    icon: '🔨' },
  { id: 'fleetflow', label: 'FleetFlow',      icon: '🚚' },
  { id: 'theater',   label: 'Theater',        icon: '🎭' },
  { id: 'doctrine',  label: 'Doctrine',       icon: '📜' },
  { id: 'outreach',  label: 'Outreach',       icon: '📞' },
  { id: 'stress',    label: 'Stress / Issue', icon: '⚠️' },
  { id: 'milestone', label: 'Milestone',      icon: '✅' },
  { id: 'system',    label: 'System Health',  icon: '⚙️' },
  { id: 'personal',  label: 'Personal Note',  icon: '📝' },
]

const LINKED_ROOMS = [
  '', 'Atrium', 'MUSE', 'Theater', 'Doctrine',
  'Business', 'FleetFlow', 'Archivist Hall', 'K.E.L.', 'VERA', 'Personal',
]

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_LETTERS = ['S','M','T','W','T','F','S']
const ORDINALS = ['First','Second','Third','Fourth','Fifth','Sixth','Seventh','Eighth','Ninth','Tenth']
function ordinal(n) { return ORDINALS[n - 1] ?? `#${n}` }

function toDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}
function formatDateLabel(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}
function formatDateFull(date) {
  if (!date) return 'Unknown Date'
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
}
function groupEventsByDate(events) {
  const groups = {}
  events.forEach(e => {
    const key = formatDateFull(e.createdAt)
    if (!groups[key]) groups[key] = []
    groups[key].push(e)
  })
  return Object.entries(groups)
}

// ── Static pulse fallback ─────────────────────────────────────────────────────

function staticPulse({ totalObs, pendingCount, stagedCount, constitutionalTests, apiConnected, recentEventCount, calendarEntries, humanGateApprovals }) {
  const parts = []
  if (totalObs === 0) {
    parts.push('The Atrium is quiet.')
    parts.push('The campus is ready to receive its first observation.')
    if (!apiConnected) parts.push('Connect Claude to activate institutional intelligence.')
    return parts.join(' ')
  }
  parts.push(totalObs === 1 ? 'One observation in memory.' : `${totalObs} observations on record.`)
  if (!apiConnected) {
    parts.push('Claude is not connected — MUSE analysis unavailable.')
  } else if (pendingCount > 0) {
    parts.push(`${pendingCount} observation${pendingCount !== 1 ? 's' : ''} awaiting routing.`)
  } else {
    parts.push('All observations routed.')
  }
  if (stagedCount > 0) {
    parts.push(`${stagedCount} production${stagedCount !== 1 ? 's' : ''} staged for Theater.`)
  } else {
    parts.push('No productions staged.')
  }
  if (humanGateApprovals > 0) {
    parts.push(`Human Gate has issued ${humanGateApprovals} approval${humanGateApprovals !== 1 ? 's' : ''}.`)
  }
  if (recentEventCount > 3) {
    parts.push('Institutional activity is elevated.')
  } else if (recentEventCount > 0) {
    parts.push('Campus is operational.')
  }
  return parts.join(' ')
}

// ── Action Queue ──────────────────────────────────────────────────────────────

function buildActionItems(observations, productions, kelReviews) {
  const items = []

  const unrouted = observations.filter(o => !o.destination)
  if (unrouted.length > 0) {
    items.push({
      id: 'routing', icon: '🍍',
      label: `${unrouted.length} observation${unrouted.length !== 1 ? 's' : ''} unrouted`,
      detail: 'Route to MUSE, Theater, FleetFlow, Doctrine, or Archive.',
      room: 'atrium',
    })
  }

  const awaitApproval = productions.filter(p =>
    p.humanGateStatus === 'pending' || (p.status === 'staged' && !p.humanGateStatus)
  )
  if (awaitApproval.length > 0) {
    items.push({
      id: 'approval', icon: '🎭',
      label: `${awaitApproval.length} production${awaitApproval.length !== 1 ? 's' : ''} awaiting Human Gate`,
      detail: 'Review staged productions and record your judgment.',
      room: 'content',
    })
  }

  const pendingKEL = kelReviews.filter(r => r.status === 'pending')
  if (pendingKEL.length > 0) {
    items.push({
      id: 'kel', icon: '◎',
      label: `${pendingKEL.length} KEL review${pendingKEL.length !== 1 ? 's' : ''} pending`,
      detail: 'Institutional review requests require KEL judgment.',
      room: 'kel',
    })
  }

  return items
}

function ActionQueue({ items, onNavigate }) {
  if (items.length === 0) {
    return (
      <div style={{
        background: 'var(--bg-2)', border: '1px solid var(--border-0)',
        borderRadius: '10px', padding: '18px 22px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <span style={{ color: '#10b981', fontSize: '16px' }}>✓</span>
        <div>
          <p style={{ color: 'var(--text-3)', fontSize: '12px', fontWeight: 500 }}>
            Nothing requires your attention.
          </p>
          <p style={{ color: 'var(--text-5)', fontSize: '11px', marginTop: '1px' }}>
            The campus is running.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--bg-2)', border: '1px solid var(--border-1)',
      borderRadius: '10px', overflow: 'hidden',
    }}>
      {items.map((item, i) => (
        <button
          key={item.id}
          onClick={() => onNavigate?.(item.room)}
          style={{
            width: '100%', textAlign: 'left', background: 'none',
            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            borderBottom: i < items.length - 1 ? '1px solid var(--border-0)' : 'none',
            padding: '13px 18px', display: 'flex', alignItems: 'center', gap: '14px',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-3)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
        >
          <span style={{ fontSize: '15px', flexShrink: 0, width: '20px', textAlign: 'center' }}>
            {item.icon}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: 'var(--text-1)', fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>
              {item.label}
            </p>
            <p style={{ color: 'var(--text-5)', fontSize: '11px' }}>{item.detail}</p>
          </div>
          <span style={{ color: 'var(--text-5)', fontSize: '13px', flexShrink: 0 }}>→</span>
        </button>
      ))}
    </div>
  )
}

// ── System Health ─────────────────────────────────────────────────────────────

const HEALTH_CFG = {
  active:    { color: '#10b981', glow: true  },
  connected: { color: '#10b981', glow: true  },
  idle:      { color: '#f59e0b', glow: false },
  quiet:     { color: '#374151', glow: false },
  offline:   { color: '#ef4444', glow: false },
}

function buildHealth(observations, productions, institutionEvents, apiKey) {
  const analyzedObs = observations.filter(o => o.claude).length
  const totalObs    = observations.length

  return [
    { id: 'atrium',   label: 'Atrium',    icon: '🍍', status: totalObs > 0 ? 'active' : 'quiet',                           detail: totalObs > 0 ? `${totalObs} obs` : 'Empty'          },
    { id: 'muse',     label: 'MUSE',      icon: '🎭', status: analyzedObs > 0 ? 'active' : totalObs > 0 ? 'idle' : 'quiet', detail: analyzedObs > 0 ? `${analyzedObs} analyzed` : 'No decisions' },
    { id: 'vera',     label: 'VERA',      icon: '✨', status: 'active',                                                     detail: 'Operational'                                        },
    { id: 'theater',  label: 'Theater',   icon: '🎬', status: productions.length > 0 ? 'active' : 'quiet',                  detail: productions.length > 0 ? `${productions.length} prods` : 'Empty' },
    { id: 'archivist',label: 'Archivist', icon: '📚', status: institutionEvents.length > 0 ? 'active' : 'quiet',            detail: institutionEvents.length > 0 ? `${institutionEvents.length} events` : 'Empty' },
    { id: 'kel',      label: 'K.E.L.',    icon: '◎',  status: 'active',                                                     detail: 'Operational'                                        },
    { id: 'fleetflow',label: 'FleetFlow', icon: '🚚', status: FLEETFLOW_URL ? 'connected' : 'offline',                      detail: FLEETFLOW_URL ? 'Connected' : 'Not linked'           },
    { id: 'voice',    label: 'Voice',     icon: '🎤', status: apiKey ? 'active' : 'offline',                                detail: apiKey ? 'Claude linked' : 'No API key'              },
  ]
}

function SystemHealth({ health, isMobile }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
      gap: '6px',
    }}>
      {health.map(room => {
        const cfg = HEALTH_CFG[room.status] || HEALTH_CFG.quiet
        return (
          <div key={room.id} style={{
            background: 'var(--bg-2)', border: '1px solid var(--border-1)',
            borderRadius: '8px', padding: '10px 12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px' }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                background: cfg.color,
                boxShadow: cfg.glow ? `0 0 6px ${cfg.color}80` : 'none',
              }} />
              <p style={{ color: 'var(--text-3)', fontSize: '10px', fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {room.label}
              </p>
            </div>
            <p style={{ color: 'var(--text-5)', fontSize: '10px', marginLeft: '13px' }}>
              {room.detail}
            </p>
          </div>
        )
      })}
    </div>
  )
}

// ── Creator Calendar ──────────────────────────────────────────────────────────

function CreatorCalendar({ logs = [], onAddLog }) {
  const today    = new Date()
  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate())

  const [calYear, setCalYear]   = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(todayKey)
  const [showForm, setShowForm] = useState(false)
  const [newType, setNewType]   = useState('insight')
  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody]   = useState('')
  const [newRoom, setNewRoom]   = useState('')
  const [saving, setSaving]     = useState(false)

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const firstDay    = new Date(calYear, calMonth, 1).getDay()

  const logsByDate = {}
  logs.forEach(log => {
    if (!logsByDate[log.date]) logsByDate[log.date] = []
    logsByDate[log.date].push(log)
  })

  const dayLogs = (logsByDate[selectedDate] || []).slice()
    .sort((a, b) => a.createdAt - b.createdAt)

  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11) }
    else setCalMonth(m => m - 1)
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0) }
    else setCalMonth(m => m + 1)
  }

  async function handleSave() {
    if (!newTitle.trim() || !selectedDate) return
    setSaving(true)
    try {
      await onAddLog({ date: selectedDate, type: newType, title: newTitle.trim(), body: newBody.trim(), linkedRoom: newRoom || null })
      setNewTitle(''); setNewBody(''); setNewRoom(''); setShowForm(false)
    } finally { setSaving(false) }
  }

  const inputStyle = {
    width: '100%', background: 'var(--bg-0)', border: '1px solid var(--border-1)',
    borderRadius: '6px', padding: '8px 12px', color: 'var(--text-1)',
    fontSize: '12px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <button onClick={prevMonth} style={{ background: 'none', border: '1px solid var(--border-1)', borderRadius: '6px', color: 'var(--text-3)', fontSize: '15px', padding: '3px 10px', cursor: 'pointer' }}>‹</button>
        <p style={{ color: 'var(--text-2)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em' }}>
          {MONTH_NAMES[calMonth]} {calYear}
        </p>
        <button onClick={nextMonth} style={{ background: 'none', border: '1px solid var(--border-1)', borderRadius: '6px', color: 'var(--text-3)', fontSize: '15px', padding: '3px 10px', cursor: 'pointer' }}>›</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', marginBottom: '3px' }}>
        {DAY_LETTERS.map((d, i) => (
          <p key={i} style={{ color: 'var(--text-6)', fontSize: '9px', textAlign: 'center', letterSpacing: '0.06em', fontWeight: 600, padding: '2px 0' }}>{d}</p>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const dateKey = toDateKey(calYear, calMonth, day)
          const entries = logsByDate[dateKey] || []
          const isToday = dateKey === todayKey
          const isSel   = dateKey === selectedDate
          const typeIds = [...new Set(entries.map(l => l.type))].slice(0, 4)
          return (
            <div key={day} onClick={() => { setSelectedDate(dateKey); setShowForm(false) }}
              style={{
                background: isSel ? '#1e293b' : 'var(--bg-2)',
                border: isToday ? '1px solid #3b82f660' : isSel ? '1px solid #3b82f640' : '1px solid var(--border-0)',
                borderRadius: '6px', padding: '5px 2px 4px', cursor: 'pointer', minHeight: '36px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              }}>
              <span style={{ color: isToday ? '#3b82f6' : isSel ? 'var(--text-1)' : 'var(--text-3)', fontSize: '11px', fontWeight: isToday ? 700 : 400 }}>
                {day}
              </span>
              {typeIds.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1px', justifyContent: 'center', lineHeight: 1 }}>
                  {typeIds.map(id => { const t = ENTRY_TYPES.find(x => x.id === id); return t ? <span key={id} style={{ fontSize: '7px' }}>{t.icon}</span> : null })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {selectedDate && (
        <div style={{ marginTop: '10px', padding: '14px 16px', background: 'var(--bg-1)', border: '1px solid var(--border-1)', borderRadius: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
            <p style={{ color: 'var(--text-1)', fontSize: '12px', fontWeight: 600 }}>
              {formatDateLabel(selectedDate)}
            </p>
            {!showForm && (
              <button onClick={() => setShowForm(true)} style={{ background: '#052e16', border: '1px solid #10b981', borderRadius: '6px', color: '#10b981', fontSize: '10px', fontWeight: 600, padding: '4px 10px', cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit' }}>
                + Entry
              </button>
            )}
          </div>

          {dayLogs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: showForm ? '12px' : '0' }}>
              {dayLogs.map(log => {
                const t = ENTRY_TYPES.find(x => x.id === log.type)
                return (
                  <div key={log.id} style={{ borderLeft: '2px solid var(--border-1)', paddingLeft: '9px' }}>
                    <p style={{ color: 'var(--text-2)', fontSize: '11px', fontWeight: 600, marginBottom: '2px' }}>{t?.icon} {log.title}</p>
                    {log.body && <p style={{ color: 'var(--text-4)', fontSize: '10px', lineHeight: 1.6 }}>{log.body}</p>}
                    {log.linkedRoom && <p style={{ color: 'var(--text-6)', fontSize: '10px', marginTop: '2px' }}>→ {log.linkedRoom}</p>}
                  </div>
                )
              })}
            </div>
          )}

          {dayLogs.length === 0 && !showForm && (
            <p style={{ color: 'var(--text-6)', fontSize: '11px', fontStyle: 'italic' }}>Nothing logged yet.</p>
          )}

          {showForm && (
            <div style={{ paddingTop: dayLogs.length > 0 ? '12px' : '0', borderTop: dayLogs.length > 0 ? '1px solid var(--border-0)' : 'none', display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <select value={newType} onChange={e => setNewType(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {ENTRY_TYPES.map(t => <option key={t.id} value={t.id}>{t.icon}  {t.label}</option>)}
              </select>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Title (required)" style={inputStyle} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSave() }} />
              <textarea value={newBody} onChange={e => setNewBody(e.target.value)} placeholder="Notes (optional)" rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
              <select value={newRoom} onChange={e => setNewRoom(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {LINKED_ROOMS.map((r, i) => <option key={i} value={r}>{r || '— No linked room —'}</option>)}
              </select>
              <div style={{ display: 'flex', gap: '7px' }}>
                <button onClick={handleSave} disabled={!newTitle.trim() || saving} style={{ background: !newTitle.trim() || saving ? 'var(--bg-2)' : '#052e16', border: '1px solid #10b98160', borderRadius: '6px', color: !newTitle.trim() || saving ? 'var(--text-5)' : '#10b981', fontSize: '12px', fontWeight: 600, padding: '7px 14px', cursor: !newTitle.trim() || saving ? 'default' : 'pointer', fontFamily: 'inherit' }}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button onClick={() => { setShowForm(false); setNewTitle(''); setNewBody(''); setNewRoom('') }} style={{ background: 'none', border: '1px solid var(--border-1)', borderRadius: '6px', color: 'var(--text-4)', fontSize: '12px', padding: '7px 12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── BusinessCenterRoom ────────────────────────────────────────────────────────

export default function BusinessCenterRoom({
  observations = [], graduates = [], builderReadiness = 'locked',
  museWorks = [], institutionEvents = [], creatorLogs = [],
  kelReviews = [], productions = [], apiKey = null,
  onRequestBuilderReview, onEnterBuilderStudio, onAddLog, onNavigate, isMobile,
}) {
  const px = isMobile ? 'px-5' : 'px-10'

  // ── Derived metrics ──────────────────────────────────────────────────────────
  const totalObs           = observations.length
  const pendingCount       = observations.filter(o => !o.destination).length
  const stagedToTheater    = observations.filter(o => o.destination === 'Theater').length
  const constitutionalTests = institutionEvents.filter(e => e.eventType === 'multi_manifest_test_completed').length
  const humanGateApprovals = kelReviews.filter(r => r.status === 'approved').length
  const calendarEntries    = creatorLogs.length
  const recentEvents       = institutionEvents.slice(0, 12)
  const groupedEvents      = groupEventsByDate(recentEvents)

  const fallbackPulse = staticPulse({
    totalObs, pendingCount, stagedCount: stagedToTheater,
    constitutionalTests, apiConnected: !!apiKey,
    recentEventCount: recentEvents.length,
    calendarEntries, humanGateApprovals,
  })

  // ── AI Pulse ─────────────────────────────────────────────────────────────────
  const [aiPulse, setAiPulse]   = useState(null)
  const [pulsing, setPulsing]   = useState(false)
  const hasPulsed               = useRef(false)

  useEffect(() => {
    if (!apiKey || hasPulsed.current) return
    hasPulsed.current = true
    handleGeneratePulse()
  }, [apiKey]) // eslint-disable-line

  async function handleGeneratePulse() {
    setPulsing(true)
    try {
      const result = await generateInstitutionalPulse(
        { observations, productions, institutionEvents, creatorLogs },
        apiKey
      )
      if (result) setAiPulse(result)
    } catch (_) {
      // fall back to static pulse silently
    } finally {
      setPulsing(false)
    }
  }

  const displayPulse = aiPulse || fallbackPulse

  // ── Action Queue ─────────────────────────────────────────────────────────────
  const actionItems = buildActionItems(observations, productions, kelReviews)

  // ── System Health ─────────────────────────────────────────────────────────────
  const health = buildHealth(observations, productions, institutionEvents, apiKey)

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-0)' }}>

      {/* Header */}
      <div className={`shrink-0 ${px} pt-6 pb-5`} style={{ borderBottom: '1px solid var(--border-0)' }}>
        <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '3px' }}>
          College of Operations
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px' }}>
          <h2 style={{ fontSize: '18px', color: 'var(--text-0)', fontWeight: 700, letterSpacing: '0.08em' }}>
            Business Center
          </h2>
          <p style={{ color: 'var(--text-6)', fontSize: '10px', fontStyle: 'italic', flexShrink: 0 }}>The Bridge</p>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto ${px} py-6`}>

        {/* ── CALENDAR (CENTERPIECE) ──────────────────────────────────────── */}
        <div style={{ maxWidth: '600px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
              Calendar
            </p>
            <p style={{ color: 'var(--text-6)', fontSize: '10px', fontStyle: 'italic' }}>The Map</p>
          </div>
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-1)', borderRadius: '10px', padding: '18px' }}>
            <CreatorCalendar logs={creatorLogs} onAddLog={onAddLog} />
          </div>
        </div>

        {/* ── ACTION QUEUE ────────────────────────────────────────────────── */}
        <div style={{ maxWidth: '600px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
              Action Queue
            </p>
            {actionItems.length > 0 && (
              <span style={{ background: '#1d4ed820', border: '1px solid #1d4ed840', borderRadius: '10px', padding: '1px 7px', color: '#60a5fa', fontSize: '9px', fontWeight: 700 }}>
                {actionItems.length}
              </span>
            )}
          </div>
          <ActionQueue items={actionItems} onNavigate={onNavigate} />
        </div>

        {/* ── INSTITUTIONAL PULSE ─────────────────────────────────────────── */}
        <div style={{ maxWidth: '600px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
              Institutional Pulse
            </p>
            {apiKey && (
              <button
                onClick={handleGeneratePulse}
                disabled={pulsing}
                style={{ background: 'none', border: '1px solid var(--border-1)', borderRadius: '5px', padding: '3px 10px', color: pulsing ? 'var(--text-6)' : 'var(--text-4)', fontSize: '10px', cursor: pulsing ? 'default' : 'pointer', letterSpacing: '0.04em' }}
              >
                {pulsing ? '…' : '↺ Refresh'}
              </button>
            )}
          </div>
          <div style={{
            background: 'var(--bg-2)', border: '1px solid var(--border-1)',
            borderLeft: '3px solid #3b82f6', borderRadius: '0 10px 10px 0',
            padding: '20px 24px',
          }}>
            <p style={{ color: pulsing ? 'var(--text-4)' : 'var(--text-1)', fontSize: '13px', lineHeight: 1.9, fontStyle: 'italic', fontWeight: 400, transition: 'color 0.3s' }}>
              {pulsing ? 'Reading the campus…' : displayPulse}
            </p>
            {aiPulse && (
              <p style={{ color: '#3b82f640', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '10px', fontWeight: 600 }}>
                ● AI Generated
              </p>
            )}
          </div>
        </div>

        {/* ── SYSTEM HEALTH ───────────────────────────────────────────────── */}
        <div style={{ maxWidth: '600px', marginBottom: '24px' }}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>
            System Health
          </p>
          <SystemHealth health={health} isMobile={isMobile} />
        </div>

        {/* ── FLEETFLOW GATEWAY ───────────────────────────────────────────── */}
        <div style={{ maxWidth: '600px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span>🚚</span>
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
              FleetFlow Wing
            </p>
          </div>
          <div style={{
            background: 'var(--bg-2)', border: '1px solid var(--border-1)',
            borderLeft: `3px solid ${FLEETFLOW_URL ? '#10b981' : '#374151'}`,
            borderRadius: '0 10px 10px 0', overflow: 'hidden',
          }}>
            <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0, background: FLEETFLOW_URL ? '#10b981' : '#6b7280', boxShadow: FLEETFLOW_URL ? '0 0 6px #10b98160' : 'none' }} />
                <div>
                  <p style={{ color: FLEETFLOW_URL ? '#10b981' : 'var(--text-4)', fontSize: '12px', fontWeight: 600, marginBottom: '1px' }}>
                    {FLEETFLOW_URL ? 'Connected' : 'Not Yet Connected'}
                  </p>
                  <p style={{ color: 'var(--text-6)', fontSize: '10px' }}>
                    {FLEETFLOW_URL ? 'Same campus. Different wing.' : 'Set VITE_FLEETFLOW_URL to open the gateway.'}
                  </p>
                </div>
              </div>
              {FLEETFLOW_URL ? (
                <a href={FLEETFLOW_URL} target="_blank" rel="noopener noreferrer" style={{
                  flexShrink: 0, background: '#052e16', border: '1px solid #10b981', color: '#10b981',
                  fontSize: '12px', fontWeight: 600, padding: '9px 18px', borderRadius: '7px',
                  textDecoration: 'none', letterSpacing: '0.04em', whiteSpace: 'nowrap',
                }}>
                  Enter Operations →
                </a>
              ) : (
                <span style={{ flexShrink: 0, color: 'var(--text-6)', fontSize: '11px', fontStyle: 'italic' }}>
                  The wing is ready.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── DIVIDER ─────────────────────────────────────────────────────── */}
        <div style={{ maxWidth: '600px', borderTop: '1px solid var(--border-0)', marginBottom: '32px' }} />

        {/* ── CREATOR TIMELINE ────────────────────────────────────────────── */}
        {recentEvents.length > 0 && (
          <div style={{ maxWidth: '600px', marginBottom: '32px' }}>
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>
              Creator Timeline
            </p>
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-1)', borderRadius: '10px', overflow: 'hidden', maxHeight: '360px', overflowY: 'auto' }}>
              {groupedEvents.map(([dateLabel, events], gi) => (
                <div key={dateLabel} style={{ borderBottom: gi < groupedEvents.length - 1 ? '1px solid var(--border-0)' : 'none', padding: '12px 16px' }}>
                  <p style={{ color: 'var(--text-4)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '7px' }}>
                    {dateLabel}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {events.map(e => (
                      <div key={e.id} style={{ display: 'flex', gap: '7px', alignItems: 'flex-start' }}>
                        <span style={{ color: 'var(--text-6)', fontSize: '11px', marginTop: '1px', flexShrink: 0 }}>·</span>
                        <p style={{ color: 'var(--text-2)', fontSize: '11px', lineHeight: 1.5 }}>{e.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── COLLEGE OF OPERATIONS ───────────────────────────────────────── */}
        <div style={{ maxWidth: '600px', marginBottom: '32px' }}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
            College of Operations
          </p>
          <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic', marginBottom: '16px' }}>
            Operational truth matters.
          </p>
          <p style={{ color: 'var(--text-2)', fontSize: '13px', lineHeight: 1.8, marginBottom: '10px' }}>
            Business Center is where the institution teaches operational stewardship — not as a feature set, but as a discipline. Clients, projects, revenue, invoices, teams: these are not administrative tasks. They are the instruments of accountability.
          </p>
          <p style={{ color: 'var(--text-3)', fontSize: '13px', lineHeight: 1.8 }}>
            A resident can spend months inside Business Center and never open FleetFlow. They should still leave understanding how to run an operation with integrity. That is the college's job.
          </p>
        </div>

        <div style={{ maxWidth: '600px', marginBottom: '36px' }}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '12px' }}>
            What This College Teaches
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {TEACHINGS.map(({ label, note }) => (
              <div key={label} style={{ borderLeft: '2px solid #3b82f630', paddingLeft: '14px' }}>
                <p style={{ color: 'var(--text-1)', fontSize: '12px', fontWeight: 600, marginBottom: '3px' }}>{label}</p>
                <p style={{ color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.65 }}>{note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── GRADUATE REGISTRY ───────────────────────────────────────────── */}
        <div style={{ maxWidth: '600px', marginBottom: '36px', paddingTop: '28px', borderTop: '1px solid var(--border-0)' }}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '12px' }}>
            Graduate Registry
          </p>
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-1)', borderLeft: '3px solid #10b981', borderRadius: '0 8px 8px 0', padding: '14px 18px', marginBottom: '10px' }}>
            <p style={{ color: 'var(--text-1)', fontSize: '14px', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '1px' }}>FleetFlow</p>
            <p style={{ color: 'var(--text-4)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '8px' }}>First Graduate</p>
            <p style={{ color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.65, fontStyle: 'italic' }}>Proof that the discipline survives contact with reality.</p>
          </div>
          {graduates.filter(g => g.sequence > 1).map(g => (
            <div key={g.id} style={{ background: 'var(--bg-2)', border: '1px solid var(--border-1)', borderLeft: '3px solid #10b981', borderRadius: '0 8px 8px 0', padding: '14px 18px', marginBottom: '10px' }}>
              <p style={{ color: 'var(--text-1)', fontSize: '14px', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '1px' }}>{g.graduateName}</p>
              <p style={{ color: 'var(--text-4)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '8px' }}>{ordinal(g.sequence)} Graduate</p>
              {g.proof && <p style={{ color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.65, fontStyle: 'italic' }}>{g.proof}</p>}
            </div>
          ))}
        </div>

        {/* ── BUILDER STUDIO ──────────────────────────────────────────────── */}
        <div style={{ maxWidth: '600px', marginBottom: '48px', paddingTop: '28px', borderTop: '1px solid var(--border-0)' }}>
          <div style={{ border: '1px solid var(--border-1)', borderRadius: '10px', padding: '24px', background: 'var(--bg-1)', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>Builder Studio</p>
            <p style={{ color: 'var(--text-2)', fontSize: '13px', lineHeight: 1.8, marginBottom: '3px' }}>Knowledge enters.</p>
            <p style={{ color: 'var(--text-2)', fontSize: '13px', lineHeight: 1.8, marginBottom: '20px' }}>Evidence leaves.</p>

            {builderReadiness === 'approved' && (
              <button onClick={onEnterBuilderStudio} style={{ display: 'inline-block', background: '#1a0a00', border: '1px solid #f59e0b', borderRadius: '6px', padding: '9px 20px', color: '#f59e0b', fontSize: '12px', letterSpacing: '0.06em', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Enter Builder Studio →
              </button>
            )}
            {builderReadiness === 'pending' && (
              <div style={{ display: 'inline-block', border: '1px solid #3b82f640', borderRadius: '6px', padding: '9px 20px', color: '#3b82f6', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
                Under KEL Review
              </div>
            )}
            {builderReadiness === 'locked' && (
              <div style={{ display: 'inline-block', border: '1px solid var(--border-1)', borderRadius: '6px', padding: '9px 20px', color: 'var(--text-5)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
                Door Closed
              </div>
            )}

            <p style={{ color: 'var(--text-6)', fontSize: '10px', marginTop: '16px', fontStyle: 'italic' }}>Graduation requires proof.</p>

            {builderReadiness === 'locked' && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-0)' }}>
                <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.65, marginBottom: '10px' }}>
                  When the discipline is learned and a build proposal is ready, ask KEL to review readiness.
                </p>
                <button onClick={onRequestBuilderReview} style={{ background: 'none', border: '1px solid var(--border-1)', borderRadius: '6px', padding: '7px 14px', color: 'var(--text-3)', fontSize: '11px', letterSpacing: '0.04em', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Request Builder Review
                </button>
              </div>
            )}
            {builderReadiness === 'pending' && (
              <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.65, marginTop: '14px' }}>
                A readiness review has been submitted. The forge opens when judgment confirms readiness.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
