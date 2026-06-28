import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { TradeProvider } from '@/context/TradeContext'
import { ProtectedRoute, PublicOnlyRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { EntryTradePage } from '@/pages/EntryTradePage'
import { DailyTradePage } from '@/pages/DailyTradePage'
import { WeeklyReportPage } from '@/pages/WeeklyReportPage'
import { MonthlyReportPage } from '@/pages/MonthlyReportPage'
import { FullStrategyPage } from '@/pages/FullStrategyPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TradeProvider>
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="entry-trade" element={<EntryTradePage />} />
                <Route path="daily" element={<DailyTradePage />} />
                <Route path="weekly" element={<WeeklyReportPage />} />
                <Route path="monthly" element={<MonthlyReportPage />} />
                <Route path="strategy" element={<FullStrategyPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>
          </Routes>
        </TradeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
