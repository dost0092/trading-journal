import { ImageIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { StrategyDefinition } from '@/types/trade'

interface StrategyCardProps {
  strategy: StrategyDefinition
}

export function StrategyCard({ strategy }: StrategyCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <CardHeader>
        <CardTitle>{strategy.name}</CardTitle>
        <CardDescription>{strategy.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-border bg-secondary/40">
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ImageIcon className="h-4 w-4" />
            <span className="text-[10px]">Reference chart</span>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
            Entry Rules
          </p>
          <ul className="space-y-2">
            {strategy.rules.map((rule, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                {rule}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-secondary/30 p-3">
          <p className="text-[11px] font-medium text-muted">Notes</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add personal notes and refinements for this strategy...
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
