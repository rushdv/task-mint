import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FaCoins, FaBars, FaTimes } from 'react-icons/fa'
import { useAuth } from '../providers/AuthProvider'
import useUser from '../hooks/useUser'
import toast from 'react-hot-toast'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { dbUser } = useUser()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const dashboardPath = dbUser?.role === 'admin'
    ? '/dashboard/admin-home'
    : dbUser?.role === 'buyer'
    ? '/dashboard/buyer-home'
    : '/dashboard/worker-home'

  return (
    <nav className="bg-green-800 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold flex items-center gap-2">
          🐝 TaskMint
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link to={dashboardPath} className="hover:text-green-200 transition-colors">Dashboard</Link>
              <div className="flex items-center gap-1 bg-green-700 px-3 py-1 rounded-full text-amber-300 font-semibold">
                <FaCoins /> {dbUser?.coins || 0}
              </div>
              <div className="flex items-center gap-2">
                <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} alt="avatar" className="w-8 h-8 rounded-full object-cover border-2 border-green-400" />
                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg text-sm transition-colors">Logout</button>
              </div>
            </>
          ) : (
            <>
              <NavLink to="/login" className="hover:text-green-200 transition-colors">Login</NavLink>
              <NavLink to="/register" className="bg-white text-green-800 px-4 py-1.5 rounded-lg font-semibold hover:bg-green-100 transition-colors">Register</NavLink>
            </>
          )}
          <a href="https://github.com" target="_blank" rel="noreferrer" className="bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors">
            Join as Developer
          </a>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-green-900 px-4 pb-4 space-y-2">
          {user ? (
            <>
              <Link to={dashboardPath} className="block py-2 hover:text-green-200" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <div className="flex items-center gap-1 text-amber-300 font-semibold py-2">
                <FaCoins /> {dbUser?.coins || 0} coins
              </div>
              <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="block w-full text-left py-2 text-red-300">Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="block py-2" onClick={() => setMenuOpen(false)}>Login</NavLink>
              <NavLink to="/register" className="block py-2" onClick={() => setMenuOpen(false)}>Register</NavLink>
            </>
          )}
          <a href="https://github.com" target="_blank" rel="noreferrer" className="block py-2 text-amber-400">Join as Developer</a>
        </div>
      )}
    </nav>
  )
}

export default Navbar
