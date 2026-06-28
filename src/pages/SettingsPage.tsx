import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function SettingsPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Display Name</Label>
            <Input id="name" defaultValue="John Doe" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="trader@example.com" />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="risk">Default Risk %</Label>
            <Input id="risk" type="number" defaultValue="1" step="0.1" />
          </div>
          <div>
            <Label htmlFor="currency">Base Currency</Label>
            <Input id="currency" defaultValue="USD" />
          </div>
          <Button variant="secondary">Update Preferences</Button>
        </CardContent>
      </Card>
    </div>
  )
}
