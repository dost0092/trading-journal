import { invalidateSignedUrl, resolveSignedUrls } from '@/lib/signedUrlCache'
import { supabase } from '@/lib/supabase'
import { GOLD_PAIR, type TradeEntry, type TradeImage } from '@/types/trade'

interface DbTradeRow {
  id: string
  user_id: string
  date: string
  time: string
  pair: string | null
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

const TRADE_COLUMNS =
  'id, user_id, date, time, pair, session, direction, risk_percent, lot_size, entry, stop_loss, take_profit, result, strategy, rules_met, rule_labels, remark, image_url, created_at'

function storagePathFromImageUrl(imageUrl: string): string {
  if (imageUrl.includes('/trade-images/')) {
    return imageUrl.split('/trade-images/')[1]?.split('?')[0] ?? imageUrl
  }
  return imageUrl
}

async function resolveTradeImageUrl(imageUrl: string | null): Promise<string | null> {
  if (!imageUrl) return null
  if (imageUrl.startsWith('http') && !imageUrl.includes('/trade-images/')) {
    return imageUrl
  }

  const path = storagePathFromImageUrl(imageUrl)
  const signed = await resolveSignedUrls([path])
  return signed.get(path) ?? (imageUrl.startsWith('http') ? imageUrl : null)
}

function rowToTrade(row: DbTradeRow, imagePreviewUrl: string | null): TradeEntry {
  return {
    id: row.id,
    date: row.date,
    time: row.time,
    pair: row.pair || GOLD_PAIR,
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

async function mapRowsToTrades(rows: DbTradeRow[]): Promise<TradeEntry[]> {
  const imagePaths = rows
    .map((row) => (row.image_url ? storagePathFromImageUrl(row.image_url) : null))
    .filter((path): path is string => Boolean(path))

  const signedUrls = imagePaths.length > 0 ? await resolveSignedUrls(imagePaths) : new Map()

  return rows.map((row) => {
    if (!row.image_url) return rowToTrade(row, null)

    const path = storagePathFromImageUrl(row.image_url)
    const previewUrl =
      signedUrls.get(path) ?? (row.image_url.startsWith('http') ? row.image_url : null)

    return rowToTrade(row, previewUrl)
  })
}

export async function fetchUserTrades(
  userId: string,
): Promise<{ trades: TradeEntry[]; error: string | null }> {
  if (!supabase) return { trades: [], error: 'Supabase is not configured.' }
  if (!userId) return { trades: [], error: 'You must be signed in.' }

  const { data, error } = await supabase
    .from('trades')
    .select(TRADE_COLUMNS)
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('time', { ascending: false })

  if (error) return { trades: [], error: error.message }

  const trades = await mapRowsToTrades(data as DbTradeRow[])
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

  invalidateSignedUrl(path)
  return path
}

export async function createTrade(
  userId: string,
  trade: Omit<TradeEntry, 'id' | 'createdAt' | 'image'>,
  image: TradeImage | null,
): Promise<{ trade: TradeEntry | null; error: string | null }> {
  if (!supabase) return { trade: null, error: 'Supabase is not configured.' }
  if (!userId) return { trade: null, error: 'You must be signed in.' }

  const tradeId = crypto.randomUUID()

  let imageUrl: string | null = null
  if (image) {
    imageUrl = await uploadTradeImage(userId, tradeId, image)
  }

  const { data, error } = await supabase
    .from('trades')
    .insert({
      id: tradeId,
      user_id: userId,
      date: trade.date,
      time: trade.time,
      pair: trade.pair,
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
      remark: trade.remark || null,
      image_url: imageUrl,
    })
    .select(TRADE_COLUMNS)
    .single()

  if (error || !data) return { trade: null, error: error?.message ?? 'Failed to save trade.' }

  const previewUrl = imageUrl ? await resolveTradeImageUrl(imageUrl) : null
  return { trade: rowToTrade(data as DbTradeRow, previewUrl), error: null }
}

export async function removeTrade(userId: string, tradeId: string): Promise<string | null> {
  if (!supabase) return 'Supabase is not configured.'
  if (!userId) return 'You must be signed in.'

  const { error } = await supabase.from('trades').delete().eq('id', tradeId).eq('user_id', userId)
  return error?.message ?? null
}

export async function updateTrade(
  userId: string,
  tradeId: string,
  trade: Omit<TradeEntry, 'id' | 'createdAt' | 'image'>,
  image: TradeImage | null,
): Promise<{ trade: TradeEntry | null; error: string | null }> {
  if (!supabase) return { trade: null, error: 'Supabase is not configured.' }
  if (!userId) return { trade: null, error: 'You must be signed in.' }

  const updates: Record<string, unknown> = {
    date: trade.date,
    time: trade.time,
    pair: trade.pair,
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
    remark: trade.remark || null,
  }

  if (image?.file) {
    const uploaded = await uploadTradeImage(userId, tradeId, image)
    if (uploaded) updates.image_url = uploaded
  } else if (image === null) {
    updates.image_url = null
  } else if (image?.storagePath) {
    updates.image_url = image.storagePath
  }

  const { data, error } = await supabase
    .from('trades')
    .update(updates)
    .eq('id', tradeId)
    .eq('user_id', userId)
    .select(TRADE_COLUMNS)
    .single()

  if (error || !data) return { trade: null, error: error?.message ?? 'Failed to update trade.' }

  const row = data as DbTradeRow
  const previewUrl = row.image_url ? await resolveTradeImageUrl(row.image_url) : null
  return { trade: rowToTrade(row, previewUrl), error: null }
}
