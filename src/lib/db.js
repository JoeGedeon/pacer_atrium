import {
  collection, addDoc, updateDoc, doc,
  onSnapshot, query, orderBy,
  serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

// ── Collections ──────────────────────────────────────────────────────────────

function obsColl(uid)  { return collection(db, 'users', uid, 'observations') }
function museColl(uid) { return collection(db, 'users', uid, 'muse_works') }

// ── Observations ─────────────────────────────────────────────────────────────

export function listenObservations(uid, callback) {
  const q = query(obsColl(uid), orderBy('timestamp', 'desc'))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => {
      const data = d.data()
      return {
        ...data,
        id: d.id,
        timestamp: data.timestamp?.toDate?.() ?? new Date(),
      }
    }))
  })
}

export async function createObservation(uid, data) {
  const { id: _, analyzing: __, timestamp, ...rest } = data
  const ref = await addDoc(obsColl(uid), {
    ...rest,
    timestamp: timestamp instanceof Date
      ? Timestamp.fromDate(timestamp)
      : serverTimestamp(),
  })
  return ref.id
}

export async function updateObservation(uid, id, patch) {
  const { id: _, analyzing: __, timestamp: ___, ...safe } = patch
  await updateDoc(doc(db, 'users', uid, 'observations', id), safe)
}

// ── Muse Works ────────────────────────────────────────────────────────────────

export function listenMuseWorks(uid, callback) {
  const q = query(museColl(uid), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => {
      const data = d.data()
      return {
        ...data,
        id: d.id,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
      }
    }))
  })
}

export async function createMuseWork(uid, data) {
  const ref = await addDoc(museColl(uid), {
    title:    data.title,
    category: data.category,
    notes:    data.notes || '',
    status:   data.status || 'shaping',
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateMuseWork(uid, id, patch) {
  await updateDoc(doc(db, 'users', uid, 'muse_works', id), patch)
}

// ── KEL Decisions — written by App, never by KEL ─────────────────────────────

export async function createKELDecision(uid, data) {
  await addDoc(collection(db, 'users', uid, 'kel_decisions'), {
    recommendation: data.recommendation,
    reasoning:      data.reasoning,
    domain:         data.domain,
    confidence:     data.confidence ?? null,
    cited:          data.cited      ?? [],
    decision:       data.decision,
    decidedAt:      serverTimestamp(),
  })
}
