import { supabase } from '@/lib/supabase'
import { GOLD_PAIR, type TradeEntry, type TradeImage } from '@/types/trade'

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
  image_url: string | null
  created_at: string
}

function rowToTrade(row: DbTradeRow): TradeEntry {
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
    image: row.image_url
      ? {
          id: row.id,
          name: 'screenshot',
          previewUrl: row.image_url,
        }
      : null,
    createdAt: row.created_at,
  }
}

export async function fetchUserTrades(): Promise<{ trades: TradeEntry[]; error: string | null }> {
  if (!supabase) return { trades: [], error: 'Supabase is not configured.' }

  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .order('date', { ascending: false })
    .order('time', { ascending: false })

  if (error) return { trades: [], error: error.message }
  return { trades: (data as DbTradeRow[]).map(rowToTrade), error: null }
}

async function uploadTradeImage(
  userId: string,
  tradeId: string,
  image: TradeImage,
): Promise<string | null> {
  if (!supabase) return null
  if (!image.file) return image.previewUrl.startsWith('http') ? image.previewUrl : null

  const ext = image.name.split('.').pop() || 'jpg'
  const path = `${userId}/${tradeId}.${ext}`

  const { error } = await supabase.storage.from('trade-images').upload(path, image.file, {
    upsert: true,
    contentType: image.file.type,
  })

  if (error) return null

  const { data } = supabase.storage.from('trade-images').getPublicUrl(path)
  return data.publicUrl
}

export async function createTrade(
  trade: Omit<TradeEntry, 'id' | 'createdAt' | 'pair' | 'image'>,
  image: TradeImage | null,
): Promise<{ trade: TradeEntry | null; error: string | null }> {
  if (!supabase) return { trade: null, error: 'Supabase is not configured.' }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { trade: null, error: 'You must be signed in.' }

  const tradeId = crypto.randomUUID()

  let imageUrl: string | null = null
  if (image) {
    imageUrl = await uploadTradeImage(user.id, tradeId, image)
  }

  const { data, error } = await supabase
    .from('trades')
    .insert({
      id: tradeId,
      user_id: user.id,
      date: trade.date,
      time: trade.time,
      session: trade.session,
      direction: trade.direction,
      risk_percent: trade.riskPercent,
      lot_size: trade.lotSize,
      entry: trade.entry,
      stop_loss: trade.stopLoss,
      take_profit: trade.takeProfit,
      result: trade.result,
      strategy: trade.strategy,
      rules_met: trade.rulesMet,
      rule_labels: trade.ruleLabels ?? {},
      image_url: imageUrl,
    })
    .select('*')
    .single()

  if (error || !data) return { trade: null, error: error?.message ?? 'Failed to save trade.' }
  return { trade: rowToTrade(data as DbTradeRow), error: null }
}

export async function removeTrade(tradeId: string): Promise<string | null> {
  if (!supabase) return 'Supabase is not configured.'

  const { error } = await supabase.from('trades').delete().eq('id', tradeId)
  return error?.message ?? null
}
