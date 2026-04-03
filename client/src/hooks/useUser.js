import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../providers/AuthProvider'
import useAxiosSecure from './useAxiosSecure'

const useUser = () => {
  const { user, loading } = useAuth()
  const axiosSecure = useAxiosSecure()

  const { data: dbUser, isLoading } = useQuery({
    queryKey: ['dbUser', user?.email],
    enabled: !!user?.email && !loading,
    queryFn: async () => {
      const res = await axiosSecure.get('/users/me')
      return res.data
    },
  })

  return { dbUser, isLoading: isLoading || loading }
}

export default useUser
