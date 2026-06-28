import { AnimatePresence, motion } from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox'
import type { StrategyCriteria } from '@/types/trade'

interface CheckboxGroupProps {
  criteria: StrategyCriteria[]
  values: Record<string, boolean>
  onChange: (id: string, checked: boolean) => void
}

export function CheckboxGroup({
  criteria,
  values,
  onChange,
}: CheckboxGroupProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={criteria.map((c) => c.id).join('-')}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
        className="space-y-2"
      >
        {criteria.map((c) => (
          <label
            key={c.id}
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition hover:border-primary/30 hover:bg-blue-50/30"
          >
            <Checkbox
              checked={values[c.id] ?? false}
              onCheckedChange={(checked) => onChange(c.id, checked === true)}
            />
            <span className="text-sm text-foreground">{c.label}</span>
          </label>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}

export function StrategyRulesList({ rules }: { rules: string[] }) {
  return (
    <ul className="space-y-2 rounded-xl border border-border bg-secondary/50 p-4">
      {rules.map((rule, i) => (
        <li key={i} className="flex gap-2 text-sm text-muted">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
          {rule}
        </li>
      ))}
    </ul>
  )
}
