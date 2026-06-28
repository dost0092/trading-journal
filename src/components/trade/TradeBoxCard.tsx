import { format, parseISO } from 'date-fns'
import { Check, ImageIcon, X } from 'lucide-react'
import { DialogRoot } from '@/components/ui/dialog'
import { QualityStar } from '@/components/calendar/QualityStar'
import { PLACEHOLDER_RULES } from '@/data/strategies'
import { STRATEGY_LABELS } from '@/data/strategies'
import { getRuleCount, getStarTier } from '@/lib/tradeUtils'
import { RULE_IDS, type TradeEntry } from '@/types/trade'
import { cn } from '@/lib/utils'

function getRuleLabel(trade: TradeEntry, ruleId: string): string {
  return trade.ruleLabels?.[ruleId] ?? PLACEHOLDER_RULES.find((r) => r.id === ruleId)?.label ?? ruleId
}

interface TradeBoxCardProps {
  trade: TradeEntry
  onClick: () => void
  active?: boolean
}

const RESULT_STYLE = {
  win: 'text-success',
  loss: 'text-danger',
  breakeven: 'text-muted',
}

/** 50/50 box — image left, minimal details right */
export function TradeBoxCard({ trade, onClick, active }: TradeBoxCardProps) {
  const strategyName = STRATEGY_LABELS[trade.strategy]
  const resultLabel =
    trade.result === 'breakeven' ? 'Break Even' : trade.result
  const ruleCount = getRuleCount(trade)
  const starTier = getStarTier(ruleCount)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'grid h-[110px] w-full grid-cols-2 overflow-hidden rounded-xl border bg-card text-left transition-all',
        active
          ? 'border-primary ring-1 ring-primary/30'
          : 'border-border hover:border-primary/20 hover:shadow-sm',
      )}
    >
      {/* Half — picture */}
      <div className="relative h-full bg-secondary">
        {trade.image ? (
          <img
            src={trade.image.previewUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
          </div>
        )}
      </div>

      {/* Half — details (minimal) */}
      <div className="flex flex-col justify-center gap-1 px-3 py-2">
        <p className="truncate text-xs font-semibold leading-tight">
          {strategyName}
        </p>
        <p className="text-[11px] text-muted">
          {format(parseISO(trade.date), 'MMM d')} · {trade.time}
        </p>
        <p
          className={cn(
            'text-xs font-medium capitalize',
            RESULT_STYLE[trade.result],
          )}
        >
          {resultLabel}
        </p>
        <div className="mt-0.5 flex items-center gap-1">
          <QualityStar tier={starTier} className="h-3.5 w-3.5" />
          <span className="text-[10px] text-muted">{ruleCount}/5 rules</span>
        </div>
      </div>
    </button>
  )
}

interface TradeDetailModalProps {
  trade: TradeEntry | null
  open: boolean
  onClose: () => void
}

export function TradeDetailModal({ trade, open, onClose }: TradeDetailModalProps) {
  if (!trade) return null

  const ruleCount = getRuleCount(trade)
  const starTier = getStarTier(ruleCount)
  const resultLabel =
    trade.result === 'breakeven' ? 'Break Even' : trade.result

  return (
    <DialogRoot
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title="Trade Details"
      description={STRATEGY_LABELS[trade.strategy]}
      className="max-w-md"
    >
      {/* 50/50 — pic + summary */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="aspect-square overflow-hidden rounded-xl border border-border bg-secondary">
          {trade.image ? (
            <img
              src={trade.image.previewUrl}
              alt="Setup"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center gap-2 text-sm">
          <div>
            <p className="text-[11px] text-muted">Date</p>
            <p className="font-medium">
              {format(parseISO(trade.date), 'MMM d, yyyy')}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted">Result</p>
            <p
              className={cn(
                'font-medium capitalize',
                RESULT_STYLE[trade.result],
              )}
            >
              {resultLabel}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted">Rules</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <QualityStar tier={starTier} className="h-4 w-4" />
              <p className="font-medium">{ruleCount}/5</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5 space-y-2 border-t border-border pt-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted">Rules checklist</p>
        <ul className="space-y-1.5">
          {RULE_IDS.map((ruleId) => {
            const met = trade.rulesMet.includes(ruleId)
            return (
              <li
                key={ruleId}
                className={cn(
                  'flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm',
                  met ? 'bg-emerald-50/80' : 'bg-secondary/40',
                )}
              >
                {met ? (
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                ) : (
                  <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                )}
                <span className={cn(!met && 'text-muted')}>{getRuleLabel(trade, ruleId)}</span>
              </li>
            )
          })}
        </ul>
      </div>

      <dl className="space-y-2.5 border-t border-border pt-4 text-sm">
        {[
          ['Time', trade.time],
          ['Direction', trade.direction],
          ['Session', trade.session.replace('_', ' ')],
          ['Entry', trade.entry],
          ['Stop Loss', trade.stopLoss],
          ['Take Profit', trade.takeProfit],
          ['Risk', `${trade.riskPercent}%`],
        ].map(([label, val]) => (
          <div key={label as string} className="flex justify-between gap-4">
            <dt className="text-muted">{label}</dt>
            <dd className="font-medium capitalize">{val}</dd>
          </div>
        ))}
      </dl>
    </DialogRoot>
  )
}
