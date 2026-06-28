import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getSavedRules, saveRules, type TradeRule } from '@/lib/ruleStorage'
import {
  getSavedStrategyNames,
  saveStrategyNames,
} from '@/lib/strategyStorage'
import type { StrategyId } from '@/types/trade'

const STRATEGY_IDS: StrategyId[] = ['liquidity_sweep', 'liquidity_run']

interface StrategySetup {
  names: Record<StrategyId, string>
  rulesByStrategy: Record<StrategyId, TradeRule[]>
}

interface StrategyConfigContextValue {
  strategyNames: Record<StrategyId, string>
  getStrategyName: (id: StrategyId) => string
  getRules: (strategy: StrategyId) => TradeRule[]
  getSetup: () => StrategySetup
  saveSetup: (setup: StrategySetup) => void
  refresh: () => void
}

const StrategyConfigContext = createContext<StrategyConfigContextValue | null>(null)

function loadSetup(): StrategySetup {
  return {
    names: getSavedStrategyNames(),
    rulesByStrategy: {
      liquidity_sweep: getSavedRules('liquidity_sweep'),
      liquidity_run: getSavedRules('liquidity_run'),
    },
  }
}

export function StrategyConfigProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0)

  const setup = useMemo(() => loadSetup(), [version])

  const getStrategyName = useCallback(
    (id: StrategyId) => setup.names[id],
    [setup.names],
  )

  const getRules = useCallback(
    (strategy: StrategyId) => setup.rulesByStrategy[strategy],
    [setup.rulesByStrategy],
  )

  const getSetup = useCallback(() => setup, [setup])

  const saveSetup = useCallback((next: StrategySetup) => {
    saveStrategyNames(next.names)
    for (const id of STRATEGY_IDS) {
      saveRules(id, next.rulesByStrategy[id])
    }
    setVersion((v) => v + 1)
  }, [])

  const refresh = useCallback(() => setVersion((v) => v + 1), [])

  const value = useMemo(
    () => ({
      strategyNames: setup.names,
      getStrategyName,
      getRules,
      getSetup,
      saveSetup,
      refresh,
    }),
    [setup, getStrategyName, getRules, getSetup, saveSetup, refresh],
  )

  return (
    <StrategyConfigContext.Provider value={value}>
      {children}
    </StrategyConfigContext.Provider>
  )
}

export function useStrategyConfig() {
  const ctx = useContext(StrategyConfigContext)
  if (!ctx) {
    throw new Error('useStrategyConfig must be used within StrategyConfigProvider')
  }
  return ctx
}
