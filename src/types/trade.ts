export type TradeDirection = 'buy' | 'sell'
export type TradeResult = 'win' | 'loss' | 'breakeven'
export type StrategyId =
  | 'liquidity_sweep'
  | 'liquidity_run'
  | 'fair_value_gap'
  | 'order_block'
export type SessionType = 'london' | 'new_york' | 'asia' | 'overlap'
export type StrategyFilter = 'all' | StrategyId

export interface TradeImage {
  id: string
  name: string
  previewUrl: string
  file?: File
  /** Storage path in trade-images bucket (for edits without re-uploading) */
  storagePath?: string
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
  /** Custom rule text saved with the trade */
  ruleLabels?: Record<string, string>
  /** Free-form journal notes (emotions, psychology, lessons learned) */
  remark?: string
  image: TradeImage | null
  createdAt: string
}

export const GOLD_PAIR = 'XAU/USD'
