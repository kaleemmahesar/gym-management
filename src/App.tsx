import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { DashboardLayout } from './layout/DashboardLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { MembersPage } from './pages/MembersPage'
import { AttendancePage } from './pages/AttendancePage'
import { PaymentsPage } from './pages/PaymentsPage'
import { ExpensesPage } from './pages/ExpensesPage'
import { ReportsPage } from './pages/ReportsPage'
import { useAppDispatch, useAppSelector } from './app/hooks'
import { useEffect } from 'react'
import { refreshStatuses } from './features/members/membersSlice'

export default function App() {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((s) => s.ui.theme)
  useEffect(() => {
    dispatch(refreshStatuses())
  }, [dispatch])

  useEffect(() => {
    document.body.classList.remove('theme-dark', 'theme-light')
    document.body.classList.add(theme === 'light' ? 'theme-light' : 'theme-dark')
  }, [theme])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
