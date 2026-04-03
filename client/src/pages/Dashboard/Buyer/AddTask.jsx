import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import useAxiosSecure from '../../../hooks/useAxiosSecure'
import useUser from '../../../hooks/useUser'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

const IMGBB_KEY = import.meta.env.VITE_IMGBB_API_KEY

const AddTask = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const axiosSecure = useAxiosSecure()
  const { dbUser } = useUser()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)

  const reqWorkers = watch('required_workers', 0)
  const payAmount = watch('payable_amount', 0)
  const totalCost = reqWorkers * payAmount

  const uploadImage = async (file) => {
    if (!file) return null
    const formData = new FormData()
    formData.append('image', file)
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: 'POST', body: formData })
    const data = await res.json()
    return data.data?.url || null
  }

  const onSubmit = async (data) => {
    if (totalCost > (dbUser?.coins || 0)) {
      toast.error('Not enough coins. Purchase more coins!')
      navigate('/dashboard/purchase-coin')
      return
    }
    setLoading(true)
    try {
      let imageUrl = data.task_image_url
      if (data.task_image?.[0]) {
        imageUrl = await uploadImage(data.task_image[0])
      }
      await axiosSecure.post('/tasks', {
        task_title: data.task_title,
        task_detail: data.task_detail,
        required_workers: Number(data.required_workers),
        payable_amount: Number(data.payable_amount),
        completion_date: data.completion_date,
        submission_info: data.submission_info,
        task_image_url: imageUrl || '',
        buyer_name: dbUser?.name,
        buyer_email: dbUser?.email,
      })
      toast.success('Task added successfully!')
      queryClient.invalidateQueries(['dbUser'])
      navigate('/dashboard/my-tasks')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Add New Task</h1>
      <p className="text-gray-500 text-sm mb-6">Available coins: <span className="text-amber-600 font-semibold">{dbUser?.coins || 0}</span></p>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
            <input {...register('task_title', { required: 'Title is required' })} className="input-field" placeholder="e.g. Watch my YouTube video and comment" />
            {errors.task_title && <p className="text-red-500 text-xs mt-1">{errors.task_title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Detail</label>
            <textarea {...register('task_detail', { required: 'Detail is required' })} rows={4} className="input-field resize-none" placeholder="Describe the task in detail..." />
            {errors.task_detail && <p className="text-red-500 text-xs mt-1">{errors.task_detail.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Required Workers</label>
              <input type="number" {...register('required_workers', { required: 'Required', min: { value: 1, message: 'Min 1' } })} className="input-field" placeholder="100" />
              {errors.required_workers && <p className="text-red-500 text-xs mt-1">{errors.required_workers.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coins per Worker</label>
              <input type="number" {...register('payable_amount', { required: 'Required', min: { value: 1, message: 'Min 1' } })} className="input-field" placeholder="10" />
              {errors.payable_amount && <p className="text-red-500 text-xs mt-1">{errors.payable_amount.message}</p>}
            </div>
          </div>

          {totalCost > 0 && (
            <div className={`rounded-lg p-3 text-sm font-medium ${totalCost > (dbUser?.coins || 0) ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
              Total cost: {totalCost} coins {totalCost > (dbUser?.coins || 0) ? '— Insufficient coins!' : '✓'}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Completion Date</label>
            <input type="date" {...register('completion_date', { required: 'Date is required' })} className="input-field" />
            {errors.completion_date && <p className="text-red-500 text-xs mt-1">{errors.completion_date.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Submission Info</label>
            <input {...register('submission_info', { required: 'Required' })} className="input-field" placeholder="e.g. Screenshot of completed action" />
            {errors.submission_info && <p className="text-red-500 text-xs mt-1">{errors.submission_info.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Image</label>
            <input type="file" accept="image/*" {...register('task_image')} className="input-field text-sm" />
            <p className="text-gray-400 text-xs mt-1">Or enter image URL:</p>
            <input {...register('task_image_url')} className="input-field mt-1" placeholder="https://example.com/image.jpg" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 disabled:opacity-60">
            {loading ? 'Adding task...' : 'Add Task'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddTask
