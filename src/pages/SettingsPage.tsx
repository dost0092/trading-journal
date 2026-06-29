import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, Shield } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { resolveDisplayName } from '@/lib/authUtils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input, Label } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { useTheme } from '@/context/ThemeContext'

export function SettingsPage() {
  const {
    session,
    profile,
    user,
    isSuperAdmin,
    status,
    profileError,
    signOut,
    updateProfileName,
    refreshProfile,
  } = useAuth()
  const { isDark } = useTheme()

  const email = profile?.email ?? user?.email ?? session?.user?.email ?? ''
  const displayName = resolveDisplayName(profile, email)
  const [name, setName] = useState(displayName)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setName(displayName)
  }, [displayName])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setMessage(null)
    const err = await updateProfileName(name)
    setSaving(false)
    if (err) {
      setError(err)
      return
    }
    setMessage('Profile saved.')
  }

  return (
    <div className="mx-auto max-w-md space-y-6 py-4">
      <Card className="shadow-none">
        <CardContent className="flex items-center justify-between gap-4 p-6">
          <div>
            <p className="text-sm font-semibold">Appearance</p>
            <p className="mt-0.5 text-xs text-muted">
              {isDark ? 'Dark mode' : 'Light mode'}
            </p>
          </div>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">Account</p>
            {isSuperAdmin && (
              <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Superadmin</Badge>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5"
                disabled={!session}
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} readOnly className="mt-1.5 bg-secondary/50" />
            </div>

            {session && (
              <div>
                <Label>Access status</Label>
                <p className="mt-1.5 text-sm capitalize text-muted">{status}</p>
              </div>
            )}

            {profileError && (
              <p className="rounded-xl bg-warning/10 px-3 py-2 text-xs text-warning">
                Profile sync issue: {profileError}. Run fix_auth_rls.sql in Supabase, then refresh.
              </p>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
            {message && <p className="text-sm text-success">{message}</p>}

            <div className="flex flex-col gap-2 sm:flex-row">
              {session && (
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? 'Saving...' : 'Save name'}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => refreshProfile()}
                className="flex-1"
              >
                Refresh
              </Button>
            </div>
          </form>

          {isSuperAdmin && (
            <Link
              to="/admin/users"
              className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium transition hover:bg-secondary"
            >
              <Shield className="h-4 w-4 text-primary" />
              Manage Users
            </Link>
          )}

          {session && (
            <Button
              variant="outline"
              onClick={() => signOut()}
              className="w-full text-destructive hover:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
