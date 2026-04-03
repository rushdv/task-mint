import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FaTasks, FaClock, FaCoins } from 'react-icons/fa'
import useAxiosSecure from '../../../hooks/useAxiosSecure'

const WorkerHome = () => {
  const axiosSecure = useAxiosSecure()

  const { data: stats = {} } = useQuery({
    queryKey: ['workerStats'],
    queryFn: async () => {
      const res = await axiosSecure.get('/submissions/worker/stats')
      return res.data
    },
  })

  const { data: approvedSubs = [] } = useQuery({
    queryKey: ['approvedSubs'],
    queryFn: async () => {
      const res = await axiosSecure.get('/submissions/worker?limit=100')
      return res.data.submissions?.filter(s => s.status === 'approved') || []
    },
  })

  const cards = [
    { label: 'Total Submissions', value: stats.total || 0, icon: <FaTasks />, color: 'bg-blue-500' },
    { label: 'Pending Submissions', value: stats.pending || 0, icon: <FaClock />, color: 'bg-yellow-500' },
    { label: 'Total Earnings', value: `${stats.totalEarning || 0} coins`, icon: <FaCoins />, color: 'bg-green-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Worker Dashboard</h1>
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
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Approved Submissions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="text-left p-3 rounded-l-lg">Task Title</th>
                <th className="text-left p-3">Buyer</th>
                <th className="text-left p-3">Amount</th>
                <th className="text-left p-3 rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              {approvedSubs.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">No approved submissions yet</td></tr>
              ) : approvedSubs.map((s, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-3">{s.task_title}</td>
                  <td className="p-3">{s.buyer_name}</td>
                  <td className="p-3 text-amber-600 font-semibold">{s.payable_amount} coins</td>
                  <td className="p-3"><span className="badge-approved">Approved</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default WorkerHome
