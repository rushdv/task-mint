import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaCalendar, FaCoins, FaUsers } from 'react-icons/fa'
import useAxiosSecure from '../../../hooks/useAxiosSecure'

const TaskList = () => {
  const axiosSecure = useAxiosSecure()

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['availableTasks'],
    queryFn: async () => {
      const res = await axiosSecure.get('/tasks')
      return res.data
    },
  })

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Available Tasks ({tasks.length})</h1>
      {tasks.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No tasks available right now</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task, i) => (
            <motion.div key={task._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              {task.task_image_url && (
                <img src={task.task_image_url} alt={task.task_title} className="w-full h-40 object-cover" />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{task.task_title}</h3>
                <p className="text-gray-500 text-sm mb-3">By: {task.buyer_name}</p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-4">
                  <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
                    <FaCoins size={10} /> {task.payable_amount} coins
                  </span>
                  <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                    <FaUsers size={10} /> {task.required_workers} workers
                  </span>
                  <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full">
                    <FaCalendar size={10} /> {new Date(task.completion_date).toLocaleDateString()}
                  </span>
                </div>
                <Link to={`/dashboard/task-details/${task._id}`} className="btn-primary w-full text-center block text-sm py-2">
                  View Details
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TaskList
