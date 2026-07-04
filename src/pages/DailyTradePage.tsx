import { useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { CalendarWidget } from '@/components/calendar/CalendarWidget'
import { TradeBoxCard, TradeDetailModal } from '@/components/trade/TradeBoxCard'
import { TradeEditDialog } from '@/components/trade/TradeEditDialog'
import { Select } from '@/components/ui/input'
import { useTrades } from '@/context/TradeContext'
import type { TradeEntry } from '@/types/trade'

export function DailyTradePage() {
  const { filteredTrades, selectedDate, deleteTrade } = useTrades()
  const [resultFilter, setResultFilter] = useState('all')
  const [selected, setSelected] = useState<TradeEntry | null>(null)
  const [editing, setEditing] = useState<TradeEntry | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trades = useMemo(() => {
    return filteredTrades.filter((t) => {
      if (resultFilter !== 'all' && t.result !== resultFilter) return false
      return true
    })
  }, [filteredTrades, resultFilter])

  const groupedTrades = useMemo(() => {
    const groups = new Map<string, TradeEntry[]>()

    trades.forEach((trade) => {
      const dateTrades = groups.get(trade.date) ?? []
      dateTrades.push(trade)
      groups.set(trade.date, dateTrades)
    })

    return Array.from(groups.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, dateTrades]) => ({ date, trades: dateTrades }))
  }, [trades])

  async function handleDelete(trade: TradeEntry) {
    if (!window.confirm('Delete this trade? This cannot be undone.')) return
    setDeleting(true)
    setError(null)
    const err = await deleteTrade(trade.id)
    setDeleting(false)
    if (err) {
      setError(err)
      return
    }
    setSelected(null)
  }

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

      {error && (
        <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
      )}

      <div className="grid gap-5 md:grid-cols-[1fr_240px]">
        <div className="space-y-5">
          {trades.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center text-xs text-muted">
              No trades found.
            </div>
          ) : (
            groupedTrades.map((group) => (
              <section key={group.date} className="space-y-3">
                <div className="flex items-center gap-3">
                  <p className="shrink-0 text-xs font-medium uppercase tracking-wider text-muted">
                    {format(parseISO(group.date), 'MMM d, yyyy')}
                  </p>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {group.trades.map((trade) => (
                    <TradeBoxCard
                      key={trade.id}
                      trade={trade}
                      active={selected?.id === trade.id}
                      onClick={() => setSelected(trade)}
                    />
                  ))}
                </div>
              </section>
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
        onEdit={(trade) => {
          setSelected(null)
          setEditing(trade)
        }}
        onDelete={handleDelete}
        deleting={deleting}
      />

      <TradeEditDialog trade={editing} onClose={() => setEditing(null)} />
    </div>
  )
}
