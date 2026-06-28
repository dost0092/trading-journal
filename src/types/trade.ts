export type TradeDirection = 'buy' | 'sell'
export type TradeResult = 'win' | 'loss' | 'breakeven'
export type StrategyId = 'liquidity_sweep' | 'liquidity_run'
export type SessionType = 'london' | 'new_york' | 'asia' | 'overlap'
export type StrategyFilter = 'all' | StrategyId

export interface TradeImage {
  id: string
  name: string
  previewUrl: string
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
  strategy: StrategyId
  /** Checked rule ids — used for calendar star scoring */
  rulesMet: string[]
  image: TradeImage | null
  createdAt: string
}

export const GOLD_PAIR = 'XAU/USD'

export const RULE_IDS = ['rule1', 'rule2', 'rule3', 'rule4', 'rule5'] as const
