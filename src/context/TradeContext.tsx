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
import { buildTradesByDateIndex, calcStats } from '@/lib/tradeStats'
import { createTrade, fetchUserTrades, removeTrade, updateTrade as updateTradeInDb } from '@/lib/tradeService'
import { filterByStrategy } from '@/lib/tradeUtils'
import type { StrategyFilter, TradeEntry, TradeImage } from '@/types/trade'

interface TradeContextValue {
  trades: TradeEntry[]
  tradesByDate: Map<string, TradeEntry[]>
  loading: boolean
  error: string | null
  selectedDate: string | null
  setSelectedDate: (date: string | null) => void
  strategyFilter: StrategyFilter
  setStrategyFilter: (f: StrategyFilter) => void
  addTrade: (
    trade: Omit<TradeEntry, 'id' | 'createdAt' | 'image'>,
    image: TradeImage | null,
  ) => Promise<string | null>
  deleteTrade: (id: string) => Promise<string | null>
  updateTrade: (
    id: string,
    trade: Omit<TradeEntry, 'id' | 'createdAt' | 'image'>,
    image: TradeImage | null,
  ) => Promise<string | null>
  refreshTrades: () => Promise<void>
  stats: ReturnType<typeof calcStats>
  filteredTrades: TradeEntry[]
  filteredByStrategy: TradeEntry[]
}

const TradeContext = createContext<TradeContextValue | null>(null)
const TradeStatsContext = createContext<ReturnType<typeof calcStats> | null>(null)

export function TradeProvider({ children }: { children: ReactNode }) {
  const { session, isApproved, user } = useAuth()
  const userId = user?.id ?? session?.user?.id ?? null
  const [trades, setTrades] = useState<TradeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [strategyFilter, setStrategyFilter] = useState<StrategyFilter>('all')
  const hasLoadedRef = useRef(false)
  const fetchPromiseRef = useRef<Promise<void> | null>(null)

  const refreshTrades = useCallback(async () => {
    if (fetchPromiseRef.current) {
      await fetchPromiseRef.current
      return
    }

    const run = async () => {
      if (!session || !isApproved || !userId) {
        setTrades([])
        setError(null)
        setLoading(false)
        hasLoadedRef.current = false
        return
      }

      if (!hasLoadedRef.current) setLoading(true)

      const { trades: list, error: fetchError } = await fetchUserTrades(userId)
      setTrades(list)
      setError(fetchError)
      setLoading(false)
      hasLoadedRef.current = true
    }

    fetchPromiseRef.current = run().finally(() => {
      fetchPromiseRef.current = null
    })

    await fetchPromiseRef.current
  }, [session, isApproved, userId])

  useEffect(() => {
    refreshTrades()
  }, [refreshTrades])

  const addTrade = useCallback(
    async (
      trade: Omit<TradeEntry, 'id' | 'createdAt' | 'image'>,
      image: TradeImage | null,
    ) => {
      if (!userId) return 'You must be signed in.'
      const { trade: saved, error: saveError } = await createTrade(userId, trade, image)
      if (saveError) return saveError
      if (saved) setTrades((prev) => [saved, ...prev])
      return null
    },
    [userId],
  )

  const deleteTrade = useCallback(
    async (id: string) => {
      if (!userId) return 'You must be signed in.'
      const err = await removeTrade(userId, id)
      if (err) return err
      setTrades((prev) => prev.filter((t) => t.id !== id))
      return null
    },
    [userId],
  )

  const updateTrade = useCallback(
    async (
      id: string,
      trade: Omit<TradeEntry, 'id' | 'createdAt' | 'image'>,
      image: TradeImage | null,
    ) => {
      if (!userId) return 'You must be signed in.'
      const { trade: saved, error: saveError } = await updateTradeInDb(userId, id, trade, image)
      if (saveError) return saveError
      if (saved) setTrades((prev) => prev.map((t) => (t.id === id ? saved : t)))
      return null
    },
    [userId],
  )

  const tradesByDate = useMemo(() => buildTradesByDateIndex(trades), [trades])

  const filteredByStrategy = useMemo(
    () => filterByStrategy(trades, strategyFilter),
    [trades, strategyFilter],
  )

  const stats = useMemo(() => calcStats(filteredByStrategy), [filteredByStrategy])

  const filteredTrades = useMemo(() => {
    if (!selectedDate) return filteredByStrategy
    return filteredByStrategy.filter((t) => t.date === selectedDate)
  }, [filteredByStrategy, selectedDate])

  const value = useMemo(
    () => ({
      trades,
      tradesByDate,
      loading,
      error,
      selectedDate,
      setSelectedDate,
      strategyFilter,
      setStrategyFilter,
      addTrade,
      deleteTrade,
      updateTrade,
      refreshTrades,
      stats,
      filteredTrades,
      filteredByStrategy,
    }),
    [
      trades,
      tradesByDate,
      loading,
      error,
      selectedDate,
      strategyFilter,
      addTrade,
      deleteTrade,
      updateTrade,
      refreshTrades,
      stats,
      filteredTrades,
      filteredByStrategy,
    ],
  )

  return (
    <TradeStatsContext.Provider value={stats}>
      <TradeContext.Provider value={value}>{children}</TradeContext.Provider>
    </TradeStatsContext.Provider>
  )
}

export function useTrades() {
  const ctx = useContext(TradeContext)
  if (!ctx) throw new Error('useTrades must be used within TradeProvider')
  return ctx
}

export function useTradeStats() {
  const stats = useContext(TradeStatsContext)
  if (!stats) throw new Error('useTradeStats must be used within TradeProvider')
  return stats
}

export type { TradeImage }
