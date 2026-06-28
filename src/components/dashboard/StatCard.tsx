import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  trend = 'neutral',
  className,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn('transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]', className)}>
        <CardContent className="flex items-start justify-between p-5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
              {label}
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
            {sub && (
              <p
                className={cn(
                  'mt-1 text-xs',
                  trend === 'up' && 'text-success',
                  trend === 'down' && 'text-danger',
                  trend === 'neutral' && 'text-muted',
                )}
              >
                {sub}
              </p>
            )}
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/8">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
