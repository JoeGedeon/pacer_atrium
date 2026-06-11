import { useState } from 'react'
import { requestKELRecommendation } from '../lib/kelAnalysis'

const REQUEST_LABELS = { builder_readiness: 'Builder Readiness' }

function timeAgo(date) {
  if (!date) return ''
  const mins = Math.floor((Date.now() - date.getTime()) / 60000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const DOMAIN_COLORS = {
  'FleetFlow':              '#3b82f6',
  'Isles of the Awakening': '#10b981',
  'Doctrine':               '#f59e0b',
  'Content':                '#8b5cf6',
  'Archive':                '#6b7280',
}

function domainColor(d) { return DOMAIN_COLORS[d] || '#4b5563' }

export default function KELRoom({
  observations = [], apiKey, onConnectClaude, onDecision,
  kelReviews = [], onApproveReview, onDenyReview, isMobile,
}) {
  const [rec,          setRec]          = useState(null)
  const [reading,      setReading]      = useState(false)
  const [kelError,     setKelError]     = useState(null)
  const [decided,      setDecided]      = useState(null)
  const [denyingId,    setDenyingId]    = useState(null)
  const [denyRationale, setDenyRationale] = useState('')

  const pendingReviews = kelReviews.filter(r => r.status === 'pending')

  const validObs = observations.filter(o => o.text && typeof o.text === 'string')
  const canRead  = !!apiKey && validObs.length >= 2

  async function handleRequest() {
    if (!canRead || reading) return
    setReading(true)
    setKelError(null)
    setRec(null)
    setDecided(null)
    try {
      const result = await requestKELRecommendation(validObs, apiKey)
      setRec(result)
    } catch (e) {
      console.error('[KEL]', e)
      setKelError(e.message)
    } finally {
      setReading(false)
    }
  }

  function handleDecision(decision) {
    if (!rec || decided) return
    setDecided(decision)
    onDecision({ ...rec, decision })
  }

  const confidence = rec ? Math.round((rec.confidence ?? 0) * 100) : 0
  const color      = rec ? domainColor(rec.domain) : '#4b5563'

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-0)' }}>

      {/* Header */}
      <div className="shrink-0 px-10 pt-8 pb-6" style={{ borderBottom: '1px solid var(--border-0)' }}>
        <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}
        >Recommendation Engine</p>
        <h2 style={{ fontSize: '18px', color: 'var(--text-0)', fontWeight: 700,
          letterSpacing: '0.08em', marginBottom: '6px' }}
        >KEL</h2>
        <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic' }}>
          Points at the map. Does not touch the wheel.
        </p>
      </div>

      <div className={`flex-1 overflow-y-auto ${isMobile ? 'px-6' : 'px-10'} py-8`}>

        {/* Pending Reviews — institutional ledger */}
        {pendingReviews.length > 0 && (
          <div style={{ maxWidth: '560px', marginBottom: '36px' }}>
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>
              Pending Reviews
            </p>
            <div className="flex flex-col gap-3">
              {pendingReviews.map(review => (
                <div key={review.id} style={{
                  background: 'var(--bg-2)', border: '1px solid var(--border-1)',
                  borderLeft: '3px solid #3b82f6', borderRadius: '0 8px 8px 0',
                  padding: '14px 18px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <p style={{ color: 'var(--text-2)', fontSize: '12px',
                        fontWeight: 600, marginBottom: '2px' }}>
                        {REQUEST_LABELS[review.requestType] ?? review.requestType}
                      </p>
                      <p style={{ color: 'var(--text-6)', fontSize: '10px' }}>
                        {timeAgo(review.createdAt)}
                      </p>
                    </div>
                    <span style={{
                      background: '#3b82f615', border: '1px solid #3b82f640',
                      borderRadius: '4px', padding: '2px 8px',
                      color: '#3b82f6', fontSize: '9px', fontWeight: 600,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                    }}>Pending</span>
                  </div>

                  {denyingId === review.id ? (
                    <div>
                      <p style={{ color: 'var(--text-4)', fontSize: '11px',
                        marginBottom: '8px' }}>
                        Rationale required before denial is recorded.
                      </p>
                      <textarea
                        value={denyRationale}
                        onChange={e => setDenyRationale(e.target.value)}
                        placeholder="Why is this request denied?"
                        rows={3}
                        style={{
                          width: '100%', background: 'var(--bg-1)',
                          border: '1px solid var(--border-1)', borderRadius: '6px',
                          padding: '8px 12px', color: 'var(--text-1)',
                          fontSize: '12px', lineHeight: 1.6, resize: 'vertical',
                          marginBottom: '10px', boxSizing: 'border-box',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          disabled={!denyRationale.trim()}
                          onClick={() => {
                            onDenyReview(review.id, denyRationale.trim())
                            setDenyingId(null)
                            setDenyRationale('')
                          }}
                          style={{
                            background: '#140808', border: '1px solid #3a1010',
                            color: denyRationale.trim() ? '#7a2020' : 'var(--text-6)',
                            fontSize: '11px', fontWeight: 600,
                            padding: '6px 14px', borderRadius: '6px',
                            cursor: denyRationale.trim() ? 'pointer' : 'default',
                          }}
                        >Confirm Denial</button>
                        <button
                          onClick={() => { setDenyingId(null); setDenyRationale('') }}
                          style={{
                            background: 'none', border: '1px solid var(--border-1)',
                            color: 'var(--text-4)', fontSize: '11px',
                            padding: '6px 14px', borderRadius: '6px', cursor: 'pointer',
                          }}
                        >Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => onApproveReview(review.id)}
                        style={{
                          background: '#041208', border: '1px solid #0a3018',
                          color: '#1a7a40', fontSize: '11px', fontWeight: 600,
                          padding: '6px 14px', borderRadius: '6px', cursor: 'pointer',
                        }}
                      >Approve</button>
                      <button
                        onClick={() => { setDenyingId(review.id); setDenyRationale('') }}
                        style={{
                          background: '#140808', border: '1px solid #3a1010',
                          color: '#7a2020', fontSize: '11px', fontWeight: 600,
                          padding: '6px 14px', borderRadius: '6px', cursor: 'pointer',
                        }}
                      >Deny</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No API key */}
        {!apiKey && (
          <div style={{ maxWidth: '440px' }}>
            <p style={{ color: 'var(--text-3)', fontSize: '13px', lineHeight: 1.7, marginBottom: '16px' }}>
              KEL requires a Claude key to produce recommendations.
            </p>
            <button onClick={onConnectClaude}
              style={{ background: 'none', border: '1px solid var(--border-1)',
                color: '#60a5fa', fontSize: '12px', cursor: 'pointer',
                padding: '8px 16px', borderRadius: '6px' }}
            >✦ Connect Claude</button>
          </div>
        )}

        {/* Not enough observations */}
        {apiKey && validObs.length < 2 && (
          <p style={{ color: 'var(--text-4)', fontSize: '13px', lineHeight: 1.7, maxWidth: '440px' }}>
            KEL needs at least 2 observations to recommend. Add more in Atrium.
          </p>
        )}

        {/* Ready to request */}
        {canRead && !rec && !reading && !kelError && (
          <div style={{ maxWidth: '520px' }}>
            <p style={{ color: 'var(--text-3)', fontSize: '13px', lineHeight: 1.7, marginBottom: '8px' }}>
              {validObs.length} observation{validObs.length !== 1 ? 's' : ''} in memory.
            </p>
            <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.7, marginBottom: '24px' }}>
              KEL will read the observations and return one recommendation with reasoning.
              The decision belongs to you — KEL records nothing.
            </p>
            <button onClick={handleRequest}
              className="px-6 py-3 rounded-lg text-sm font-medium"
              style={{ background: '#1d4ed8', color: '#e0eaff',
                border: '1px solid #2563eb', cursor: 'pointer' }}
            >
              Request Recommendation
            </button>
          </div>
        )}

        {/* Reading */}
        {reading && (
          <div className="flex items-center gap-3" style={{ paddingTop: '8px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%',
              background: '#1d4ed8', animation: 'pulse-fade 1.5s infinite' }} />
            <p style={{ color: 'var(--text-3)', fontSize: '13px', fontStyle: 'italic' }}>
              KEL is reading the observations…
            </p>
          </div>
        )}

        {/* Error */}
        {kelError && (
          <div style={{ maxWidth: '520px' }}>
            <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: '16px' }}>
              KEL unavailable: {kelError}
            </p>
            <button onClick={handleRequest}
              style={{ background: 'none', border: '1px solid var(--border-1)',
                color: 'var(--text-3)', fontSize: '12px', cursor: 'pointer',
                padding: '7px 14px', borderRadius: '6px' }}
            >Try again</button>
          </div>
        )}

        {/* Recommendation */}
        {rec && (
          <div style={{ maxWidth: '560px' }}>

            {/* Domain badge */}
            <div className="flex items-center gap-3 mb-6">
              <span style={{
                fontSize: '10px', padding: '3px 10px', borderRadius: '999px',
                background: `${color}18`, color, border: `1px solid ${color}35`,
                letterSpacing: '0.06em',
              }}>{rec.domain}</span>
              <span style={{ color: 'var(--text-5)', fontSize: '10px' }}>
                {confidence}% confidence
              </span>
            </div>

            {/* Confidence bar */}
            <div style={{ height: '2px', background: 'var(--border-1)', borderRadius: '2px', marginBottom: '24px' }}>
              <div style={{ height: '100%', borderRadius: '2px',
                width: `${confidence}%`, background: color }} />
            </div>

            {/* Recommendation */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
                textTransform: 'uppercase', marginBottom: '8px' }}>KEL recommends</p>
              <p style={{ color: 'var(--text-0)', fontSize: '16px', lineHeight: 1.6,
                fontWeight: 500, letterSpacing: '-0.01em' }}>
                {rec.recommendation}
              </p>
            </div>

            {/* Reasoning */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
                textTransform: 'uppercase', marginBottom: '8px' }}>Because</p>
              <p style={{ color: 'var(--text-2)', fontSize: '13px', lineHeight: 1.7 }}>
                {rec.reasoning}
              </p>
            </div>

            {/* Cited observations */}
            {rec.cited?.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
                  textTransform: 'uppercase', marginBottom: '8px' }}>Observed</p>
                <div className="flex flex-col gap-2">
                  {rec.cited.map((c, i) => (
                    <p key={i} style={{
                      color: 'var(--text-4)', fontSize: '11px', lineHeight: 1.55,
                      paddingLeft: '10px', borderLeft: `2px solid ${color}40`,
                    }}>"{c}"</p>
                  ))}
                </div>
              </div>
            )}

            {/* Decision buttons — or confirmed verdict */}
            {!decided ? (
              <div>
                <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
                  textTransform: 'uppercase', marginBottom: '12px' }}>Your decision</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { id: 'approved', label: 'Approve',  bg: '#041208', border: '#0a3018', color: '#1a7a40' },
                    { id: 'rejected', label: 'Reject',   bg: '#140808', border: '#3a1010', color: '#7a2020' },
                    { id: 'deferred', label: 'Defer',    bg: 'var(--bg-2)', border: 'var(--border-1)', color: 'var(--text-3)' },
                  ].map(opt => (
                    <button key={opt.id} onClick={() => handleDecision(opt.id)}
                      className="px-5 py-2.5 rounded-lg text-sm font-medium"
                      style={{ background: opt.bg, border: `1px solid ${opt.border}`,
                        color: opt.color, cursor: 'pointer' }}
                    >{opt.label}</button>
                  ))}
                </div>
                <p style={{ color: 'var(--text-6)', fontSize: '10px', marginTop: '10px' }}>
                  Your decision is recorded by Archive. KEL does not record outcomes.
                </p>
              </div>
            ) : (
              <div style={{ padding: '14px 18px', borderRadius: '8px',
                background: 'var(--bg-2)', border: '1px solid var(--border-1)' }}>
                <p style={{ color: 'var(--text-2)', fontSize: '12px', marginBottom: '6px' }}>
                  Decision recorded:{' '}
                  <span style={{ fontWeight: 600,
                    color: decided === 'approved' ? '#1a7a40' : decided === 'rejected' ? '#7a2020' : 'var(--text-2)' }}>
                    {decided}
                  </span>
                </p>
                <p style={{ color: 'var(--text-5)', fontSize: '11px', lineHeight: 1.6 }}>
                  Archive holds the verdict. VERA will read it next time.
                </p>
                <button onClick={handleRequest} style={{
                  marginTop: '12px', background: 'none', border: 'none',
                  color: 'var(--text-4)', fontSize: '11px', cursor: 'pointer', padding: 0,
                }}>Request another recommendation →</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
