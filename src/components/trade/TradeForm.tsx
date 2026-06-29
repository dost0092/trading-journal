import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { PencilLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Label, Select } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { CheckboxGroup } from '@/components/trade/CheckboxGroup'
import { StrategyRulesEditor } from '@/components/trade/StrategyRulesEditor'
import { ImageUpload } from '@/components/trade/ImageUpload'
import { useStrategyConfig } from '@/context/StrategyConfigContext'
import { rulesToLabelMap } from '@/lib/ruleStorage'
import {
  tradeFormSchema,
  defaultTradeFormValues,
  type TradeFormSchema,
} from '@/lib/tradeSchema'
import { GOLD_PAIR, RULE_IDS, type StrategyId } from '@/types/trade'
import type { TradeImage } from '@/types/trade'
import { cn } from '@/lib/utils'

interface TradeFormProps {
  image: TradeImage | null
  onImageChange: (image: TradeImage | null) => void
  onSubmit: (data: TradeFormSchema, image: TradeImage | null) => void | Promise<void>
  saving?: boolean
}

const STRATEGY_IDS: StrategyId[] = ['liquidity_sweep', 'liquidity_run']

function emptyRulesMet(): Record<string, boolean> {
  return Object.fromEntries(RULE_IDS.map((id) => [id, false]))
}

export function TradeForm({ image, onImageChange, onSubmit, saving = false }: TradeFormProps) {
  const { getStrategyName, getRules, refresh } = useStrategyConfig()
  const [editorOpen, setEditorOpen] = useState(false)
  const [rules, setRules] = useState(() => getRules(defaultTradeFormValues.strategy))

  const form = useForm<TradeFormSchema>({
    resolver: zodResolver(tradeFormSchema),
    defaultValues: {
      ...defaultTradeFormValues,
      rulesMet: emptyRulesMet(),
      ruleLabels: rulesToLabelMap(getRules(defaultTradeFormValues.strategy)),
    },
    mode: 'onChange',
  })

  const { watch, setValue, handleSubmit } = form
  const values = watch()

  const syncRulesForStrategy = (strategy: StrategyId) => {
    const savedRules = getRules(strategy)
    setRules(savedRules)
    setValue('ruleLabels', rulesToLabelMap(savedRules))
    setValue('rulesMet', emptyRulesMet())
  }

  useEffect(() => {
    syncRulesForStrategy(values.strategy)
  }, [values.strategy, getRules, setValue])

  const handleRuleChange = (id: string, checked: boolean) => {
    setValue('rulesMet', { ...values.rulesMet, [id]: checked })
  }

  const handleEditorSaved = () => {
    refresh()
    syncRulesForStrategy(values.strategy)
  }

  return (
    <>
      <form
        onSubmit={handleSubmit((data) => onSubmit(data, image))}
        className="mx-auto max-w-2xl space-y-10"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted">Strategy</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditorOpen(true)}
            >
              <PencilLine className="h-3.5 w-3.5" />
              Edit strategy & rules
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {STRATEGY_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setValue('strategy', id)}
                className={cn(
                  'rounded-2xl border-2 px-6 py-5 text-left transition-all duration-200',
                  values.strategy === id
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-border bg-card hover:border-primary/25',
                )}
              >
                <p className="text-base font-semibold tracking-tight">{getStrategyName(id)}</p>
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
          <p className="text-[11px] text-muted">
            Tick each rule you followed on this trade. Use Edit to change rule text.
          </p>
          <CheckboxGroup
            criteria={rules}
            values={values.rulesMet}
            onChange={handleRuleChange}
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
                          ? 'border-success/50 bg-success/10 text-success'
                          : 'border-danger/50 bg-danger/10 text-danger'
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
                          ? 'border-success/50 bg-success/10 text-success'
                          : r === 'loss'
                            ? 'border-danger/50 bg-danger/10 text-danger'
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

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={saving}>
        {saving ? 'Saving...' : 'Save Trade'}
      </Button>
      </form>

      <StrategyRulesEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSaved={handleEditorSaved}
      />
    </>
  )
}
