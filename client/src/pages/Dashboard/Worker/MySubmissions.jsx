import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import useAxiosSecure from '../../../hooks/useAxiosSecure'

const MySubmissions = () => {
  const axiosSecure = useAxiosSecure()
  const [page, setPage] = useState(1)
  const limit = 10

  const { data = {}, isLoading } = useQuery({
    queryKey: ['mySubmissions', page],
    queryFn: async () => {
      const res = await axiosSecure.get(`/submissions/worker?page=${page}&limit=${limit}`)
      return res.data
    },
  })

  const { submissions = [], totalPages = 1 } = data

  const statusBadge = (status) => {
    if (status === 'approved') return <span className="badge-approved">Approved</span>
    if (status === 'rejected') return <span className="badge-rejected">Rejected</span>
    return <span className="badge-pending">Pending</span>
  }

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Submissions</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-left">
                <th className="p-3">#</th>
                <th className="p-3">Task Title</th>
                <th className="p-3">Buyer</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">No submissions yet</td></tr>
              ) : submissions.map((s, i) => (
                <tr key={s._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-400">{(page - 1) * limit + i + 1}</td>
                  <td className="p-3 font-medium">{s.task_title}</td>
                  <td className="p-3 text-gray-500">{s.buyer_name}</td>
                  <td className="p-3 text-amber-600 font-semibold">{s.payable_amount} coins</td>
                  <td className="p-3 text-gray-500">{new Date(s.current_date).toLocaleDateString()}</td>
                  <td className="p-3">{statusBadge(s.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1 rounded border disabled:opacity-40 hover:bg-gray-50">Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`px-3 py-1 rounded border ${p === page ? 'bg-green-600 text-white border-green-600' : 'hover:bg-gray-50'}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1 rounded border disabled:opacity-40 hover:bg-gray-50">Next</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MySubmissions
