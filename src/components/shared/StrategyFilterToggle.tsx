import type { StrategyFilter } from '@/types/trade'
import { STRATEGIES } from '@/data/strategies'
import { cn } from '@/lib/utils'

const OPTIONS: { id: StrategyFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  ...STRATEGIES.map((s) => ({ id: s.id, label: s.name })),
]

interface StrategyFilterToggleProps {
  value: StrategyFilter
  onChange: (v: StrategyFilter) => void
  className?: string
}

export function StrategyFilterToggle({
  value,
  onChange,
  className,
}: StrategyFilterToggleProps) {
  return (
    <div
      className={cn(
        'inline-flex flex-wrap gap-1 rounded-2xl border border-border bg-card p-1',
        className,
      )}
    >
      {OPTIONS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            'rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200',
            value === id
              ? 'bg-primary text-white shadow-sm'
              : 'text-muted hover:bg-secondary hover:text-foreground',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
