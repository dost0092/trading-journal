import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex h-9 w-[3.75rem] shrink-0 cursor-pointer items-center rounded-full border border-border bg-secondary/80 p-1 shadow-inner transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        className,
      )}
    >
      <Sun
        className={cn(
          'pointer-events-none absolute left-2.5 z-10 h-3.5 w-3.5 transition-colors duration-300',
          isDark ? 'text-muted-foreground/40' : 'text-amber-500',
        )}
        aria-hidden
      />
      <Moon
        className={cn(
          'pointer-events-none absolute right-2.5 z-10 h-3.5 w-3.5 transition-colors duration-300',
          isDark ? 'text-primary' : 'text-muted-foreground/40',
        )}
        aria-hidden
      />
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 520, damping: 36 }}
        className="relative z-20 block h-7 w-7 rounded-full bg-card shadow-md ring-1 ring-border/80"
        animate={{ x: isDark ? 26 : 0 }}
      />
    </button>
  )
}
