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
  buildProfileFromUser,
  resolveIsApproved,
  resolveIsSuperAdmin,
} from '@/lib/authUtils'
import {
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
  profileError: string | null
  signUp: (email: string, password: string, fullName: string) => Promise<string | null>
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfileName: (fullName: string) => Promise<string | null>
  fetchAllUsers: () => Promise<{ users: UserProfile[]; error: string | null }>
  updateUserStatus: (userId: string, status: UserStatus) => Promise<string | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const PROFILE_FIELDS = 'id, email, full_name, role, status, created_at'

async function loadUserProfile(user: User): Promise<{
  profile: UserProfile | null
  error: string | null
}> {
  if (!supabase) return { profile: buildProfileFromUser(user), error: null }

  const { data: ensured, error: rpcError } = await supabase.rpc('ensure_user_profile')

  if (ensured && !rpcError) {
    return { profile: ensured as UserProfile, error: null }
  }

  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_FIELDS)
    .eq('id', user.id)
    .maybeSingle()

  if (data) return { profile: data as UserProfile, error: null }

  if (error) {
    return { profile: buildProfileFromUser(user), error: error.message }
  }

  return { profile: buildProfileFromUser(user), error: rpcError?.message ?? null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  const syncProfile = useCallback(async (user: User) => {
    const { profile: nextProfile, error } = await loadUserProfile(user)
    setProfile(nextProfile)
    setProfileError(error)
    return nextProfile
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return
    await syncProfile(session.user)
  }, [session?.user, syncProfile])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session?.user) {
        syncProfile(data.session.user).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (nextSession?.user) {
        syncProfile(nextSession.user)
      } else {
        setProfile(null)
        setProfileError(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [syncProfile])

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
    setProfileError(null)
  }, [])

  const updateProfileName = useCallback(
    async (fullName: string) => {
      if (!supabase || !session?.user) return 'Not signed in.'
      const trimmed = fullName.trim()
      if (!trimmed) return 'Name is required.'

      const { error } = await supabase
        .from('profiles')
        .update({ full_name: trimmed })
        .eq('id', session.user.id)

      if (error) return error.message

      await syncProfile(session.user)
      return null
    },
    [session?.user, syncProfile],
  )

  const fetchAllUsers = useCallback(async () => {
    if (!supabase) return { users: [], error: 'Supabase is not configured.' }

    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILE_FIELDS)
      .order('created_at', { ascending: false })

    if (error) return { users: [], error: error.message }
    return { users: (data ?? []) as UserProfile[], error: null }
  }, [])

  const updateUserStatus = useCallback(async (userId: string, status: UserStatus) => {
    if (!supabase) return 'Supabase is not configured.'
    const { error } = await supabase.from('profiles').update({ status }).eq('id', userId)
    return error?.message ?? null
  }, [])

  const userEmail = profile?.email ?? session?.user?.email ?? null
  const isSuperAdmin = resolveIsSuperAdmin(profile, userEmail)
  const isApproved = resolveIsApproved(profile, userEmail)
  const role: UserRole = isSuperAdmin ? 'superadmin' : (profile?.role ?? 'user')
  const status: UserStatus = isSuperAdmin ? 'approved' : (profile?.status ?? 'pending')

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      role,
      status,
      isSuperAdmin,
      isApproved,
      loading,
      profileError,
      signUp,
      signIn,
      signOut,
      refreshProfile,
      updateProfileName,
      fetchAllUsers,
      updateUserStatus,
    }),
    [
      session,
      profile,
      role,
      status,
      isSuperAdmin,
      isApproved,
      loading,
      profileError,
      signUp,
      signIn,
      signOut,
      refreshProfile,
      updateProfileName,
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
