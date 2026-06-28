import { Bell, Search } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { CalendarHeaderButton } from '@/components/calendar/CalendarWidget'

const TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/entry-trade': 'Entry Trade',
  '/daily': 'Daily Trade',
  '/weekly': 'Weekly Report',
  '/monthly': 'Monthly Report',
  '/strategy': 'Full Strategy',
  '/settings': 'Settings',
}

/** Pages that already show a full calendar in the main content — hide header calendar */
const PAGES_WITH_SIDEBAR_CALENDAR = new Set(['/daily', '/weekly', '/monthly'])

export function Header({ pathname }: { pathname: string }) {
  const title =
    TITLES[pathname] ??
    Object.entries(TITLES).find(([k]) => pathname.startsWith(k))?.[1] ??
    'Dashboard'

  const showHeaderCalendar = !PAGES_WITH_SIDEBAR_CALENDAR.has(pathname)

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-md">
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search trades..."
            className="h-9 w-52 pl-9 text-xs"
          />
        </div>

        {showHeaderCalendar && (
          <div className="hidden sm:block">
            <CalendarHeaderButton />
          </div>
        )}

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted transition hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
        </button>

        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-[11px]">JD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
