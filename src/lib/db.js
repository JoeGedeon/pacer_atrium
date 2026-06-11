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

export function listenKELDecisions(uid, callback) {
  const q = query(
    collection(db, 'users', uid, 'kel_decisions'),
    orderBy('decidedAt', 'desc')
  )
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => {
      const data = d.data()
      return {
        ...data,
        id: d.id,
        decidedAt: data.decidedAt?.toDate?.() ?? new Date(),
      }
    }))
  })
}

// ── KEL Review Ledger — institutional review records, not observation decisions ─

function kelReviewColl(uid) { return collection(db, 'users', uid, 'kel_reviews') }

export async function createKELReview(uid, data) {
  const ref = await addDoc(kelReviewColl(uid), {
    requestType: data.requestType,
    status:      'pending',
    residentId:  uid,
    rationale:   null,
    reviewedBy:  null,
    reviewedAt:  null,
    createdAt:   serverTimestamp(),
  })
  return ref.id
}

export function listenKELReviews(uid, callback) {
  const q = query(kelReviewColl(uid), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => {
      const data = d.data()
      return {
        ...data,
        id: d.id,
        createdAt:  data.createdAt?.toDate?.()  ?? new Date(),
        reviewedAt: data.reviewedAt?.toDate?.() ?? null,
      }
    }))
  })
}

export async function updateKELReview(uid, id, patch) {
  await updateDoc(doc(db, 'users', uid, 'kel_reviews', id), {
    ...patch,
    reviewedAt: serverTimestamp(),
  })
}

// ── Institution Events — witnesses to governance decisions ────────────────────

function eventColl(uid) { return collection(db, 'users', uid, 'institution_events') }

export async function createInstitutionEvent(uid, data) {
  await addDoc(eventColl(uid), {
    eventType:       data.eventType,
    title:           data.title,
    description:     data.description     || null,
    actor:           data.actor           || uid,
    relatedEntityId: data.relatedEntityId || null,
    createdAt:       serverTimestamp(),
  })
}

export function listenInstitutionEvents(uid, callback) {
  const q = query(eventColl(uid), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => {
      const data = d.data()
      return { ...data, id: d.id, createdAt: data.createdAt?.toDate?.() ?? new Date() }
    }))
  })
}

// ── Graduate Registry — written only by Builder Studio, read everywhere ────────

function gradColl(uid) { return collection(db, 'users', uid, 'graduates') }

export function listenGraduates(uid, callback) {
  const q = query(gradColl(uid), orderBy('sequence', 'asc'))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => {
      const data = d.data()
      return {
        ...data,
        id: d.id,
        graduatedAt: data.graduatedAt?.toDate?.() ?? null,
      }
    }))
  })
}

export async function createGraduate(uid, data) {
  const ref = await addDoc(gradColl(uid), {
    graduateName:      data.graduateName,
    discipline:        data.discipline,
    sequence:          data.sequence,
    tagline:           data.tagline        || null,
    proof:             data.proof          || null,
    productionTitle:   data.productionTitle || null,
    evaluationStatus:  data.evaluationStatus  || 'in_development',
    transmissionStatus: data.transmissionStatus || 'pending',
    graduatedAt:       serverTimestamp(),
  })
  return ref.id
}
