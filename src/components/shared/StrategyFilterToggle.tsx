import type { StrategyFilter, StrategyId } from '@/types/trade'
import { useStrategyConfig } from '@/context/StrategyConfigContext'
import { cn } from '@/lib/utils'

interface StrategyFilterToggleProps {
  value: StrategyFilter
  onChange: (v: StrategyFilter) => void
  className?: string
}

const STRATEGY_IDS: StrategyId[] = ['liquidity_sweep', 'liquidity_run']

export function StrategyFilterToggle({
  value,
  onChange,
  className,
}: StrategyFilterToggleProps) {
  const { getStrategyName } = useStrategyConfig()

  const options: { id: StrategyFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    ...STRATEGY_IDS.map((id) => ({ id, label: getStrategyName(id) })),
  ]

  return (
    <div
      className={cn(
        'inline-flex flex-wrap gap-1 rounded-2xl border border-border bg-card p-1',
        className,
      )}
    >
      {options.map(({ id, label }) => (
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
