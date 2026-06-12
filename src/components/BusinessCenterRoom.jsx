import { useState } from 'react'

// VITE_FLEETFLOW_URL must be set in your .env / Netlify environment variables.
const FLEETFLOW_URL = import.meta.env.VITE_FLEETFLOW_URL || null

const TEACHINGS = [
  {
    label: 'Visibility',
    note: "What you can't see, you can't manage. Operations require clear sight lines — into jobs, revenue, labor, and process.",
  },
  {
    label: 'Accountability',
    note: 'Processes have owners. Owners have consequences. Accountability is not punishment — it is protection.',
  },
  {
    label: 'Consequence',
    note: 'Small failures compound. Name them early, before they become disputes, claims, or lost revenue.',
  },
  {
    label: 'Operational Stewardship',
    note: 'Protect the operation the way you protect what it carries. The work is in your custody.',
  },
  {
    label: 'Process Discipline',
    note: 'Consistency reduces error. Error exposes gaps. Gaps become the next expensive lesson.',
  },
]

const FLEETFLOW_FUTURE_METRICS = [
  'Active Companies',
  'Active Jobs',
  'Revenue Processed',
  'Revenue Recovered',
  'Failed Workflows',
  'Subscription Count',
  'Missed Charges Detected',
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

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const ORDINALS = ['First', 'Second', 'Third', 'Fourth', 'Fifth',
  'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth']
function ordinal(n) { return ORDINALS[n - 1] ?? `#${n}` }

function toDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function formatDateLabel(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString([], {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
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

function generatePulse({
  totalObs, pendingCount, stagedCount, constitutionalTests,
  apiConnected, recentEventCount, calendarEntries, humanGateApprovals,
}) {
  if (totalObs === 0) {
    return 'The Atrium is quiet. The campus is ready to receive its first observation.'
  }
  if (!apiConnected) {
    return `${totalObs} observation${totalObs !== 1 ? 's' : ''} captured. Connect Claude to enable MUSE analysis and institutional intelligence.`
  }
  if (pendingCount > 5 && pendingCount > stagedCount * 3) {
    return `${pendingCount} observations are awaiting routing decisions. Human Gate attention may be the current bottleneck.`
  }
  if (calendarEntries > 0 && stagedCount > 0) {
    return `${stagedCount} observation${stagedCount !== 1 ? 's' : ''} staged for Theater. Creator activity is logged. The institution is moving.`
  }
  if (stagedCount > 0 && constitutionalTests > 0) {
    return `Campus is active. ${stagedCount} observation${stagedCount !== 1 ? 's' : ''} staged for Theater. Constitutional testing is on the record.`
  }
  if (stagedCount > 0) {
    return `${stagedCount} observation${stagedCount !== 1 ? 's' : ''} staged for production. The pipeline is moving.`
  }
  if (humanGateApprovals > 0) {
    return `${humanGateApprovals} Human Gate approval${humanGateApprovals !== 1 ? 's' : ''} on record. Institutional governance is active.`
  }
  if (recentEventCount > 3) {
    return 'Institutional activity is elevated. Multiple governance events recorded in recent sessions.'
  }
  return `${totalObs} observation${totalObs !== 1 ? 's' : ''} in memory. Campus is operational.`
}

// ── Wing metric row ───────────────────────────────────────────────────────────

function WingRow({ label, value }) {
  const isDash = value === '—'
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '6px 0', borderBottom: '1px solid var(--border-0)',
    }}>
      <span style={{ color: 'var(--text-4)', fontSize: '11px' }}>{label}</span>
      <span style={{
        color: isDash ? 'var(--text-6)' : 'var(--text-1)',
        fontSize: '12px', fontWeight: isDash ? 400 : 600,
        fontVariantNumeric: 'tabular-nums',
      }}>{value}</span>
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
      await onAddLog({
        date: selectedDate,
        type: newType,
        title: newTitle.trim(),
        body: newBody.trim(),
        linkedRoom: newRoom || null,
      })
      setNewTitle('')
      setNewBody('')
      setNewRoom('')
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%', background: 'var(--bg-0)', border: '1px solid var(--border-1)',
    borderRadius: '6px', padding: '8px 12px', color: 'var(--text-1)',
    fontSize: '12px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  }

  return (
    <div>
      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: '10px' }}>
        <button onClick={prevMonth} style={{
          background: 'none', border: '1px solid var(--border-1)',
          borderRadius: '6px', color: 'var(--text-3)',
          fontSize: '15px', padding: '3px 10px', cursor: 'pointer',
        }}>‹</button>
        <p style={{ color: 'var(--text-2)', fontSize: '13px',
          fontWeight: 600, letterSpacing: '0.06em' }}>
          {MONTH_NAMES[calMonth]} {calYear}
        </p>
        <button onClick={nextMonth} style={{
          background: 'none', border: '1px solid var(--border-1)',
          borderRadius: '6px', color: 'var(--text-3)',
          fontSize: '15px', padding: '3px 10px', cursor: 'pointer',
        }}>›</button>
      </div>

      {/* Day letter headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '3px', marginBottom: '3px' }}>
        {DAY_LETTERS.map((d, i) => (
          <p key={i} style={{ color: 'var(--text-6)', fontSize: '9px',
            textAlign: 'center', letterSpacing: '0.06em',
            fontWeight: 600, padding: '2px 0' }}>
            {d}
          </p>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const dateKey = toDateKey(calYear, calMonth, day)
          const entries = logsByDate[dateKey] || []
          const isToday = dateKey === todayKey
          const isSel   = dateKey === selectedDate
          const typeIds = [...new Set(entries.map(l => l.type))].slice(0, 4)

          return (
            <div
              key={day}
              onClick={() => { setSelectedDate(dateKey); setShowForm(false) }}
              style={{
                background: isSel ? '#1e293b' : 'var(--bg-2)',
                border: isToday ? '1px solid #3b82f660'
                  : isSel ? '1px solid #3b82f640'
                  : '1px solid var(--border-0)',
                borderRadius: '6px', padding: '5px 2px 4px',
                cursor: 'pointer', minHeight: '40px',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '3px',
              }}
            >
              <span style={{
                color: isToday ? '#3b82f6' : isSel ? 'var(--text-1)' : 'var(--text-3)',
                fontSize: '11px', fontWeight: isToday ? 700 : 400,
              }}>
                {day}
              </span>
              {typeIds.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap',
                  gap: '1px', justifyContent: 'center', lineHeight: 1 }}>
                  {typeIds.map(id => {
                    const t = ENTRY_TYPES.find(x => x.id === id)
                    return t
                      ? <span key={id} style={{ fontSize: '7px' }}>{t.icon}</span>
                      : null
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Day drawer */}
      {selectedDate && (
        <div style={{
          marginTop: '12px', padding: '16px 18px',
          background: 'var(--bg-1)', border: '1px solid var(--border-1)',
          borderRadius: '10px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
            <p style={{ color: 'var(--text-1)', fontSize: '13px', fontWeight: 600 }}>
              {formatDateLabel(selectedDate)}
            </p>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                style={{
                  background: '#052e16', border: '1px solid #10b981',
                  borderRadius: '6px', color: '#10b981', fontSize: '11px',
                  fontWeight: 600, padding: '5px 12px', cursor: 'pointer',
                  letterSpacing: '0.04em', flexShrink: 0, fontFamily: 'inherit',
                }}
              >
                + Add Entry
              </button>
            )}
          </div>

          {dayLogs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px',
              marginBottom: showForm ? '16px' : '0' }}>
              {dayLogs.map(log => {
                const t = ENTRY_TYPES.find(x => x.id === log.type)
                return (
                  <div key={log.id} style={{ borderLeft: '2px solid var(--border-1)', paddingLeft: '10px' }}>
                    <p style={{ color: 'var(--text-2)', fontSize: '12px',
                      fontWeight: 600, marginBottom: '2px' }}>
                      {t?.icon} {log.title}
                    </p>
                    {log.body && (
                      <p style={{ color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.6 }}>
                        {log.body}
                      </p>
                    )}
                    {log.linkedRoom && (
                      <p style={{ color: 'var(--text-6)', fontSize: '10px', marginTop: '3px' }}>
                        → {log.linkedRoom}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {dayLogs.length === 0 && !showForm && (
            <p style={{ color: 'var(--text-6)', fontSize: '11px', fontStyle: 'italic' }}>
              Nothing logged for this day yet.
            </p>
          )}

          {showForm && (
            <div style={{
              paddingTop: dayLogs.length > 0 ? '14px' : '0',
              borderTop: dayLogs.length > 0 ? '1px solid var(--border-0)' : 'none',
              display: 'flex', flexDirection: 'column', gap: '8px',
            }}>
              <select value={newType} onChange={e => setNewType(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                {ENTRY_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.icon}  {t.label}</option>
                ))}
              </select>
              <input
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Title (required)"
                style={inputStyle}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSave() }}
              />
              <textarea
                value={newBody}
                onChange={e => setNewBody(e.target.value)}
                placeholder="Notes (optional)"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
              <select value={newRoom} onChange={e => setNewRoom(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                {LINKED_ROOMS.map((r, i) => (
                  <option key={i} value={r}>{r || '— No linked room —'}</option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleSave}
                  disabled={!newTitle.trim() || saving}
                  style={{
                    background: !newTitle.trim() || saving ? 'var(--bg-2)' : '#052e16',
                    border: '1px solid #10b98160', borderRadius: '6px',
                    color: !newTitle.trim() || saving ? 'var(--text-5)' : '#10b981',
                    fontSize: '12px', fontWeight: 600, padding: '8px 16px',
                    cursor: !newTitle.trim() || saving ? 'default' : 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {saving ? 'Saving…' : 'Save Entry'}
                </button>
                <button
                  onClick={() => { setShowForm(false); setNewTitle(''); setNewBody(''); setNewRoom('') }}
                  style={{
                    background: 'none', border: '1px solid var(--border-1)',
                    borderRadius: '6px', color: 'var(--text-4)',
                    fontSize: '12px', padding: '8px 14px',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
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
  kelReviews = [], apiKey = null,
  onRequestBuilderReview, onEnterBuilderStudio, onAddLog, isMobile,
}) {
  const px = isMobile ? 'px-6' : 'px-10'

  // ── Cockpit metrics ────────────────────────────────────────────────────────
  const totalObs          = observations.length
  const pendingCount      = observations.filter(o => !o.destination).length
  const stagedToTheater   = observations.filter(o => o.destination === 'Theater').length
  const constitutionalTests = institutionEvents.filter(e => e.eventType === 'multi_manifest_test_completed').length
  const humanGateApprovals  = kelReviews.filter(r => r.status === 'approved').length
  const calendarEntries   = creatorLogs.length
  const apiConnected      = !!apiKey
  const recentEvents      = institutionEvents.slice(0, 12)
  const groupedEvents     = groupEventsByDate(recentEvents)

  const pulse = generatePulse({
    totalObs, pendingCount, stagedCount: stagedToTheater,
    constitutionalTests, apiConnected,
    recentEventCount: recentEvents.length,
    calendarEntries, humanGateApprovals,
  })

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-0)' }}>

      {/* Header */}
      <div className={`shrink-0 ${px} pt-8 pb-5`}
        style={{ borderBottom: '1px solid var(--border-0)' }}>
        <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
          College of Operations
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline',
          justifyContent: 'space-between', gap: '12px' }}>
          <h2 style={{ fontSize: '18px', color: 'var(--text-0)',
            fontWeight: 700, letterSpacing: '0.08em' }}>Business Center</h2>
          <p style={{ color: 'var(--text-6)', fontSize: '10px',
            fontStyle: 'italic', flexShrink: 0 }}>The Bridge</p>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto ${px} py-8`}>

        {/* ── CREATOR COCKPIT ─────────────────────────────────────────────── */}
        <div style={{ maxWidth: '600px', marginBottom: '32px' }}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '12px' }}>
            Creator Cockpit
          </p>

          {/* Three wings */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '10px',
            marginBottom: '14px',
          }}>
            {/* FleetFlow Wing */}
            <div style={{
              background: 'var(--bg-2)', border: '1px solid var(--border-1)',
              borderTop: '2px solid #10b98140', borderRadius: '0 0 8px 8px',
              padding: '14px 14px 12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px' }}>🚚</span>
                <p style={{ color: 'var(--text-3)', fontSize: '10px', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase' }}>FleetFlow</p>
              </div>
              <WingRow label="Active Companies"  value="—" />
              <WingRow label="Active Jobs"        value="—" />
              <WingRow label="Revenue This Month" value="—" />
              <WingRow label="Revenue Recovered"  value="—" />
            </div>

            {/* PACER Wing */}
            <div style={{
              background: 'var(--bg-2)', border: '1px solid var(--border-1)',
              borderTop: '2px solid #a855f740', borderRadius: '0 0 8px 8px',
              padding: '14px 14px 12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px' }}>🍍</span>
                <p style={{ color: 'var(--text-3)', fontSize: '10px', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase' }}>PACER</p>
              </div>
              <WingRow label="Observations"     value={totalObs} />
              <WingRow label="Pending MUSE"     value={pendingCount} />
              <WingRow label="Manifest Decisions" value="—" />
              <WingRow label="Archive Only"     value="—" />
            </div>

            {/* Institution Wing */}
            <div style={{
              background: 'var(--bg-2)', border: '1px solid var(--border-1)',
              borderTop: '2px solid #f59e0b40', borderRadius: '0 0 8px 8px',
              padding: '14px 14px 12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px' }}>🏛️</span>
                <p style={{ color: 'var(--text-3)', fontSize: '10px', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase' }}>Institution</p>
              </div>
              <WingRow label="Calendar Entries"    value={calendarEntries} />
              <WingRow label="New Doctrine"         value="—" />
              <WingRow label="Constitutional Tests" value={constitutionalTests} />
              <WingRow label="HG Approvals"         value={humanGateApprovals} />
            </div>
          </div>

          {/* Institutional Pulse — the center card */}
          <div style={{
            background: 'var(--bg-2)', border: '1px solid var(--border-1)',
            borderLeft: '3px solid #3b82f6', borderRadius: '0 10px 10px 0',
            padding: '22px 26px',
          }}>
            <p style={{ color: '#3b82f660', fontSize: '9px', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>
              Institutional Pulse
            </p>
            <p style={{ color: 'var(--text-1)', fontSize: '16px', lineHeight: 1.7,
              fontStyle: 'italic', fontWeight: 500 }}>
              {pulse}
            </p>
          </div>
        </div>

        {/* ── CREATOR TIMELINE ────────────────────────────────────────────── */}
        {recentEvents.length > 0 && (
          <div style={{ maxWidth: '600px', marginBottom: '32px' }}>
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>
              Creator Timeline
            </p>
            <div style={{
              background: 'var(--bg-2)', border: '1px solid var(--border-1)',
              borderRadius: '10px', overflow: 'hidden',
            }}>
              {groupedEvents.map(([dateLabel, events], gi) => (
                <div key={dateLabel} style={{
                  borderBottom: gi < groupedEvents.length - 1
                    ? '1px solid var(--border-0)' : 'none',
                  padding: '14px 18px',
                }}>
                  <p style={{ color: 'var(--text-4)', fontSize: '10px',
                    fontWeight: 600, letterSpacing: '0.08em', marginBottom: '8px' }}>
                    {dateLabel}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {events.map(e => (
                      <div key={e.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <span style={{ color: 'var(--text-6)', fontSize: '11px',
                          marginTop: '1px', flexShrink: 0 }}>·</span>
                        <p style={{ color: 'var(--text-2)', fontSize: '12px', lineHeight: 1.5 }}>
                          {e.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CREATOR CALENDAR ────────────────────────────────────────────── */}
        <div style={{ maxWidth: '600px', marginBottom: '40px' }}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
            Creator Calendar
          </p>
          <p style={{ color: 'var(--text-6)', fontSize: '10px',
            fontStyle: 'italic', marginBottom: '14px' }}>
            What happened today that matters?
          </p>
          <CreatorCalendar logs={creatorLogs} onAddLog={onAddLog} />
        </div>

        {/* ── FLEETFLOW WING ──────────────────────────────────────────────── */}
        <div style={{ maxWidth: '600px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span>🚚</span>
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontWeight: 600 }}>
              FleetFlow Wing
            </p>
          </div>
          <div style={{
            background: 'var(--bg-2)', border: '1px solid var(--border-1)',
            borderRadius: '10px', overflow: 'hidden',
          }}>
            <div style={{
              padding: '12px 18px', borderBottom: '1px solid var(--border-0)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{
                display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%',
                background: FLEETFLOW_URL ? '#10b981' : '#6b7280', flexShrink: 0,
              }} />
              <p style={{
                color: FLEETFLOW_URL ? '#10b981' : 'var(--text-4)',
                fontSize: '12px', fontWeight: 600,
              }}>
                {FLEETFLOW_URL ? 'Connected' : 'Not Yet Connected'}
              </p>
            </div>
            <div style={{ padding: '14px 18px' }}>
              <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.1em',
                textTransform: 'uppercase', marginBottom: '10px' }}>
                Future Metrics
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {FLEETFLOW_FUTURE_METRICS.map(metric => (
                  <div key={metric} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '5px 0', borderBottom: '1px solid var(--border-0)',
                  }}>
                    <span style={{ color: 'var(--text-4)', fontSize: '12px' }}>{metric}</span>
                    <span style={{ color: 'var(--text-6)', fontSize: '12px' }}>—</span>
                  </div>
                ))}
              </div>
              <p style={{ color: 'var(--text-6)', fontSize: '10px',
                fontStyle: 'italic', marginTop: '12px', lineHeight: 1.6 }}>
                FleetFlow Wing route bridge pending. The wing already belongs here.
              </p>
            </div>
          </div>
        </div>

        {/* ── COLLEGE OF OPERATIONS ───────────────────────────────────────── */}
        <div style={{ maxWidth: '600px', paddingTop: '32px',
          borderTop: '1px solid var(--border-0)', marginBottom: '32px' }}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
            College of Operations
          </p>
          <p style={{ color: 'var(--text-5)', fontSize: '12px',
            fontStyle: 'italic', marginBottom: '20px' }}>
            Operational truth matters.
          </p>
          <p style={{ color: 'var(--text-2)', fontSize: '13px',
            lineHeight: 1.8, marginBottom: '10px' }}>
            Business Center is where the institution teaches operational stewardship — not as a feature set, but as a discipline. Clients, projects, revenue, invoices, teams: these are not administrative tasks. They are the instruments of accountability.
          </p>
          <p style={{ color: 'var(--text-3)', fontSize: '13px', lineHeight: 1.8 }}>
            A resident can spend months inside Business Center and never open FleetFlow. They should still leave understanding how to run an operation with integrity. That is the college's job.
          </p>
        </div>

        <div style={{ maxWidth: '600px', marginBottom: '36px' }}>
          <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>
            What This College Teaches
          </p>
          <div className="flex flex-col gap-3">
            {TEACHINGS.map(({ label, note }) => (
              <div key={label} style={{ borderLeft: '2px solid #3b82f630', paddingLeft: '14px' }}>
                <p style={{ color: 'var(--text-1)', fontSize: '12px',
                  fontWeight: 600, marginBottom: '3px' }}>{label}</p>
                <p style={{ color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.65 }}>{note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── GRADUATE REGISTRY ───────────────────────────────────────────── */}
        <div style={{ maxWidth: '600px', marginBottom: '36px',
          paddingTop: '32px', borderTop: '1px solid var(--border-0)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px' }}>🚚</span>
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontWeight: 600 }}>
              Graduate Registry
            </p>
          </div>

          <div style={{
            background: 'var(--bg-2)', border: '1px solid var(--border-1)',
            borderLeft: '3px solid #10b981', borderRadius: '0 8px 8px 0',
            padding: '16px 20px', marginBottom: '12px',
          }}>
            <p style={{ color: 'var(--text-1)', fontSize: '14px',
              fontWeight: 700, letterSpacing: '0.04em', marginBottom: '2px' }}>FleetFlow</p>
            <p style={{ color: 'var(--text-4)', fontSize: '10px', fontWeight: 600,
              letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '12px' }}>
              First Graduate
            </p>
            <p style={{ color: 'var(--text-3)', fontSize: '12px',
              lineHeight: 1.7, marginBottom: '6px' }}>
              Built from thirty years of operational reality.
            </p>
            <p style={{ color: 'var(--text-4)', fontSize: '11px',
              lineHeight: 1.65, fontStyle: 'italic' }}>
              Proof that the discipline survives contact with reality.
            </p>
          </div>

          {graduates.filter(g => g.sequence > 1).map(g => (
            <div key={g.id} style={{
              background: 'var(--bg-2)', border: '1px solid var(--border-1)',
              borderLeft: '3px solid #10b981', borderRadius: '0 8px 8px 0',
              padding: '16px 20px', marginBottom: '12px',
            }}>
              <p style={{ color: 'var(--text-1)', fontSize: '14px',
                fontWeight: 700, letterSpacing: '0.04em', marginBottom: '2px' }}>
                {g.graduateName}
              </p>
              <p style={{ color: 'var(--text-4)', fontSize: '10px', fontWeight: 600,
                letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '10px' }}>
                {ordinal(g.sequence)} Graduate
              </p>
              {g.proof && (
                <p style={{ color: 'var(--text-4)', fontSize: '11px',
                  lineHeight: 1.65, fontStyle: 'italic' }}>{g.proof}</p>
              )}
            </div>
          ))}

          {FLEETFLOW_URL ? (
            <a
              href={FLEETFLOW_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block', background: '#052e16',
                border: '1px solid #10b981', color: '#10b981', fontSize: '13px',
                fontWeight: 600, padding: '12px 24px', borderRadius: '8px',
                textDecoration: 'none', letterSpacing: '0.04em', marginTop: '4px',
              }}
            >
              Enter FleetFlow Workspace →
            </a>
          ) : (
            <div style={{
              background: 'var(--bg-2)', border: '1px solid var(--border-1)',
              borderRadius: '8px', padding: '14px 18px', maxWidth: '400px', marginTop: '4px',
            }}>
              <p style={{ color: 'var(--text-3)', fontSize: '12px', marginBottom: '5px' }}>
                FleetFlow workspace not yet connected.
              </p>
              <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.6 }}>
                Set <code style={{ color: 'var(--text-3)' }}>VITE_FLEETFLOW_URL</code> in
                environment variables to open the gateway.
              </p>
            </div>
          )}
          <p style={{ color: 'var(--text-6)', fontSize: '10px', marginTop: '10px' }}>
            Business Center teaches. FleetFlow executes. The gateway is where they meet.
          </p>
        </div>

        {/* ── BUILDER STUDIO ──────────────────────────────────────────────── */}
        <div style={{
          maxWidth: '600px', marginBottom: '40px',
          paddingTop: '36px', borderTop: '1px solid var(--border-0)',
        }}>
          <div style={{
            border: '1px solid var(--border-1)', borderRadius: '10px',
            padding: '28px 28px 24px', background: 'var(--bg-1)', textAlign: 'center',
          }}>
            <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.2em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '16px' }}>
              Builder Studio
            </p>
            <p style={{ color: 'var(--text-2)', fontSize: '13px',
              lineHeight: 1.8, marginBottom: '4px' }}>
              Knowledge enters.
            </p>
            <p style={{ color: 'var(--text-2)', fontSize: '13px',
              lineHeight: 1.8, marginBottom: '24px' }}>
              Evidence leaves.
            </p>
            {builderReadiness === 'approved' && (
              <button
                onClick={onEnterBuilderStudio}
                style={{
                  display: 'inline-block', background: '#1a0a00',
                  border: '1px solid #f59e0b', borderRadius: '6px', padding: '10px 22px',
                  color: '#f59e0b', fontSize: '12px', letterSpacing: '0.06em',
                  fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Enter Builder Studio →
              </button>
            )}
            {builderReadiness === 'pending' && (
              <div style={{
                display: 'inline-block', border: '1px solid #3b82f640',
                borderRadius: '6px', padding: '10px 22px', color: '#3b82f6',
                fontSize: '11px', letterSpacing: '0.08em',
                textTransform: 'uppercase', fontWeight: 600,
              }}>
                Under KEL Review
              </div>
            )}
            {builderReadiness === 'locked' && (
              <div style={{
                display: 'inline-block', border: '1px solid var(--border-1)',
                borderRadius: '6px', padding: '10px 22px', color: 'var(--text-5)',
                fontSize: '11px', letterSpacing: '0.1em',
                textTransform: 'uppercase', fontWeight: 600,
              }}>
                Door Closed
              </div>
            )}
            <p style={{ color: 'var(--text-6)', fontSize: '10px',
              marginTop: '18px', fontStyle: 'italic' }}>
              Graduation requires proof.
            </p>
            {builderReadiness === 'locked' && (
              <div style={{ marginTop: '20px', paddingTop: '20px',
                borderTop: '1px solid var(--border-0)' }}>
                <p style={{ color: 'var(--text-5)', fontSize: '11px',
                  lineHeight: 1.65, marginBottom: '12px' }}>
                  When the discipline is learned and a build proposal is ready,
                  ask KEL to review readiness for Builder Studio.
                </p>
                <button
                  onClick={onRequestBuilderReview}
                  style={{
                    background: 'none', border: '1px solid var(--border-1)',
                    borderRadius: '6px', padding: '8px 16px', color: 'var(--text-3)',
                    fontSize: '11px', letterSpacing: '0.04em',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Request Builder Review
                </button>
              </div>
            )}
            {builderReadiness === 'pending' && (
              <p style={{ color: 'var(--text-5)', fontSize: '11px',
                lineHeight: 1.65, marginTop: '16px' }}>
                A readiness review has been submitted to KEL. The forge opens when judgment confirms readiness.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
