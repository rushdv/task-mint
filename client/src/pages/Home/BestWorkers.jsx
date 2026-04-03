import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FaCoins } from 'react-icons/fa'
import useAxiosPublic from '../../hooks/useAxiosPublic'

const BestWorkers = () => {
  const axiosPublic = useAxiosPublic()

  const { data: workers = [] } = useQuery({
    queryKey: ['topWorkers'],
    queryFn: async () => {
      const res = await axiosPublic.get('/users/top-workers')
      return res.data
    },
  })

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Top Workers</h2>
          <p className="text-gray-500">Our highest earning community members</p>
        </motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {workers.map((worker, i) => (
            <motion.div
              key={worker._id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow"
            >
              <img
                src={worker.photo || `https://ui-avatars.com/api/?name=${worker.name}&background=16a34a&color=fff`}
                alt={worker.name}
                className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-2 border-green-400"
              />
              <p className="font-semibold text-gray-800 text-sm truncate">{worker.name}</p>
              <div className="flex items-center justify-center gap-1 text-amber-500 font-bold mt-1">
                <FaCoins size={12} /> {worker.coins}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BestWorkers
