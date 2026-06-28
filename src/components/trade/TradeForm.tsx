import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input, Label, Select } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { CheckboxGroup } from '@/components/trade/CheckboxGroup'
import { ImageUpload } from '@/components/trade/ImageUpload'
import { STRATEGIES } from '@/data/strategies'
import {
  getSavedRules,
  rulesToLabelMap,
  saveRules,
  type TradeRule,
} from '@/lib/ruleStorage'
import {
  tradeFormSchema,
  defaultTradeFormValues,
  type TradeFormSchema,
} from '@/lib/tradeSchema'
import { GOLD_PAIR, RULE_IDS } from '@/types/trade'
import type { TradeImage } from '@/types/trade'
import { cn } from '@/lib/utils'

interface TradeFormProps {
  image: TradeImage | null
  onImageChange: (image: TradeImage | null) => void
  onSubmit: (data: TradeFormSchema, image: TradeImage | null) => void
}

function emptyRulesMet(): Record<string, boolean> {
  return Object.fromEntries(RULE_IDS.map((id) => [id, false]))
}

export function TradeForm({ image, onImageChange, onSubmit }: TradeFormProps) {
  const [rules, setRules] = useState<TradeRule[]>(() =>
    getSavedRules(defaultTradeFormValues.strategy),
  )

  const form = useForm<TradeFormSchema>({
    resolver: zodResolver(tradeFormSchema),
    defaultValues: {
      ...defaultTradeFormValues,
      rulesMet: emptyRulesMet(),
      ruleLabels: rulesToLabelMap(getSavedRules(defaultTradeFormValues.strategy)),
    },
    mode: 'onChange',
  })

  const { watch, setValue, handleSubmit } = form
  const values = watch()

  useEffect(() => {
    const savedRules = getSavedRules(values.strategy)
    setRules(savedRules)
    setValue('ruleLabels', rulesToLabelMap(savedRules))
    setValue('rulesMet', emptyRulesMet())
  }, [values.strategy, setValue])

  const handleRuleChange = (id: string, checked: boolean) => {
    setValue('rulesMet', { ...values.rulesMet, [id]: checked })
  }

  const handleLabelChange = (id: string, label: string) => {
    const next = rules.map((r) => (r.id === id ? { ...r, label } : r))
    setRules(next)
    saveRules(values.strategy, next)
    setValue('ruleLabels', rulesToLabelMap(next))
  }

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data, image))} className="mx-auto max-w-2xl space-y-10">
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">Strategy</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {STRATEGIES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setValue('strategy', s.id)}
              className={cn(
                'rounded-2xl border-2 px-6 py-5 text-left transition-all duration-200',
                values.strategy === s.id
                  ? 'border-primary bg-blue-50/40 shadow-sm'
                  : 'border-border bg-card hover:border-primary/25',
              )}
            >
              <p className="text-base font-semibold tracking-tight">{s.name}</p>
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={values.strategy}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <p className="text-xs font-medium uppercase tracking-wider text-muted">Rules</p>
        <CheckboxGroup
          criteria={rules}
          values={values.rulesMet}
          onChange={handleRuleChange}
          onLabelChange={handleLabelChange}
          editable
        />
      </motion.div>

      <Card className="border-border/80 shadow-none">
        <CardContent className="space-y-6 p-6 pt-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <p className="text-sm font-medium text-muted">Instrument</p>
            <p className="text-sm font-semibold">{GOLD_PAIR}</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" className="mt-1.5" {...form.register('date')} />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" className="mt-1.5" {...form.register('time')} />
            </div>
            <div>
              <Label htmlFor="session">Session</Label>
              <Select id="session" className="mt-1.5" {...form.register('session')}>
                <option value="london">London</option>
                <option value="new_york">New York</option>
                <option value="asia">Asia</option>
                <option value="overlap">Overlap</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="risk">Risk %</Label>
              <Input
                id="risk"
                type="number"
                step="0.1"
                className="mt-1.5"
                {...form.register('riskPercent', { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="lot">Lot Size</Label>
              <Input
                id="lot"
                type="number"
                step="0.01"
                className="mt-1.5"
                {...form.register('lotSize', { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="entry">Entry</Label>
              <Input
                id="entry"
                type="number"
                step="0.01"
                className="mt-1.5"
                {...form.register('entry', { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="sl">Stop Loss</Label>
              <Input
                id="sl"
                type="number"
                step="0.01"
                className="mt-1.5"
                {...form.register('stopLoss', { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="tp">Take Profit</Label>
              <Input
                id="tp"
                type="number"
                step="0.01"
                className="mt-1.5"
                {...form.register('takeProfit', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Direction</Label>
            <div className="flex gap-2">
              {(['buy', 'sell'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setValue('direction', d)}
                  className={cn(
                    'flex-1 rounded-xl border py-2.5 text-sm font-medium capitalize transition',
                    values.direction === d
                      ? d === 'buy'
                        ? 'border-success/50 bg-green-50 text-success'
                        : 'border-danger/50 bg-red-50 text-danger'
                      : 'border-border hover:bg-secondary',
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Result</Label>
            <div className="flex gap-2">
              {(['win', 'loss', 'breakeven'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setValue('result', r)}
                  className={cn(
                    'flex-1 rounded-xl border py-2.5 text-sm font-medium capitalize transition',
                    values.result === r
                      ? r === 'win'
                        ? 'border-success/50 bg-green-50 text-success'
                        : r === 'loss'
                          ? 'border-danger/50 bg-red-50 text-danger'
                          : 'border-border bg-secondary'
                      : 'border-border hover:bg-secondary',
                  )}
                >
                  {r === 'breakeven' ? 'Break Even' : r}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">Screenshot</p>
        <ImageUpload image={image} onChange={onImageChange} />
      </div>

      <Button type="submit" size="lg" className="w-full sm:w-auto">
        Save Trade
      </Button>
    </form>
  )
}
