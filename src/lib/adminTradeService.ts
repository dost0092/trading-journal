import { supabase } from '@/lib/supabase'
import type { UserProfile } from '@/lib/supabase'
import type { TradeEntry } from '@/types/trade'

interface DbTradeRow {
  id: string
  user_id: string
  date: string
  time: string
  session: string
  direction: string
  risk_percent: number
  lot_size: number
  entry: number
  stop_loss: number
  take_profit: number
  result: string
  strategy: string
  rules_met: string[]
  rule_labels: Record<string, string> | null
  remark: string | null
  image_url: string | null
  created_at: string
}

const GOLD_PAIR = 'XAU/USD'

function storagePathFromImageUrl(imageUrl: string): string {
  if (imageUrl.includes('/trade-images/')) {
    return imageUrl.split('/trade-images/')[1]?.split('?')[0] ?? imageUrl
  }
  return imageUrl
}

async function resolveTradeImageUrl(imageUrl: string | null): Promise<string | null> {
  if (!imageUrl || !supabase) return null

  const path = storagePathFromImageUrl(imageUrl)
  const { data, error } = await supabase.storage
    .from('trade-images')
    .createSignedUrl(path, 60 * 60)

  if (!error && data?.signedUrl) return data.signedUrl
  if (imageUrl.startsWith('http')) return imageUrl
  return null
}

function rowToTrade(row: DbTradeRow, imagePreviewUrl: string | null): TradeEntry {
  return {
    id: row.id,
    date: row.date,
    time: row.time,
    pair: GOLD_PAIR,
    session: row.session as TradeEntry['session'],
    direction: row.direction as TradeEntry['direction'],
    riskPercent: Number(row.risk_percent),
    lotSize: Number(row.lot_size),
    entry: Number(row.entry),
    stopLoss: Number(row.stop_loss),
    takeProfit: Number(row.take_profit),
    result: row.result as TradeEntry['result'],
    strategy: row.strategy as TradeEntry['strategy'],
    rulesMet: Array.isArray(row.rules_met) ? row.rules_met : [],
    ruleLabels: row.rule_labels ?? undefined,
    remark: row.remark ?? undefined,
    image: imagePreviewUrl
      ? {
          id: row.id,
          name: 'screenshot',
          previewUrl: imagePreviewUrl,
          storagePath: row.image_url ?? undefined,
        }
      : null,
    createdAt: row.created_at,
  }
}

export async function fetchUserProfileById(
  userId: string,
): Promise<{ profile: UserProfile | null; error: string | null }> {
  if (!supabase) return { profile: null, error: 'Supabase is not configured.' }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, status, created_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) return { profile: null, error: error.message }
  return { profile: data as UserProfile | null, error: null }
}

/** Superadmin only — loads trades for a specific user (read-only admin view). */
export async function fetchUserTradesAsAdmin(
  targetUserId: string,
): Promise<{ trades: TradeEntry[]; error: string | null }> {
  if (!supabase) return { trades: [], error: 'Supabase is not configured.' }

  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', targetUserId)
    .order('date', { ascending: false })
    .order('time', { ascending: false })

  if (error) return { trades: [], error: error.message }

  const rows = data as DbTradeRow[]
  const trades = await Promise.all(
    rows.map(async (row) => {
      const previewUrl = await resolveTradeImageUrl(row.image_url)
      return rowToTrade(row, previewUrl)
    }),
  )

  return { trades, error: null }
}
