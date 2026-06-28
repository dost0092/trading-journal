import { useStrategyConfig } from '@/context/StrategyConfigContext'
import { Card, CardContent } from '@/components/ui/card'
import type { StrategyId } from '@/types/trade'

const STRATEGY_IDS: StrategyId[] = ['liquidity_sweep', 'liquidity_run']

export function FullStrategyPage() {
  const { getStrategyName, getRules } = useStrategyConfig()

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-4">
      <p className="text-sm text-muted">XAU/USD strategy playbook</p>

      <div className="space-y-6">
        {STRATEGY_IDS.map((id) => (
          <Card key={id} className="shadow-none">
            <CardContent className="space-y-4 p-6">
              <p className="text-base font-semibold">{getStrategyName(id)}</p>
              <ul className="space-y-2">
                {getRules(id).map((r) => (
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
