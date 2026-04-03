import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa'
import { useAuth } from '../../providers/AuthProvider'
import useAxiosPublic from '../../hooks/useAxiosPublic'
import useUser from '../../hooks/useUser'
import toast from 'react-hot-toast'

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { login, googleLogin } = useAuth()
  const axiosPublic = useAxiosPublic()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const from = location.state?.from?.pathname || null

  const getRedirect = (role) => {
    if (from) return from
    return role === 'admin' ? '/dashboard/admin-home' : role === 'buyer' ? '/dashboard/buyer-home' : '/dashboard/worker-home'
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await login(data.email, data.password)
      const res = await axiosPublic.get(`/users/me`, { headers: { authorization: `Bearer ${localStorage.getItem('access-token')}` } })
      toast.success('Welcome back!')
      navigate(getRedirect(res.data?.role))
    } catch (err) {
      toast.error('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    try {
      const result = await googleLogin()
      const u = result.user
      await axiosPublic.post('/users', { name: u.displayName, email: u.email, photo: u.photoURL, role: 'worker' })
      toast.success('Logged in!')
      navigate('/dashboard/worker-home')
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Welcome Back</h2>
        <p className="text-center text-gray-500 text-sm mb-6">Sign in to your TaskMint account</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
              className="input-field"
              placeholder="your@email.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                {...register('password', { required: 'Password is required' })}
                className="input-field pr-10"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-2.5 text-gray-400">
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 disabled:opacity-60">
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 hover:bg-gray-50 transition-colors font-medium text-gray-700">
          <FaGoogle className="text-red-500" /> Continue with Google
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account? <Link to="/register" className="text-green-600 font-semibold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
