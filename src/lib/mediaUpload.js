import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

async function uploadToStorage(file, path, timeoutMs = 90000) {
  return Promise.race([
    uploadBytes(ref(storage, path), file).then(snap => getDownloadURL(snap.ref)),
    new Promise((_, reject) => setTimeout(() => reject(new Error('upload-timeout')), timeoutMs)),
  ])
}

export async function uploadMediaVideo(file, uid) {
  const ext = file.name.split('.').pop().toLowerCase()
  return uploadToStorage(file, `media/${uid}/video/${Date.now()}.${ext}`, 120000)
}

export async function uploadMediaAudio(file, uid) {
  const ext = file.name.split('.').pop().toLowerCase()
  return uploadToStorage(file, `media/${uid}/audio/${Date.now()}.${ext}`, 60000)
}
