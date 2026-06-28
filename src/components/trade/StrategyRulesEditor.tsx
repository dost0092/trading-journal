import { useEffect, useState } from 'react'
import { PencilLine } from 'lucide-react'
import { DialogRoot } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { useStrategyConfig } from '@/context/StrategyConfigContext'
import type { TradeRule } from '@/lib/ruleStorage'
import type { StrategyId } from '@/types/trade'
import { RULE_IDS } from '@/types/trade'

const STRATEGY_IDS: StrategyId[] = ['liquidity_sweep', 'liquidity_run']

interface StrategyRulesEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}

export function StrategyRulesEditor({
  open,
  onOpenChange,
  onSaved,
}: StrategyRulesEditorProps) {
  const { getSetup, saveSetup } = useStrategyConfig()
  const [names, setNames] = useState<Record<StrategyId, string>>(() => getSetup().names)
  const [rulesByStrategy, setRulesByStrategy] = useState<
    Record<StrategyId, TradeRule[]>
  >(() => getSetup().rulesByStrategy)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const setup = getSetup()
    setNames(setup.names)
    setRulesByStrategy(setup.rulesByStrategy)
    setError(null)
  }, [open, getSetup])

  function updateName(id: StrategyId, value: string) {
    setNames((prev) => ({ ...prev, [id]: value }))
  }

  function updateRule(strategy: StrategyId, ruleId: string, label: string) {
    setRulesByStrategy((prev) => ({
      ...prev,
      [strategy]: prev[strategy].map((r) => (r.id === ruleId ? { ...r, label } : r)),
    }))
  }

  function handleSave() {
    const trimmedNames = {
      liquidity_sweep: names.liquidity_sweep.trim(),
      liquidity_run: names.liquidity_run.trim(),
    }

    if (!trimmedNames.liquidity_sweep || !trimmedNames.liquidity_run) {
      setError('Both strategy names are required.')
      return
    }

    const cleanedRules = STRATEGY_IDS.reduce(
      (acc, strategyId) => {
        acc[strategyId] = rulesByStrategy[strategyId].map((r, index) => ({
          ...r,
          label: r.label.trim() || `Rule ${index + 1}`,
        }))
        return acc
      },
      {} as Record<StrategyId, TradeRule[]>,
    )

    saveSetup({ names: trimmedNames, rulesByStrategy: cleanedRules })
    onSaved?.()
    onOpenChange(false)
  }

  return (
    <DialogRoot
      open={open}
      onOpenChange={onOpenChange}
      title="Edit strategy & rules"
      description="Customize both strategy names and their rules. Saved to your browser."
      className="max-w-lg"
    >
      <div className="space-y-6">
        {STRATEGY_IDS.map((strategyId) => (
          <div
            key={strategyId}
            className="space-y-4 rounded-2xl border border-border bg-background p-4"
          >
            <div>
              <Label htmlFor={`name-${strategyId}`}>Strategy name</Label>
              <Input
                id={`name-${strategyId}`}
                value={names[strategyId]}
                onChange={(e) => updateName(strategyId, e.target.value)}
                className="mt-1.5"
                placeholder="Strategy name"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">Rules</p>
              {RULE_IDS.map((ruleId, index) => {
                const rule = rulesByStrategy[strategyId].find((r) => r.id === ruleId)
                return (
                  <div key={ruleId} className="flex items-center gap-2">
                    <span className="w-14 shrink-0 text-xs text-muted">Rule {index + 1}</span>
                    <Input
                      value={rule?.label ?? ''}
                      onChange={(e) => updateRule(strategyId, ruleId, e.target.value)}
                      placeholder={`Write rule ${index + 1}...`}
                      className="flex-1"
                    />
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            <PencilLine className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>
    </DialogRoot>
  )
}
