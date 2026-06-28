import { isSameMonth, isToday } from 'date-fns'
import { QualityStars } from '@/components/calendar/QualityStar'
import { getTradesForDate } from '@/data/mockData'
import { getRuleCount, getStarTier } from '@/lib/tradeUtils'
import type { TradeEntry } from '@/types/trade'
import { cn } from '@/lib/utils'

interface CalendarDayCellProps {
  day: Date
  dateStr: string
  trades: TradeEntry[]
  month: Date
  selectedDate: string | null
  onSelect: (dateStr: string) => void
  size?: 'compact' | 'full'
}

export function CalendarDayCell({
  day,
  dateStr,
  trades,
  month,
  selectedDate,
  onSelect,
}: CalendarDayCellProps) {
  const dayTrades = getTradesForDate(trades, dateStr)
  const starTiers = dayTrades.map((t) => getStarTier(getRuleCount(t)))
  const isSelected = selectedDate === dateStr
  const isTodayDate = isToday(day)
  const inMonth = isSameMonth(day, month)

  return (
    <button
      type="button"
      onClick={() => onSelect(dateStr)}
      disabled={!inMonth}
      className={cn(
        'relative flex h-9 w-full flex-col items-center justify-center rounded-lg transition-colors',
        !inMonth && 'pointer-events-none opacity-0',
        isSelected
          ? 'bg-primary text-white'
          : dayTrades.length > 0
            ? 'bg-secondary/60 hover:bg-secondary'
            : isTodayDate
              ? 'bg-blue-50 text-primary'
              : 'hover:bg-secondary/50',
      )}
    >
      <span
        className={cn(
          'text-[11px] font-medium leading-none',
          isSelected ? 'text-white' : isTodayDate ? 'text-primary' : 'text-foreground',
        )}
      >
        {day.getDate()}
      </span>

      {starTiers.length > 0 && (
        <div
          className={cn(
            'mt-0.5 flex max-w-full flex-wrap justify-center gap-px',
            isSelected && '[&_svg]:fill-white [&_svg]:text-white [&_span]:bg-white/60',
          )}
        >
          <QualityStars tiers={starTiers.slice(0, 3)} />
        </div>
      )}
    </button>
  )
}
