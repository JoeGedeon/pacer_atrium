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
