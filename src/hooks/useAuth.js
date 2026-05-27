// src/hooks/useAuth.js
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, auth, profiles } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Joriy sessiyani tekshirish
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else setLoading(false)
    })

    // Auth o'zgarishlarini kuzatish
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) await loadProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId) => {
    try {
      const data = await profiles.get(userId)
      setProfile(data)
    } catch (e) {
      console.error('Profile yuklashda xato:', e)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (data) => {
    const result = await auth.signUp(data)
    return result
  }

  const signIn = async (data) => {
    const result = await auth.signIn(data)
    return result
  }

  const signOut = async () => {
    await auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const updateProfile = async (updates) => {
    if (!user) return
    const updated = await profiles.update(user.id, updates)
    setProfile(updated)
    return updated
  }

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      signUp, signIn, signOut, updateProfile,
      refreshProfile: () => user && loadProfile(user.id)
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
