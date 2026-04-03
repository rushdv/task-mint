import { motion } from 'framer-motion'
import { FaShieldAlt, FaBolt, FaHandshake, FaHeadset } from 'react-icons/fa'

const features = [
  { icon: <FaShieldAlt size={28} />, title: 'Secure & Trusted', desc: 'All transactions are secured with industry-standard encryption and verified payment systems.' },
  { icon: <FaBolt size={28} />, title: 'Fast Payments', desc: 'Get your earnings processed quickly. No long waiting periods for your hard-earned coins.' },
  { icon: <FaHandshake size={28} />, title: 'Fair for Everyone', desc: 'Transparent task pricing and fair review system ensures both workers and buyers are satisfied.' },
  { icon: <FaHeadset size={28} />, title: '24/7 Support', desc: 'Our dedicated support team is always available to help resolve any issues you encounter.' },
]

const WhyChooseUs = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Why Choose TaskMint?</h2>
          <p className="text-gray-500">We make micro-tasking simple, safe, and rewarding</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border-t-4 border-green-500"
            >
              <div className="text-green-600 mb-3">{f.icon}</div>
              <h3 className="font-bold text-gray-800 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUs
