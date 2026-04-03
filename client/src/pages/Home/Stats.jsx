import { motion } from 'framer-motion'
import { FaUsers, FaTasks, FaCoins, FaGlobe } from 'react-icons/fa'

const stats = [
  { icon: <FaUsers size={28} />, value: '10,000+', label: 'Active Workers' },
  { icon: <FaTasks size={28} />, value: '50,000+', label: 'Tasks Completed' },
  { icon: <FaCoins size={28} />, value: '$200K+', label: 'Total Paid Out' },
  { icon: <FaGlobe size={28} />, value: '50+', label: 'Countries' },
]

const Stats = () => {
  return (
    <section className="py-12 bg-green-700 text-white">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <div className="flex justify-center mb-2 text-amber-300">{s.icon}</div>
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-green-200 text-sm mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default Stats
