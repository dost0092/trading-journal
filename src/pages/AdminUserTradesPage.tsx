import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, RefreshCw } from 'lucide-react'
import { TradeBoxCard, TradeDetailModal } from '@/components/trade/TradeBoxCard'
import { Select } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { fetchUserProfileById, fetchUserTradesAsAdmin } from '@/lib/adminTradeService'
import { calcStats } from '@/lib/tradeStats'
import type { UserProfile } from '@/lib/supabase'
import type { TradeEntry } from '@/types/trade'

export function AdminUserTradesPage() {
  const { userId } = useParams<{ userId: string }>()
  const { isSuperAdmin } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [trades, setTrades] = useState<TradeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resultFilter, setResultFilter] = useState('all')
  const [selected, setSelected] = useState<TradeEntry | null>(null)

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)

    const [profileResult, tradesResult] = await Promise.all([
      fetchUserProfileById(userId),
      fetchUserTradesAsAdmin(userId),
    ])

    if (profileResult.error) setError(profileResult.error)
    else if (!profileResult.profile) setError('User not found.')
    else setProfile(profileResult.profile)

    if (tradesResult.error) setError(tradesResult.error)
    else setTrades(tradesResult.trades)

    setLoading(false)
  }, [userId])

  useEffect(() => {
    if (isSuperAdmin && userId) load()
  }, [isSuperAdmin, userId, load])

  const filteredTrades = useMemo(() => {
    if (resultFilter === 'all') return trades
    return trades.filter((t) => t.result === resultFilter)
  }, [trades, resultFilter])

  const stats = useMemo(() => calcStats(trades), [trades])

  if (!isSuperAdmin) {
    return (
      <p className="py-8 text-center text-sm text-muted">Superadmin access required.</p>
    )
  }

  if (!userId) {
    return (
      <p className="py-8 text-center text-sm text-muted">Invalid user.</p>
    )
  }

  const displayName = profile?.full_name ?? profile?.email ?? 'User'

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-1.5 text-xs text-muted transition hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Manage Users
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold tracking-tight">{displayName}&apos;s journal</h1>
          </div>
          {profile?.email && (
            <p className="text-sm text-muted">{profile.email}</p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-secondary text-foreground capitalize hover:bg-secondary">
              {profile?.role ?? 'user'}
            </Badge>
            <Badge className="bg-secondary text-foreground capitalize hover:bg-secondary">
              {profile?.status ?? 'unknown'}
            </Badge>
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
              Read-only admin view
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="h-8 w-32 text-xs"
          >
            <option value="all">All</option>
            <option value="win">Win</option>
            <option value="loss">Loss</option>
            <option value="breakeven">Break Even</option>
          </Select>
          <Button size="sm" variant="outline" onClick={() => load()}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}. Run <code className="text-xs">supabase/migration_admin_view_user_trades.sql</code>{' '}
          in Supabase SQL Editor if trades fail to load.
        </p>
      )}

      {!loading && trades.length > 0 && (
        <div className="grid grid-cols-3 gap-4 rounded-xl border border-border bg-card p-4 text-center">
          <div>
            <p className="text-2xl font-semibold">{stats.totalTrades}</p>
            <p className="text-xs text-muted">Total trades</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-success">{stats.wins}</p>
            <p className="text-xs text-muted">Wins</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-danger">{stats.losses}</p>
            <p className="text-xs text-muted">Losses</p>
          </div>
        </div>
      )}

      {loading ? (
        <p className="py-12 text-center text-sm text-muted">Loading trades...</p>
      ) : filteredTrades.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted">No trades found for this user.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTrades.map((trade) => (
            <TradeBoxCard
              key={trade.id}
              trade={trade}
              active={selected?.id === trade.id}
              onClick={() => setSelected(trade)}
            />
          ))}
        </div>
      )}

      <TradeDetailModal
        trade={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
