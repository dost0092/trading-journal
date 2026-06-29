import { PLACEHOLDER_RULES, STRATEGY_LABELS } from '@/data/strategies'
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
    rulesByStrategy: {
      liquidity_sweep: PLACEHOLDER_RULES.map((r) => ({ ...r })),
      liquidity_run: PLACEHOLDER_RULES.map((r) => ({ ...r })),
    },
  }
}

export async function fetchUserStrategyConfig(): Promise<StrategySetup> {
  const defaults = getDefaultSetup()
  if (!supabase) return defaults

  const { data, error } = await supabase
    .from('user_strategy_configs')
    .select('strategy_names, rules_by_strategy')
    .maybeSingle()

  if (error || !data) return defaults

  const names = data.strategy_names as Record<StrategyId, string>
  const rules = data.rules_by_strategy as Record<StrategyId, TradeRule[]>

  return {
    names: {
      liquidity_sweep: names?.liquidity_sweep?.trim() || defaults.names.liquidity_sweep,
      liquidity_run: names?.liquidity_run?.trim() || defaults.names.liquidity_run,
    },
    rulesByStrategy: {
      liquidity_sweep: rules?.liquidity_sweep?.length
        ? rules.liquidity_sweep
        : defaults.rulesByStrategy.liquidity_sweep,
      liquidity_run: rules?.liquidity_run?.length
        ? rules.liquidity_run
        : defaults.rulesByStrategy.liquidity_run,
    },
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
