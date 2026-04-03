import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { FaCoins, FaUsers, FaCalendar } from 'react-icons/fa'
import useAxiosSecure from '../../../hooks/useAxiosSecure'
import { useAuth } from '../../../providers/AuthProvider'
import useUser from '../../../hooks/useUser'
import toast from 'react-hot-toast'

const TaskDetails = () => {
  const { id } = useParams()
  const axiosSecure = useAxiosSecure()
  const { user } = useAuth()
  const { dbUser } = useUser()
  const navigate = useNavigate()
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/tasks/${id}`)
      return res.data
    },
  })

  const onSubmit = async (data) => {
    try {
      await axiosSecure.post('/submissions', {
        task_id: id,
        task_title: task.task_title,
        payable_amount: task.payable_amount,
        worker_email: user.email,
        worker_name: dbUser?.name || user.displayName,
        buyer_name: task.buyer_name,
        buyer_email: task.buyer_email,
        submission_details: data.submission_details,
      })
      toast.success('Submission sent for review!')
      reset()
      navigate('/dashboard/my-submissions')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed')
    }
  }

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
  if (!task) return <div className="text-center py-20 text-gray-400">Task not found</div>

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        {task.task_image_url && <img src={task.task_image_url} alt={task.task_title} className="w-full h-56 object-cover" />}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{task.task_title}</h1>
          <p className="text-gray-500 mb-4">Posted by: {task.buyer_name}</p>
          <p className="text-gray-700 mb-4 leading-relaxed">{task.task_detail}</p>
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm font-medium">
              <FaCoins /> {task.payable_amount} coins per task
            </span>
            <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium">
              <FaUsers /> {task.required_workers} workers needed
            </span>
            <span className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
              <FaCalendar /> Due: {new Date(task.completion_date).toLocaleDateString()}
            </span>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-1">What to Submit:</h3>
            <p className="text-gray-600 text-sm">{task.submission_info}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Submit Your Work</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <textarea
            {...register('submission_details', { required: 'Please provide submission details' })}
            rows={5}
            className="input-field resize-none mb-1"
            placeholder="Describe your submission or paste your proof here..."
          />
          {errors.submission_details && <p className="text-red-500 text-xs mb-3">{errors.submission_details.message}</p>}
          <button type="submit" className="btn-primary w-full py-2.5 mt-2">Submit Task</button>
        </form>
      </div>
    </div>
  )
}

export default TaskDetails
