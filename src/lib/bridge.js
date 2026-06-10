import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

export async function sendToPACER(observation, uid) {
  const ref = await addDoc(collection(db, 'pacer_intake'), {
    source: 'PACER_ATRIUM',
    type: 'creative_observation',
    mode: observation.type,
    text: observation.text,
    constellation: observation.constellation || null,
    destination: observation.destination || null,
    status: 'pending_review',
    createdAt: serverTimestamp(),
    createdBy: uid,
  })
  return ref.id
}
