import { PLACEHOLDER_RULES, STRATEGIES } from '@/data/strategies'
import { Card, CardContent } from '@/components/ui/card'

export function FullStrategyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-4">
      <p className="text-sm text-muted">XAU/USD strategy playbook</p>

      <div className="space-y-6">
        {STRATEGIES.map((s) => (
          <Card key={s.id} className="shadow-none">
            <CardContent className="space-y-4 p-6">
              <p className="text-base font-semibold">{s.name}</p>
              <ul className="space-y-2">
                {PLACEHOLDER_RULES.map((r) => (
                  <li key={r.id} className="flex gap-2 text-sm text-muted">
                    <span className="text-primary">·</span>
                    {r.label}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
