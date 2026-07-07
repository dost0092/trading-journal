import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  const { session, isApproved, user } = useAuth()
  const userId = user?.id ?? session?.user?.id ?? null
  const [setup, setSetup] = useState<StrategySetup>(getDefaultSetup)
  const [loading, setLoading] = useState(true)
  const hasLoadedRef = useRef(false)
  const fetchPromiseRef = useRef<Promise<void> | null>(null)

  const refresh = useCallback(async () => {
    if (fetchPromiseRef.current) {
      await fetchPromiseRef.current
      return
    }

    const run = async () => {
      if (!session || !isApproved || !userId) {
        setSetup(getDefaultSetup())
        setLoading(false)
        hasLoadedRef.current = false
        return
      }

      if (!hasLoadedRef.current) setLoading(true)
      const config = await fetchUserStrategyConfig(userId)
      setSetup(config)
      setLoading(false)
      hasLoadedRef.current = true
    }

    fetchPromiseRef.current = run().finally(() => {
      fetchPromiseRef.current = null
    })

    await fetchPromiseRef.current
  }, [session, isApproved, userId])

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

  const saveSetup = useCallback(
    async (next: StrategySetup) => {
      if (!userId) return 'You must be signed in.'
      const err = await saveUserStrategyConfig(userId, next)
      if (!err) setSetup(next)
      return err
    },
    [userId],
  )

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
