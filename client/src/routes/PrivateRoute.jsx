import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  return children
}

export default PrivateRoute
