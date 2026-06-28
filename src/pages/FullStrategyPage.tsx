import { BookOpen } from 'lucide-react'
import { STRATEGIES } from '@/data/strategies'
import { StrategyCard } from '@/components/strategy/StrategyCard'

export function FullStrategyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-primary" />
        <p className="text-sm text-muted">
          Your complete strategy playbook with rules and reference charts.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {STRATEGIES.map((strategy) => (
          <StrategyCard key={strategy.id} strategy={strategy} />
        ))}
      </div>
    </div>
  )
}
