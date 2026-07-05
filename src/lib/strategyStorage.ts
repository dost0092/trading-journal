import { STRATEGY_IDS, STRATEGY_LABELS } from '@/data/strategies'
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
    return Object.fromEntries(
      STRATEGY_IDS.map((id) => [id, parsed[id]?.trim() || STRATEGY_LABELS[id]]),
    ) as Record<StrategyId, string>
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
