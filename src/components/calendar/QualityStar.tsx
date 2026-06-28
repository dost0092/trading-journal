import { Star } from 'lucide-react'
import type { StarTier } from '@/lib/tradeUtils'
import { cn } from '@/lib/utils'

export function QualityStar({ tier, className }: { tier: StarTier; className?: string }) {
  if (tier === 'dot') {
    return (
      <span
        className={cn('inline-block h-1.5 w-1.5 rounded-full bg-gray-300', className)}
      />
    )
  }

  const colors = {
    gold: 'fill-amber-400 text-amber-400',
    silver: 'fill-slate-300 text-slate-300',
    gray: 'fill-gray-400 text-gray-400',
  }

  return <Star className={cn('h-3 w-3', colors[tier], className)} />
}

export function QualityStars({ tiers }: { tiers: StarTier[] }) {
  if (tiers.length === 0) return null
  return (
    <div className="flex flex-wrap items-center justify-center gap-px">
      {tiers.map((tier, i) => (
        <QualityStar key={i} tier={tier} />
      ))}
    </div>
  )
}
