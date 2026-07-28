// Normalized selectors for the Institutional Calendar.
// The Calendar imports only from this module — it never queries contract fields,
// parses contract types, or infers dates. Jurisdiction is rendering authorized
// commitments in time. Source agnostic by design.

const AUTHORIZED = new Set(['authorized', 'active'])

// Returns only authorized commitments, optionally bounded to a date range.
// dateRange: { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' } or null for all.
export function selectCalendarCommitments(commitments, dateRange = null) {
  const visible = (commitments || []).filter(c => AUTHORIZED.has(c.status))
  if (!dateRange) return visible
  const { start, end } = dateRange
  return visible.filter(c => c.maturityDate && c.maturityDate >= start && c.maturityDate <= end)
}

// Returns authorized commitments indexed by maturityDate ('YYYY-MM-DD').
export function selectCommitmentsByDate(commitments) {
  const byDate = {}
  ;(commitments || [])
    .filter(c => AUTHORIZED.has(c.status) && c.maturityDate)
    .forEach(c => {
      if (!byDate[c.maturityDate]) byDate[c.maturityDate] = []
      byDate[c.maturityDate].push(c)
    })
  return byDate
}

// Returns proposed (not yet authorized) commitments indexed by maturityDate.
// The Calendar must render these in a clearly labeled Pending Authorization
// section — never in the main institutional timeline.
export function selectProposedByDate(commitments) {
  const byDate = {}
  ;(commitments || [])
    .filter(c => c.status === 'proposed' && c.maturityDate)
    .forEach(c => {
      if (!byDate[c.maturityDate]) byDate[c.maturityDate] = []
      byDate[c.maturityDate].push(c)
    })
  return byDate
}

// Summarizes one day's authorized commitments.
// Revenue is separated by recognitionType — never blended.
// Returns: { total, byType: { start: [...], renewal: [...], ... }, revenueByRecognition: { projected: { amount, currency }, ... } }
export function dailyCommitmentPulse(commitments, dateKey) {
  const day = (commitments || []).filter(
    c => AUTHORIZED.has(c.status) && c.maturityDate === dateKey
  )

  const byType = {}
  day.forEach(c => {
    if (!byType[c.type]) byType[c.type] = []
    byType[c.type].push(c)
  })

  const revenueByRecognition = {}
  day.forEach(c => {
    if (!c.value?.amount) return
    const key = c.value.recognitionType || 'projected'
    if (!revenueByRecognition[key]) {
      revenueByRecognition[key] = { amount: 0, currency: c.value.currency || 'USD' }
    }
    revenueByRecognition[key].amount += c.value.amount
  })

  return { total: day.length, byType, revenueByRecognition }
}
