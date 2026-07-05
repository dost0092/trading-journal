import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { CalendarWidget } from '@/components/calendar/CalendarWidget'
import { StrategyFilterToggle } from '@/components/shared/StrategyFilterToggle'
import { ChartCard } from '@/components/dashboard/ChartCard'
import { useStrategyConfig } from '@/context/StrategyConfigContext'
import { useTrades } from '@/context/TradeContext'

export function MonthlyReportPage() {
  const { stats, strategyFilter, setStrategyFilter } = useTrades()
  const { getStrategyName } = useStrategyConfig()

  const pieData = [
    { name: 'Win', value: stats.wins, color: '#22C55E' },
    { name: 'Loss', value: stats.losses, color: '#EF4444' },
  ].filter((d) => d.value > 0)

  const filterLabel =
    strategyFilter === 'all' ? 'All strategies' : getStrategyName(strategyFilter)

  return (
    <div className="mx-auto max-w-4xl space-y-12 py-4">
      <StrategyFilterToggle value={strategyFilter} onChange={setStrategyFilter} />

      <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
        {[
          { label: 'Total Trades', value: stats.totalTrades },
          { label: 'Winning', value: stats.wins },
          { label: 'Losing', value: stats.losses },
          { label: 'Win %', value: `${stats.winRate}%` },
          { label: 'Loss %', value: `${stats.lossRate}%` },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
            <p className="mt-1.5 text-sm text-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <ChartCard
          title="Win / Loss Distribution"
          description={`${filterLabel} · ${stats.totalTrades} trades`}
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
              <p className="text-sm text-muted">No trades this period</p>
            )}
          </div>
          {pieData.length > 0 && (
            <p className="mt-3 text-center text-xs text-muted">
              {stats.wins} wins · {stats.losses} losses
            </p>
          )}
        </ChartCard>

        <CalendarWidget full showLegend />
      </div>
    </div>
  )
}
