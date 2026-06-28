import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { MOCK_TRADES, calcStats } from '@/data/mockData'
import type { TradeEntry, TradeImage } from '@/types/trade'

interface TradeContextValue {
  trades: TradeEntry[]
  selectedDate: string | null
  setSelectedDate: (date: string | null) => void
  addTrade: (trade: Omit<TradeEntry, 'id' | 'createdAt'>) => void
  deleteTrade: (id: string) => void
  stats: ReturnType<typeof calcStats>
  filteredTrades: TradeEntry[]
}

const TradeContext = createContext<TradeContextValue | null>(null)

export function TradeProvider({ children }: { children: ReactNode }) {
  const [trades, setTrades] = useState<TradeEntry[]>(MOCK_TRADES)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const addTrade = useCallback(
    (trade: Omit<TradeEntry, 'id' | 'createdAt'>) => {
      const entry: TradeEntry = {
        ...trade,
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

  const stats = useMemo(() => calcStats(trades), [trades])

  const filteredTrades = useMemo(() => {
    if (!selectedDate) return trades
    return trades.filter((t) => t.date === selectedDate)
  }, [trades, selectedDate])

  const value = useMemo(
    () => ({
      trades,
      selectedDate,
      setSelectedDate,
      addTrade,
      deleteTrade,
      stats,
      filteredTrades,
    }),
    [trades, selectedDate, addTrade, deleteTrade, stats, filteredTrades],
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
