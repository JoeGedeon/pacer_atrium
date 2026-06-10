import { useState, useEffect } from 'react'

const CATEGORIES = [
  { id: 'music',         label: 'Music',         icon: '🎵' },
  { id: 'visual',        label: 'Visual Art',     icon: '🎨' },
  { id: 'lore',          label: 'Lore',           icon: '📖' },
  { id: 'worldbuilding', label: 'Worldbuilding',  icon: '🌎' },
  { id: 'characters',    label: 'Characters',     icon: '🎭' },
  { id: 'productions',   label: 'Productions',    icon: '🎬' },
]

const CONSTELLATIONS = [
  { a: 'Yanu',              b: 'Aiziano',   note: 'origin' },
  { a: 'FleetFlow',         b: 'Isles',     note: 'movement as narrative' },
  { a: 'PACER',             b: 'Doctrine',  note: 'intelligence requires governance' },
  { a: 'Blue Pineapple',    b: 'Atrium',    note: 'brand as entry point' },
  { a: 'Crossing the Bridge', b: 'Theater', note: 'story finds its stage' },
]

function loadWorks() {
  try {
    return JSON.parse(localStorage.getItem('muse_works') || '[]').map(w => ({
      ...w,
      createdAt: new Date(w.createdAt),
    }))
  } catch { return [] }
}

function tilt(seed, i) {
  return ((( seed + i) % 7) - 3) * 0.55
}

export default function MuseRoom({ observations = [] }) {
  const [works, setWorks]           = useState(loadWorks)
  const [activeWork, setActiveWork] = useState(null)
  const [draft, setDraft]           = useState({ title: '', category: 'characters', notes: '' })
  const [adding, setAdding]         = useState(false)

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
      notes: draft.notes.trim(),
      premiered: false,
      createdAt: new Date(),
    }
    setWorks(prev => [w, ...prev])
    setActiveWork(w)
    setDraft({ title: '', category: 'characters', notes: '' })
    setAdding(false)
  }

  function updateNotes(id, notes) {
    setWorks(prev => prev.map(w => w.id === id ? { ...w, notes } : w))
  }

  function premiere(id) {
    setWorks(prev => prev.map(w => w.id === id ? { ...w, premiered: true } : w))
  }

  const signals   = observations.slice(0, 14)
  const activeCat = CATEGORIES.find(c => c.id === activeWork?.category)

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-0)' }}>

      {/* ── Three panels ─────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT WING — arriving signals, intentionally messy */}
        <div className="flex flex-col shrink-0 overflow-y-auto py-5 px-3"
          style={{ width: '210px', background: 'var(--bg-0)', borderRight: '1px solid var(--border-0)' }}
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
            <p className="text-xs px-2" style={{ color: 'var(--text-6)', lineHeight: '1.6' }}>
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
                  <p style={{ color: 'var(--text-2)', fontSize: '11px', lineHeight: '1.5' }}>
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
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p style={{ color: 'var(--text-5)', fontSize: '9px', letterSpacing: '0.15em',
                    textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}
                  >{activeCat?.icon} {activeCat?.label}</p>
                  <h2 style={{ fontSize: '32px', color: 'var(--text-0)', fontWeight: 700,
                    letterSpacing: '-0.025em', lineHeight: 1.15 }}
                  >{activeWork.title}</h2>
                </div>
                {activeWork.premiered ? (
                  <span style={{ fontSize: '11px', padding: '5px 14px', borderRadius: '999px',
                    background: '#10b98112', color: '#10b981', border: '1px solid #10b98128' }}
                  >Premiered</span>
                ) : (
                  <button onClick={() => premiere(activeWork.id)} style={{
                    fontSize: '12px', padding: '7px 18px', borderRadius: '8px', fontWeight: 500,
                    background: '#1d4ed8', color: '#e0eaff', border: 'none', cursor: 'pointer',
                  }}>Opening Night →</button>
                )}
              </div>

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
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-1)',
                    fontSize: '15px',
                    lineHeight: '1.85',
                    minHeight: '280px',
                    width: '100%',
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
                  {catWorks.map(w => (
                    <button key={w.id} onClick={() => setActiveWork(w)}
                      style={{
                        textAlign: 'left', borderRadius: '6px', padding: '7px 10px',
                        fontSize: '12px', transition: 'all 0.15s',
                        background: activeWork?.id === w.id ? 'var(--bg-3)' : 'transparent',
                        border: `1px solid ${activeWork?.id === w.id ? 'var(--border-1)' : 'transparent'}`,
                        color: w.premiered ? '#10b981' : activeWork?.id === w.id ? 'var(--text-0)' : 'var(--text-2)',
                        cursor: 'pointer',
                      }}
                    >{w.premiered ? '✦ ' : ''}{w.title}</button>
                  ))}
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
        <p style={{ color: 'var(--text-6)', fontSize: '9px', letterSpacing: '0.15em',
          textTransform: 'uppercase', marginBottom: '10px' }}
        >Constellations Muse noticed</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 32px' }}>
          {CONSTELLATIONS.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span style={{ color: 'var(--text-2)', fontSize: '11px' }}>{c.a}</span>
              <span style={{ color: 'var(--text-5)', fontSize: '11px' }}>⟷</span>
              <span style={{ color: 'var(--text-2)', fontSize: '11px' }}>{c.b}</span>
              <span style={{ color: 'var(--text-6)', fontSize: '9px', fontStyle: 'italic' }}>{c.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM — discovery, not project management */}
      <div className="shrink-0" style={{
        borderTop: '1px solid var(--border-0)',
        padding: '14px 28px',
        background: 'var(--bg-0)',
      }}>
        <p style={{ color: 'var(--text-5)', fontSize: '12px', fontStyle: 'italic',
          letterSpacing: '0.02em' }}
        >What wants to be made next?</p>
      </div>
    </div>
  )
}
