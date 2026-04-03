import { Navigate } from 'react-router-dom'
import useUser from '../hooks/useUser'

const RoleRoute = ({ children, role }) => {
  const { dbUser, isLoading } = useUser()

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (dbUser?.role !== role) {
    const redirectMap = { admin: '/dashboard/admin-home', buyer: '/dashboard/buyer-home', worker: '/dashboard/worker-home' }
    return <Navigate to={redirectMap[dbUser?.role] || '/'} replace />
  }

  return children
}

export default RoleRoute
