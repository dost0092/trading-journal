import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { CalendarWidget } from '@/components/calendar/CalendarWidget'
import { TradeCard } from '@/components/trade/TradeCard'
import { Input, Select } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useTrades } from '@/context/TradeContext'
import type { TradeEntry } from '@/types/trade'

export function DailyTradePage() {
  const { filteredTrades, selectedDate } = useTrades()
  const [search, setSearch] = useState('')
  const [pairFilter, setPairFilter] = useState('all')
  const [strategyFilter, setStrategyFilter] = useState('all')
  const [resultFilter, setResultFilter] = useState('all')
  const [selected, setSelected] = useState<TradeEntry | null>(null)

  const trades = useMemo(() => {
    return filteredTrades.filter((t) => {
      if (search && !t.pair.toLowerCase().includes(search.toLowerCase())) return false
      if (pairFilter !== 'all' && t.pair !== pairFilter) return false
      if (strategyFilter !== 'all' && t.strategy !== strategyFilter) return false
      if (resultFilter !== 'all' && t.result !== resultFilter) return false
      return true
    })
  }, [filteredTrades, search, pairFilter, strategyFilter, resultFilter])

  const pairs = [...new Set(filteredTrades.map((t) => t.pair))]

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search pair..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={pairFilter} onChange={(e) => setPairFilter(e.target.value)} className="w-32">
            <option value="all">All Pairs</option>
            {pairs.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
          <Select value={strategyFilter} onChange={(e) => setStrategyFilter(e.target.value)} className="w-40">
            <option value="all">All Strategies</option>
            <option value="liquidity_sweep">Liquidity Sweep</option>
            <option value="liquidity_run">Liquidity Run</option>
          </Select>
          <Select value={resultFilter} onChange={(e) => setResultFilter(e.target.value)} className="w-32">
            <option value="all">All Results</option>
            <option value="win">Win</option>
            <option value="loss">Loss</option>
            <option value="breakeven">Break Even</option>
          </Select>
        </div>

        {selectedDate && (
          <p className="text-xs text-primary">
            Filtering by {selectedDate} — use calendar to change
          </p>
        )}

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Trade Timeline</h3>
          {trades.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted">
                No trades found for current filters.
              </CardContent>
            </Card>
          ) : (
            trades.map((trade) => (
              <TradeCard
                key={trade.id}
                trade={trade}
                onClick={() => setSelected(trade)}
              />
            ))
          )}
        </div>
      </div>

      <div className="space-y-4">
        <CalendarWidget showLegend />

        {selected && (
          <Card>
            <CardContent className="space-y-2 p-4">
              <p className="text-sm font-semibold">{selected.pair} Details</p>
              <p className="text-xs text-muted">{selected.notes || 'No notes'}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <span className="text-muted">Entry</span>
                <span>{selected.entry}</span>
                <span className="text-muted">SL</span>
                <span>{selected.stopLoss}</span>
                <span className="text-muted">TP</span>
                <span>{selected.takeProfit}</span>
                <span className="text-muted">Session</span>
                <span className="capitalize">{selected.session.replace('_', ' ')}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
