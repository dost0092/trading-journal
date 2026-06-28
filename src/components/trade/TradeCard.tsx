import { motion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight, ImageIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { calcRR } from '@/data/mockData'
import { getStrategy } from '@/data/strategies'
import type { TradeEntry } from '@/types/trade'
import { cn } from '@/lib/utils'

interface TradeCardProps {
  trade: TradeEntry
  onClick?: () => void
  compact?: boolean
}

export function TradeCard({ trade, onClick, compact }: TradeCardProps) {
  const strategy = getStrategy(trade.strategy)
  const rr = calcRR(trade.entry, trade.stopLoss, trade.takeProfit)

  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
    >
      <Card
        className={cn(
          'cursor-pointer transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]',
          compact && 'rounded-xl',
        )}
        onClick={onClick}
      >
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-secondary">
            {trade.images[0] ? (
              <img
                src={trade.images[0].previewUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{trade.pair}</span>
              <Badge
                variant={
                  trade.result === 'win'
                    ? 'success'
                    : trade.result === 'loss'
                      ? 'danger'
                      : 'default'
                }
              >
                {trade.result}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted">
              {strategy?.name} · {trade.time} · RR 1:{rr}
            </p>
          </div>

          <div className="text-right">
            <div
              className={cn(
                'flex items-center justify-end gap-0.5 text-sm font-semibold',
                trade.pnl >= 0 ? 'text-success' : 'text-danger',
              )}
            >
              {trade.pnl >= 0 ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {trade.pnl >= 0 ? '+' : ''}${Math.abs(trade.pnl)}
            </div>
            <p className="text-[10px] capitalize text-muted">{trade.direction}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
