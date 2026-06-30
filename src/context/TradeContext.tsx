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
import { calcStats } from '@/lib/tradeStats'
import { createTrade, fetchUserTrades, removeTrade, updateTrade as updateTradeInDb } from '@/lib/tradeService'
import { filterByStrategy } from '@/lib/tradeUtils'
import type { StrategyFilter, TradeEntry, TradeImage } from '@/types/trade'

interface TradeContextValue {
  trades: TradeEntry[]
  loading: boolean
  error: string | null
  selectedDate: string | null
  setSelectedDate: (date: string | null) => void
  strategyFilter: StrategyFilter
  setStrategyFilter: (f: StrategyFilter) => void
  addTrade: (
    trade: Omit<TradeEntry, 'id' | 'createdAt' | 'pair' | 'image'>,
    image: TradeImage | null,
  ) => Promise<string | null>
  deleteTrade: (id: string) => Promise<string | null>
  updateTrade: (
    id: string,
    trade: Omit<TradeEntry, 'id' | 'createdAt' | 'pair' | 'image'>,
    image: TradeImage | null,
  ) => Promise<string | null>
  refreshTrades: () => Promise<void>
  stats: ReturnType<typeof calcStats>
  filteredTrades: TradeEntry[]
  filteredByStrategy: TradeEntry[]
}

const TradeContext = createContext<TradeContextValue | null>(null)

export function TradeProvider({ children }: { children: ReactNode }) {
  const { session, isApproved } = useAuth()
  const [trades, setTrades] = useState<TradeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [strategyFilter, setStrategyFilter] = useState<StrategyFilter>('all')

  const refreshTrades = useCallback(async () => {
    if (!session || !isApproved) {
      setTrades([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { trades: list, error: fetchError } = await fetchUserTrades()
    setTrades(list)
    setError(fetchError)
    setLoading(false)
  }, [session, isApproved])

  useEffect(() => {
    refreshTrades()
  }, [refreshTrades])

  const addTrade = useCallback(
    async (
      trade: Omit<TradeEntry, 'id' | 'createdAt' | 'pair' | 'image'>,
      image: TradeImage | null,
    ) => {
      const { trade: saved, error: saveError } = await createTrade(trade, image)
      if (saveError) return saveError
      if (saved) setTrades((prev) => [saved, ...prev])
      return null
    },
    [],
  )

  const deleteTrade = useCallback(async (id: string) => {
    const err = await removeTrade(id)
    if (err) return err
    setTrades((prev) => prev.filter((t) => t.id !== id))
    return null
  }, [])

  const updateTrade = useCallback(
    async (
      id: string,
      trade: Omit<TradeEntry, 'id' | 'createdAt' | 'pair' | 'image'>,
      image: TradeImage | null,
    ) => {
      const { trade: saved, error: saveError } = await updateTradeInDb(id, trade, image)
      if (saveError) return saveError
      if (saved) setTrades((prev) => prev.map((t) => (t.id === id ? saved : t)))
      return null
    },
    [],
  )

  const filteredByStrategy = useMemo(
    () => filterByStrategy(trades, strategyFilter),
    [trades, strategyFilter],
  )

  const stats = useMemo(() => calcStats(filteredByStrategy), [filteredByStrategy])

  const filteredTrades = useMemo(() => {
    let list = filteredByStrategy
    if (selectedDate) list = list.filter((t) => t.date === selectedDate)
    return list
  }, [filteredByStrategy, selectedDate])

  const value = useMemo(
    () => ({
      trades,
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

  return <TradeContext.Provider value={value}>{children}</TradeContext.Provider>
}

export function useTrades() {
  const ctx = useContext(TradeContext)
  if (!ctx) throw new Error('useTrades must be used within TradeProvider')
  return ctx
}

export type { TradeImage }
