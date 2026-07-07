import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
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
  editableLabels?: boolean
}

export function CheckboxGroup({
  criteria,
  values,
  onChange,
  onLabelChange,
  editableLabels = false,
}: CheckboxGroupProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')

  function startEditing(rule: RuleOption) {
    if (!editableLabels || !onLabelChange) return
    setEditingId(rule.id)
    setDraft(rule.label)
  }

  function commitEdit(ruleId: string) {
    const trimmed = draft.trim()
    if (trimmed && onLabelChange) {
      onLabelChange(ruleId, trimmed)
    }
    setEditingId(null)
    setDraft('')
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        {criteria.map((c) => {
          const checked = values[c.id] ?? false
          const isEditing = editingId === c.id

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
              {isEditing ? (
                <Input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={() => commitEdit(c.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      commitEdit(c.id)
                    }
                    if (e.key === 'Escape') {
                      setEditingId(null)
                      setDraft('')
                    }
                  }}
                  className="h-8 flex-1 text-sm"
                />
              ) : (
                <span
                  className={cn(
                    'flex-1 text-sm',
                    editableLabels && 'cursor-text',
                  )}
                  onDoubleClick={() => startEditing(c)}
                  title={editableLabels ? 'Double-click to edit' : undefined}
                >
                  {c.label}
                </span>
              )}
            </div>
          )
        })}
      </motion.div>
    </AnimatePresence>
  )
}
