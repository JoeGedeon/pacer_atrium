import { useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

const STATES = ['open', 'reviewed', 'dismissed']
const SEVERITY = { critical: 0, high: 1, medium: 2, low: 3 }

function dateKey(value = new Date()) {
  const d = value instanceof Date ? value : new Date(value)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function toDate(value) {
  if (!value) return new Date(0)
  if (typeof value.toDate === 'function') return value.toDate()
  return new Date(value)
}

function stableId(parts) {
  return parts.filter(Boolean).map(v => String(v).trim().toLowerCase()).join('::')
}

function explicitDisagreement(record) {
  const text = [record?.status, record?.type, record?.summary, record?.text, record?.reason]
    .filter(Boolean).join(' ').toLowerCase()
  return /disagree|mismatch|contradict|conflict|different result|parity failure/.test(text)
}

function buildSignals({ observations, events, commands, doctrineCases }) {
  const signals = []

  observations.forEach(obs => {
    const state = String(obs.operationalState || obs.status || '').toLowerCase()
    const text = String(obs.text || obs.summary || '')
    if (state === 'conflict' || /conflict|contradict/.test(text.toLowerCase())) {
      signals.push({
        id: stableId(['conflict', obs.id, obs.updatedAt || obs.timestamp]),
        type: 'Conflict detected', severity: 'critical', sourceIds: [obs.id],
        constellation: obs.constellation || 'Unassigned', createdAt: toDate(obs.updatedAt || obs.timestamp),
        whyNow: text || 'Conflicting institutional evidence requires human review.',
        destination: 'Archivist Hall', category: 'Critical attention',
      })
    }
    if (state === 'reopened' || obs.resonanceStatus === 'reopened') {
      signals.push({
        id: stableId(['resonance-reopened', obs.id, obs.updatedAt || obs.timestamp]),
        type: 'Resonance reopened', severity: 'high', sourceIds: [obs.id],
        constellation: obs.constellation || 'Unassigned', createdAt: toDate(obs.updatedAt || obs.timestamp),
        whyNow: 'New evidence reopened a previously dormant institutional connection.',
        destination: 'Archivist Hall', category: 'Changed since last review',
      })
    }
  })

  const byConstellation = new Map()
  observations.forEach(obs => {
    if (!obs.constellation || !explicitDisagreement(obs)) return
    const key = obs.constellation
    const bucket = byConstellation.get(key) || []
    bucket.push(obs)
    byConstellation.set(key, bucket)
  })
  byConstellation.forEach((records, constellation) => {
    const repo = records.find(r => /repo/i.test(String(r.source || r.type || '')))
    const browser = records.find(r => /browser/i.test(String(r.source || r.type || '')))
    if (!repo || !browser) return
    const newest = [repo, browser].sort((a, b) => toDate(b.updatedAt || b.timestamp) - toDate(a.updatedAt || a.timestamp))[0]
    signals.push({
      id: stableId(['repo-browser-disagreement', constellation, repo.id, browser.id, newest.updatedAt || newest.timestamp]),
      type: 'Repository/browser disagreement', severity: 'critical', sourceIds: [repo.id, browser.id],
      constellation, createdAt: toDate(newest.updatedAt || newest.timestamp),
      whyNow: 'Repository and browser evidence explicitly disagree inside the same constellation.',
      destination: 'Memory Galaxy', category: 'Critical attention',
    })
  })

  commands.forEach(command => {
    if (command.status === 'pending_approval') {
      signals.push({
        id: stableId(['human-gate', command.id, command.requestedAt || command.updatedAt || command.createdAt]),
        type: 'Human Gate review', severity: 'high', sourceIds: [command.id],
        constellation: command.constellation || command.patternTag || 'Operations',
        createdAt: toDate(command.requestedAt || command.updatedAt || command.createdAt),
        whyNow: command.title ? `${command.title} is waiting for an authorized human decision.` : 'A command is waiting for Human Gate review.',
        destination: 'K.E.L. Commands', category: 'Waiting on you',
      })
    }
    if (command.status === 'failed') {
      signals.push({
        id: stableId(['capability-failure', command.id, command.completedAt || command.updatedAt]),
        type: 'Capability failure', severity: 'critical', sourceIds: [command.id],
        constellation: command.constellation || command.patternTag || 'Operations',
        createdAt: toDate(command.completedAt || command.updatedAt || command.createdAt),
        whyNow: command.failureReason || command.title || 'An operational capability failed and needs review.',
        destination: 'Mission Control', category: 'System health',
      })
    }
  })

  doctrineCases.forEach(item => {
    const changed = item.status === 'validated' || item.status === 'institutional' || item.status === 'archived'
    if (!changed) return
    signals.push({
      id: stableId(['principle-change', item.id, item.updatedAt || item.decidedAt || item.createdAt]),
      type: 'Principle changed', severity: 'medium', sourceIds: [item.id],
      constellation: item.constellation || item.domain || 'Doctrine',
      createdAt: toDate(item.updatedAt || item.decidedAt || item.createdAt),
      whyNow: `${item.title || 'An operational principle'} moved to ${item.status}.`,
      destination: 'Doctrine', category: 'Changed since last review',
    })
  })

  events.forEach(event => {
    const kind = String(event.type || event.eventType || '').toLowerCase()
    if (!/story|material|principle|capability/.test(kind)) return
    signals.push({
      id: stableId(['institution-event', event.id, event.createdAt || event.timestamp]),
      type: /capability/.test(kind) ? 'Capability update' : 'Operational story changed',
      severity: /fail|critical/.test(String(event.status || event.summary || '').toLowerCase()) ? 'high' : 'medium',
      sourceIds: [event.id], constellation: event.constellation || 'Institution',
      createdAt: toDate(event.createdAt || event.timestamp),
      whyNow: event.summary || event.text || 'A material institutional event changed the current operating story.',
      destination: 'Archivist Hall', category: 'Changed since last review',
    })
  })

  const deduped = new Map()
  signals.forEach(signal => { if (!deduped.has(signal.id)) deduped.set(signal.id, signal) })
  return [...deduped.values()].sort((a, b) => (SEVERITY[a.severity] - SEVERITY[b.severity]) || (b.createdAt - a.createdAt))
}

function subscribe(uid, name, callback) {
  const ref = query(collection(db, 'users', uid, name), orderBy('createdAt', 'desc'))
  return onSnapshot(ref, snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))), err => {
    console.warn(`[PACER awareness] ${name} listener failed`, err?.code || err)
    callback([])
  })
}

export default function OperationalAwarenessLayer({ children }) {
  const [uid, setUid] = useState(null)
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('attention')
  const [filter, setFilter] = useState('open')
  const [observations, setObservations] = useState([])
  const [events, setEvents] = useState([])
  const [commands, setCommands] = useState([])
  const [doctrineCases, setDoctrineCases] = useState([])
  const [dispositions, setDispositions] = useState({})
  const [history, setHistory] = useState([])
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => onAuthStateChanged(auth, user => setUid(user?.uid || null)), [])

  useEffect(() => {
    if (!uid) return
    const stops = [
      subscribe(uid, 'observations', setObservations),
      subscribe(uid, 'institution_events', setEvents),
      subscribe(uid, 'commands', setCommands),
      subscribe(uid, 'doctrine_cases', setDoctrineCases),
      onSnapshot(collection(db, 'users', uid, 'inbox_dispositions'), snap => {
        const next = {}; snap.docs.forEach(d => { next[d.id] = d.data() }); setDispositions(next)
      }),
      onSnapshot(query(collection(db, 'users', uid, 'daily_brief_history'), orderBy('generatedAt', 'desc')), snap => {
        setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      }),
    ]
    return () => stops.forEach(stop => stop?.())
  }, [uid])

  const signals = useMemo(() => buildSignals({ observations, events, commands, doctrineCases }).map(signal => ({
    ...signal, reviewStatus: dispositions[signal.id]?.status || 'open',
  })), [observations, events, commands, doctrineCases, dispositions])

  const categories = useMemo(() => {
    const result = { 'Critical attention': [], 'Changed since last review': [], 'Waiting on you': [], 'System health': [], 'Recently reviewed': [] }
    signals.forEach(signal => {
      if (signal.reviewStatus === 'reviewed') result['Recently reviewed'].push(signal)
      else if (signal.reviewStatus === 'open') result[signal.category]?.push(signal)
    })
    return result
  }, [signals])

  const filtered = signals.filter(signal => signal.reviewStatus === filter)
  const openCount = signals.filter(signal => signal.reviewStatus === 'open').length

  async function setDisposition(signal, status) {
    if (!uid || busy) return
    const previous = dispositions[signal.id]
    setBusy(signal.id); setError('')
    setDispositions(current => ({ ...current, [signal.id]: { ...(current[signal.id] || {}), status } }))
    try {
      await setDoc(doc(db, 'users', uid, 'inbox_dispositions', signal.id), {
        signalId: signal.id, status, sourceIds: signal.sourceIds, constellation: signal.constellation,
        type: signal.type, updatedAt: serverTimestamp(),
      }, { merge: true })
    } catch (err) {
      setDispositions(current => {
        const next = { ...current }
        if (previous) next[signal.id] = previous; else delete next[signal.id]
        return next
      })
      setError('Review state was not saved. PACER restored the persisted truth.')
    } finally { setBusy(null) }
  }

  async function ensureTodaySnapshot() {
    if (!uid) return null
    const key = dateKey()
    const ref = doc(db, 'users', uid, 'daily_brief_history', key)
    await runTransaction(db, async tx => {
      const existing = await tx.get(ref)
      if (existing.exists()) return
      const categoryMap = {}
      Object.entries(categories).forEach(([name, items]) => { categoryMap[name] = items.map(item => item.id) })
      tx.set(ref, {
        localDate: key,
        categories: categoryMap,
        categoryCounts: Object.fromEntries(Object.entries(categoryMap).map(([name, ids]) => [name, ids.length])),
        signalIds: [...new Set(Object.values(categoryMap).flat())],
        openedSignalIds: [], generatedAt: serverTimestamp(),
      })
    })
    return key
  }

  async function openSignal(signal) {
    const key = await ensureTodaySnapshot()
    if (uid && key) {
      await setDoc(doc(db, 'users', uid, 'daily_brief_history', key), { openedSignalIds: arrayUnion(signal.id) }, { merge: true })
    }
    setTab('attention'); setFilter(signal.reviewStatus)
    requestAnimationFrame(() => document.getElementById(`pacer-signal-${CSS.escape(signal.id)}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
  }

  async function showBrief() {
    await ensureTodaySnapshot()
    setTab('brief'); setOpen(true)
  }

  return <>
    {children}
    {uid && <button className="pacer-awareness-launch" onClick={() => setOpen(true)} aria-label={`Open PACER Inbox, ${openCount} open items`}>
      <span>◎</span> PACER Inbox {openCount > 0 && <b>{openCount}</b>}
    </button>}
    {open && <div className="pacer-awareness-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setOpen(false) }}>
      <section className="pacer-awareness-panel" role="dialog" aria-modal="true" aria-label="PACER operational awareness">
        <header>
          <div><small>GOVERNED OPERATIONAL AWARENESS</small><h2>PACER Inbox</h2></div>
          <button onClick={() => setOpen(false)} aria-label="Close PACER Inbox">×</button>
        </header>
        <nav aria-label="PACER Inbox views">
          <button aria-pressed={tab === 'attention'} onClick={() => setTab('attention')}>Current attention</button>
          <button aria-pressed={tab === 'brief'} onClick={showBrief}>Morning Brief</button>
          <button aria-pressed={tab === 'history'} onClick={() => setTab('history')}>Brief history</button>
        </nav>
        {error && <div className="pacer-awareness-error" role="alert">{error}</div>}
        {tab === 'attention' && <>
          <div className="pacer-awareness-tabs" role="tablist" aria-label="Review status">
            {STATES.map(state => <button key={state} role="tab" aria-selected={filter === state} onClick={() => setFilter(state)}>{state} <span>{signals.filter(s => s.reviewStatus === state).length}</span></button>)}
          </div>
          <div className="pacer-awareness-list">
            {filtered.length === 0 && <div className="pacer-awareness-empty">No {filter} signals. PACER will not invent urgency merely to keep the room dramatic.</div>}
            {filtered.map(signal => <article id={`pacer-signal-${signal.id}`} key={signal.id} className={`pacer-awareness-item severity-${signal.severity}`}>
              <div className="pacer-awareness-item-head"><span>{signal.type}</span><b>{signal.severity}</b></div>
              <p>{signal.whyNow}</p>
              <dl><div><dt>Evidence</dt><dd>{signal.sourceIds.length}</dd></div><div><dt>Constellation</dt><dd>{signal.constellation}</dd></div><div><dt>Created</dt><dd>{signal.createdAt.toLocaleString()}</dd></div><div><dt>Destination</dt><dd>{signal.destination}</dd></div></dl>
              <footer><button onClick={() => openSignal(signal)}>Open</button>{signal.reviewStatus !== 'reviewed' && <button disabled={busy === signal.id} onClick={() => setDisposition(signal, 'reviewed')}>Reviewed</button>}{signal.reviewStatus !== 'dismissed' && <button disabled={busy === signal.id} onClick={() => setDisposition(signal, 'dismissed')}>Dismiss</button>}{signal.reviewStatus !== 'open' && <button disabled={busy === signal.id} onClick={() => setDisposition(signal, 'open')}>Reopen</button>}</footer>
            </article>)}
          </div>
        </>}
        {tab === 'brief' && <div className="pacer-awareness-brief">
          {Object.entries(categories).map(([name, items]) => <section key={name}><h3>{name}<span>{items.length}</span></h3>{items.length === 0 ? <p className="muted">Nothing in this category.</p> : items.slice(0, 4).map(item => <button key={item.id} onClick={() => openSignal(item)}><b>{item.type}</b><span>{item.whyNow}</span></button>)}</section>)}
        </div>}
        {tab === 'history' && <div className="pacer-awareness-history">
          {history.length === 0 && <div className="pacer-awareness-empty">No dated briefs yet. Open Morning Brief to establish today’s immutable snapshot.</div>}
          {history.map((brief, index) => {
            const previous = history[index + 1]
            const ids = brief.signalIds || []
            const priorIds = previous?.signalIds || []
            const carried = ids.filter(id => priorIds.includes(id))
            const fresh = ids.filter(id => !priorIds.includes(id))
            const streaks = ids.map(id => {
              let streak = 1
              for (let i = index + 1; i < history.length; i += 1) {
                if (!(history[i].signalIds || []).includes(id)) break
                streak += 1
              }
              const first = [...history].reverse().find(h => (h.signalIds || []).includes(id))
              const age = Math.max(0, Math.round((new Date(`${brief.localDate}T12:00:00`) - new Date(`${first?.localDate || brief.localDate}T12:00:00`)) / 86400000))
              return { id, streak, firstSeen: first?.localDate || brief.localDate, age }
            })
            const longest = [...streaks].sort((a, b) => b.streak - a.streak)[0]
            return <article key={brief.id} className="pacer-history-card"><h3>{brief.localDate}<span>{ids.length} signals</span></h3><div className="pacer-history-metrics"><span>Opened <b>{brief.openedSignalIds?.length || 0}</b></span><span>Carried <b>{carried.length}</b></span><span>New <b>{fresh.length}</b></span><span>Longest running <b>{longest?.streak || 0} briefs</b></span></div><details><summary>Signal accountability audit</summary>{streaks.map(row => <div className="pacer-history-row" key={row.id}><code>{row.id}</code><span>First seen {row.firstSeen}</span><span>{row.age} days</span><span>{row.streak} consecutive briefs</span></div>)}</details></article>
          })}
        </div>}
        <aside className="pacer-awareness-boundary">PACER Inbox aggregates, prioritizes, explains, and links. It does not approve, adopt, execute, resolve, or rewrite evidence.</aside>
      </section>
    </div>}
    <style>{styles}</style>
  </>
}

const styles = `
.pacer-awareness-launch{position:fixed;right:18px;bottom:18px;z-index:9000;border:1px solid #8b5cf6;background:#111827;color:#f8fafc;border-radius:999px;padding:11px 16px;font:700 13px/1 system-ui;box-shadow:0 10px 35px #0008;cursor:pointer}.pacer-awareness-launch b{background:#ef4444;border-radius:999px;padding:3px 7px;margin-left:5px}.pacer-awareness-backdrop{position:fixed;inset:0;z-index:9990;background:#020617cc;display:flex;justify-content:flex-end}.pacer-awareness-panel{width:min(760px,100%);height:100%;overflow:auto;background:#07101f;color:#e5e7eb;border-left:1px solid #334155;box-shadow:-20px 0 50px #0008;font-family:system-ui}.pacer-awareness-panel>header{position:sticky;top:0;z-index:2;display:flex;justify-content:space-between;align-items:center;padding:20px 22px;background:#07101ff2;border-bottom:1px solid #1e293b;backdrop-filter:blur(12px)}.pacer-awareness-panel h2{margin:3px 0 0;font-size:25px}.pacer-awareness-panel small{color:#a78bfa;letter-spacing:.14em}.pacer-awareness-panel header button{font-size:30px;background:none;border:0;color:#cbd5e1;cursor:pointer}.pacer-awareness-panel>nav{display:flex;gap:8px;padding:14px 22px;border-bottom:1px solid #1e293b}.pacer-awareness-panel>nav button,.pacer-awareness-tabs button{border:1px solid #334155;background:#0f172a;color:#cbd5e1;border-radius:9px;padding:9px 12px;cursor:pointer}.pacer-awareness-panel>nav button[aria-pressed=true],.pacer-awareness-tabs button[aria-selected=true]{border-color:#8b5cf6;background:#2e1065;color:white}.pacer-awareness-tabs{display:flex;gap:8px;padding:14px 22px}.pacer-awareness-tabs span{opacity:.75}.pacer-awareness-list,.pacer-awareness-brief,.pacer-awareness-history{padding:0 22px 22px}.pacer-awareness-item{border:1px solid #334155;border-left-width:4px;background:#0b1220;border-radius:12px;padding:16px;margin-bottom:12px}.severity-critical{border-left-color:#ef4444}.severity-high{border-left-color:#f59e0b}.severity-medium{border-left-color:#60a5fa}.severity-low{border-left-color:#64748b}.pacer-awareness-item-head{display:flex;justify-content:space-between;text-transform:capitalize}.pacer-awareness-item-head b{font-size:11px;letter-spacing:.08em;color:#cbd5e1}.pacer-awareness-item p{color:#cbd5e1;line-height:1.5}.pacer-awareness-item dl{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.pacer-awareness-item dl div{background:#111827;border-radius:8px;padding:8px}.pacer-awareness-item dt{font-size:10px;color:#94a3b8;text-transform:uppercase}.pacer-awareness-item dd{margin:3px 0 0;font-size:12px;overflow-wrap:anywhere}.pacer-awareness-item footer{display:flex;gap:8px;margin-top:12px}.pacer-awareness-item footer button{border:1px solid #475569;background:#111827;color:#f8fafc;border-radius:7px;padding:7px 10px;cursor:pointer}.pacer-awareness-empty{padding:30px;border:1px dashed #475569;border-radius:12px;color:#94a3b8;text-align:center}.pacer-awareness-error{margin:12px 22px;padding:10px;background:#7f1d1d;border-radius:8px}.pacer-awareness-brief section{margin:16px 0}.pacer-awareness-brief h3{display:flex;justify-content:space-between}.pacer-awareness-brief h3 span{color:#a78bfa}.pacer-awareness-brief section>button{width:100%;display:grid;text-align:left;gap:4px;background:#0b1220;color:#e5e7eb;border:1px solid #334155;border-radius:10px;padding:12px;margin:7px 0;cursor:pointer}.pacer-awareness-brief section>button span,.muted{color:#94a3b8}.pacer-history-card{border:1px solid #334155;background:#0b1220;border-radius:12px;padding:15px;margin:12px 0}.pacer-history-card h3{display:flex;justify-content:space-between}.pacer-history-card h3 span{font-size:12px;color:#a78bfa}.pacer-history-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.pacer-history-metrics span{background:#111827;padding:8px;border-radius:8px;font-size:12px}.pacer-history-card details{margin-top:12px}.pacer-history-row{display:grid;grid-template-columns:2fr 1fr .7fr 1fr;gap:8px;padding:9px 0;border-top:1px solid #1e293b;font-size:11px}.pacer-history-row code{overflow-wrap:anywhere;color:#c4b5fd}.pacer-awareness-boundary{margin:0 22px 24px;padding:12px;border:1px solid #312e81;background:#17153b;color:#c4b5fd;border-radius:10px;font-size:12px;line-height:1.45}@media(max-width:700px){.pacer-awareness-item dl{grid-template-columns:1fr 1fr}.pacer-history-metrics{grid-template-columns:1fr 1fr}.pacer-history-row{grid-template-columns:1fr}.pacer-awareness-launch{right:10px;bottom:10px}.pacer-awareness-panel>nav{overflow:auto}}
`
