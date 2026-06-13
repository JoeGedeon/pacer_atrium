// ── Gmail ─────────────────────────────────────────────────────────────────────

function classifyEmail(from, subject, snippet) {
  const text = (from + ' ' + subject + ' ' + snippet).toLowerCase()
  if (/moving|hauler|haul|truck|freight|broker|lead|quote|dispatch|carrier|logistics/.test(text))
    return 'opportunity'
  if (/urgent|asap|overdue|past due|payment|invoice|collections|attorney|legal|lawsuit|demand/.test(text))
    return 'urgent'
  if (/\?$|\? |please respond|can you|would you|need your|waiting for|let me know|follow.?up/.test(text))
    return 'action_required'
  return 'routine'
}

function parseHeaders(payload) {
  const headers = payload?.headers || []
  const get = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || ''
  return { from: get('From'), subject: get('Subject') || '(no subject)' }
}

export async function fetchEmailSummary(accessToken) {
  const listRes = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=30',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!listRes.ok) {
    const err = await listRes.json().catch(() => ({}))
    throw new Error(err.error?.message || `Gmail API ${listRes.status}`)
  }
  const listData = await listRes.json()
  const messages = listData.messages || []
  const unreadCount = listData.resultSizeEstimate ?? messages.length

  const details = await Promise.all(
    messages.slice(0, 15).map(m =>
      fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      ).then(r => r.json()).catch(() => null)
    )
  )

  const emails = details
    .filter(Boolean)
    .map(msg => {
      const { from, subject } = parseHeaders(msg.payload)
      const snippet = (msg.snippet || '').replace(/&#\d+;/g, ' ')
      return {
        id: msg.id,
        from,
        subject,
        snippet,
        category: classifyEmail(from, subject, snippet),
      }
    })

  return {
    unreadCount,
    emails,
    categories: {
      opportunities:  emails.filter(e => e.category === 'opportunity'),
      urgent:         emails.filter(e => e.category === 'urgent'),
      actionRequired: emails.filter(e => e.category === 'action_required'),
      routine:        emails.filter(e => e.category === 'routine'),
    },
  }
}

// ── Google Calendar ───────────────────────────────────────────────────────────

function formatTime(dateTimeStr) {
  if (!dateTimeStr) return ''
  const d = new Date(dateTimeStr)
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export async function fetchTodayEvents(accessToken) {
  const now = new Date()
  const endOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2)

  const params = new URLSearchParams({
    timeMin: now.toISOString(),
    timeMax: endOfTomorrow.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '15',
  })

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Calendar API ${res.status}`)
  }
  const data = await res.json()

  return (data.items || []).map(event => ({
    id: event.id,
    title: event.summary || '(no title)',
    startTime: event.start?.dateTime || null,
    endTime:   event.end?.dateTime   || null,
    allDay:    !event.start?.dateTime,
    timeLabel: event.start?.dateTime ? formatTime(event.start.dateTime) : 'All day',
    description: event.description || '',
    location:  event.location || '',
  }))
}

// ── Context strings for AI ────────────────────────────────────────────────────

export function emailContextString(emailData) {
  if (!emailData) return null
  const { unreadCount, categories } = emailData
  const parts = [`${unreadCount} unread email${unreadCount !== 1 ? 's' : ''}.`]
  if (categories.opportunities.length > 0)
    parts.push(`${categories.opportunities.length} FleetFlow opportunit${categories.opportunities.length !== 1 ? 'ies' : 'y'} in inbox.`)
  if (categories.urgent.length > 0)
    parts.push(`${categories.urgent.length} urgent.`)
  if (categories.actionRequired.length > 0)
    parts.push(`${categories.actionRequired.length} require${categories.actionRequired.length !== 1 ? '' : 's'} response.`)
  return parts.join(' ')
}

export function calendarContextString(events) {
  if (!events || events.length === 0) return 'No upcoming events.'
  const today = new Date().toDateString()
  return events.map(e => {
    const eventDate = e.startTime ? new Date(e.startTime).toDateString() : today
    const dayLabel = eventDate === today ? 'Today' : 'Tomorrow'
    return `${dayLabel} ${e.timeLabel} — ${e.title}`
  }).join('; ')
}
