import { supabase } from '@/lib/supabase'

const SIGNED_URL_TTL_SEC = 4 * 60 * 60
const CACHE_BUFFER_MS = 5 * 60 * 1000

const cache = new Map<string, { url: string; expiresAt: number }>()

export function invalidateSignedUrl(path: string) {
  cache.delete(path)
}

export async function getSignedTradeImageUrl(path: string): Promise<string | null> {
  if (!supabase) return null

  const cached = cache.get(path)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url
  }

  const { data, error } = await supabase.storage
    .from('trade-images')
    .createSignedUrl(path, SIGNED_URL_TTL_SEC)

  if (error || !data?.signedUrl) return null

  cache.set(path, {
    url: data.signedUrl,
    expiresAt: Date.now() + SIGNED_URL_TTL_SEC * 1000 - CACHE_BUFFER_MS,
  })

  return data.signedUrl
}

export async function resolveSignedUrls(paths: string[]): Promise<Map<string, string | null>> {
  const uniquePaths = [...new Set(paths)]
  const results = new Map<string, string | null>()

  await Promise.all(
    uniquePaths.map(async (path) => {
      results.set(path, await getSignedTradeImageUrl(path))
    }),
  )

  return results
}
