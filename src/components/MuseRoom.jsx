import { useState, useEffect } from 'react'

const CATEGORIES = [
  { id: 'music',         label: 'Music',        icon: '🎵' },
  { id: 'visual',        label: 'Visual Art',    icon: '🎨' },
  { id: 'lore',          label: 'Lore',          icon: '📖' },
  { id: 'worldbuilding', label: 'Worldbuilding', icon: '🌎' },
  { id: 'characters',    label: 'Characters',    icon: '🎭' },
  { id: 'productions',   label: 'Productions',   icon: '🎬' },
]

const LIFECYCLE = [
  { id: 'shaping',          label: 'Shaping',          action: null },
  { id: 'structured',       label: 'Structured',        action: 'Mark Structured' },
  { id: 'premiere_ready',   label: 'Premiere Ready',    action: 'Declare Ready' },
  { id: 'opening_night',    label: 'Opening Night',     action: 'Open the Curtain' },
  { id: 'published_memory', label: 'Published Memory',  action: 'Send to Archive' },
]

const LIFECYCLE_IDS  = LIFECYCLE.map(s => s.id)
const STATUS_COLORS  = {
  shaping:          'var(--text-4)',
  structured:       'var(--text-2)',
  premiere_ready:   '#f59e0b',
  opening_night:    '#10b981',
  published_memory: '#06b6d4',
}
const STATUS_GLYPHS  = {
  shaping:          '',
  structured:       '',
  premiere_ready:   '◈ ',
  opening_night:    '✦ ',
  published_memory: '◉ ',
}

const CONSTELLATIONS = [
  { a: 'Yanu',                b: 'Aiziano',   note: 'origin' },
  { a: 'FleetFlow',           b: 'Isles',     note: 'movement as narrative' },
  { a: 'PACER',               b: 'Doctrine',  note: 'intelligence requires governance' },
  { a: 'Blue Pineapple',      b: 'Atrium',    note: 'brand as entry point' },
  { a: 'Crossing the Bridge', b: 'Theater',   note: 'story finds its stage' },
]

function loadWorks() {
  try {
    return JSON.parse(localStorage.getItem('muse_works') || '[]').map(w => ({
      ...w,
      createdAt: new Date(w.createdAt),
      // migrate old premiered boolean to status string
      status: w.status || (w.premiered ? 'opening_night' : 'shaping'),
    }))
  } catch { return [] }
}

function tilt(seed, i) {
  return (((seed + i) % 7) - 3) * 0.55
}

function nextStatus(current) {
  const idx = LIFECYCLE_IDS.indexOf(current)
  return idx < LIFECYCLE_IDS.length - 1 ? LIFECYCLE_IDS[idx + 1] : current
}

export default function MuseRoom({ observations = [], onSurface }) {
  const [works, setWorks]           = useState(loadWorks)
  const [activeWork, setActiveWork] = useState(null)
  const [draft, setDraft]           = useState({ title: '', category: 'characters' })
  const [adding, setAdding]         = useState(false)
  const [surfaced, setSurfaced]     = useState(new Set())

  useEffect(() => {
    try { localStorage.setItem('muse_works', JSON.stringify(works)) } catch {}
  }, [works])

  useEffect(() => {
    if (!activeWork) return
    const updated = works.find(w => w.id === activeWork.id)
    if (updated) setActiveWork(updated)
  }, [works]) // eslint-disable-line react-hooks/exhaustive-deps

  function addWork() {
    if (!draft.title.trim()) return
    const w = {
      id: Date.now(),
      title: draft.title.trim(),
      category: draft.category,
      notes: '',
      status: 'shaping',
      createdAt: new Date(),
    }
    setWorks(prev => [w, ...prev])
    setActiveWork(w)
    setDraft({ title: '', category: 'characters' })
    setAdding(false)
  }

  function updateNotes(id, notes) {
    setWorks(prev => prev.map(w => w.id === id ? { ...w, notes } : w))
  }

  function advance(id) {
    setWorks(prev => prev.map(w =>
      w.id === id ? { ...w, status: nextStatus(w.status) } : w
    ))
  }

  const signals   = observations.slice(0, 14)
  const activeCat = CATEGORIES.find(c => c.id === activeWork?.category)
  const activeIdx = activeWork ? LIFECYCLE_IDS.indexOf(activeWork.status) : -1
  const nextStage = activeWork ? LIFECYCLE[activeIdx + 1] : null

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-0)' }}>

      {/* ── Three panels ─────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT WING — arriving signals, intentionally messy */}
        <div className="flex flex-col shrink-0 overflow-y-auto py-5 px-3"
          style={{ width: '210px', borderRight: '1px solid var(--border-0)' }}
        >
          <div className="flex items-center gap-2 mb-4 px-2">
            <span className="animate-pulse shrink-0" style={{
              width: '5px', height: '5px', borderRadius: '50%', background: '#10b981',
            }} />
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontWeight: 600 }}
            >Arriving</p>
          </div>

          {signals.length === 0 ? (
            <p className="px-2" style={{ color: 'var(--text-6)', fontSize: '11px', lineHeight: 1.7 }}>
              Signals from Atrium will appear here.
            </p>
          ) : (
            <div className="flex flex-col gap-3 px-1">
              {signals.map((obs, i) => (
                <div key={obs.id} style={{
                  transform: `rotate(${tilt(obs.id, i)}deg)`,
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border-1)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                }}>
                  <p style={{ color: 'var(--text-2)', fontSize: '11px', lineHeight: 1.5 }}>
                    {obs.text.length > 65 ? obs.text.slice(0, 65) + '…' : obs.text}
                  </p>
                  {obs.constellation && (
                    <p style={{ color: '#a07830', fontSize: '9px', marginTop: '4px' }}>
                      {obs.constellation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CENTER STAGE — dominant, like an easel */}
        <div className="flex-1 flex flex-col overflow-hidden"
          style={{ background: 'var(--bg-1)', borderRight: '1px solid var(--border-0)' }}
        >
          {activeWork ? (
            <div className="flex flex-col flex-1 px-12 py-10 overflow-y-auto">

              {/* Work header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
                    textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}
                  >{activeCat?.icon} {activeCat?.label}</p>
                  <h2 style={{ fontSize: '32px', color: 'var(--text-0)', fontWeight: 700,
                    letterSpacing: '-0.025em', lineHeight: 1.15 }}
                  >{activeWork.title}</h2>
                </div>

                {/* Lifecycle action button */}
                {nextStage ? (
                  <button onClick={() => advance(activeWork.id)} style={{
                    fontSize: '11px', padding: '7px 16px', borderRadius: '8px', fontWeight: 500,
                    background: activeWork.status === 'premiere_ready' ? '#1d4ed8' : 'var(--bg-3)',
                    color: activeWork.status === 'premiere_ready' ? '#e0eaff' : 'var(--text-2)',
                    border: `1px solid ${activeWork.status === 'premiere_ready' ? '#2563eb' : 'var(--border-1)'}`,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                  }}>
                    {activeWork.status === 'premiere_ready' ? 'Opening Night →' : nextStage.action}
                  </button>
                ) : (
                  <span style={{ fontSize: '11px', padding: '5px 14px', borderRadius: '999px',
                    background: '#06b6d415', color: '#06b6d4', border: '1px solid #06b6d430' }}
                  >In Archive</span>
                )}
              </div>

              {/* Lifecycle strip */}
              <div className="flex items-center gap-0 mb-10" style={{ overflowX: 'auto' }}>
                {LIFECYCLE.map((stage, i) => {
                  const past    = i < activeIdx
                  const current = i === activeIdx
                  const color   = STATUS_COLORS[stage.id]
                  return (
                    <div key={stage.id} className="flex items-center">
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: current ? color : past ? 'var(--border-2)' : 'var(--border-0)',
                          border: current ? `2px solid ${color}` : '2px solid transparent',
                          margin: '0 auto 4px',
                        }} />
                        <p style={{
                          fontSize: '8px', letterSpacing: '0.08em', textTransform: 'uppercase',
                          color: current ? color : past ? 'var(--text-4)' : 'var(--text-6)',
                          whiteSpace: 'nowrap',
                        }}>{stage.label}</p>
                      </div>
                      {i < LIFECYCLE.length - 1 && (
                        <div style={{
                          width: '32px', height: '1px', flexShrink: 0, margin: '-10px 4px 0',
                          background: past ? 'var(--border-2)' : 'var(--border-0)',
                        }} />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Studio notes */}
              <div style={{ flex: 1 }}>
                <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
                  textTransform: 'uppercase', marginBottom: '12px' }}
                >Studio Notes</p>
                <textarea
                  value={activeWork.notes}
                  onChange={e => updateNotes(activeWork.id, e.target.value)}
                  placeholder="What's taking shape here?"
                  className="w-full resize-none outline-none"
                  style={{
                    background: 'transparent', border: 'none',
                    color: 'var(--text-1)', fontSize: '15px',
                    lineHeight: 1.85, minHeight: '260px', width: '100%',
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center px-10">
              <div style={{ maxWidth: '340px', textAlign: 'center' }}>
                <div style={{ fontSize: '44px', marginBottom: '22px', opacity: 0.18 }}>🎭</div>
                <p style={{ fontSize: '19px', color: 'var(--text-3)', fontWeight: 500,
                  letterSpacing: '-0.015em', marginBottom: '10px' }}
                >The stage is ready.</p>
                <p style={{ fontSize: '13px', color: 'var(--text-5)', lineHeight: 1.7 }}>
                  Select a work from the right wing<br />or press + to begin something new.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT WING — works in progress, increasingly organized */}
        <div className="flex flex-col shrink-0 overflow-y-auto py-5 px-3"
          style={{ width: '250px', background: 'var(--bg-0)' }}
        >
          <div className="flex items-center justify-between mb-4 px-2">
            <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
              textTransform: 'uppercase', fontWeight: 600 }}
            >Works in Progress</p>
            <button onClick={() => setAdding(v => !v)} style={{
              background: 'none', border: 'none', color: 'var(--text-3)',
              cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: 0,
            }}>+</button>
          </div>

          {adding && (
            <div className="mb-5 px-1">
              <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-1)',
                borderRadius: '8px', padding: '12px' }}
              >
                <input value={draft.title}
                  onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
                  placeholder="Title"
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') addWork(); if (e.key === 'Escape') setAdding(false) }}
                  style={{ width: '100%', background: 'transparent', border: 'none',
                    borderBottom: '1px solid var(--border-1)', color: 'var(--text-0)',
                    fontSize: '13px', paddingBottom: '6px', marginBottom: '10px', outline: 'none' }}
                />
                <select value={draft.category}
                  onChange={e => setDraft(d => ({ ...d, category: e.target.value }))}
                  style={{ width: '100%', background: 'var(--bg-1)', border: '1px solid var(--border-1)',
                    borderRadius: '4px', color: 'var(--text-1)', padding: '5px 6px',
                    fontSize: '11px', marginBottom: '10px', outline: 'none' }}
                >
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                  ))}
                </select>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={addWork} style={{
                    flex: 1, fontSize: '11px', padding: '6px', borderRadius: '5px',
                    background: '#1d4ed8', color: '#e0eaff', border: 'none', cursor: 'pointer',
                  }}>Add</button>
                  <button onClick={() => setAdding(false)} style={{
                    flex: 1, fontSize: '11px', padding: '6px', borderRadius: '5px',
                    background: 'var(--bg-3)', color: 'var(--text-2)',
                    border: '1px solid var(--border-1)', cursor: 'pointer',
                  }}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {CATEGORIES.map(cat => {
            const catWorks = works.filter(w => w.category === cat.id)
            if (catWorks.length === 0) return null
            return (
              <div key={cat.id} style={{ marginBottom: '18px' }}>
                <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.12em',
                  textTransform: 'uppercase', padding: '0 8px', marginBottom: '6px' }}
                >{cat.icon} {cat.label}</p>
                <div className="flex flex-col gap-0.5">
                  {catWorks.map(w => {
                    const glyph = STATUS_GLYPHS[w.status] || ''
                    const color = STATUS_COLORS[w.status] || 'var(--text-2)'
                    const isActive = activeWork?.id === w.id
                    return (
                      <button key={w.id} onClick={() => setActiveWork(w)}
                        style={{
                          textAlign: 'left', borderRadius: '6px', padding: '7px 10px',
                          fontSize: '12px', transition: 'all 0.15s', cursor: 'pointer',
                          background: isActive ? 'var(--bg-3)' : 'transparent',
                          border: `1px solid ${isActive ? 'var(--border-1)' : 'transparent'}`,
                          color: (w.status === 'shaping' || w.status === 'structured')
                            ? (isActive ? 'var(--text-0)' : 'var(--text-2)')
                            : color,
                        }}
                      >{glyph}{w.title}</button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {works.length === 0 && !adding && (
            <p style={{ color: 'var(--text-6)', fontSize: '11px', padding: '0 8px', lineHeight: 1.7 }}>
              Nothing in progress yet.<br />Press + to begin.
            </p>
          )}
        </div>
      </div>

      {/* BACK WALL — constellations Muse noticed */}
      <div className="shrink-0" style={{
        borderTop: '1px solid var(--border-0)',
        background: 'var(--bg-0)',
        padding: '12px 28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '10px' }}>
          <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.15em',
            textTransform: 'uppercase' }}
          >Constellations Muse noticed</p>
          {onSurface && (
            <p style={{ color: 'var(--text-6)', fontSize: '9px', fontStyle: 'italic' }}>
              — surface one to send it back to Atrium
            </p>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 28px' }}>
          {CONSTELLATIONS.map((c, i) => {
            const key    = `${c.a}↔${c.b}`
            const done   = surfaced.has(key)
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span style={{ color: done ? 'var(--text-5)' : 'var(--text-2)', fontSize: '11px' }}>{c.a}</span>
                <span style={{ color: 'var(--text-6)', fontSize: '11px' }}>⟷</span>
                <span style={{ color: done ? 'var(--text-5)' : 'var(--text-2)', fontSize: '11px' }}>{c.b}</span>
                <span style={{ color: 'var(--text-6)', fontSize: '9px', fontStyle: 'italic' }}>{c.note}</span>
                {onSurface && (
                  done ? (
                    <span style={{ fontSize: '9px', color: '#10b981' }}>↗ surfaced</span>
                  ) : (
                    <button onClick={() => {
                      onSurface({
                        text: `Connection noticed: ${c.a} ↔ ${c.b} — ${c.note}.`,
                        type: 'text',
                        constellation: null,
                        source: 'Muse Back Wall',
                      })
                      setSurfaced(prev => new Set([...prev, key]))
                    }} style={{
                      fontSize: '9px', padding: '1px 7px', borderRadius: '4px',
                      background: 'transparent', border: '1px solid var(--border-1)',
                      color: 'var(--text-4)', cursor: 'pointer',
                    }}>↗ surface</button>
                  )
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* BOTTOM — discovery, not project management */}
      <div className="shrink-0" style={{
        borderTop: '1px solid var(--border-0)',
        padding: '14px 28px',
      }}>
        <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic',
          letterSpacing: '0.02em' }}
        >What wants to be made next?</p>
      </div>
    </div>
  )
}
