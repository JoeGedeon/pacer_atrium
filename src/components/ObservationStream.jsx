import { useState, useRef } from 'react'
import ObservationCard from './ObservationCard'
import { uploadObservationImage } from '../lib/imageUpload'

const OBS_TYPES = [
  { id: 'text',  label: 'Text',  icon: '✍️' },
  { id: 'voice', label: 'Voice', icon: '🎤' },
  { id: 'image', label: 'Image', icon: '📸' },
]

export default function ObservationStream({
  observations, onSubmit, activeObservation, onSelectObservation, uid, isMobile,
}) {
  const [text, setText]               = useState('')
  const [type, setType]               = useState('text')
  const [constellation, setConstellation] = useState('')
  const [activeConstellation, setActiveConstellation] = useState(null)
  const [imageFile, setImageFile]     = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading]     = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const fileInputRef = useRef(null)

  const constellations = [...new Set(
    observations.filter(o => o.constellation).map(o => o.constellation)
  )]

  const displayed = activeConstellation
    ? observations.filter(o => o.constellation === activeConstellation)
    : observations

  function handleTypeChange(newType) {
    setType(newType)
    setImageFile(null)
    setImagePreview(null)
    setUploadError(null)
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file.')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setUploadError('Image must be under 20 MB.')
      return
    }
    setImageFile(file)
    setUploadError(null)
    const reader = new FileReader()
    reader.onload = e => setImagePreview(e.target.result)
    reader.readAsDataURL(file)
  }

  function clearImage() {
    setImageFile(null)
    setImagePreview(null)
    setUploadError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (type === 'image') {
      if (!imageFile) return
      setUploading(true)
      setUploadError(null)
      try {
        const storageUrl = await uploadObservationImage(imageFile, uid)
        onSubmit({
          text: text.trim() || imageFile.name,
          type: 'image',
          storageUrl,
          constellation: constellation.trim() || null,
        })
        setText('')
        setConstellation('')
        clearImage()
      } catch (err) {
        setUploadError('Upload failed. Check your connection and try again.')
      } finally {
        setUploading(false)
      }
    } else {
      if (!text.trim()) return
      onSubmit({ text: text.trim(), type, constellation: constellation.trim() || null })
      setText('')
      setConstellation('')
    }
  }

  const canSubmit = type === 'image' ? (!!imageFile && !uploading) : !!text.trim()

  const inputPx = isMobile ? 'px-4' : 'px-10'

  return (
    <main className="flex flex-col flex-1 min-w-0" style={{ background: 'var(--bg-0)' }}>
      <div className={`${inputPx} pt-8 pb-6 border-b shrink-0`} style={{ borderColor: 'var(--border-1)' }}>
        <p className="text-xs mb-4" style={{ color: 'var(--text-2)' }}>What have you noticed?</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {OBS_TYPES.map(t => (
            <button key={t.id} onClick={() => handleTypeChange(t.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: type === t.id ? '#1e3a5f' : 'var(--bg-2)',
                color:      type === t.id ? '#93c5fd' : 'var(--text-2)',
                border:    `1px solid ${type === t.id ? '#1d4ed8' : 'var(--border-2)'}`,
              }}
            >
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {type === 'image' ? (
            <div style={{ marginBottom: '12px' }}>
              {imagePreview ? (
                <div style={{ position: 'relative', marginBottom: '10px' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: '100%', maxHeight: '200px', objectFit: 'cover',
                      borderRadius: '8px', border: '1px solid var(--border-2)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    style={{
                      position: 'absolute', top: '8px', right: '8px',
                      background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                      color: '#fff', width: '24px', height: '24px', cursor: 'pointer',
                      fontSize: '12px', lineHeight: 1, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >×</button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-lg text-sm transition-all"
                  style={{
                    background: 'var(--bg-input)', border: '2px dashed var(--border-2)',
                    color: 'var(--text-4)', cursor: 'pointer', padding: '32px 16px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>📸</div>
                  <p style={{ fontSize: '12px' }}>Tap to select a photo</p>
                  <p style={{ fontSize: '10px', marginTop: '4px', color: 'var(--text-6)' }}>
                    JPG, PNG, GIF, WebP · max 20 MB
                  </p>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Caption (optional)"
                rows={2}
                className="w-full resize-none rounded-lg px-4 py-3 text-sm outline-none"
                style={{
                  background: 'var(--bg-input)', color: 'var(--text-0)',
                  border: '1px solid var(--border-2)', lineHeight: '1.65',
                  marginTop: imagePreview ? '8px' : 0,
                  display: imagePreview ? 'block' : 'none',
                }}
              />
            </div>
          ) : (
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Enter your observation..."
              rows={4}
              className="w-full resize-none rounded-lg px-4 py-3 text-sm outline-none transition-colors"
              style={{
                background: 'var(--bg-input)', color: 'var(--text-0)',
                border: '1px solid var(--border-2)', lineHeight: '1.65',
                marginBottom: '12px',
              }}
              onFocus={e  => { e.target.style.borderColor = '#2563eb' }}
              onBlur={e   => { e.target.style.borderColor = 'var(--border-2)' }}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e) }}
            />
          )}

          {uploadError && (
            <p style={{ color: '#ef4444', fontSize: '11px', marginBottom: '8px' }}>{uploadError}</p>
          )}

          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              list="constellation-list"
              value={constellation}
              onChange={e => setConstellation(e.target.value)}
              placeholder="Constellation (optional)"
              className="w-full rounded-lg px-3 py-2 text-xs outline-none"
              style={{
                background: 'var(--bg-1)', color: 'var(--text-1)',
                border: '1px solid var(--border-1)',
              }}
              onFocus={e => { e.target.style.borderColor = '#6b4e1a' }}
              onBlur={e  => { e.target.style.borderColor = 'var(--border-1)' }}
            />
            <datalist id="constellation-list">
              {constellations.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: 'var(--text-5)' }}>
              {type !== 'image' && '⌘↵ to submit'}
            </span>
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: canSubmit ? '#1d4ed8' : 'var(--bg-2)',
                color:      canSubmit ? '#e0eaff'  : 'var(--text-5)',
                border:    `1px solid ${canSubmit ? '#2563eb' : 'var(--border-2)'}`,
                cursor:     canSubmit ? 'pointer' : 'not-allowed',
              }}
            >
              {uploading ? 'Uploading…' : 'Receive Observation'}
            </button>
          </div>
        </form>
      </div>

      <div className={`flex-1 overflow-y-auto ${inputPx} py-5`}>
        {constellations.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <button onClick={() => setActiveConstellation(null)}
              className="text-xs px-2.5 py-1 rounded-full"
              style={{
                background: !activeConstellation ? 'var(--bg-3)' : 'transparent',
                color:      !activeConstellation ? 'var(--text-1)' : 'var(--text-3)',
                border:     '1px solid var(--border-1)',
              }}
            >All</button>
            {constellations.map(c => (
              <button key={c} onClick={() => setActiveConstellation(activeConstellation === c ? null : c)}
                className="text-xs px-2.5 py-1 rounded-full"
                style={{
                  background: activeConstellation === c ? '#1e1208' : 'transparent',
                  color:      activeConstellation === c ? '#a07830' : 'var(--text-3)',
                  border:    `1px solid ${activeConstellation === c ? '#4a2e0a' : 'var(--border-1)'}`,
                }}
              >{c}</button>
            ))}
          </div>
        )}

        {displayed.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-xs" style={{ color: 'var(--text-6)' }}>
              {activeConstellation ? `No observations in ${activeConstellation}.` : 'The stream is empty.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {displayed.map(obs => (
              <ObservationCard
                key={obs.id}
                observation={obs}
                isActive={activeObservation?.id === obs.id}
                onClick={() => onSelectObservation(obs)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
