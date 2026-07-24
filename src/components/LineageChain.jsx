// Provenance display for a published artifact.
// Receives one lineage record — renders the chain of IDs that produced it.
// Designed to be reused by Theater published tab, ARCHIVIST view, and analytics.

const STEPS = [
  { key: 'observation', label: 'Originated from Observation', field: 'observationId' },
  { key: 'command',     label: 'Executed as K.E.L. Command',  field: 'commandId'     },
  { key: 'thread',      label: 'Promoted through Thread',     field: 'threadId'      },
  { key: 'muse',        label: 'Developed in MUSE Work',      field: 'museWorkId'    },
  { key: 'production',  label: 'Packaged as Production',      field: 'productionId'  },
  { key: 'asset',       label: 'Published as Asset',          field: 'assetId'       },
]

function shortId(id) {
  return id ? id.slice(0, 4).toUpperCase() : null
}

export default function LineageChain({ lineage }) {
  if (!lineage) return null

  const path   = lineage.path ?? []
  const active = STEPS.filter(s => path.includes(s.key) && lineage[s.field])

  const date = lineage.publishedAt instanceof Date
    ? lineage.publishedAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : typeof lineage.publishedAt === 'string'
      ? new Date(lineage.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : null

  if (active.length === 0 && !date) return null

  return (
    <div style={{
      marginTop: '12px',
      padding: '12px 14px',
      background: '#04080f',
      border: '1px solid #6366f118',
      borderRadius: '6px',
    }}>
      <p style={{
        color: 'var(--text-6)', fontSize: '8px', letterSpacing: '0.16em',
        textTransform: 'uppercase', fontWeight: 700, marginBottom: '10px',
      }}>
        Lineage
      </p>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {active.map((step, i) => (
          <div key={step.key}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 0' }}>
              <div style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: '#6366f1', flexShrink: 0,
              }} />
              <span style={{ color: 'var(--text-4)', fontSize: '10px', flex: 1 }}>
                {step.label}
              </span>
              <code style={{
                color: '#818cf8', fontSize: '10px',
                fontFamily: 'monospace', letterSpacing: '0.1em',
              }}>
                {shortId(lineage[step.field])}
              </code>
            </div>
            {i < active.length - 1 && (
              <div style={{
                width: '1px', height: '8px',
                background: '#6366f128', marginLeft: '2px',
              }} />
            )}
          </div>
        ))}

        {date && (
          <>
            {active.length > 0 && (
              <div style={{ width: '1px', height: '8px', background: '#10b98128', marginLeft: '2px' }} />
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 0' }}>
              <div style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: '#10b981', flexShrink: 0,
              }} />
              <span style={{ color: '#10b981', fontSize: '10px', flex: 1 }}>Published</span>
              <span style={{ color: 'var(--text-5)', fontSize: '10px' }}>{date}</span>
            </div>
          </>
        )}
      </div>

      {lineage.constellation && (
        <p style={{
          color: 'var(--text-6)', fontSize: '9px',
          marginTop: '8px', fontStyle: 'italic',
          borderTop: '1px solid #ffffff08', paddingTop: '6px',
        }}>
          via {lineage.constellation}
        </p>
      )}
    </div>
  )
}
