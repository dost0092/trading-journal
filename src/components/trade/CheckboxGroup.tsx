import { AnimatePresence, motion } from 'framer-motion'
import { PencilLine } from 'lucide-react'
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
  onLabelChange?: (id: string, label: string) => void
  editable?: boolean
}

export function CheckboxGroup({
  criteria,
  values,
  onChange,
  onLabelChange,
  editable = false,
}: CheckboxGroupProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        {editable && (
          <p className="text-[11px] text-muted">
            Tap the text to edit each rule. Tick when the rule was met.
          </p>
        )}

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

              {editable && onLabelChange ? (
                <div className="relative min-w-0 flex-1">
                  <input
                    type="text"
                    value={c.label}
                    onChange={(e) => onLabelChange(c.id, e.target.value)}
                    placeholder="Write your rule..."
                    className="w-full bg-transparent pr-6 text-sm outline-none placeholder:text-muted-foreground/50 focus:rounded-lg focus:bg-secondary/50 focus:px-2 focus:py-1"
                  />
                  <PencilLine className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/40" />
                </div>
              ) : (
                <span className="text-sm">{c.label}</span>
              )}
            </div>
          )
        })}
      </motion.div>
    </AnimatePresence>
  )
}
