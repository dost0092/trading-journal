import type { StrategyDefinition } from '@/types/trade'

export const STRATEGIES: StrategyDefinition[] = [
  {
    id: 'liquidity_sweep',
    name: 'Liquidity Sweep',
    description:
      'Capture reversals after liquidity is taken beyond key structural levels.',
    rules: [
      'Wait for clear market structure shift on higher timeframe',
      'Identify equal highs/lows or session liquidity pools',
      'Confirm sweep with displacement candle and fair value gap',
      'Enter on retest of order block or breaker structure',
    ],
    criteria: [
      { id: 'msb', label: 'Market Structure Break' },
      { id: 'liquidity_grab', label: 'Liquidity Grab' },
      { id: 'fvg', label: 'Fair Value Gap' },
      { id: 'confirmation', label: 'Confirmation Candle' },
      { id: 'rr_valid', label: 'Risk Reward Valid' },
    ],
  },
  {
    id: 'liquidity_run',
    name: 'Liquidity Run',
    description:
      'Ride momentum through liquidity targets aligned with the prevailing trend.',
    rules: [
      'Confirm strong trend on 15M or higher timeframe',
      'Identify next liquidity target (BSL/SSL)',
      'Wait for pullback into premium or discount zone',
      'Enter on continuation signal with tight invalidation',
    ],
    criteria: [
      { id: 'trend', label: 'Trend Confirmation' },
      { id: 'expansion', label: 'Liquidity Expansion' },
      { id: 'session', label: 'Session Alignment' },
      { id: 'volume', label: 'Volume Confirmation' },
      { id: 'trigger', label: 'Entry Trigger' },
    ],
  },
]

export const getStrategy = (id: string) =>
  STRATEGIES.find((s) => s.id === id)
