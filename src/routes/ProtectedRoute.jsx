import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useMeQuery } from '../services/api/authApi'
import { LoadingState } from '../components/common/LoadingState'

export function ProtectedRoute({ roles }) {
  const location = useLocation()
  const { data, isLoading, isError } = useMeQuery()

  if (isLoading) return <LoadingState variant="spinner" label="Checking session..." />
  if (isError || !data?.data) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles && !roles.includes(data.data.role)) {
    return <Navigate to="/access-denied" replace />
  }

  return <Outlet />
}
