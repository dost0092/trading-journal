import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null

export type UserRole = 'user' | 'superadmin'
export type UserStatus = 'pending' | 'approved' | 'rejected'

export interface UserProfile {
  id: string
  email: string | null
  full_name: string | null
  role: UserRole
  status: UserStatus
  created_at?: string
}

export function isProfileApproved(profile: UserProfile | null): boolean {
  if (!profile) return false
  if (profile.role === 'superadmin') return true
  return profile.status === 'approved'
}
