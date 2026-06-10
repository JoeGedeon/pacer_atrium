import { useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
} from 'firebase/auth'
import { auth } from '../lib/firebase'

export function useAuth() {
  const [user, setUser]       = useState(undefined) // undefined = still loading
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u || null)
      setLoading(false)
    })
    return unsub
  }, [])

  async function signIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  async function signUp(email, password) {
    return createUserWithEmailAndPassword(auth, email, password)
  }

  async function signOut() {
    return fbSignOut(auth)
  }

  return { user, loading, signIn, signUp, signOut }
}
