import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { FaCoins, FaDollarSign } from 'react-icons/fa'
import useAxiosSecure from '../../../hooks/useAxiosSecure'
import useUser from '../../../hooks/useUser'
import toast from 'react-hot-toast'
import { useState } from 'react'

const Withdrawals = () => {
  const { dbUser } = useUser()
  const axiosSecure = useAxiosSecure()
  const queryClient = useQueryClient()
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)

  const coinToWithdraw = watch('withdrawal_coin', 0)
  const withdrawAmount = (coinToWithdraw / 20).toFixed(2)
  const canWithdraw = (dbUser?.coins || 0) >= 200

  const onSubmit = async (data) => {
    if (data.withdrawal_coin > dbUser.coins) return toast.error('Cannot exceed available coins')
    setLoading(true)
    try {
      await axiosSecure.post('/withdrawals', {
        worker_email: dbUser.email,
        worker_name: dbUser.name,
        withdrawal_coin: Number(data.withdrawal_coin),
        withdrawal_amount: Number(withdrawAmount),
        payment_system: data.payment_system,
        account_number: data.account_number,
      })
      toast.success('Withdrawal request submitted!')
      queryClient.invalidateQueries(['dbUser'])
      reset()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit withdrawal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Withdrawals</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Your Earnings</h2>
        <div className="flex gap-4">
          <div className="flex-1 bg-amber-50 rounded-lg p-4 text-center">
            <FaCoins className="text-amber-500 text-2xl mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-800">{dbUser?.coins || 0}</p>
            <p className="text-gray-500 text-sm">Available Coins</p>
          </div>
          <div className="flex-1 bg-green-50 rounded-lg p-4 text-center">
            <FaDollarSign className="text-green-500 text-2xl mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-800">${((dbUser?.coins || 0) / 20).toFixed(2)}</p>
            <p className="text-gray-500 text-sm">Withdrawal Value</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">20 coins = $1 | Minimum 200 coins to withdraw</p>
      </div>

      {!canWithdraw ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-semibold">Insufficient Coins</p>
          <p className="text-red-400 text-sm mt-1">You need at least 200 coins to withdraw. Keep completing tasks!</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Withdrawal Request</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coins to Withdraw</label>
              <input
                type="number"
                {...register('withdrawal_coin', {
                  required: 'Required',
                  min: { value: 200, message: 'Minimum 200 coins' },
                  max: { value: dbUser?.coins, message: 'Cannot exceed available coins' },
                })}
                className="input-field"
                placeholder="Enter coin amount"
              />
              {errors.withdrawal_coin && <p className="text-red-500 text-xs mt-1">{errors.withdrawal_coin.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Withdrawal Amount ($)</label>
              <input value={`$${withdrawAmount}`} readOnly className="input-field bg-gray-50 cursor-not-allowed" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment System</label>
              <select {...register('payment_system', { required: 'Select payment system' })} className="input-field">
                <option value="">Select payment method</option>
                <option value="stripe">Stripe</option>
                <option value="bkash">Bkash</option>
                <option value="rocket">Rocket</option>
                <option value="nagad">Nagad</option>
                <option value="paypal">PayPal</option>
              </select>
              {errors.payment_system && <p className="text-red-500 text-xs mt-1">{errors.payment_system.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              <input {...register('account_number', { required: 'Account number required' })} className="input-field" placeholder="Your account number" />
              {errors.account_number && <p className="text-red-500 text-xs mt-1">{errors.account_number.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 disabled:opacity-60">
              {loading ? 'Submitting...' : 'Withdraw'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default Withdrawals
