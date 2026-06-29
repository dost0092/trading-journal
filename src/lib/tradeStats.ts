import { subWeeks, startOfWeek, format, endOfWeek, isWithinInterval } from 'date-fns'
import type { TradeEntry } from '@/types/trade'

export function getTradesForDate(trades: TradeEntry[], dateStr: string) {
  return trades.filter((t) => t.date === dateStr)
}

export function getTradeCountForDate(trades: TradeEntry[], dateStr: string) {
  return getTradesForDate(trades, dateStr).length
}

export function calcStats(trades: TradeEntry[]) {
  const wins = trades.filter((t) => t.result === 'win')
  const losses = trades.filter((t) => t.result === 'loss')
  const winRate =
    trades.length > 0 ? Math.round((wins.length / trades.length) * 100) : 0
  const lossRate =
    trades.length > 0 ? Math.round((losses.length / trades.length) * 100) : 0

  return {
    totalTrades: trades.length,
    winRate,
    lossRate,
    wins: wins.length,
    losses: losses.length,
  }
}

/** Last 6 weeks trade counts for dashboard bar chart */
export function buildPerformanceWeeks(trades: TradeEntry[]) {
  const now = new Date()

  return Array.from({ length: 6 }, (_, index) => {
    const weekStart = startOfWeek(subWeeks(now, 5 - index), { weekStartsOn: 1 })
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
    const count = trades.filter((t) => {
      const d = new Date(`${t.date}T12:00:00`)
      return isWithinInterval(d, { start: weekStart, end: weekEnd })
    }).length

    return {
      week: format(weekStart, 'MMM d'),
      trades: count,
    }
  })
}
