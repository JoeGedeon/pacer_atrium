import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

export async function uploadObservationImage(file, uid) {
  const ext = file.name.split('.').pop().toLowerCase()
  const path = `images/${uid}/${Date.now()}.${ext}`
  const snapshot = await uploadBytes(ref(storage, path), file)
  return getDownloadURL(snapshot.ref)
}
