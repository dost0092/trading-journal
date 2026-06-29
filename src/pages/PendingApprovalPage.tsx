import { Clock } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { AuthThemeToggle } from '@/components/theme/AuthThemeToggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function PendingApprovalPage() {
  const { profile, signOut, refreshProfile } = useAuth()

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <AuthThemeToggle />
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <Clock className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight">Waiting for approval</h1>
          <p className="text-sm text-muted">
            Your account <strong>{profile?.email}</strong> was created successfully. A superadmin
            must approve your access before you can use the journal.
          </p>
        </div>

        <Card className="shadow-none text-left">
          <CardContent className="space-y-3 p-6">
            <p className="text-sm text-muted">What happens next:</p>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted">
              <li>Superadmin reviews your signup request</li>
              <li>Once approved, sign in again to access the dashboard</li>
              <li>You can check status anytime with the button below</li>
            </ul>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={() => refreshProfile()} className="flex-1">
            Check status
          </Button>
          <Button variant="outline" onClick={() => signOut()} className="flex-1">
            Sign out
          </Button>
        </div>
      </div>
    </div>
  )
}
