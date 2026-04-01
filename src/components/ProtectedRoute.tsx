import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'

export function ProtectedRoute() {
  const isAuthed = useAppSelector((s) => s.auth.isAuthenticated)
  if (!isAuthed) return <Navigate to="/login" replace />
  return <Outlet />
}

