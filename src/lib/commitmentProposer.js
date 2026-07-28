// Derives proposed commitments from a verified contract.
// The Calendar never calls this directly — commitments are created by App.jsx
// after Human Gate verification and stored in Firestore. This module owns the
// derivation logic only. Swapping the inference rules does not touch the Calendar.

export const TYPE_META = {
  start:      { label: 'Start',         icon: '▶', color: '#10b981' },
  renewal:    { label: 'Renewal',       icon: '↺', color: '#3b82f6' },
  expiration: { label: 'Expiration',    icon: '⏱', color: '#ef4444' },
  payment:    { label: 'Payment',       icon: '$',  color: '#8b5cf6' },
  notice:     { label: 'Notice Window', icon: '⚠', color: '#f59e0b' },
  compliance: { label: 'Compliance',    icon: '✓',  color: '#6b7280' },
}

const NOTICE_DAYS = 30

function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function proposeCommitmentsFromContract(contract) {
  const v = contract.verified
  if (!v) return []

  const name    = v.contractType || 'Contract'
  const parties = [v.partyA, v.partyB].filter(Boolean).join(' · ') || null
  const result  = []

  if (v.effectiveDate) {
    result.push({
      type:          'start',
      title:         `${name} effective`,
      description:   parties,
      maturityDate:  v.effectiveDate,
      sourceFieldIds: ['effectiveDate'],
      value:         null,
    })
  }

  if (v.renewalDate) {
    result.push({
      type:          'renewal',
      title:         `${name} renewal`,
      description:   null,
      maturityDate:  v.renewalDate,
      sourceFieldIds: ['renewalDate'],
      value:         null,
    })
  }

  if (v.expirationDate) {
    const noticeDate = addDays(v.expirationDate, -NOTICE_DAYS)
    if (noticeDate !== v.expirationDate) {
      result.push({
        type:          'notice',
        title:         `${name} — ${NOTICE_DAYS}-day notice`,
        description:   'Notice window before expiration',
        maturityDate:  noticeDate,
        sourceFieldIds: ['expirationDate'],
        value:         null,
      })
    }
    result.push({
      type:          'expiration',
      title:         `${name} expires`,
      description:   null,
      maturityDate:  v.expirationDate,
      sourceFieldIds: ['expirationDate'],
      value:         null,
    })
  }

  return result
}
