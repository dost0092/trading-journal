import type { TradeFormSchema } from '@/lib/tradeSchema'
import { RULE_IDS, type TradeEntry } from '@/types/trade'

export function tradeToFormValues(trade: TradeEntry): TradeFormSchema {
  const rulesMet = Object.fromEntries(
    RULE_IDS.map((id) => [id, trade.rulesMet.includes(id)]),
  )

  return {
    date: trade.date,
    time: trade.time,
    session: trade.session,
    direction: trade.direction,
    riskPercent: trade.riskPercent,
    lotSize: trade.lotSize,
    entry: trade.entry,
    stopLoss: trade.stopLoss,
    takeProfit: trade.takeProfit,
    result: trade.result,
    strategy: trade.strategy,
    rulesMet,
    ruleLabels: trade.ruleLabels ?? {},
  }
}
