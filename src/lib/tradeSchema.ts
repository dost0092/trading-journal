import { z } from 'zod'
import { GOLD_PAIR } from '@/types/trade'

export const tradeFormSchema = z.object({
  date: z.string().min(1),
  time: z.string().min(1),
  session: z.enum(['london', 'new_york', 'asia', 'overlap']),
  direction: z.enum(['buy', 'sell']),
  riskPercent: z.number().min(0).max(100),
  lotSize: z.number().min(0),
  entry: z.number(),
  stopLoss: z.number(),
  takeProfit: z.number(),
  result: z.enum(['win', 'loss', 'breakeven']),
  strategy: z.enum(['liquidity_sweep', 'liquidity_run', 'fair_value_gap', 'order_block']),
  rulesMet: z.record(z.string(), z.boolean()),
  ruleLabels: z.record(z.string(), z.string()),
})

export type TradeFormSchema = z.infer<typeof tradeFormSchema>

export const defaultTradeFormValues: TradeFormSchema = {
  date: new Date().toISOString().split('T')[0],
  time: new Date().toTimeString().slice(0, 5),
  session: 'london',
  direction: 'buy',
  riskPercent: 1,
  lotSize: 0.1,
  entry: 0,
  stopLoss: 0,
  takeProfit: 0,
  result: 'win',
  strategy: 'liquidity_sweep',
  rulesMet: {},
  ruleLabels: {},
}

export const GOLD_PAIR_FIXED = GOLD_PAIR
