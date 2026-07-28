import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

export async function uploadContractFile(file, uid, contractId) {
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error(`File exceeds 10 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB)`)
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const path = `contracts/${uid}/${contractId}.${ext}`
  const storageRef = ref(storage, path)

  const uploadPromise = uploadBytes(storageRef, file).then(() => getDownloadURL(storageRef))
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Upload timed out')), 60000)
  )

  return Promise.race([uploadPromise, timeoutPromise])
}
