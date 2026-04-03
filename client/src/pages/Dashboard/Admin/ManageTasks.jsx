import { useQuery, useQueryClient } from '@tanstack/react-query'
import useAxiosSecure from '../../../hooks/useAxiosSecure'
import toast from 'react-hot-toast'

const ManageTasks = () => {
  const axiosSecure = useAxiosSecure()
  const queryClient = useQueryClient()

  const { data: tasks = [], isLoading, refetch } = useQuery({
    queryKey: ['allTasks'],
    queryFn: async () => {
      const res = await axiosSecure.get('/tasks/all')
      return res.data
    },
  })

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return
    try {
      await axiosSecure.delete(`/tasks/${id}`)
      toast.success('Task deleted')
      refetch()
      queryClient.invalidateQueries(['dbUser'])
    } catch { toast.error('Failed to delete') }
  }

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Tasks ({tasks.length})</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-left">
                <th className="p-3">Title</th>
                <th className="p-3">Buyer</th>
                <th className="p-3">Workers</th>
                <th className="p-3">Pay/Worker</th>
                <th className="p-3">Deadline</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">No tasks found</td></tr>
              ) : tasks.map(task => (
                <tr key={task._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium max-w-xs truncate">{task.task_title}</td>
                  <td className="p-3 text-gray-500">{task.buyer_name}</td>
                  <td className="p-3">{task.required_workers}</td>
                  <td className="p-3 text-amber-600">{task.payable_amount} coins</td>
                  <td className="p-3 text-gray-500">{new Date(task.completion_date).toLocaleDateString()}</td>
                  <td className="p-3">
                    <button onClick={() => handleDelete(task._id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs">
                      Delete
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

export default ManageTasks
