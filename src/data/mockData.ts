import { format, subDays } from 'date-fns'
import type { TradeEntry } from '@/types/trade'
import { GOLD_PAIR } from '@/types/trade'

export const MOCK_TRADES: TradeEntry[] = [
  {
    id: '1',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:32',
    pair: GOLD_PAIR,
    session: 'london',
    direction: 'buy',
    riskPercent: 1,
    lotSize: 0.1,
    entry: 2342.5,
    stopLoss: 2335,
    takeProfit: 2362,
    result: 'win',
    strategy: 'liquidity_sweep',
    rulesMet: ['rule1', 'rule2', 'rule3', 'rule4', 'rule5'],
    image: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '14:15',
    pair: GOLD_PAIR,
    session: 'new_york',
    direction: 'sell',
    riskPercent: 0.75,
    lotSize: 0.1,
    entry: 2358,
    stopLoss: 2365,
    takeProfit: 2340,
    result: 'win',
    strategy: 'liquidity_run',
    rulesMet: ['rule1', 'rule2', 'rule3', 'rule4'],
    image: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    time: '08:05',
    pair: GOLD_PAIR,
    session: 'london',
    direction: 'buy',
    riskPercent: 1,
    lotSize: 0.1,
    entry: 2342.5,
    stopLoss: 2335,
    takeProfit: 2362,
    result: 'loss',
    strategy: 'liquidity_sweep',
    rulesMet: ['rule1', 'rule2'],
    image: null,
    createdAt: subDays(new Date(), 1).toISOString(),
  },
  {
    id: '4',
    date: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
    time: '10:45',
    pair: GOLD_PAIR,
    session: 'overlap',
    direction: 'sell',
    riskPercent: 0.5,
    lotSize: 0.1,
    entry: 2360,
    stopLoss: 2368,
    takeProfit: 2345,
    result: 'win',
    strategy: 'liquidity_run',
    rulesMet: ['rule1', 'rule2', 'rule3'],
    image: null,
    createdAt: subDays(new Date(), 2).toISOString(),
  },
  {
    id: '5',
    date: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
    time: '07:20',
    pair: GOLD_PAIR,
    session: 'london',
    direction: 'sell',
    riskPercent: 1,
    lotSize: 0.1,
    entry: 2355,
    stopLoss: 2362,
    takeProfit: 2340,
    result: 'breakeven',
    strategy: 'liquidity_sweep',
    rulesMet: ['rule1', 'rule2', 'rule3'],
    image: null,
    createdAt: subDays(new Date(), 3).toISOString(),
  },
]

export const PERFORMANCE_WEEKS = [
  { week: 'W1', trades: 3 },
  { week: 'W2', trades: 5 },
  { week: 'W3', trades: 2 },
  { week: 'W4', trades: 4 },
  { week: 'W5', trades: 6 },
  { week: 'W6', trades: 3 },
]

export const WEEKLY_BREAKDOWN = [
  { day: 'Mon', wins: 1, losses: 0 },
  { day: 'Tue', wins: 0, losses: 1 },
  { day: 'Wed', wins: 2, losses: 0 },
  { day: 'Thu', wins: 1, losses: 0 },
  { day: 'Fri', wins: 0, losses: 1 },
]

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
