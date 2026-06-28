import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import {
  isProfileApproved,
  isSupabaseConfigured,
  supabase,
  type UserProfile,
  type UserRole,
  type UserStatus,
} from '@/lib/supabase'

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  role: UserRole
  status: UserStatus
  isSuperAdmin: boolean
  isApproved: boolean
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<string | null>
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  fetchAllUsers: () => Promise<UserProfile[]>
  updateUserStatus: (userId: string, status: UserStatus) => Promise<string | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const PROFILE_FIELDS = 'id, email, full_name, role, status, created_at'

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_FIELDS)
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return data as UserProfile
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  const loadProfile = useCallback(async (userId: string) => {
    const p = await fetchProfile(userId)
    setProfile(p)
    return p
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return
    await loadProfile(session.user.id)
  }, [session?.user, loadProfile])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session?.user) {
        loadProfile(data.session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (nextSession?.user) {
        loadProfile(nextSession.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [loadProfile])

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      if (!supabase) return 'Supabase is not configured.'
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      return error?.message ?? null
    },
    [],
  )

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return 'Supabase is not configured.'
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setProfile(null)
  }, [])

  const fetchAllUsers = useCallback(async () => {
    if (!supabase) return []
    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILE_FIELDS)
      .order('created_at', { ascending: false })

    if (error) return []
    return (data ?? []) as UserProfile[]
  }, [])

  const updateUserStatus = useCallback(async (userId: string, status: UserStatus) => {
    if (!supabase) return 'Supabase is not configured.'
    const { error } = await supabase.from('profiles').update({ status }).eq('id', userId)
    return error?.message ?? null
  }, [])

  const role: UserRole = profile?.role ?? 'user'
  const status: UserStatus = profile?.status ?? 'pending'
  const isApproved = isProfileApproved(profile)

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      role,
      status,
      isSuperAdmin: role === 'superadmin',
      isApproved,
      loading,
      signUp,
      signIn,
      signOut,
      refreshProfile,
      fetchAllUsers,
      updateUserStatus,
    }),
    [
      session,
      profile,
      role,
      status,
      isApproved,
      loading,
      signUp,
      signIn,
      signOut,
      refreshProfile,
      fetchAllUsers,
      updateUserStatus,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
