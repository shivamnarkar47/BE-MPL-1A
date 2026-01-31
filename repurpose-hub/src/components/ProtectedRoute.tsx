import { useAuth } from '@/contexts/AuthContext'
import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user != null) {
    return <Outlet />
  }

  return <Navigate to="/" replace={true} />
}

export default ProtectedRoute
