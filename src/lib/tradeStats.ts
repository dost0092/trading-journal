import { subWeeks, startOfWeek, format, endOfWeek, isWithinInterval } from 'date-fns'
import type { TradeEntry } from '@/types/trade'

export function buildTradesByDateIndex(trades: TradeEntry[]): Map<string, TradeEntry[]> {
  const index = new Map<string, TradeEntry[]>()

  for (const trade of trades) {
    const existing = index.get(trade.date)
    if (existing) {
      existing.push(trade)
    } else {
      index.set(trade.date, [trade])
    }
  }

  return index
}

export function getTradesForDate(trades: TradeEntry[], dateStr: string) {
  return trades.filter((t) => t.date === dateStr)
}

export function getTradesForDateFromIndex(
  index: Map<string, TradeEntry[]>,
  dateStr: string,
) {
  return index.get(dateStr) ?? []
}

export function getTradeCountForDate(trades: TradeEntry[], dateStr: string) {
  return getTradesForDate(trades, dateStr).length
}

export function getTradeCountForDateFromIndex(
  index: Map<string, TradeEntry[]>,
  dateStr: string,
) {
  return index.get(dateStr)?.length ?? 0
}

export function calcStats(trades: TradeEntry[]) {
  let wins = 0
  let losses = 0

  for (const trade of trades) {
    if (trade.result === 'win') wins += 1
    else if (trade.result === 'loss') losses += 1
  }

  const total = trades.length
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0
  const lossRate = total > 0 ? Math.round((losses / total) * 100) : 0

  return {
    totalTrades: total,
    winRate,
    lossRate,
    wins,
    losses,
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
