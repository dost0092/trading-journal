import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { useTrades } from '@/context/TradeContext'
import { getDayStatus } from '@/data/mockData'
import type { DayStatus } from '@/types/trade'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const DOT: Record<DayStatus, string> = {
  win: 'bg-success',
  loss: 'bg-danger',
  none: 'bg-gray-300',
}

interface CalendarWidgetProps {
  compact?: boolean
  showLegend?: boolean
  className?: string
}

export function CalendarWidget({
  compact = false,
  showLegend = false,
  className,
}: CalendarWidgetProps) {
  const { trades, selectedDate, setSelectedDate } = useTrades()
  const [month, setMonth] = useState(new Date())
  const today = new Date()

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month))
    const end = endOfWeek(endOfMonth(month))
    return eachDayOfInterval({ start, end })
  }, [month])

  const handleDayClick = (day: Date) => {
    const ds = format(day, 'yyyy-MM-dd')
    setSelectedDate(selectedDate === ds ? null : ds)
  }

  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card',
        compact ? 'p-2.5' : 'p-4',
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth((m) => addMonths(m, -1))}
          className="rounded-lg p-1 text-muted transition hover:bg-secondary"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span
          className={cn(
            'font-medium text-foreground',
            compact ? 'text-[11px]' : 'text-xs',
          )}
        >
          {format(month, 'MMM yyyy')}
        </span>
        <button
          type="button"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          className="rounded-lg p-1 text-muted transition hover:bg-secondary"
          aria-label="Next month"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className={cn(
              'text-center font-medium text-muted-foreground',
              compact ? 'text-[9px]' : 'text-[10px]',
            )}
          >
            {d}
          </div>
        ))}

        {days.map((day) => {
          const ds = format(day, 'yyyy-MM-dd')
          const status = getDayStatus(trades, ds)
          const isSelected = selectedDate === ds
          const isToday = isSameDay(day, today)
          const inMonth = isSameMonth(day, month)

          return (
            <button
              key={ds}
              type="button"
              onClick={() => handleDayClick(day)}
              className={cn(
                'relative mx-auto flex flex-col items-center justify-center rounded-lg transition-all',
                compact ? 'h-6 w-6 text-[10px]' : 'h-8 w-8 text-xs',
                !inMonth && 'opacity-30',
                isSelected
                  ? 'bg-primary text-white'
                  : isToday
                    ? 'font-semibold text-primary hover:bg-blue-50'
                    : 'text-foreground hover:bg-secondary',
              )}
            >
              {day.getDate()}
              {inMonth && (
                <span
                  className={cn(
                    'absolute bottom-0.5 h-1 w-1 rounded-full',
                    isSelected ? 'bg-white' : DOT[status],
                  )}
                />
              )}
            </button>
          )
        })}
      </div>

      {showLegend && (
        <div className="mt-3 flex items-center justify-center gap-4 border-t border-border pt-3">
          {(
            [
              ['Win', 'bg-success'],
              ['Loss', 'bg-danger'],
              ['No Trade', 'bg-gray-300'],
            ] as const
          ).map(([label, color]) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={cn('h-1.5 w-1.5 rounded-full', color)} />
              <span className="text-[10px] text-muted">{label}</span>
            </div>
          ))}
        </div>
      )}

      {selectedDate && (
        <button
          type="button"
          onClick={() => setSelectedDate(null)}
          className="mt-2 w-full text-center text-[10px] text-primary hover:underline"
        >
          Clear filter ({format(parseISO(selectedDate), 'MMM d')})
        </button>
      )}
    </div>
  )
}
