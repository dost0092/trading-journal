import { useCallback, useEffect, useState } from 'react'
import { Check, RefreshCw, Shield, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import type { UserProfile, UserStatus } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

function StatusBadge({ status, role }: { status: UserStatus; role: string }) {
  if (role === 'superadmin') {
    return <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Superadmin</Badge>
  }
  const map: Record<UserStatus, string> = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
  }
  return (
    <Badge className={cn('capitalize hover:opacity-90', map[status])}>{status}</Badge>
  )
}

export function AdminUsersPage() {
  const { fetchAllUsers, updateUserStatus, profile: me, isSuperAdmin } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { users: list, error: fetchError } = await fetchAllUsers()
    setUsers(list)
    if (fetchError) setError(fetchError)
    setLoading(false)
  }, [fetchAllUsers])

  useEffect(() => {
    if (isSuperAdmin) load()
  }, [isSuperAdmin, load])

  async function setStatus(userId: string, status: UserStatus) {
    setActionId(userId)
    setError(null)
    const err = await updateUserStatus(userId, status)
    setActionId(null)
    if (err) {
      setError(err)
      return
    }
    await load()
  }

  if (!isSuperAdmin) {
    return (
      <p className="py-8 text-center text-sm text-muted">
        Superadmin access required.
      </p>
    )
  }

  const pendingCount = users.filter((u) => u.status === 'pending' && u.role !== 'superadmin').length

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold tracking-tight">User management</h1>
          </div>
          <p className="mt-1 text-sm text-muted">
            Approve or reject users who signed up. Superadmins always have full access.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge className="bg-amber-100 text-amber-800">{pendingCount} pending</Badge>
          )}
          <Button size="sm" variant="outline" onClick={() => load()}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}. Run <code className="text-xs">supabase/fix_auth_rls.sql</code> in Supabase SQL
          Editor if this persists.
        </p>
      )}

      <Card className="shadow-none">
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-sm text-muted">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="p-6 text-sm text-muted">
              No users found. If you expect users here, run fix_auth_rls.sql in Supabase.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {users.map((user) => {
                const isSelf = user.id === me?.id
                const isSuper = user.role === 'superadmin'

                return (
                  <div
                    key={user.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {user.full_name ?? 'Unknown'}
                        {isSelf && <span className="ml-2 text-xs text-muted">(you)</span>}
                      </p>
                      <p className="truncate text-xs text-muted">{user.email}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={user.status} role={user.role} />

                      {!isSuper && user.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            disabled={actionId === user.id}
                            onClick={() => setStatus(user.id, 'approved')}
                          >
                            <Check className="mr-1 h-3.5 w-3.5" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actionId === user.id}
                            onClick={() => setStatus(user.id, 'rejected')}
                          >
                            <X className="mr-1 h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </>
                      )}

                      {!isSuper && user.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionId === user.id}
                          onClick={() => setStatus(user.id, 'rejected')}
                        >
                          Revoke
                        </Button>
                      )}

                      {!isSuper && user.status === 'rejected' && (
                        <Button
                          size="sm"
                          disabled={actionId === user.id}
                          onClick={() => setStatus(user.id, 'approved')}
                        >
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
