import { format } from 'date-fns'
import {
  Activity,
  Calendar,
  DollarSign,
  Percent,
  Target,
  TrendingUp,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CalendarWidget } from '@/components/calendar/CalendarWidget'
import { ChartCard } from '@/components/dashboard/ChartCard'
import { StatCard } from '@/components/dashboard/StatCard'
import { Card, CardContent } from '@/components/ui/card'
import {
  EQUITY_DATA,
  MONTHLY_PERF,
  RR_DISTRIBUTION,
} from '@/data/mockData'
import { useTrades } from '@/context/TradeContext'

const QUICK_NAV = [
  { to: '/daily', label: 'Daily Trade', desc: 'View today\'s timeline' },
  { to: '/weekly', label: 'Weekly Report', desc: 'Weekly performance' },
  { to: '/monthly', label: 'Monthly Report', desc: 'Monthly analytics' },
  { to: '/strategy', label: 'Full Strategy', desc: 'Strategy playbook' },
]

const PIE_DATA = [
  { name: 'Wins', value: 68, color: '#22C55E' },
  { name: 'Losses', value: 32, color: '#EF4444' },
]

export function DashboardPage() {
  const { stats } = useTrades()
  const today = format(new Date(), 'EEEE, MMMM d, yyyy')

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium text-muted">Welcome back</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                {today}
              </h2>
              <p className="mt-1 text-sm text-muted">
                Your trading journal at a glance
              </p>
            </div>
            <div className="lg:hidden">
              <CalendarWidget compact showLegend />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard label="Total Trades" value={String(stats.totalTrades)} icon={Activity} />
        <StatCard
          label="Win Rate"
          value={`${stats.winRate}%`}
          sub="+4.2% this month"
          icon={Percent}
          trend="up"
        />
        <StatCard
          label="Month PnL"
          value={`${stats.monthPnl >= 0 ? '+' : ''}$${stats.monthPnl}`}
          icon={DollarSign}
          trend={stats.monthPnl >= 0 ? 'up' : 'down'}
        />
        <StatCard
          label="Week PnL"
          value={`${stats.weekPnl >= 0 ? '+' : ''}$${stats.weekPnl}`}
          icon={TrendingUp}
          trend={stats.weekPnl >= 0 ? 'up' : 'down'}
        />
        <StatCard
          label="Avg R:R"
          value={`1:${stats.avgRR}`}
          sub="Risk-reward average"
          icon={Target}
        />
        <div className="hidden 2xl:block">
          <CalendarWidget compact showLegend />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Quick Navigation</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_NAV.map(({ to, label, desc }) => (
            <Link key={to} to={to}>
              <Card className="transition-all hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="mt-0.5 text-xs text-muted">{desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Performance Overview</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Equity Curve" description="Account growth over time">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={EQUITY_DATA}>
                  <defs>
                    <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E8E8E8', fontSize: 12 }} />
                  <Area type="monotone" dataKey="equity" stroke="#3B82F6" strokeWidth={2} fill="url(#eq)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Monthly Performance" description="PnL by month">
            <div className="h-52">
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

          <ChartCard title="Win / Loss Distribution">
            <div className="flex h-52 items-center">
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie data={PIE_DATA} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={3}>
                    {PIE_DATA.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E8E8E8', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                <div>
                  <p className="text-2xl font-semibold text-success">{stats.profitPercent}%</p>
                  <p className="text-xs text-muted">Winning Days</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-danger">{stats.lossPercent}%</p>
                  <p className="text-xs text-muted">Losing Days</p>
                </div>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="R:R Distribution">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={RR_DISTRIBUTION}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" vertical={false} />
                  <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E8E8E8', fontSize: 12 }} />
                  <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      <AnalyticsSection />
    </div>
  )
}

function AnalyticsSection() {
  const { stats } = useTrades()

  const metrics = [
    { label: 'Performance', value: `${stats.profitPercent}%` },
    { label: 'Monthly', value: `${stats.monthlyPercent}%` },
    { label: 'Weekly', value: `${stats.weeklyPercent}%` },
    { label: 'Avg RR', value: `1:${stats.avgRR}` },
    { label: 'Profit', value: `${stats.profitPercent}%` },
    { label: 'Loss', value: `${stats.lossPercent}%` },
    { label: 'Win Streak', value: `${stats.winningStreak}d` },
    { label: 'Loss Streak', value: `${stats.losingStreak}d` },
    { label: 'Risk', value: '1.0%' },
    { label: 'Drawdown', value: `${stats.drawdownPercent}%` },
  ]

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Calendar className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Analytics</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {metrics.map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="p-4 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
              <p className="mt-1 text-lg font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
