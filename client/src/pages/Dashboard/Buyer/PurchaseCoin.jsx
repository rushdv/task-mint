import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { FaCoins } from 'react-icons/fa'
import useAxiosSecure from '../../../hooks/useAxiosSecure'
import useUser from '../../../hooks/useUser'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const packages = [
  { coins: 10, price: 1, label: 'Starter' },
  { coins: 150, price: 10, label: 'Basic' },
  { coins: 500, price: 20, label: 'Pro' },
  { coins: 1000, price: 35, label: 'Elite' },
]

const CheckoutForm = ({ selectedPkg, onSuccess }) => {
  const stripe = useStripe()
  const elements = useElements()
  const axiosSecure = useAxiosSecure()
  const { dbUser } = useUser()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    try {
      const { data } = await axiosSecure.post('/create-payment-intent', { amount: selectedPkg.price })
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      })
      if (result.error) {
        toast.error(result.error.message)
      } else if (result.paymentIntent.status === 'succeeded') {
        await axiosSecure.post('/payments', {
          buyer_email: dbUser?.email,
          amount: selectedPkg.price,
          coins: selectedPkg.coins,
          transactionId: result.paymentIntent.id,
        })
        toast.success(`${selectedPkg.coins} coins added!`)
        onSuccess()
      }
    } catch (err) {
      toast.error('Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-gray-300 rounded-lg p-3">
        <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
      </div>
      <button type="submit" disabled={!stripe || loading} className="btn-primary w-full py-2.5 disabled:opacity-60">
        {loading ? 'Processing...' : `Pay $${selectedPkg.price}`}
      </button>
    </form>
  )
}

const PurchaseCoin = () => {
  const [selectedPkg, setSelectedPkg] = useState(null)
  const queryClient = useQueryClient()

  const handleSuccess = () => {
    setSelectedPkg(null)
    queryClient.invalidateQueries(['dbUser'])
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Purchase Coins</h1>
      <p className="text-gray-500 text-sm mb-6">Choose a package to top up your coin balance</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {packages.map((pkg, i) => (
          <div
            key={i}
            onClick={() => setSelectedPkg(pkg)}
            className={`bg-white rounded-xl shadow-sm p-5 text-center cursor-pointer border-2 transition-all hover:shadow-md ${selectedPkg?.coins === pkg.coins ? 'border-green-500 bg-green-50' : 'border-transparent'}`}
          >
            <div className="text-amber-500 flex justify-center mb-2"><FaCoins size={28} /></div>
            <p className="text-2xl font-bold text-gray-800">{pkg.coins}</p>
            <p className="text-gray-500 text-sm mb-2">coins</p>
            <p className="text-green-600 font-bold text-lg">${pkg.price}</p>
            <p className="text-xs text-gray-400 mt-1">{pkg.label}</p>
          </div>
        ))}
      </div>

      {selectedPkg && (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Complete Payment</h2>
          <p className="text-gray-500 text-sm mb-4">
            You're purchasing <span className="text-amber-600 font-bold">{selectedPkg.coins} coins</span> for <span className="text-green-600 font-bold">${selectedPkg.price}</span>
          </p>
          <Elements stripe={stripePromise}>
            <CheckoutForm selectedPkg={selectedPkg} onSuccess={handleSuccess} />
          </Elements>
          <p className="text-xs text-gray-400 mt-3 text-center">Use test card: 4242 4242 4242 4242</p>
        </div>
      )}
    </div>
  )
}

export default PurchaseCoin
