import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Expand,
  Plus,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDayCell } from '@/components/calendar/CalendarDayCell'
import { DialogRoot } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useTrades } from '@/context/TradeContext'
import { useStrategyConfig } from '@/context/StrategyConfigContext'
import { QualityStar } from '@/components/calendar/QualityStar'
import { getRuleCount, getRuleTotal, getStarTier } from '@/lib/tradeUtils'
import { getTradeCountForDateFromIndex, getTradesForDateFromIndex } from '@/lib/tradeStats'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEKDAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

interface CalendarGridProps {
  month: Date
  setMonth: (d: Date) => void
  size: 'compact' | 'full'
  weekdayLabels: string[]
  showTodayButton?: boolean
}

export function CalendarGrid({
  month,
  setMonth,
  size,
  weekdayLabels,
  showTodayButton,
}: CalendarGridProps) {
  const { tradesByDate, selectedDate, setSelectedDate } = useTrades()

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month))
    const end = endOfWeek(endOfMonth(month))
    return eachDayOfInterval({ start, end })
  }, [month])

  const handleSelect = (dateStr: string) => {
    setSelectedDate(selectedDate === dateStr ? null : dateStr)
  }

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setMonth(addMonths(month, -1))}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-muted transition hover:bg-secondary hover:text-foreground"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="text-center">
          <p
            className={cn(
              'font-semibold text-foreground',
              size === 'full' ? 'text-base' : 'text-xs',
            )}
          >
            {format(month, 'MMMM yyyy')}
          </p>
          {showTodayButton && (
            <button
              type="button"
              onClick={() => setMonth(new Date())}
              className="mt-0.5 text-[10px] font-medium text-primary hover:underline"
            >
              Today
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMonth(addMonths(month, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-muted transition hover:bg-secondary hover:text-foreground"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div
        className={cn('grid grid-cols-7', size === 'full' ? 'gap-1' : 'gap-0.5')}
      >
        {weekdayLabels.map((d) => (
          <div
            key={d}
            className={cn(
              'text-center font-medium uppercase tracking-wide text-muted-foreground',
              size === 'full' ? 'py-1 text-[11px]' : 'text-[10px]',
            )}
          >
            {d}
          </div>
        ))}

        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          return (
            <CalendarDayCell
              key={dateStr}
              day={day}
              dateStr={dateStr}
              dayTrades={getTradesForDateFromIndex(tradesByDate, dateStr)}
              month={month}
              selectedDate={selectedDate}
              onSelect={handleSelect}
              size={size}
            />
          )
        })}
      </div>
    </>
  )
}

function CalendarLegend({ className }: { className?: string }) {
  const items: { label: string; tier: 'gold' | 'silver' | 'gray' | 'dot' }[] = [
    { label: '100%', tier: 'gold' },
    { label: '80%+', tier: 'silver' },
    { label: '60%+', tier: 'gray' },
    { label: '<60%', tier: 'dot' },
  ]

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-center gap-x-4 gap-y-2',
        className,
      )}
    >
      {items.map(({ label, tier }) => (
        <div key={label} className="flex items-center gap-1.5">
          <QualityStar tier={tier} />
          <span className="text-[10px] text-muted">{label}</span>
        </div>
      ))}
    </div>
  )
}

function SelectedDayTrades() {
  const { tradesByDate, selectedDate } = useTrades()
  const { getStrategyName } = useStrategyConfig()

  if (!selectedDate) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-secondary/30 px-4 py-8 text-center">
        <CalendarDays className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
        <p className="text-sm text-muted">Select a day to view trades</p>
      </div>
    )
  }

  const dayTrades = getTradesForDateFromIndex(tradesByDate, selectedDate)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">
            {format(parseISO(selectedDate), 'EEEE, MMM d')}
          </p>
          <p className="text-xs text-muted">
            {dayTrades.length} trade{dayTrades.length !== 1 ? 's' : ''} logged
          </p>
        </div>
        <Link to="/entry-trade">
          <Button size="sm" variant="outline">
            <Plus className="h-3.5 w-3.5" />
            Add Trade
          </Button>
        </Link>
      </div>

      {dayTrades.length === 0 ? (
        <div className="rounded-xl border border-border bg-secondary/30 px-4 py-6 text-center">
          <p className="text-sm text-muted">No trades on this day</p>
          <Link
            to="/entry-trade"
            className="mt-2 inline-block text-xs text-primary hover:underline"
          >
            Log your first trade
          </Link>
        </div>
      ) : (
        <div className="max-h-48 space-y-2 overflow-y-auto">
          {dayTrades.map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {getStrategyName(trade.strategy)}
                    </span>
                    <Badge
                      variant={
                        trade.result === 'win'
                          ? 'success'
                          : trade.result === 'loss'
                            ? 'danger'
                            : 'default'
                      }
                    >
                      {trade.result}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted">{trade.time}</p>
                </div>
                <QualityStar tier={getStarTier(getRuleCount(trade), getRuleTotal(trade))} />
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export function CalendarExpandedDialog({
  open,
  onOpenChange,
  month,
  setMonth,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  month: Date
  setMonth: (d: Date) => void
}) {
  const { selectedDate, setSelectedDate } = useTrades()

  return (
    <DialogRoot
      open={open}
      onOpenChange={onOpenChange}
      title="Trading Calendar"
      description="View all trades by day. Numbers show how many trades were logged."
      className="max-w-3xl"
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <CalendarGrid
              month={month}
              setMonth={setMonth}
              size="full"
              weekdayLabels={WEEKDAYS}
              showTodayButton
            />

            <CalendarLegend className="border-t border-border pt-4" />

            <SelectedDayTrades />

            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="w-full text-center text-xs text-primary hover:underline"
              >
                Clear day selection
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </DialogRoot>
  )
}

/** Minimal header button — opens full calendar modal, no inline grid */
export function CalendarHeaderButton() {
  const [month, setMonth] = useState(new Date())
  const [open, setOpen] = useState(false)
  const { tradesByDate, selectedDate } = useTrades()
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayCount = getTradeCountForDateFromIndex(tradesByDate, today)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm transition hover:border-primary/30 hover:bg-blue-50/40"
        title="Open calendar"
      >
        <CalendarDays className="h-4 w-4 text-primary" />
        <span className="hidden font-medium text-foreground sm:inline">
          {format(new Date(), 'MMM d, yyyy')}
        </span>
        <span className="font-medium text-foreground sm:hidden">
          {format(new Date(), 'MMM d')}
        </span>
        {todayCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
            {todayCount}
          </span>
        )}
        {selectedDate && selectedDate !== today && (
          <span className="hidden h-1.5 w-1.5 rounded-full bg-primary md:inline" />
        )}
      </button>

      <CalendarExpandedDialog
        open={open}
        onOpenChange={setOpen}
        month={month}
        setMonth={setMonth}
      />
    </>
  )
}

interface CalendarWidgetProps {
  compact?: boolean
  full?: boolean
  showLegend?: boolean
  expandable?: boolean
  className?: string
}

export function CalendarWidget({
  compact = false,
  full = false,
  showLegend = false,
  expandable = false,
  className,
}: CalendarWidgetProps) {
  const [month, setMonth] = useState(new Date())
  const [expanded, setExpanded] = useState(false)
  const { selectedDate, setSelectedDate } = useTrades()

  const size = full ? 'full' : 'compact'
  const weekdayLabels = full ? WEEKDAYS : WEEKDAYS_SHORT

  return (
    <>
      <div
        className={cn(
          'rounded-2xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
          compact ? 'p-3' : full ? 'p-5' : 'p-4',
          className,
        )}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              {format(month, 'MMMM yyyy')}
            </span>
          </div>
          {expandable && !full && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-primary transition hover:bg-blue-50"
            >
              <Expand className="h-3.5 w-3.5" />
              Expand
            </button>
          )}
        </div>

        <CalendarGrid
          month={month}
          setMonth={setMonth}
          size={size}
          weekdayLabels={weekdayLabels}
          showTodayButton={full}
        />

        {showLegend && (
          <CalendarLegend className="mt-3 border-t border-border pt-2" />
        )}

        {selectedDate && (
          <button
            type="button"
            onClick={() => setSelectedDate(null)}
            className="mt-2 w-full text-center text-[10px] text-primary hover:underline"
          >
            Clear · {format(parseISO(selectedDate), 'MMM d')}
          </button>
        )}
      </div>

      <CalendarExpandedDialog
        open={expanded}
        onOpenChange={setExpanded}
        month={month}
        setMonth={setMonth}
      />
    </>
  )
}
