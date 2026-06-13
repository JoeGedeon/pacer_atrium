import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

export function getSupportedAudioMimeType() {
  if (typeof MediaRecorder === 'undefined') return ''
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ]
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type
  }
  return ''
}

export async function uploadVoiceSeed(audioBlob, uid) {
  const ext = (audioBlob.type || '').includes('mp4') ? 'mp4' : 'webm'
  const path = `voice_seeds/${uid}/${Date.now()}.${ext}`

  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('upload-timeout')), 30000)
  )
  const upload = uploadBytes(
    ref(storage, path),
    audioBlob,
    { contentType: audioBlob.type || 'audio/webm' }
  ).then(snap => getDownloadURL(snap.ref))

  return Promise.race([upload, timeout])
}
