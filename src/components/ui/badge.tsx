import { cn } from '@/lib/utils'

const variants = {
  default: 'bg-secondary text-foreground',
  success: 'bg-green-50 text-success border-green-200',
  danger: 'bg-red-50 text-danger border-red-200',
  warning: 'bg-amber-50 text-warning border-amber-200',
  primary: 'bg-blue-50 text-primary border-blue-200',
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variants
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] font-medium',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
