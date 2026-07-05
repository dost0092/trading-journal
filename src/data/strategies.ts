import type { StrategyId } from '@/types/trade'

export const STRATEGY_IDS: StrategyId[] = [
  'liquidity_sweep',
  'liquidity_run',
  'fair_value_gap',
  'order_block',
]

export const STRATEGY_LABELS: Record<StrategyId, string> = {
  liquidity_sweep: 'SCC Liquidity Sweep',
  liquidity_run: 'SCC Liquidity Run',
  fair_value_gap: 'SCC Fair Value Gap',
  order_block: 'SCC Order Block',
}

export const STRATEGIES = STRATEGY_IDS.map((id) => ({
  id,
  name: STRATEGY_LABELS[id],
}))

export const getStrategy = (id: string) =>
  STRATEGIES.find((s) => s.id === id)

export const PLACEHOLDER_RULES = [
  { id: 'rule1', label: 'Rule 1' },
  { id: 'rule2', label: 'Rule 2' },
  { id: 'rule3', label: 'Rule 3' },
  { id: 'rule4', label: 'Rule 4' },
  { id: 'rule5', label: 'Rule 5' },
]
