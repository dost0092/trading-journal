import { ShieldX } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { AuthThemeToggle } from '@/components/theme/AuthThemeToggle'
import { Button } from '@/components/ui/button'

export function AccessDeniedPage() {
  const { profile, signOut } = useAuth()

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <AuthThemeToggle />
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10">
          <ShieldX className="h-6 w-6 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight">Access denied</h1>
          <p className="text-sm text-muted">
            Your account <strong>{profile?.email}</strong> was not approved. Contact a superadmin if
            you believe this is a mistake.
          </p>
        </div>
        <Button variant="outline" onClick={() => signOut()} className="w-full">
          Sign out
        </Button>
      </div>
    </div>
  )
}
