import type { StrategyId } from '@/types/trade'

export const STRATEGY_LABELS: Record<StrategyId, string> = {
  liquidity_sweep: 'SCC Liquidity Sweep',
  liquidity_run: 'SCC Liquidity Run',
}

export const STRATEGIES = [
  { id: 'liquidity_sweep' as const, name: STRATEGY_LABELS.liquidity_sweep },
  { id: 'liquidity_run' as const, name: STRATEGY_LABELS.liquidity_run },
]

export const getStrategy = (id: string) =>
  STRATEGIES.find((s) => s.id === id)

export const PLACEHOLDER_RULES = [
  { id: 'rule1', label: 'Rule 1' },
  { id: 'rule2', label: 'Rule 2' },
  { id: 'rule3', label: 'Rule 3' },
  { id: 'rule4', label: 'Rule 4' },
  { id: 'rule5', label: 'Rule 5' },
]
