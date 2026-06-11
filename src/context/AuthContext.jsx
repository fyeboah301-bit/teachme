import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
  }

 const signUp = async (email, password, userData) => {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error

  if (data.user) {
    // Wait a moment for auth to settle
    await new Promise(resolve => setTimeout(resolve, 1000))

    const referralCode = 'TM' + data.user.id.slice(0, 6).toUpperCase()
    const referredBy = localStorage.getItem('teachme_referral')

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      email,
      role: userData.role,
      full_name: userData.full_name,
      phone: userData.phone,
      country: userData.country,
      city: userData.city,
      referral_code: referralCode,
      referred_by: referredBy || null
    })
    if (profileError) console.log('Profile error:', profileError)

    if (referredBy) {
      const { data: referrer } = await supabase.from('profiles').select('id').eq('referral_code', referredBy).single()
      if (referrer) {
        await supabase.from('referral_rewards').insert({
          referrer_id: referrer.id,
          referred_id: data.user.id,
          reward_type: 'signup',
          reward_status: 'pending'
        })
      }
      localStorage.removeItem('teachme_referral')
    }

    if (userData.role === 'teacher') {
      const { error: teacherError } = await supabase.from('teachers').upsert({
        id: data.user.id,
        subjects: userData.subjects || [],
        hourly_rate: 0
      })
      if (teacherError) console.log('Teacher error:', teacherError)
    }

    // Fetch the profile immediately
    await fetchProfile(data.user.id)
  }
  return data
}

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}