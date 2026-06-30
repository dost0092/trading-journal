import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CalendarWidget } from '@/components/calendar/CalendarWidget'
import { ChartCard } from '@/components/dashboard/ChartCard'
import { TradeBoxCard, TradeDetailModal } from '@/components/trade/TradeBoxCard'
import { TradeEditDialog } from '@/components/trade/TradeEditDialog'
import { calcStats } from '@/lib/tradeStats'
import { useTrades } from '@/context/TradeContext'
import {
  buildWeeklyBreakdown,
  formatWeekRange,
  getTradesInWeek,
} from '@/lib/tradeUtils'
import type { TradeEntry } from '@/types/trade'

export function WeeklyReportPage() {
  const { filteredByStrategy, deleteTrade } = useTrades()
  const [selected, setSelected] = useState<TradeEntry | null>(null)
  const [editing, setEditing] = useState<TradeEntry | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const weekTrades = useMemo(
    () => getTradesInWeek(filteredByStrategy),
    [filteredByStrategy],
  )

  const weekStats = useMemo(() => calcStats(weekTrades), [weekTrades])

  const weekDays = useMemo(
    () => buildWeeklyBreakdown(filteredByStrategy),
    [filteredByStrategy],
  )

  const pieData = [
    { name: 'Win', value: weekStats.winRate, color: '#22C55E' },
    { name: 'Loss', value: weekStats.lossRate, color: '#EF4444' },
  ]

  const breakdownTotal = weekDays.reduce((s, d) => s + d.total, 0)

  return (
    <div className="mx-auto max-w-6xl space-y-10 py-4">
      {error && (
        <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
      )}
      <div>
        <p className="text-xs text-muted">Week of {formatWeekRange()}</p>
        <div className="mt-4 grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-semibold tracking-tight">
              {weekStats.totalTrades}
            </p>
            <p className="mt-2 text-sm text-muted">Total Trades</p>
          </div>
          <div>
            <p className="text-3xl font-semibold tracking-tight">
              {weekStats.winRate}%
            </p>
            <p className="mt-2 text-sm text-muted">Weekly Win</p>
            <p className="mt-1 text-xs text-muted">{weekStats.wins} wins</p>
          </div>
          <div>
            <p className="text-3xl font-semibold tracking-tight">
              {weekStats.lossRate}%
            </p>
            <p className="mt-2 text-sm text-muted">Weekly Loss</p>
            <p className="mt-1 text-xs text-muted">{weekStats.losses} losses</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_240px]">
        <ChartCard
          title="Win / Loss"
          description={`${weekStats.totalTrades} trades this week`}
        >
          <div className="flex h-48 items-center justify-center">
            {weekStats.totalTrades > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={4}
                    label={({ name, value }) => `${name} ${value}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #E8E8E8',
                      fontSize: 12,
                    }}
                    formatter={(v) => [`${v}%`, '']}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={28}
                    formatter={(value) => (
                      <span className="text-xs text-muted">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted">No trades this week</p>
            )}
          </div>
        </ChartCard>

        <CalendarWidget compact showLegend />
      </div>

      <ChartCard
        title="Weekly Breakdown"
        description={`Mon – Sun · ${breakdownTotal} total trades`}
      >
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekDays}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #E8E8E8',
                  fontSize: 12,
                }}
                formatter={(value, name) => {
                  const labels: Record<string, string> = {
                    wins: 'Wins',
                    losses: 'Losses',
                    total: 'Total',
                  }
                  return [value, labels[String(name)] ?? name]
                }}
              />
              <Legend
                verticalAlign="top"
                height={24}
                formatter={(value) => (
                  <span className="text-xs capitalize text-muted">{value}</span>
                )}
              />
              <Bar dataKey="wins" name="Wins" fill="#22C55E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="losses" name="Losses" fill="#EF4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total" name="Total" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* This week's trades — Mon → Sun */}
      <div className="space-y-8">
        <p className="text-sm font-semibold">This Week&apos;s Trades</p>

        {weekTrades.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted">
            No trades logged this week.
          </div>
        ) : (
          weekDays.map(({ day, date, trades, total }) => (
            <div key={date} className="space-y-3">
              <div className="flex items-baseline justify-between">
                <p className="text-xs font-medium text-foreground">
                  {day}
                  <span className="ml-2 font-normal text-muted">
                    {date}
                  </span>
                </p>
                <span className="text-[11px] text-muted">
                  {total} trade{total !== 1 ? 's' : ''}
                </span>
              </div>

              {trades.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {trades.map((trade) => (
                    <TradeBoxCard
                      key={trade.id}
                      trade={trade}
                      active={selected?.id === trade.id}
                      onClick={() => setSelected(trade)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-muted">No trades</p>
              )}
            </div>
          ))
        )}
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
