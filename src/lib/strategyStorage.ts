import { STRATEGY_LABELS } from '@/data/strategies'
import type { StrategyId } from '@/types/trade'

const STORAGE_KEY = 'trading-journal-strategy-names'

export function getDefaultStrategyNames(): Record<StrategyId, string> {
  return { ...STRATEGY_LABELS }
}

export function getSavedStrategyNames(): Record<StrategyId, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultStrategyNames()

    const parsed = JSON.parse(raw) as Partial<Record<StrategyId, string>>
    return {
      liquidity_sweep:
        parsed.liquidity_sweep?.trim() || STRATEGY_LABELS.liquidity_sweep,
      liquidity_run:
        parsed.liquidity_run?.trim() || STRATEGY_LABELS.liquidity_run,
    }
  } catch {
    return getDefaultStrategyNames()
  }
}

export function saveStrategyNames(names: Record<StrategyId, string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(names))
}

export function getStrategyName(id: StrategyId): string {
  return getSavedStrategyNames()[id]
}
