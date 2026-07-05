import { PLACEHOLDER_RULES, STRATEGY_IDS, STRATEGY_LABELS } from '@/data/strategies'
import type { TradeRule } from '@/lib/ruleStorage'
import { supabase } from '@/lib/supabase'
import type { StrategyId } from '@/types/trade'

export interface StrategySetup {
  names: Record<StrategyId, string>
  rulesByStrategy: Record<StrategyId, TradeRule[]>
}

export function getDefaultSetup(): StrategySetup {
  return {
    names: { ...STRATEGY_LABELS },
    rulesByStrategy: Object.fromEntries(
      STRATEGY_IDS.map((id) => [id, PLACEHOLDER_RULES.map((r) => ({ ...r }))]),
    ) as Record<StrategyId, TradeRule[]>,
  }
}

function normalizeRules(rules: TradeRule[] | undefined, fallback: TradeRule[]) {
  if (!Array.isArray(rules) || rules.length === 0) return fallback

  return rules.map((rule, index) => ({
    id: rule.id || `rule_${index + 1}`,
    label: rule.label?.trim() || `Rule ${index + 1}`,
  }))
}

export async function fetchUserStrategyConfig(): Promise<StrategySetup> {
  const defaults = getDefaultSetup()
  if (!supabase) return defaults

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return defaults

  const { data, error } = await supabase
    .from('user_strategy_configs')
    .select('strategy_names, rules_by_strategy')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !data) return defaults

  const names = data.strategy_names as Partial<Record<StrategyId, string>>
  const rules = data.rules_by_strategy as Partial<Record<StrategyId, TradeRule[]>>

  return {
    names: Object.fromEntries(
      STRATEGY_IDS.map((id) => [id, names?.[id]?.trim() || defaults.names[id]]),
    ) as Record<StrategyId, string>,
    rulesByStrategy: Object.fromEntries(
      STRATEGY_IDS.map((id) => [
        id,
        normalizeRules(rules?.[id], defaults.rulesByStrategy[id]),
      ]),
    ) as Record<StrategyId, TradeRule[]>,
  }
}

export async function saveUserStrategyConfig(setup: StrategySetup): Promise<string | null> {
  if (!supabase) return 'Supabase is not configured.'

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return 'You must be signed in.'

  const { error } = await supabase.from('user_strategy_configs').upsert(
    {
      user_id: user.id,
      strategy_names: setup.names,
      rules_by_strategy: setup.rulesByStrategy,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )

  return error?.message ?? null
}
