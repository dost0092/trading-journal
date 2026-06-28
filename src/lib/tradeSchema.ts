import { z } from 'zod'

export const tradeFormSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  pair: z.string().min(1, 'Pair is required'),
  session: z.enum(['london', 'new_york', 'asia', 'overlap']),
  direction: z.enum(['buy', 'sell']),
  riskPercent: z.number().min(0).max(100),
  lotSize: z.number().min(0),
  entry: z.number(),
  stopLoss: z.number(),
  takeProfit: z.number(),
  result: z.enum(['win', 'loss', 'breakeven']),
  pnl: z.number(),
  notes: z.string(),
  strategy: z.enum(['liquidity_sweep', 'liquidity_run']),
  criteriaMet: z.record(z.string(), z.boolean()),
})

export type TradeFormSchema = z.infer<typeof tradeFormSchema>

export const defaultTradeFormValues: TradeFormSchema = {
  date: new Date().toISOString().split('T')[0],
  time: new Date().toTimeString().slice(0, 5),
  pair: 'EUR/USD',
  session: 'london',
  direction: 'buy',
  riskPercent: 1,
  lotSize: 0.5,
  entry: 0,
  stopLoss: 0,
  takeProfit: 0,
  result: 'win',
  pnl: 0,
  notes: '',
  strategy: 'liquidity_sweep',
  criteriaMet: {},
}
