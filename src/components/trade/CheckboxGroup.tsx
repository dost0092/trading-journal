import { AnimatePresence, motion } from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface RuleOption {
  id: string
  label: string
}

interface CheckboxGroupProps {
  criteria: RuleOption[]
  values: Record<string, boolean>
  onChange: (id: string, checked: boolean) => void
}

export function CheckboxGroup({ criteria, values, onChange }: CheckboxGroupProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        {criteria.map((c) => {
          const checked = values[c.id] ?? false

          return (
            <div
              key={c.id}
              className={cn(
                'flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition',
                checked && 'border-primary/25 bg-primary/5',
              )}
            >
              <Checkbox
                checked={checked}
                onCheckedChange={(v) => onChange(c.id, v === true)}
                aria-label={`Rule met: ${c.label}`}
              />
              <span className="text-sm">{c.label}</span>
            </div>
          )
        })}
      </motion.div>
    </AnimatePresence>
  )
}
