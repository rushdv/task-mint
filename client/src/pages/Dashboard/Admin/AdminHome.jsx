import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FaUsers, FaShoppingCart, FaCoins, FaDollarSign } from 'react-icons/fa'
import useAxiosSecure from '../../../hooks/useAxiosSecure'
import toast from 'react-hot-toast'

const AdminHome = () => {
  const axiosSecure = useAxiosSecure()
  const queryClient = useQueryClient()

  const { data: stats = {} } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await axiosSecure.get('/admin/stats')
      return res.data
    },
  })

  const { data: withdrawals = [], refetch } = useQuery({
    queryKey: ['pendingWithdrawals'],
    queryFn: async () => {
      const res = await axiosSecure.get('/withdrawals/pending')
      return res.data
    },
  })

  const handleApprove = async (id) => {
    try {
      await axiosSecure.patch(`/withdrawals/${id}/approve`)
      toast.success('Withdrawal approved!')
      refetch()
      queryClient.invalidateQueries(['adminStats'])
    } catch { toast.error('Failed') }
  }

  const cards = [
    { label: 'Total Workers', value: stats.totalWorkers || 0, icon: <FaUsers />, color: 'bg-blue-500' },
    { label: 'Total Buyers', value: stats.totalBuyers || 0, icon: <FaShoppingCart />, color: 'bg-purple-500' },
    { label: 'Total Coins', value: stats.totalCoins || 0, icon: <FaCoins />, color: 'bg-amber-500' },
    { label: 'Total Payments', value: `$${stats.totalPayments || 0}`, icon: <FaDollarSign />, color: 'bg-green-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-3">
            <div className={`${c.color} text-white p-3 rounded-lg text-xl`}>{c.icon}</div>
            <div>
              <p className="text-gray-500 text-xs">{c.label}</p>
              <p className="text-xl font-bold text-gray-800">{c.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Pending Withdrawal Requests ({withdrawals.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-left">
                <th className="p-3">Worker</th>
                <th className="p-3">Email</th>
                <th className="p-3">Coins</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Method</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">No pending withdrawals</td></tr>
              ) : withdrawals.map(w => (
                <tr key={w._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{w.worker_name}</td>
                  <td className="p-3 text-gray-500 text-xs">{w.worker_email}</td>
                  <td className="p-3 text-amber-600">{w.withdrawal_coin}</td>
                  <td className="p-3 text-green-600 font-semibold">${w.withdrawal_amount}</td>
                  <td className="p-3 capitalize">{w.payment_system}</td>
                  <td className="p-3">
                    <button onClick={() => handleApprove(w._id)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs">
                      Payment Success
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

export default AdminHome
