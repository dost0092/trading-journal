import { Outlet } from 'react-router-dom'
import { StrategyConfigProvider } from '@/context/StrategyConfigContext'
import { TradeProvider } from '@/context/TradeContext'

export function AuthenticatedProviders() {
  return (
    <StrategyConfigProvider>
      <TradeProvider>
        <Outlet />
      </TradeProvider>
    </StrategyConfigProvider>
  )
}
