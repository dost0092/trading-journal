import { Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { calcRR } from '@/data/mockData'
import { getStrategy } from '@/data/strategies'
import type { TradeFormSchema } from '@/lib/tradeSchema'
import type { TradeImage } from '@/types/trade'

interface TradeSummaryProps {
  values: TradeFormSchema
  images: TradeImage[]
}

export function TradeSummary({ values, images }: TradeSummaryProps) {
  const strategy = getStrategy(values.strategy)
  const rr = calcRR(values.entry, values.stopLoss, values.takeProfit)
  const criteriaCount = Object.values(values.criteriaMet).filter(Boolean).length
  const criteriaTotal = strategy?.criteria.length ?? 0

  const rows = [
    { label: 'Strategy', value: strategy?.name ?? '—' },
    {
      label: 'Result',
      value: values.result,
      badge: true,
    },
    { label: 'Risk', value: `${values.riskPercent}%` },
    { label: 'Reward (RR)', value: rr > 0 ? `1:${rr}` : '—' },
    {
      label: 'PnL',
      value: `${values.pnl >= 0 ? '+' : ''}$${values.pnl}`,
      color: values.pnl >= 0 ? 'text-success' : values.pnl < 0 ? 'text-danger' : '',
    },
    { label: 'Images', value: `${images.length} uploaded` },
    {
      label: 'Criteria',
      value: `${criteriaCount}/${criteriaTotal} met`,
    },
    {
      label: 'Status',
      value: criteriaCount >= criteriaTotal * 0.6 ? 'Valid Setup' : 'Incomplete',
    },
  ]

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Trade Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map(({ label, value, badge, color }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs text-muted">{label}</span>
            {badge ? (
              <Badge
                variant={
                  value === 'win'
                    ? 'success'
                    : value === 'loss'
                      ? 'danger'
                      : 'default'
                }
              >
                {value}
              </Badge>
            ) : (
              <span className={`text-sm font-medium capitalize ${color ?? ''}`}>
                {value}
              </span>
            )}
          </div>
        ))}

        <Separator />

        <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3">
          <Check className="h-4 w-4 text-success" />
          <p className="text-xs text-success">
            Live preview — updates as you fill the form
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
