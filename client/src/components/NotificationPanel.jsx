import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import useAxiosSecure from '../hooks/useAxiosSecure'
import { FaBell } from 'react-icons/fa'

const NotificationPanel = ({ onClose }) => {
  const axiosSecure = useAxiosSecure()
  const navigate = useNavigate()
  const panelRef = useRef(null)

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await axiosSecure.get('/notifications')
      return res.data
    },
  })

  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  return (
    <div ref={panelRef} className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
      <div className="p-3 border-b flex items-center gap-2 font-semibold text-gray-700">
        <FaBell className="text-green-600" /> Notifications
      </div>
      {notifications.length === 0 ? (
        <p className="p-4 text-gray-500 text-sm text-center">No notifications yet</p>
      ) : (
        notifications.map((n, i) => (
          <div
            key={i}
            onClick={() => { navigate(n.actionRoute); onClose() }}
            className="p-3 border-b hover:bg-gray-50 cursor-pointer text-sm"
          >
            <p className="text-gray-700">{n.message}</p>
            <p className="text-gray-400 text-xs mt-1">{new Date(n.time).toLocaleString()}</p>
          </div>
        ))
      )}
    </div>
  )
}

export default NotificationPanel
