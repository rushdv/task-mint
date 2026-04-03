import { useQuery } from '@tanstack/react-query'
import useAxiosSecure from '../../../hooks/useAxiosSecure'

const PaymentHistory = () => {
  const axiosSecure = useAxiosSecure()

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['paymentHistory'],
    queryFn: async () => {
      const res = await axiosSecure.get('/payments')
      return res.data
    },
  })

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Payment History</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-left">
                <th className="p-3">#</th>
                <th className="p-3">Transaction ID</th>
                <th className="p-3">Coins</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">No payment history</td></tr>
              ) : payments.map((p, i) => (
                <tr key={p._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-400">{i + 1}</td>
                  <td className="p-3 font-mono text-xs text-gray-500">{p.transactionId || 'N/A'}</td>
                  <td className="p-3 text-amber-600 font-semibold">+{p.coins} coins</td>
                  <td className="p-3 text-green-600 font-semibold">${p.amount}</td>
                  <td className="p-3 text-gray-500">{new Date(p.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PaymentHistory
