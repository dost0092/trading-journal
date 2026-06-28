import { useMemo, useState } from 'react'
import { CalendarWidget } from '@/components/calendar/CalendarWidget'
import { TradeBoxCard, TradeDetailModal } from '@/components/trade/TradeBoxCard'
import { Select } from '@/components/ui/input'
import { useTrades } from '@/context/TradeContext'
import type { TradeEntry } from '@/types/trade'

export function DailyTradePage() {
  const { filteredTrades, selectedDate } = useTrades()
  const [resultFilter, setResultFilter] = useState('all')
  const [selected, setSelected] = useState<TradeEntry | null>(null)

  const trades = useMemo(() => {
    return filteredTrades.filter((t) => {
      if (resultFilter !== 'all' && t.result !== resultFilter) return false
      return true
    })
  }, [filteredTrades, resultFilter])

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-2">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted">
          {selectedDate ? selectedDate : 'XAU/USD · Gold trades'}
        </p>
        <Select
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value)}
          className="h-8 w-32 text-xs"
        >
          <option value="all">All</option>
          <option value="win">Win</option>
          <option value="loss">Loss</option>
          <option value="breakeven">Break Even</option>
        </Select>
      </div>

      <div className="grid gap-5 md:grid-cols-[1fr_240px]">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {trades.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-border py-16 text-center text-xs text-muted">
              No trades found.
            </div>
          ) : (
            trades.map((trade) => (
              <TradeBoxCard
                key={trade.id}
                trade={trade}
                active={selected?.id === trade.id}
                onClick={() => setSelected(trade)}
              />
            ))
          )}
        </div>

        <div className="md:sticky md:top-20 md:self-start">
          <CalendarWidget compact showLegend />
        </div>
      </div>

      <TradeDetailModal
        trade={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
