import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase?.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase?.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
    } finally {
      setLoading(false)
    }
  }

  async function signUp({ email, password, name, registration, course, role }) {
    try {
      const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) throw signUpError

      const { error: profileError } = await supabase.from('profiles').insert({
        id: newUser.id,
        name,
        email,
        registration,
        course,
        role,
      })

      if (profileError) throw profileError

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  async function signIn({ email, password }) {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin: profile?.role === 'admin',
    isProfessor: profile?.role === 'professor',
    isStudent: profile?.role === 'student',
    isSupervisor: profile?.role === 'supervisor',
    canManage: profile?.role === 'admin' || profile?.role === 'professor',
    canScore: profile?.role === 'admin' || profile?.role === 'professor' || profile?.role === 'supervisor',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
