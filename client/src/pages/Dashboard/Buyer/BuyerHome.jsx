import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FaTasks, FaClock, FaDollarSign } from 'react-icons/fa'
import useAxiosSecure from '../../../hooks/useAxiosSecure'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'

const BuyerHome = () => {
  const axiosSecure = useAxiosSecure()
  const queryClient = useQueryClient()
  const [selectedSub, setSelectedSub] = useState(null)

  const { data: stats = {} } = useQuery({
    queryKey: ['buyerStats'],
    queryFn: async () => {
      const res = await axiosSecure.get('/tasks/buyer/stats')
      return res.data
    },
  })

  const { data: submissions = [], refetch } = useQuery({
    queryKey: ['buyerSubmissions'],
    queryFn: async () => {
      const res = await axiosSecure.get('/submissions/buyer')
      return res.data
    },
  })

  const handleApprove = async (id) => {
    try {
      await axiosSecure.patch(`/submissions/${id}/approve`)
      toast.success('Submission approved!')
      refetch()
      queryClient.invalidateQueries(['dbUser'])
    } catch { toast.error('Failed to approve') }
  }

  const handleReject = async (id) => {
    try {
      await axiosSecure.patch(`/submissions/${id}/reject`)
      toast.success('Submission rejected')
      refetch()
    } catch { toast.error('Failed to reject') }
  }

  const cards = [
    { label: 'Total Tasks', value: stats.taskCount || 0, icon: <FaTasks />, color: 'bg-blue-500' },
    { label: 'Pending Workers', value: stats.pendingWorkers || 0, icon: <FaClock />, color: 'bg-yellow-500' },
    { label: 'Total Paid', value: `$${stats.totalPaid || 0}`, icon: <FaDollarSign />, color: 'bg-green-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Buyer Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {cards.map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
            <div className={`${c.color} text-white p-3 rounded-lg text-xl`}>{c.icon}</div>
            <div>
              <p className="text-gray-500 text-sm">{c.label}</p>
              <p className="text-2xl font-bold text-gray-800">{c.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Tasks to Review ({submissions.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-left">
                <th className="p-3">Worker</th>
                <th className="p-3">Task</th>
                <th className="p-3">Amount</th>
                <th className="p-3">View</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">No pending submissions</td></tr>
              ) : submissions.map(s => (
                <tr key={s._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{s.worker_name}</td>
                  <td className="p-3 max-w-xs truncate">{s.task_title}</td>
                  <td className="p-3 text-amber-600 font-semibold">{s.payable_amount} coins</td>
                  <td className="p-3">
                    <button onClick={() => setSelectedSub(s)} className="text-blue-600 hover:underline text-xs">View</button>
                  </td>
                  <td className="p-3 flex gap-2">
                    <button onClick={() => handleApprove(s._id)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs">Approve</button>
                    <button onClick={() => handleReject(s._id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs">Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedSub && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="font-bold text-lg mb-3">{selectedSub.task_title}</h3>
            <p className="text-gray-600 text-sm mb-2"><span className="font-medium">Worker:</span> {selectedSub.worker_name}</p>
            <p className="text-gray-600 text-sm mb-4"><span className="font-medium">Submission:</span></p>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 mb-4">{selectedSub.submission_details}</div>
            <button onClick={() => setSelectedSub(null)} className="btn-primary w-full">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default BuyerHome
