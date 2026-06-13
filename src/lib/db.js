import {
  collection, addDoc, updateDoc, doc, getDoc, setDoc,
  onSnapshot, query, orderBy,
  serverTimestamp, Timestamp, increment,
} from 'firebase/firestore'
import { db } from './firebase'

// ── Campus Stats — creator-only counters for beta observation ─────────────────
// Firestore rule required: authenticated users may write; creator UID may read.

const STATS_DOC = doc(db, 'campus_stats', 'summary')

export async function incrementCampusStat(field) {
  try {
    await setDoc(STATS_DOC, { [field]: increment(1) }, { merge: true })
  } catch (err) {
    // Silent failure — but log so Firestore rule issues are diagnosable.
    // If you see PERMISSION_DENIED here, deploy firestore.rules via Firebase Console.
    console.warn('[campus_stats] increment failed:', err?.code || err)
  }
}

export function listenCampusStats(callback) {
  return onSnapshot(
    STATS_DOC,
    snap => callback(snap.exists() ? snap.data() : { visitors: 0, returns: 0, observations: 0 }),
    () => callback({ visitors: 0, returns: 0, observations: 0 }),
  )
}

// ── Morning Brief ─────────────────────────────────────────────────────────────
// One document per user. All devices read the same brief until it expires.

const BRIEF_DOC = (uid) => doc(db, 'users', uid, 'briefs', 'latest')

export async function getLatestBrief(uid) {
  const snap = await getDoc(BRIEF_DOC(uid))
  return snap.exists() ? snap.data() : null
}

export async function saveLatestBrief(uid, { text, calendarIncluded, emailIncluded }) {
  await setDoc(BRIEF_DOC(uid), {
    text,
    generatedAt: new Date().toISOString(),
    calendarIncluded: !!calendarIncluded,
    emailIncluded: !!emailIncluded,
    version: 'v3', // v3: directive leadership prompt — priorities and next actions, not status reporting
  })
}

// ── User Profile ─────────────────────────────────────────────────────────────

const PROFILE_DOC = (uid) => doc(db, 'users', uid, 'profile', 'campus')

export async function getUserProfile(uid) {
  const snap = await getDoc(PROFILE_DOC(uid))
  return snap.exists() ? snap.data() : null
}

export async function createUserProfile(uid, data) {
  await setDoc(PROFILE_DOC(uid), {
    campusId:          data.campusId,
    campusName:        data.campusName        || null,
    outcomeChoice:     data.outcomeChoice     || null,
    bypass:            data.bypass            || false,
    arrivalMode:       data.arrivalMode       || 'silent',
    hasSeenOnboarding: data.bypass ? true : false, // creator skips onboarding
    createdAt:         serverTimestamp(),
  })
}

export async function updateUserProfile(uid, patch) {
  await updateDoc(PROFILE_DOC(uid), patch)
}

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

// ── Creator Logs — timestamped logbook entries ────────────────────────────────

function logColl(uid) { return collection(db, 'users', uid, 'creator_logs') }

export async function createCreatorLog(uid, data) {
  await addDoc(logColl(uid), {
    date:       data.date,
    type:       data.type,
    title:      data.title,
    body:       data.body       || '',
    linkedRoom: data.linkedRoom || null,
    createdAt:  serverTimestamp(),
    createdBy:  uid,
  })
}

export function listenCreatorLogs(uid, callback) {
  const q = query(logColl(uid), orderBy('createdAt', 'asc'))
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

// ── Productions — Theater production management records ──────────────────────

function prodColl(uid) { return collection(db, 'users', uid, 'productions') }

export async function createProduction(uid, data) {
  const ref = await addDoc(prodColl(uid), {
    title:               data.title               || 'Untitled Production',
    sourceObservationId: data.sourceObservationId || null,
    sourceText:          data.sourceText          || '',
    sourceConstellation: data.sourceConstellation || null,
    manifestDecision:    data.manifestDecision    || null,
    status:              data.status              || 'incoming',
    studio:              data.studio              || null,
    deliveryDestination: data.deliveryDestination || null,
    humanGateStatus:     data.humanGateStatus     || null,
    outputs:             {},
    notes:               data.notes              || '',
    createdAt:           serverTimestamp(),
    updatedAt:           serverTimestamp(),
  })
  return ref.id
}

export function listenProductions(uid, callback) {
  const q = query(prodColl(uid), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => {
      const data = d.data()
      return {
        ...data,
        id: d.id,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
        updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
      }
    }))
  })
}

export async function updateProduction(uid, id, patch) {
  await updateDoc(doc(db, 'users', uid, 'productions', id), {
    ...patch,
    updatedAt: serverTimestamp(),
  })
}

// ── Multi-Manifest Tests — constitutional preservation tests ──────────────────

export async function createMultiManifestTest(uid, data) {
  const ref = await addDoc(
    collection(db, 'users', uid, 'multi_manifest_tests'),
    {
      observationText: data.observationText,
      results:         data.results,
      preservedCount:  data.preservedCount,
      totalCount:      data.totalCount,
      createdAt:       serverTimestamp(),
    }
  )
  await createInstitutionEvent(uid, {
    eventType:       'multi_manifest_test_completed',
    title:           'Multi-Manifest Test Completed',
    description:     `${data.preservedCount}/${data.totalCount} formats preserved cargo integrity. Constitutional Principle #2 tested.`,
    relatedEntityId: ref.id,
  })
  return ref.id
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
    graduateName:       data.graduateName,
    discipline:         data.discipline,
    sequence:           data.sequence,
    tagline:            data.tagline            || null,
    proof:              data.proof              || null,
    productionTitle:    data.productionTitle    || null,
    evaluationStatus:   data.evaluationStatus   || 'in_development',
    transmissionStatus: data.transmissionStatus || 'pending',
    graduatedAt:        serverTimestamp(),
  })
  await createInstitutionEvent(uid, {
    eventType:       'graduate_added',
    title:           `${data.graduateName} added to Graduate Registry`,
    description:     'A new graduate has earned a plaque.',
    actor:           uid,
    relatedEntityId: ref.id,
  })
  return ref.id
}
