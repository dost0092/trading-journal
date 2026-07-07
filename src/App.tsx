import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import {
  PendingRoute,
  ProtectedRoute,
  PublicOnlyRoute,
  SuperAdminGate,
} from '@/components/auth/ProtectedRoute'
import { AuthenticatedProviders } from '@/components/auth/AuthenticatedProviders'
import { AppLayout } from '@/components/layout/AppLayout'

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-sm text-muted">Loading...</p>
    </div>
  )
}

const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const EntryTradePage = lazy(() =>
  import('@/pages/EntryTradePage').then((m) => ({ default: m.EntryTradePage })),
)
const DailyTradePage = lazy(() =>
  import('@/pages/DailyTradePage').then((m) => ({ default: m.DailyTradePage })),
)
const WeeklyReportPage = lazy(() =>
  import('@/pages/WeeklyReportPage').then((m) => ({ default: m.WeeklyReportPage })),
)
const MonthlyReportPage = lazy(() =>
  import('@/pages/MonthlyReportPage').then((m) => ({ default: m.MonthlyReportPage })),
)
const FullStrategyPage = lazy(() =>
  import('@/pages/FullStrategyPage').then((m) => ({ default: m.FullStrategyPage })),
)
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const SignupPage = lazy(() => import('@/pages/SignupPage').then((m) => ({ default: m.SignupPage })))
const PendingApprovalPage = lazy(() =>
  import('@/pages/PendingApprovalPage').then((m) => ({ default: m.PendingApprovalPage })),
)
const AccessDeniedPage = lazy(() =>
  import('@/pages/AccessDeniedPage').then((m) => ({ default: m.AccessDeniedPage })),
)
const AdminUsersPage = lazy(() =>
  import('@/pages/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })),
)
const AdminUserTradesPage = lazy(() =>
  import('@/pages/AdminUserTradesPage').then((m) => ({ default: m.AdminUserTradesPage })),
)

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route
                path="/login"
                element={
                  <LazyPage>
                    <LoginPage />
                  </LazyPage>
                }
              />
              <Route
                path="/signup"
                element={
                  <LazyPage>
                    <SignupPage />
                  </LazyPage>
                }
              />
            </Route>
            <Route element={<PendingRoute />}>
              <Route
                path="/pending-approval"
                element={
                  <LazyPage>
                    <PendingApprovalPage />
                  </LazyPage>
                }
              />
              <Route
                path="/access-denied"
                element={
                  <LazyPage>
                    <AccessDeniedPage />
                  </LazyPage>
                }
              />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route element={<AuthenticatedProviders />}>
                <Route element={<AppLayout />}>
                  <Route
                    index
                    element={
                      <LazyPage>
                        <DashboardPage />
                      </LazyPage>
                    }
                  />
                  <Route
                    path="entry-trade"
                    element={
                      <LazyPage>
                        <EntryTradePage />
                      </LazyPage>
                    }
                  />
                  <Route
                    path="daily"
                    element={
                      <LazyPage>
                        <DailyTradePage />
                      </LazyPage>
                    }
                  />
                  <Route
                    path="weekly"
                    element={
                      <LazyPage>
                        <WeeklyReportPage />
                      </LazyPage>
                    }
                  />
                  <Route
                    path="monthly"
                    element={
                      <LazyPage>
                        <MonthlyReportPage />
                      </LazyPage>
                    }
                  />
                  <Route
                    path="strategy"
                    element={
                      <LazyPage>
                        <FullStrategyPage />
                      </LazyPage>
                    }
                  />
                  <Route
                    path="settings"
                    element={
                      <LazyPage>
                        <SettingsPage />
                      </LazyPage>
                    }
                  />
                  <Route element={<SuperAdminGate />}>
                    <Route
                      path="admin/users"
                      element={
                        <LazyPage>
                          <AdminUsersPage />
                        </LazyPage>
                      }
                    />
                    <Route
                      path="admin/users/:userId/trades"
                      element={
                        <LazyPage>
                          <AdminUserTradesPage />
                        </LazyPage>
                      }
                    />
                  </Route>
                </Route>
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
