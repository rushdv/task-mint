import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import useAxiosSecure from '../../../hooks/useAxiosSecure'
import toast from 'react-hot-toast'

const MyTasks = () => {
  const axiosSecure = useAxiosSecure()
  const queryClient = useQueryClient()
  const [editTask, setEditTask] = useState(null)
  const { register, handleSubmit, reset, setValue } = useForm()

  const { data: tasks = [], isLoading, refetch } = useQuery({
    queryKey: ['myTasks'],
    queryFn: async () => {
      const res = await axiosSecure.get('/tasks/buyer')
      return res.data
    },
  })

  const handleDelete = async (id) => {
    if (!confirm('Delete this task? Unused coins will be refunded.')) return
    try {
      await axiosSecure.delete(`/tasks/${id}`)
      toast.success('Task deleted and coins refunded!')
      refetch()
      queryClient.invalidateQueries(['dbUser'])
    } catch { toast.error('Failed to delete') }
  }

  const openEdit = (task) => {
    setEditTask(task)
    setValue('task_title', task.task_title)
    setValue('task_detail', task.task_detail)
    setValue('submission_info', task.submission_info)
  }

  const onUpdate = async (data) => {
    try {
      await axiosSecure.patch(`/tasks/${editTask._id}`, data)
      toast.success('Task updated!')
      setEditTask(null)
      reset()
      refetch()
    } catch { toast.error('Update failed') }
  }

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Tasks ({tasks.length})</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-left">
                <th className="p-3">Title</th>
                <th className="p-3">Workers</th>
                <th className="p-3">Pay/Worker</th>
                <th className="p-3">Deadline</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">No tasks added yet</td></tr>
              ) : tasks.map(task => (
                <tr key={task._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium max-w-xs truncate">{task.task_title}</td>
                  <td className="p-3">{task.required_workers}</td>
                  <td className="p-3 text-amber-600">{task.payable_amount} coins</td>
                  <td className="p-3 text-gray-500">{new Date(task.completion_date).toLocaleDateString()}</td>
                  <td className="p-3 flex gap-2">
                    <button onClick={() => openEdit(task)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs">Update</button>
                    <button onClick={() => handleDelete(task._id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="font-bold text-lg mb-4">Update Task</h3>
            <form onSubmit={handleSubmit(onUpdate)} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input {...register('task_title', { required: true })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Detail</label>
                <textarea {...register('task_detail', { required: true })} rows={3} className="input-field resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Submission Info</label>
                <input {...register('submission_info', { required: true })} className="input-field" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1">Save</button>
                <button type="button" onClick={() => { setEditTask(null); reset() }} className="btn-outline flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyTasks
