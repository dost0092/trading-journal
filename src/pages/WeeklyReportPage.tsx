import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CalendarWidget } from '@/components/calendar/CalendarWidget'
import { ChartCard } from '@/components/dashboard/ChartCard'
import { StatCard } from '@/components/dashboard/StatCard'
import { TradeCard } from '@/components/trade/TradeCard'
import { WEEKLY_DAILY } from '@/data/mockData'
import { useTrades } from '@/context/TradeContext'
import { DollarSign, Percent, Target, TrendingUp } from 'lucide-react'

export function WeeklyReportPage() {
  const { trades, stats } = useTrades()
  const weekTrades = trades.slice(0, 8)

  const winLoss = [
    { name: 'Win', value: stats.profitPercent, color: '#22C55E' },
    { name: 'Loss', value: stats.lossPercent, color: '#EF4444' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Weekly Win Rate" value={`${stats.winRate}%`} icon={Percent} trend="up" />
        <StatCard
          label="Weekly PnL"
          value={`${stats.weekPnl >= 0 ? '+' : ''}$${stats.weekPnl}`}
          icon={DollarSign}
          trend={stats.weekPnl >= 0 ? 'up' : 'down'}
        />
        <StatCard label="Weekly RR" value={`1:${stats.avgRR}`} icon={Target} />
        <StatCard label="Trades" value={String(weekTrades.length)} icon={TrendingUp} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Daily Performance" description="PnL by day this week">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_DAILY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E8E8E8', fontSize: 12 }} />
                <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                  {WEEKLY_DAILY.map((entry, i) => (
                    <Cell key={i} fill={entry.pnl >= 0 ? '#22C55E' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Win / Loss %" description="Weekly breakdown">
          <div className="flex h-52 items-end justify-center gap-8 pb-4">
            {winLoss.map(({ name, value, color }) => (
              <div key={name} className="flex flex-col items-center gap-2">
                <div
                  className="w-16 rounded-t-xl transition-all"
                  style={{ height: `${value * 1.5}px`, backgroundColor: color }}
                />
                <span className="text-xs font-medium">{name}</span>
                <span className="text-lg font-semibold">{value}%</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <CalendarWidget showLegend />
        <div>
          <h3 className="mb-3 text-sm font-semibold">This Week&apos;s Trades</h3>
          <div className="space-y-2">
            {weekTrades.map((t) => (
              <TradeCard key={t.id} trade={t} compact />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
