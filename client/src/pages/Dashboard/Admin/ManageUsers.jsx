import { useQuery, useQueryClient } from '@tanstack/react-query'
import useAxiosSecure from '../../../hooks/useAxiosSecure'
import toast from 'react-hot-toast'

const ManageUsers = () => {
  const axiosSecure = useAxiosSecure()
  const queryClient = useQueryClient()

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const res = await axiosSecure.get('/users')
      return res.data
    },
  })

  const handleRoleChange = async (id, role) => {
    try {
      await axiosSecure.patch(`/users/role/${id}`, { role })
      toast.success('Role updated!')
      refetch()
    } catch { toast.error('Failed to update role') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return
    try {
      await axiosSecure.delete(`/users/${id}`)
      toast.success('User deleted')
      refetch()
    } catch { toast.error('Failed to delete') }
  }

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Users ({users.length})</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-left">
                <th className="p-3">User</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Coins</th>
                <th className="p-3">Update Role</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <img src={user.photo || `https://ui-avatars.com/api/?name=${user.name}`} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-gray-500 text-xs">{user.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : user.role === 'buyer' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3 text-amber-600 font-semibold">{user.coins}</td>
                  <td className="p-3">
                    <select
                      defaultValue={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                      <option value="worker">Worker</option>
                      <option value="buyer">Buyer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <button onClick={() => handleDelete(user._id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ManageUsers
