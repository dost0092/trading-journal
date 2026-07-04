import {
  eachDayOfInterval,
  endOfWeek,
  format,
  startOfWeek,
} from 'date-fns'
import { PLACEHOLDER_RULES } from '@/data/strategies'
import type { TradeEntry } from '@/types/trade'

export type StarTier = 'gold' | 'silver' | 'gray' | 'dot'

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function getRuleCount(trade: TradeEntry): number {
  return trade.rulesMet.length
}

export function getRuleIdsForTrade(trade: TradeEntry): string[] {
  const ids = new Set<string>()

  Object.keys(trade.ruleLabels ?? {}).forEach((id) => ids.add(id))
  trade.rulesMet.forEach((id) => ids.add(id))

  if (ids.size === 0) {
    PLACEHOLDER_RULES.forEach((rule) => ids.add(rule.id))
  }

  return Array.from(ids)
}

export function getRuleTotal(trade: TradeEntry): number {
  return getRuleIdsForTrade(trade).length
}

export function getStarTier(ruleCount: number, totalRules: number): StarTier {
  if (totalRules <= 0 || ruleCount <= 0) return 'dot'

  const completion = ruleCount / totalRules
  if (completion >= 1) return 'gold'
  if (completion >= 0.8) return 'silver'
  if (completion >= 0.6) return 'gray'
  return 'dot'
}

export function filterByStrategy(
  trades: TradeEntry[],
  filter: 'all' | TradeEntry['strategy'],
) {
  if (filter === 'all') return trades
  return trades.filter((t) => t.strategy === filter)
}

export function getCurrentWeekRange(reference = new Date()) {
  const start = startOfWeek(reference, { weekStartsOn: 1 })
  const end = endOfWeek(reference, { weekStartsOn: 1 })
  return { start, end }
}

export function getTradesInWeek(
  trades: TradeEntry[],
  reference = new Date(),
) {
  const { start, end } = getCurrentWeekRange(reference)
  const startStr = format(start, 'yyyy-MM-dd')
  const endStr = format(end, 'yyyy-MM-dd')
  return trades
    .filter((t) => t.date >= startStr && t.date <= endStr)
    .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))
}

export function buildWeeklyBreakdown(trades: TradeEntry[], reference = new Date()) {
  const { start, end } = getCurrentWeekRange(reference)
  const days = eachDayOfInterval({ start, end })

  return days.map((day, i) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const dayTrades = trades.filter((t) => t.date === dateStr)
    return {
      day: WEEKDAY_LABELS[i],
      date: dateStr,
      wins: dayTrades.filter((t) => t.result === 'win').length,
      losses: dayTrades.filter((t) => t.result === 'loss').length,
      total: dayTrades.length,
      trades: dayTrades,
    }
  })
}

export function formatWeekRange(reference = new Date()) {
  const { start, end } = getCurrentWeekRange(reference)
  return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`
}
