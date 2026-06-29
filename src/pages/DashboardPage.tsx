import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
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
import { StrategyFilterToggle } from '@/components/shared/StrategyFilterToggle'
import { ChartCard } from '@/components/dashboard/ChartCard'
import { Card, CardContent } from '@/components/ui/card'
import { useTrades } from '@/context/TradeContext'
import { buildPerformanceWeeks } from '@/lib/tradeStats'

const QUICK_NAV = [
  { to: '/daily', label: 'Daily Trade' },
  { to: '/weekly', label: 'Weekly Report' },
  { to: '/monthly', label: 'Monthly Report' },
]

export function DashboardPage() {
  const { stats, strategyFilter, setStrategyFilter, filteredByStrategy, loading } = useTrades()

  const pieData = [
    { name: 'Win', value: stats.wins, color: '#22C55E' },
    { name: 'Loss', value: stats.losses, color: '#EF4444' },
  ].filter((d) => d.value > 0)

  const performanceWeeks = buildPerformanceWeeks(filteredByStrategy)
  const totalWeekTrades = performanceWeeks.reduce((s, w) => s + w.trades, 0)

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-muted">Loading your journal...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-12 py-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-3 gap-6"
      >
        {[
          { label: 'Total Trades', value: stats.totalTrades },
          { label: 'Win Rate', value: `${stats.winRate}%` },
          { label: 'Loss Rate', value: `${stats.lossRate}%` },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <p className="text-3xl font-semibold tracking-tight">{value}</p>
            <p className="mt-2 text-sm text-muted">{label}</p>
          </div>
        ))}
      </motion.div>

      <StrategyFilterToggle value={strategyFilter} onChange={setStrategyFilter} />

      <div className="grid gap-8 lg:grid-cols-2">
        <ChartCard
          title="Win / Loss Distribution"
          description={`${stats.wins} wins · ${stats.losses} losses`}
        >
          <div className="flex h-56 items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={4}
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid var(--color-border)',
                      fontSize: 12,
                      background: 'var(--color-card)',
                    }}
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
              <p className="text-sm text-muted">No trades yet — log your first trade</p>
            )}
          </div>
        </ChartCard>

        <ChartCard
          title="Performance"
          description={`${totalWeekTrades} trades over last 6 weeks`}
        >
          <div className="h-56">
            {totalWeekTrades > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceWeeks}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid var(--color-border)',
                      fontSize: 12,
                      background: 'var(--color-card)',
                    }}
                    formatter={(v) => [`${v} trades`, 'Count']}
                  />
                  <Bar
                    dataKey="trades"
                    name="Trades"
                    fill="var(--color-primary)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted">Your weekly chart will appear here</p>
              </div>
            )}
          </div>
        </ChartCard>
      </div>

      <div className="flex flex-wrap gap-3">
        {QUICK_NAV.map(({ to, label }) => (
          <Link key={to} to={to}>
            <Card className="transition hover:shadow-sm">
              <CardContent className="px-5 py-3">
                <p className="text-sm font-medium">{label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
