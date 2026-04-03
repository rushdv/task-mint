import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa'
import { useAuth } from '../../providers/AuthProvider'
import useAxiosPublic from '../../hooks/useAxiosPublic'
import toast from 'react-hot-toast'

const IMGBB_KEY = import.meta.env.VITE_IMGBB_API_KEY

const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { register: firebaseRegister, updateUserProfile, googleLogin } = useAuth()
  const axiosPublic = useAxiosPublic()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const uploadImage = async (file) => {
    if (!file) return null
    const formData = new FormData()
    formData.append('image', file)
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: 'POST', body: formData })
    const data = await res.json()
    return data.data?.url || null
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      let photoURL = data.photoURL
      if (data.photo?.[0]) {
        photoURL = await uploadImage(data.photo[0])
      }
      await firebaseRegister(data.email, data.password)
      await updateUserProfile(data.name, photoURL || `https://ui-avatars.com/api/?name=${data.name}`)
      await axiosPublic.post('/users', {
        name: data.name,
        email: data.email,
        photo: photoURL || `https://ui-avatars.com/api/?name=${data.name}`,
        role: data.role,
      })
      toast.success('Registration successful!')
      navigate('/dashboard/' + (data.role === 'buyer' ? 'buyer-home' : 'worker-home'))
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    try {
      const result = await googleLogin()
      const u = result.user
      await axiosPublic.post('/users', {
        name: u.displayName,
        email: u.email,
        photo: u.photoURL,
        role: 'worker',
      })
      toast.success('Logged in with Google!')
      navigate('/dashboard/worker-home')
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Create Account</h2>
        <p className="text-center text-gray-500 text-sm mb-6">Join TaskMint and start earning today</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input {...register('name', { required: 'Name is required' })} className="input-field" placeholder="Your full name" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email format' } })} className="input-field" placeholder="your@email.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
            <input type="file" accept="image/*" {...register('photo')} className="input-field text-sm" />
            <p className="text-gray-400 text-xs mt-1">Or enter image URL:</p>
            <input {...register('photoURL')} className="input-field mt-1" placeholder="https://example.com/photo.jpg" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select {...register('role', { required: 'Please select a role' })} className="input-field">
              <option value="">Select role</option>
              <option value="worker">Worker (get 10 coins)</option>
              <option value="buyer">Buyer (get 50 coins)</option>
            </select>
            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Minimum 6 characters' },
                  pattern: { value: /(?=.*[A-Z])(?=.*[!@#$&*])/, message: 'Must include uppercase and special character' },
                })}
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
            {loading ? 'Creating account...' : 'Register'}
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
          Already have an account? <Link to="/login" className="text-green-600 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
