import { motion } from 'framer-motion'
import { FaUserPlus, FaTasks, FaCheckCircle, FaMoneyBillWave } from 'react-icons/fa'

const steps = [
  { icon: <FaUserPlus size={32} />, title: 'Create Account', desc: 'Sign up as a Worker or Buyer in seconds. Get starter coins on registration.' },
  { icon: <FaTasks size={32} />, title: 'Browse or Post Tasks', desc: 'Workers browse available tasks. Buyers post tasks with clear instructions.' },
  { icon: <FaCheckCircle size={32} />, title: 'Complete & Submit', desc: 'Workers complete tasks and submit proof. Buyers review and approve.' },
  { icon: <FaMoneyBillWave size={32} />, title: 'Get Paid', desc: 'Earn coins for every approved task. Withdraw your earnings anytime.' },
]

const HowItWorks = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-2">How It Works</h2>
          <p className="text-gray-500">Get started in 4 simple steps</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
                {step.icon}
              </div>
              <div className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                {i + 1}
              </div>
              <h3 className="font-bold text-gray-800 mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
