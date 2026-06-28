import type { User } from '@supabase/supabase-js'
import { isSuperAdminEmail } from '@/lib/authConfig'
import type { UserProfile } from '@/lib/supabase'

export function buildProfileFromUser(user: User): UserProfile {
  const email = user.email ?? null
  const isSuper = email ? isSuperAdminEmail(email) : false
  return {
    id: user.id,
    email,
    full_name:
      (user.user_metadata?.full_name as string | undefined) ??
      email?.split('@')[0] ??
      null,
    role: isSuper ? 'superadmin' : 'user',
    status: isSuper ? 'approved' : 'pending',
  }
}

export function resolveIsSuperAdmin(
  profile: UserProfile | null,
  email: string | null | undefined,
): boolean {
  if (profile?.role === 'superadmin') return true
  return email ? isSuperAdminEmail(email) : false
}

export function resolveIsApproved(
  profile: UserProfile | null,
  email: string | null | undefined,
): boolean {
  if (resolveIsSuperAdmin(profile, email)) return true
  if (!profile) return false
  return profile.status === 'approved'
}

export function resolveDisplayName(
  profile: UserProfile | null,
  email: string | null | undefined,
): string {
  return profile?.full_name ?? email?.split('@')[0] ?? 'User'
}

export function resolveInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
