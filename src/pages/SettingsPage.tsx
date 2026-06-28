import { useAuth } from '@/context/AuthContext'
import { isSupabaseConfigured } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Input, Label } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function SettingsPage() {
  const { profile, isSuperAdmin, signOut } = useAuth()

  return (
    <div className="mx-auto max-w-md space-y-8 py-4">
      <Card className="shadow-none">
        <CardContent className="space-y-5 p-6">
          <p className="text-sm font-semibold">Profile</p>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              defaultValue={profile?.full_name ?? 'Demo User'}
              readOnly={isSupabaseConfigured}
              className="mt-1.5"
            />
          </div>
          {profile?.email && (
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue={profile.email} readOnly className="mt-1.5" />
            </div>
          )}
          {isSuperAdmin && (
            <p className="rounded-xl bg-primary/8 px-3 py-2 text-xs text-primary">
              You are signed in as superadmin.
            </p>
          )}
          {!isSupabaseConfigured && (
            <p className="text-xs text-muted">
              Running in demo mode. Add Supabase env vars to enable login.
            </p>
          )}
          {isSupabaseConfigured && (
            <Button variant="outline" onClick={() => signOut()}>
              Sign out
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
