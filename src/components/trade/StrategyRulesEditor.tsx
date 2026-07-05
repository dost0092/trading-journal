import { useEffect, useState } from 'react'
import { PencilLine, Plus, Trash2 } from 'lucide-react'
import { DialogRoot } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { useStrategyConfig } from '@/context/StrategyConfigContext'
import type { TradeRule } from '@/lib/ruleStorage'
import type { StrategySetup } from '@/lib/strategyConfigService'
import { STRATEGY_IDS } from '@/data/strategies'
import type { StrategyId } from '@/types/trade'

interface StrategyRulesEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: (setup: StrategySetup) => void
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
  const [saving, setSaving] = useState(false)

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

  function addRule(strategy: StrategyId) {
    setRulesByStrategy((prev) => ({
      ...prev,
      [strategy]: [
        ...prev[strategy],
        { id: `rule_${crypto.randomUUID()}`, label: '' },
      ],
    }))
  }

  function deleteRule(strategy: StrategyId, ruleId: string) {
    setRulesByStrategy((prev) => ({
      ...prev,
      [strategy]: prev[strategy].filter((r) => r.id !== ruleId),
    }))
  }

  async function handleSave() {
    const trimmedNames = Object.fromEntries(
      STRATEGY_IDS.map((id) => [id, names[id].trim()]),
    ) as Record<StrategyId, string>

    if (STRATEGY_IDS.some((id) => !trimmedNames[id])) {
      setError('All strategy names are required.')
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

    setSaving(true)
    setError(null)
    const setup = { names: trimmedNames, rulesByStrategy: cleanedRules }
    const err = await saveSetup(setup)
    setSaving(false)
    if (err) {
      setError(err)
      return
    }
    onSaved?.(setup)
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
              {rulesByStrategy[strategyId].map((rule, index) => {
                return (
                  <div key={rule.id} className="flex items-center gap-2">
                    <span className="w-14 shrink-0 text-xs text-muted">Rule {index + 1}</span>
                    <Input
                      value={rule.label}
                      onChange={(e) => updateRule(strategyId, rule.id, e.target.value)}
                      placeholder={`Write rule ${index + 1}...`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRule(strategyId, rule.id)}
                      aria-label={`Delete rule ${index + 1}`}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted" />
                    </Button>
                  </div>
                )
              })}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addRule(strategyId)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Rule
              </Button>
            </div>
          </div>
        ))}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            <PencilLine className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </DialogRoot>
  )
}
