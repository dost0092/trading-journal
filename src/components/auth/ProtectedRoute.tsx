import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export function ProtectedRoute() {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (!isSupabaseConfigured) {
    return <Outlet />
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export function PublicOnlyRoute() {
  const { session, loading } = useAuth()

  if (!isSupabaseConfigured) {
    return <Navigate to="/" replace />
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted">Loading...</p>
      </div>
    )
  }

  if (session) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
