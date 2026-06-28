export type TradeDirection = 'buy' | 'sell'
export type TradeResult = 'win' | 'loss' | 'breakeven'
export type StrategyId = 'liquidity_sweep' | 'liquidity_run'
export type SessionType = 'london' | 'new_york' | 'asia' | 'overlap'
export type DayStatus = 'win' | 'loss' | 'none'

export interface TradeImage {
  id: string
  name: string
  previewUrl: string
  type: 'chart' | 'before' | 'after' | 'trade'
}

export interface TradeEntry {
  id: string
  date: string
  time: string
  pair: string
  session: SessionType
  direction: TradeDirection
  riskPercent: number
  lotSize: number
  entry: number
  stopLoss: number
  takeProfit: number
  result: TradeResult
  pnl: number
  notes: string
  strategy: StrategyId
  criteriaMet: string[]
  images: TradeImage[]
  createdAt: string
}

export interface StrategyCriteria {
  id: string
  label: string
}

export interface StrategyDefinition {
  id: StrategyId
  name: string
  description: string
  rules: string[]
  criteria: StrategyCriteria[]
}

export interface DashboardStats {
  totalTrades: number
  winRate: number
  monthPnl: number
  weekPnl: number
  avgRR: number
  tradingStreak: number
  winningStreak: number
  losingStreak: number
  profitPercent: number
  lossPercent: number
  drawdownPercent: number
  monthlyPercent: number
  weeklyPercent: number
}

export interface TradeFormValues {
  date: string
  time: string
  pair: string
  session: SessionType
  direction: TradeDirection
  riskPercent: number
  lotSize: number
  entry: number
  stopLoss: number
  takeProfit: number
  result: TradeResult
  pnl: number
  notes: string
  strategy: StrategyId
  criteriaMet: Record<string, boolean>
}
