import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted">Loading...</p>
    </div>
  )
}

function authRedirect(profile: ReturnType<typeof useAuth>['profile'], isApproved: boolean) {
  if (!profile) return null
  if (isApproved) return null
  if (profile.status === 'rejected') return '/access-denied'
  return '/pending-approval'
}

export function ProtectedRoute() {
  const { session, profile, isApproved, loading } = useAuth()
  const location = useLocation()

  if (!isSupabaseConfigured) return <Outlet />
  if (loading) return <LoadingScreen />
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />

  const redirect = authRedirect(profile, isApproved)
  if (redirect) return <Navigate to={redirect} replace />

  return <Outlet />
}

export function PublicOnlyRoute() {
  const { session, profile, isApproved, loading } = useAuth()

  if (!isSupabaseConfigured) return <Navigate to="/" replace />
  if (loading) return <LoadingScreen />
  if (!session) return <Outlet />

  if (!isApproved) {
    const redirect = authRedirect(profile, isApproved)
    if (redirect) return <Navigate to={redirect} replace />
  }

  return <Navigate to="/" replace />
}

export function PendingRoute() {
  const { session, profile, isApproved, loading } = useAuth()

  if (!isSupabaseConfigured) return <Navigate to="/" replace />
  if (loading) return <LoadingScreen />
  if (!session) return <Navigate to="/login" replace />
  if (isApproved) return <Navigate to="/" replace />
  if (profile?.status === 'rejected') return <Navigate to="/access-denied" replace />

  return <Outlet />
}

export function SuperAdminRoute() {
  const { session, isSuperAdmin, isApproved, loading } = useAuth()
  const location = useLocation()

  if (!isSupabaseConfigured) return <Navigate to="/" replace />
  if (loading) return <LoadingScreen />
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (!isApproved) return <Navigate to="/pending-approval" replace />
  if (!isSuperAdmin) return <Navigate to="/" replace />

  return <Outlet />
}
