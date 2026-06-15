import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

export async function uploadObservationImage(file, uid) {
  const ext = file.name.split('.').pop().toLowerCase()
  const path = `images/${uid}/${Date.now()}.${ext}`

  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('upload-timeout')), 30000)
  )

  const upload = uploadBytes(ref(storage, path), file).then(snap => getDownloadURL(snap.ref))

  return Promise.race([upload, timeout])
}

// Fetch a DALL-E temporary URL and upload the image to Firebase Storage,
// returning a permanent download URL. Timeout after 60s to handle slow CDN responses.
export async function uploadStudioArtifactImage(dallEUrl, uid) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('upload-timeout')), 60000)
  )

  const upload = (async () => {
    const res = await fetch(dallEUrl)
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`)
    const blob = await res.blob()
    const path = `studio_artifacts/${uid}/${Date.now()}.png`
    const snap = await uploadBytes(ref(storage, path), blob, { contentType: 'image/png' })
    return getDownloadURL(snap.ref)
  })()

  return Promise.race([upload, timeout])
}
