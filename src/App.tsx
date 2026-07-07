import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { StrategyConfigProvider } from '@/context/StrategyConfigContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { TradeProvider } from '@/context/TradeContext'
import {
  PendingRoute,
  ProtectedRoute,
  PublicOnlyRoute,
  SuperAdminGate,
} from '@/components/auth/ProtectedRoute'
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
import { PendingApprovalPage } from '@/pages/PendingApprovalPage'
import { AccessDeniedPage } from '@/pages/AccessDeniedPage'
import { AdminUsersPage } from '@/pages/AdminUsersPage'
import { AdminUserTradesPage } from '@/pages/AdminUserTradesPage'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <StrategyConfigProvider>
            <TradeProvider>
              <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>
            <Route element={<PendingRoute />}>
              <Route path="/pending-approval" element={<PendingApprovalPage />} />
              <Route path="/access-denied" element={<AccessDeniedPage />} />
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
                <Route element={<SuperAdminGate />}>
                  <Route path="admin/users" element={<AdminUsersPage />} />
                  <Route path="admin/users/:userId/trades" element={<AdminUserTradesPage />} />
                </Route>
              </Route>
            </Route>
              </Routes>
            </TradeProvider>
          </StrategyConfigProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
