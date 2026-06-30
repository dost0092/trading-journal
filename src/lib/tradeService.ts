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
    image: imagePreviewUrl
      ? {
          id: row.id,
          name: 'screenshot',
          previewUrl: imagePreviewUrl,
        }
      : null,
    createdAt: row.created_at,
  }
}

export async function fetchUserTrades(): Promise<{ trades: TradeEntry[]; error: string | null }> {
  if (!supabase) return { trades: [], error: 'Supabase is not configured.' }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { trades: [], error: 'You must be signed in.' }

  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
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

  return path
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

  const previewUrl = imageUrl ? await resolveTradeImageUrl(imageUrl) : null
  return { trade: rowToTrade(data as DbTradeRow, previewUrl), error: null }
}

export async function removeTrade(tradeId: string): Promise<string | null> {
  if (!supabase) return 'Supabase is not configured.'

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return 'You must be signed in.'

  const { error } = await supabase.from('trades').delete().eq('id', tradeId).eq('user_id', user.id)
  return error?.message ?? null
}
