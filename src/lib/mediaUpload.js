import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

async function uploadToStorage(file, path, timeoutMs = 90000) {
  console.log('[mediaUpload] START', {
    name: file.name, type: file.type, size: file.size, path,
  })
  try {
    const storageRef = ref(storage, path)
    const snap = await Promise.race([
      uploadBytes(storageRef, file),
      new Promise((_, reject) => setTimeout(() => reject(new Error('upload-timeout')), timeoutMs)),
    ])
    console.log('[mediaUpload] uploadBytes OK', { path: snap.ref.fullPath })
    const url = await getDownloadURL(snap.ref)
    console.log('[mediaUpload] getDownloadURL OK', { url: url.slice(0, 80) + '…' })
    return url
  } catch (err) {
    console.error('[mediaUpload] FAILED', {
      code:    err?.code,
      message: err?.message,
      name:    err?.name,
      path,
      fileType: file.type,
      fileSize: file.size,
    })
    throw err
  }
}

export async function uploadMediaVideo(file, uid) {
  console.log('[mediaUpload] uploadMediaVideo called — uid:', uid, '— file:', file?.name, file?.type, file?.size)
  if (!uid) throw new Error('storage/unauthenticated: No uid available for upload path')
  const ext = file.name.split('.').pop().toLowerCase()
  return uploadToStorage(file, `media/${uid}/video/${Date.now()}.${ext}`, 120000)
}

export async function uploadMediaAudio(file, uid) {
  console.log('[mediaUpload] uploadMediaAudio called — uid:', uid, '— file:', file?.name, file?.type, file?.size)
  if (!uid) throw new Error('storage/unauthenticated: No uid available for upload path')
  const ext = file.name.split('.').pop().toLowerCase()
  return uploadToStorage(file, `media/${uid}/audio/${Date.now()}.${ext}`, 60000)
}
