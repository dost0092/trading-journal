import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@/context/AuthContext'
import type { TradeRule } from '@/lib/ruleStorage'
import {
  fetchUserStrategyConfig,
  getDefaultSetup,
  saveUserStrategyConfig,
  type StrategySetup,
} from '@/lib/strategyConfigService'
import type { StrategyId } from '@/types/trade'

interface StrategyConfigContextValue {
  strategyNames: Record<StrategyId, string>
  getStrategyName: (id: StrategyId) => string
  getRules: (strategy: StrategyId) => TradeRule[]
  getSetup: () => StrategySetup
  saveSetup: (setup: StrategySetup) => Promise<string | null>
  refresh: () => Promise<void>
  loading: boolean
}

const StrategyConfigContext = createContext<StrategyConfigContextValue | null>(null)

export function StrategyConfigProvider({ children }: { children: ReactNode }) {
  const { session, isApproved } = useAuth()
  const [setup, setSetup] = useState<StrategySetup>(getDefaultSetup)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!session || !isApproved) {
      setSetup(getDefaultSetup())
      setLoading(false)
      return
    }

    setLoading(true)
    const config = await fetchUserStrategyConfig()
    setSetup(config)
    setLoading(false)
  }, [session, isApproved])

  useEffect(() => {
    refresh()
  }, [refresh])

  const getStrategyName = useCallback(
    (id: StrategyId) => setup.names[id],
    [setup.names],
  )

  const getRules = useCallback(
    (strategy: StrategyId) => setup.rulesByStrategy[strategy],
    [setup.rulesByStrategy],
  )

  const getSetup = useCallback(() => setup, [setup])

  const saveSetup = useCallback(async (next: StrategySetup) => {
    const err = await saveUserStrategyConfig(next)
    if (!err) setSetup(next)
    return err
  }, [])

  const value = useMemo(
    () => ({
      strategyNames: setup.names,
      getStrategyName,
      getRules,
      getSetup,
      saveSetup,
      refresh,
      loading,
    }),
    [setup, getStrategyName, getRules, getSetup, saveSetup, refresh, loading],
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
