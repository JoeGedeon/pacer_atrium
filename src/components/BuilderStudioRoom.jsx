export default function BuilderStudioRoom({ isMobile, builderReadiness, threads = [], onNavigate }) {
  const px = isMobile ? 'px-6' : 'px-10'
  const approvedThreads = threads.filter(t => t.decision === 'approved')

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

      <div className={`flex-1 overflow-y-auto ${px} py-8`}>

        {builderReadiness === 'approved' && (
          <div style={{ maxWidth: '560px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
              <span style={{ color: '#10b981' }}>✓</span>
              <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>
                Human Gate authorization confirmed
              </span>
            </div>

            {approvedThreads.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
                  textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>
                  Approved Decisions — Build from these
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {approvedThreads.map(t => (
                    <div key={t.id} style={{
                      background: 'var(--bg-2)', border: '1px solid var(--border-1)',
                      borderLeft: '3px solid #10b981', borderRadius: '0 8px 8px 0',
                      padding: '14px 18px',
                    }}>
                      <p style={{ color: 'var(--text-0)', fontSize: '13px',
                        lineHeight: 1.6, marginBottom: '8px' }}>
                        {t.recommendation}
                      </p>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {t.domain && (
                          <span style={{ color: 'var(--text-5)', fontSize: '10px' }}>{t.domain}</span>
                        )}
                        {t.outcome ? (
                          <span style={{ color: '#10b981', fontSize: '10px' }}>Outcome recorded</span>
                        ) : (
                          <span style={{ color: 'var(--text-6)', fontSize: '10px', fontStyle: 'italic' }}>
                            Outcome pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{
              background: 'var(--bg-2)', border: '1px solid var(--border-1)',
              borderRadius: '8px', padding: '20px 24px',
            }}>
              <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
                textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>
                Forge Tools
              </p>
              <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic' }}>
                Build tools are being prepared. Return shortly.
              </p>
            </div>
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
                'Create implementation plans from approved decisions',
                'Generate execution sequences',
                'Track build milestones',
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
      </div>
    </div>
  )
}
