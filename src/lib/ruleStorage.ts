import { PLACEHOLDER_RULES } from '@/data/strategies'
import type { StrategyId } from '@/types/trade'
import { RULE_IDS } from '@/types/trade'

export interface TradeRule {
  id: string
  label: string
}

const STORAGE_PREFIX = 'trading-journal-rules'

export function getDefaultRules(): TradeRule[] {
  return PLACEHOLDER_RULES.map((r) => ({ ...r }))
}

export function getSavedRules(strategy: StrategyId): TradeRule[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}-${strategy}`)
    if (!raw) return getDefaultRules()

    const parsed = JSON.parse(raw) as TradeRule[]
    if (!Array.isArray(parsed)) return getDefaultRules()

    return RULE_IDS.map((id, index) => {
      const saved = parsed.find((r) => r.id === id)
      return {
        id,
        label: saved?.label?.trim() || PLACEHOLDER_RULES[index].label,
      }
    })
  } catch {
    return getDefaultRules()
  }
}

export function saveRules(strategy: StrategyId, rules: TradeRule[]) {
  localStorage.setItem(`${STORAGE_PREFIX}-${strategy}`, JSON.stringify(rules))
}

export function rulesToLabelMap(rules: TradeRule[]): Record<string, string> {
  return Object.fromEntries(rules.map((r) => [r.id, r.label]))
}
