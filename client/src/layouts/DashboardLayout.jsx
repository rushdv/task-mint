import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { FaBars, FaTimes, FaBell, FaCoins, FaHome, FaTasks, FaList, FaMoneyBill, FaHistory, FaUsers, FaPlus, FaSignOutAlt } from 'react-icons/fa'
import { useAuth } from '../providers/AuthProvider'
import useUser from '../hooks/useUser'
import NotificationPanel from '../components/NotificationPanel'
import toast from 'react-hot-toast'

const workerLinks = [
  { to: '/dashboard/worker-home', label: 'Home', icon: <FaHome /> },
  { to: '/dashboard/task-list', label: 'Task List', icon: <FaList /> },
  { to: '/dashboard/my-submissions', label: 'My Submissions', icon: <FaTasks /> },
  { to: '/dashboard/withdrawals', label: 'Withdrawals', icon: <FaMoneyBill /> },
]
const buyerLinks = [
  { to: '/dashboard/buyer-home', label: 'Home', icon: <FaHome /> },
  { to: '/dashboard/add-task', label: 'Add New Task', icon: <FaPlus /> },
  { to: '/dashboard/my-tasks', label: "My Tasks", icon: <FaTasks /> },
  { to: '/dashboard/purchase-coin', label: 'Purchase Coin', icon: <FaCoins /> },
  { to: '/dashboard/payment-history', label: 'Payment History', icon: <FaHistory /> },
]
const adminLinks = [
  { to: '/dashboard/admin-home', label: 'Home', icon: <FaHome /> },
  { to: '/dashboard/manage-users', label: 'Manage Users', icon: <FaUsers /> },
  { to: '/dashboard/manage-tasks', label: 'Manage Tasks', icon: <FaTasks /> },
]

const DashboardLayout = () => {
  const { user, logout } = useAuth()
  const { dbUser } = useUser()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const links = dbUser?.role === 'admin' ? adminLinks : dbUser?.role === 'buyer' ? buyerLinks : workerLinks

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/')
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-green-800 text-white transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto`}>
        <div className="flex items-center justify-between p-4 border-b border-green-700">
          <NavLink to="/" className="text-xl font-bold flex items-center gap-2">
            🪙 TaskMint
          </NavLink>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}><FaTimes /></button>
        </div>
        <nav className="p-4 space-y-1">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-green-600 font-semibold' : 'hover:bg-green-700'}`
              }
            >
              {link.icon} {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-green-700 transition-colors">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button className="lg:hidden text-gray-600" onClick={() => setSidebarOpen(true)}><FaBars size={20} /></button>
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-1 text-amber-600 font-semibold">
              <FaCoins /> {dbUser?.coins || 0}
            </div>
            <div className="text-sm text-gray-600 hidden sm:block">
              <span className="capitalize bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">{dbUser?.role}</span>
              <span className="ml-2">{user?.displayName}</span>
            </div>
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 text-gray-600 hover:text-green-700">
                <FaBell size={18} />
              </button>
              {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
            </div>
            <img src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}`} alt="avatar" className="w-9 h-9 rounded-full object-cover border-2 border-green-500" />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
