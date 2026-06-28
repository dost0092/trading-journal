import { format, subDays } from 'date-fns'
import type { DayStatus, TradeEntry } from '@/types/trade'

export const MOCK_TRADES: TradeEntry[] = [
  {
    id: '1',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:32',
    pair: 'EUR/USD',
    session: 'london',
    direction: 'buy',
    riskPercent: 1,
    lotSize: 0.5,
    entry: 1.0842,
    stopLoss: 1.0828,
    takeProfit: 1.0878,
    result: 'win',
    pnl: 420,
    notes: 'Clean sweep of Asian low with displacement.',
    strategy: 'liquidity_sweep',
    criteriaMet: ['msb', 'liquidity_grab', 'fvg', 'confirmation', 'rr_valid'],
    images: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    time: '14:15',
    pair: 'GBP/USD',
    session: 'new_york',
    direction: 'sell',
    riskPercent: 0.75,
    lotSize: 0.3,
    entry: 1.2712,
    stopLoss: 1.2735,
    takeProfit: 1.265,
    result: 'win',
    pnl: 310,
    notes: 'NY session liquidity run into SSL.',
    strategy: 'liquidity_run',
    criteriaMet: ['trend', 'expansion', 'session', 'trigger'],
    images: [],
    createdAt: subDays(new Date(), 1).toISOString(),
  },
  {
    id: '3',
    date: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
    time: '08:05',
    pair: 'XAU/USD',
    session: 'london',
    direction: 'buy',
    riskPercent: 1,
    lotSize: 0.2,
    entry: 2342.5,
    stopLoss: 2335,
    takeProfit: 2362,
    result: 'loss',
    pnl: -180,
    notes: 'False break — stopped out at structure.',
    strategy: 'liquidity_sweep',
    criteriaMet: ['msb', 'liquidity_grab'],
    images: [],
    createdAt: subDays(new Date(), 2).toISOString(),
  },
  {
    id: '4',
    date: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
    time: '10:45',
    pair: 'USD/JPY',
    session: 'overlap',
    direction: 'sell',
    riskPercent: 0.5,
    lotSize: 0.4,
    entry: 149.82,
    stopLoss: 150.05,
    takeProfit: 149.2,
    result: 'win',
    pnl: 260,
    notes: 'Overlap session continuation.',
    strategy: 'liquidity_run',
    criteriaMet: ['trend', 'session', 'volume', 'trigger'],
    images: [],
    createdAt: subDays(new Date(), 3).toISOString(),
  },
  {
    id: '5',
    date: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
    time: '07:20',
    pair: 'EUR/USD',
    session: 'london',
    direction: 'sell',
    riskPercent: 1,
    lotSize: 0.5,
    entry: 1.089,
    stopLoss: 1.0905,
    takeProfit: 1.085,
    result: 'breakeven',
    pnl: 0,
    notes: 'Moved to BE after partial target.',
    strategy: 'liquidity_sweep',
    criteriaMet: ['msb', 'fvg', 'confirmation'],
    images: [],
    createdAt: subDays(new Date(), 5).toISOString(),
  },
]

export const EQUITY_DATA = [
  { week: 'W1', equity: 10000 },
  { week: 'W2', equity: 10240 },
  { week: 'W3', equity: 10180 },
  { week: 'W4', equity: 10520 },
  { week: 'W5', equity: 10890 },
  { week: 'W6', equity: 10750 },
  { week: 'W7', equity: 11200 },
  { week: 'W8', equity: 11680 },
]

export const MONTHLY_PERF = [
  { month: 'Jan', pnl: 820 },
  { month: 'Feb', pnl: 1240 },
  { month: 'Mar', pnl: -320 },
  { month: 'Apr', pnl: 980 },
  { month: 'May', pnl: 1460 },
  { month: 'Jun', pnl: 810 },
]

export const RR_DISTRIBUTION = [
  { range: '1:1', count: 4 },
  { range: '1:2', count: 12 },
  { range: '1:3', count: 8 },
  { range: '1:4+', count: 3 },
]

export const WEEKLY_DAILY = [
  { day: 'Mon', pnl: 120 },
  { day: 'Tue', pnl: -80 },
  { day: 'Wed', pnl: 340 },
  { day: 'Thu', pnl: 210 },
  { day: 'Fri', pnl: -40 },
]

export function getDayStatus(trades: TradeEntry[], dateStr: string): DayStatus {
  const dayTrades = trades.filter((t) => t.date === dateStr)
  if (dayTrades.length === 0) return 'none'
  const totalPnl = dayTrades.reduce((s, t) => s + t.pnl, 0)
  if (totalPnl > 0) return 'win'
  if (totalPnl < 0) return 'loss'
  return 'none'
}

export function calcRR(entry: number, sl: number, tp: number): number {
  const risk = Math.abs(entry - sl)
  const reward = Math.abs(tp - entry)
  if (risk === 0) return 0
  return Math.round((reward / risk) * 10) / 10
}

export function calcStats(trades: TradeEntry[]) {
  const wins = trades.filter((t) => t.result === 'win')
  const losses = trades.filter((t) => t.result === 'loss')
  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0)
  const winRate =
    trades.length > 0 ? Math.round((wins.length / trades.length) * 100) : 0

  const now = new Date()
  const monthStart = format(now, 'yyyy-MM')
  const weekAgo = subDays(now, 7)

  const monthTrades = trades.filter((t) => t.date.startsWith(monthStart))
  const weekTrades = trades.filter((t) => new Date(t.date) >= weekAgo)

  const avgRR =
    trades.length > 0
      ? trades.reduce(
          (s, t) => s + calcRR(t.entry, t.stopLoss, t.takeProfit),
          0,
        ) / trades.length
      : 0

  return {
    totalTrades: trades.length,
    winRate,
    monthPnl: monthTrades.reduce((s, t) => s + t.pnl, 0),
    weekPnl: weekTrades.reduce((s, t) => s + t.pnl, 0),
    avgRR: Math.round(avgRR * 10) / 10,
    totalPnl,
    wins: wins.length,
    losses: losses.length,
    profitPercent: trades.length
      ? Math.round((wins.length / trades.length) * 100)
      : 0,
    lossPercent: trades.length
      ? Math.round((losses.length / trades.length) * 100)
      : 0,
    tradingStreak: 5,
    winningStreak: 3,
    losingStreak: 1,
    drawdownPercent: 4.2,
    monthlyPercent: 8.1,
    weeklyPercent: 2.4,
  }
}
