import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { MOCK_TRADES, calcStats } from '@/data/mockData'
import { filterByStrategy } from '@/lib/tradeUtils'
import type { StrategyFilter, TradeEntry, TradeImage } from '@/types/trade'

interface TradeContextValue {
  trades: TradeEntry[]
  selectedDate: string | null
  setSelectedDate: (date: string | null) => void
  strategyFilter: StrategyFilter
  setStrategyFilter: (f: StrategyFilter) => void
  addTrade: (trade: Omit<TradeEntry, 'id' | 'createdAt' | 'pair'>) => void
  deleteTrade: (id: string) => void
  stats: ReturnType<typeof calcStats>
  filteredTrades: TradeEntry[]
  filteredByStrategy: TradeEntry[]
}

const TradeContext = createContext<TradeContextValue | null>(null)

export function TradeProvider({ children }: { children: ReactNode }) {
  const [trades, setTrades] = useState<TradeEntry[]>(MOCK_TRADES)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [strategyFilter, setStrategyFilter] = useState<StrategyFilter>('all')

  const addTrade = useCallback(
    (trade: Omit<TradeEntry, 'id' | 'createdAt' | 'pair'>) => {
      const entry: TradeEntry = {
        ...trade,
        pair: 'XAU/USD',
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      }
      setTrades((prev) => [entry, ...prev])
    },
    [],
  )

  const deleteTrade = useCallback((id: string) => {
    setTrades((prev) => prev.filter((t) => t.id !== id))
  }, [])

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
      selectedDate,
      setSelectedDate,
      strategyFilter,
      setStrategyFilter,
      addTrade,
      deleteTrade,
      stats,
      filteredTrades,
      filteredByStrategy,
    }),
    [
      trades,
      selectedDate,
      strategyFilter,
      addTrade,
      deleteTrade,
      stats,
      filteredTrades,
      filteredByStrategy,
    ],
  )

  return (
    <TradeContext.Provider value={value}>{children}</TradeContext.Provider>
  )
}

export function useTrades() {
  const ctx = useContext(TradeContext)
  if (!ctx) throw new Error('useTrades must be used within TradeProvider')
  return ctx
}

export type { TradeImage }
