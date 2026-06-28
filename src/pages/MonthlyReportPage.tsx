import {
  Area,
  AreaChart,
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
import {
  EQUITY_DATA,
  MONTHLY_PERF,
  RR_DISTRIBUTION,
} from '@/data/mockData'
import { useTrades } from '@/context/TradeContext'
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Percent,
  Target,
} from 'lucide-react'

export function MonthlyReportPage() {
  const { trades, stats } = useTrades()

  const best = trades.reduce(
    (a, b) => (b.pnl > (a?.pnl ?? -Infinity) ? b : a),
    trades[0],
  )
  const worst = trades.reduce(
    (a, b) => (b.pnl < (a?.pnl ?? Infinity) ? b : a),
    trades[0],
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Win Rate" value={`${stats.winRate}%`} icon={Percent} />
        <StatCard label="Loss Rate" value={`${stats.lossPercent}%`} icon={Percent} trend="down" />
        <StatCard label="Avg RR" value={`1:${stats.avgRR}`} icon={Target} />
        <StatCard label="Total Trades" value={String(stats.totalTrades)} icon={Activity} />
        <StatCard
          label="Best Trade"
          value={best ? `+$${best.pnl}` : '—'}
          sub={best?.pair}
          icon={ArrowUpRight}
          trend="up"
        />
        <StatCard
          label="Worst Trade"
          value={worst ? `$${worst.pnl}` : '—'}
          sub={worst?.pair}
          icon={ArrowDownRight}
          trend="down"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Equity Curve" description="Monthly account growth">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={EQUITY_DATA}>
                <defs>
                  <linearGradient id="monthEq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E8E8E8', fontSize: 12 }} />
                <Area type="monotone" dataKey="equity" stroke="#3B82F6" strokeWidth={2} fill="url(#monthEq)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Performance Graph" description="Monthly PnL">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_PERF}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E8E8E8', fontSize: 12 }} />
                <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                  {MONTHLY_PERF.map((entry, i) => (
                    <Cell key={i} fill={entry.pnl >= 0 ? '#22C55E' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Distribution Graph" description="R:R distribution">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={RR_DISTRIBUTION}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E8E8E8', fontSize: 12 }} />
                <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Calendar Heatmap">
          <CalendarWidget showLegend />
        </ChartCard>
      </div>

      <StatCard
        label="Month PnL"
        value={`${stats.monthPnl >= 0 ? '+' : ''}$${stats.monthPnl}`}
        sub={`${stats.monthlyPercent}% performance`}
        icon={DollarSign}
        trend={stats.monthPnl >= 0 ? 'up' : 'down'}
        className="max-w-sm"
      />
    </div>
  )
}
