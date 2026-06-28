import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input, Label, Select, Textarea } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckboxGroup, StrategyRulesList } from '@/components/trade/CheckboxGroup'
import { ImageUpload } from '@/components/trade/ImageUpload'
import { TradeSummary } from '@/components/trade/TradeSummary'
import { STRATEGIES, getStrategy } from '@/data/strategies'
import {
  tradeFormSchema,
  defaultTradeFormValues,
  type TradeFormSchema,
} from '@/lib/tradeSchema'
import type { TradeImage } from '@/types/trade'
import { cn } from '@/lib/utils'

interface TradeFormProps {
  images: TradeImage[]
  onImagesChange: (images: TradeImage[]) => void
  onSubmit: (data: TradeFormSchema, images: TradeImage[]) => void
}

export function TradeForm({ images, onImagesChange, onSubmit }: TradeFormProps) {
  const form = useForm<TradeFormSchema>({
    resolver: zodResolver(tradeFormSchema),
    defaultValues: defaultTradeFormValues,
    mode: 'onChange',
  })

  const { watch, setValue, handleSubmit, control } = form
  const values = watch()
  const strategy = getStrategy(values.strategy)

  useEffect(() => {
    const s = getStrategy(values.strategy)
    if (!s) return
    const criteriaMet: Record<string, boolean> = {}
    s.criteria.forEach((c) => {
      criteriaMet[c.id] = values.criteriaMet[c.id] ?? false
    })
    setValue('criteriaMet', criteriaMet)
  }, [values.strategy, setValue])

  const handleCriteriaChange = (id: string, checked: boolean) => {
    setValue('criteriaMet', { ...values.criteriaMet, [id]: checked })
  }

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data, images))}
      className="grid gap-6 lg:grid-cols-[1fr_300px]"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Trade Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...form.register('date')} />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" {...form.register('time')} />
            </div>
            <div>
              <Label htmlFor="pair">Pair</Label>
              <Input id="pair" placeholder="EUR/USD" {...form.register('pair')} />
            </div>
            <div>
              <Label htmlFor="session">Session</Label>
              <Select id="session" {...form.register('session')}>
                <option value="london">London</option>
                <option value="new_york">New York</option>
                <option value="asia">Asia</option>
                <option value="overlap">Overlap</option>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <Label>Direction</Label>
              <div className="mt-1.5 flex gap-2">
                {(['buy', 'sell'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setValue('direction', d)}
                    className={cn(
                      'flex-1 rounded-xl border py-2 text-sm font-medium capitalize transition',
                      values.direction === d
                        ? d === 'buy'
                          ? 'border-success bg-green-50 text-success'
                          : 'border-danger bg-red-50 text-danger'
                        : 'border-border hover:bg-secondary',
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="risk">Risk %</Label>
              <Input
                id="risk"
                type="number"
                step="0.1"
                {...form.register('riskPercent', { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="lot">Lot Size</Label>
              <Input
                id="lot"
                type="number"
                step="0.01"
                {...form.register('lotSize', { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="entry">Entry</Label>
              <Input
                id="entry"
                type="number"
                step="0.00001"
                {...form.register('entry', { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="sl">Stop Loss</Label>
              <Input
                id="sl"
                type="number"
                step="0.00001"
                {...form.register('stopLoss', { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="tp">Take Profit</Label>
              <Input
                id="tp"
                type="number"
                step="0.00001"
                {...form.register('takeProfit', { valueAsNumber: true })}
              />
            </div>

            <div className="sm:col-span-2">
              <Label>Result</Label>
              <div className="mt-1.5 flex gap-2">
                {(['win', 'loss', 'breakeven'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setValue('result', r)}
                    className={cn(
                      'flex-1 rounded-xl border py-2 text-xs font-medium capitalize transition',
                      values.result === r
                        ? r === 'win'
                          ? 'border-success bg-green-50 text-success'
                          : r === 'loss'
                            ? 'border-danger bg-red-50 text-danger'
                            : 'border-border bg-secondary text-foreground'
                        : 'border-border hover:bg-secondary',
                    )}
                  >
                    {r === 'breakeven' ? 'Break Even' : r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="pnl">PnL ($)</Label>
              <Input
                id="pnl"
                type="number"
                {...form.register('pnl', { valueAsNumber: true })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} {...form.register('notes')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Core Strategy Selection</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {STRATEGIES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setValue('strategy', s.id)}
                className={cn(
                  'rounded-2xl border p-4 text-left transition-all duration-200',
                  values.strategy === s.id
                    ? 'border-primary bg-blue-50/50 shadow-sm'
                    : 'border-border hover:border-primary/30 hover:bg-secondary/50',
                )}
              >
                <p className="text-sm font-semibold">{s.name}</p>
                <p className="mt-1 text-xs text-muted">{s.description}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        {strategy && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle>Strategy Criteria</CardTitle>
              </CardHeader>
              <CardContent>
                <Controller
                  name="criteriaMet"
                  control={control}
                  render={() => (
                    <CheckboxGroup
                      criteria={strategy.criteria}
                      values={values.criteriaMet}
                      onChange={handleCriteriaChange}
                    />
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{strategy.name} Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <StrategyRulesList rules={strategy.rules} />
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Image Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload images={images} onChange={onImagesChange} />
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full sm:w-auto">
          Save Trade Entry
        </Button>
      </div>

      <TradeSummary values={values} images={images} />
    </form>
  )
}
