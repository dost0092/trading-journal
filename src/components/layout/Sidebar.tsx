import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  LayoutDashboard,
  PenLine,
  Settings,
  TrendingUp,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useTrades } from '@/context/TradeContext'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/entry-trade', label: 'Entry Trade', icon: PenLine },
  { to: '/daily', label: 'Daily Trade', icon: CalendarDays },
  { to: '/weekly', label: 'Weekly Report', icon: BarChart3 },
  { to: '/monthly', label: 'Monthly Report', icon: TrendingUp },
  { to: '/strategy', label: 'Full Strategy', icon: BookOpen },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { stats } = useTrades()

  return (
    <aside className="flex h-full w-[260px] flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight">Trade Journal</p>
          <p className="text-[11px] text-muted">Pro Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/8 text-primary'
                  : 'text-muted hover:bg-secondary hover:text-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn(
                    'h-4 w-4 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground',
                  )}
                />
                {label}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4">
        <Separator className="mb-4" />
        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="mb-3 flex items-center gap-3">
            <Avatar>
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-[11px] text-muted">Active Trader</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-card p-2.5 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted">
                Streak
              </p>
              <p className="text-sm font-semibold text-primary">
                {stats.tradingStreak}d
              </p>
            </div>
            <div className="rounded-xl bg-card p-2.5 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted">
                Win Rate
              </p>
              <p className="text-sm font-semibold text-success">
                {stats.winRate}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
