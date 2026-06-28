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
import { PERFORMANCE_WEEKS } from '@/data/mockData'
import { useTrades } from '@/context/TradeContext'

const QUICK_NAV = [
  { to: '/daily', label: 'Daily Trade' },
  { to: '/weekly', label: 'Weekly Report' },
  { to: '/monthly', label: 'Monthly Report' },
]

export function DashboardPage() {
  const { stats, strategyFilter, setStrategyFilter } = useTrades()

  const pieData = [
    { name: 'Win', value: stats.wins, color: '#22C55E' },
    { name: 'Loss', value: stats.losses, color: '#EF4444' },
  ].filter((d) => d.value > 0)

  const totalWeekTrades = PERFORMANCE_WEEKS.reduce((s, w) => s + w.trades, 0)

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
                      border: '1px solid #E8E8E8',
                      fontSize: 12,
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
              <p className="text-sm text-muted">No trades yet</p>
            )}
          </div>
        </ChartCard>

        <ChartCard
          title="Performance"
          description={`${totalWeekTrades} trades over 6 weeks`}
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PERFORMANCE_WEEKS}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" vertical={false} />
                <XAxis
                  dataKey="week"
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
                  formatter={(v) => [`${v} trades`, 'Count']}
                />
                <Bar
                  dataKey="trades"
                  name="Trades"
                  fill="#3B82F6"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
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
