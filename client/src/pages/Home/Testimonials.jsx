import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import { motion } from 'framer-motion'
import { FaQuoteLeft } from 'react-icons/fa'
import 'swiper/css'
import 'swiper/css/pagination'

const testimonials = [
  { name: 'Sarah Johnson', role: 'Worker', quote: 'TaskMint changed my life! I earn extra income completing simple tasks during my free time. The payments are always on time.', avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=16a34a&color=fff' },
  { name: 'Michael Chen', role: 'Buyer', quote: 'As a small business owner, TaskMint helps me get tasks done quickly and affordably. The worker quality is consistently excellent.', avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=0ea5e9&color=fff' },
  { name: 'Amina Osei', role: 'Worker', quote: 'I love the flexibility. I can work whenever I want and the coin system makes it easy to track my earnings.', avatar: 'https://ui-avatars.com/api/?name=Amina+Osei&background=f59e0b&color=fff' },
  { name: 'David Park', role: 'Buyer', quote: 'The platform is intuitive and the task management tools are powerful. Highly recommend for any business needing quick turnaround.', avatar: 'https://ui-avatars.com/api/?name=David+Park&background=8b5cf6&color=fff' },
  { name: 'Fatima Al-Hassan', role: 'Worker', quote: 'TaskMint is the best micro-task platform I have used. The withdrawal process is smooth and the support team is responsive.', avatar: 'https://ui-avatars.com/api/?name=Fatima+Hassan&background=ec4899&color=fff' },
]

const Testimonials = () => {
  return (
    <section className="py-16 bg-green-800 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold mb-2">What Our Users Say</h2>
          <p className="text-green-200">Real stories from our community</p>
        </motion.div>
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
          }}
          className="pb-10"
        >
          {testimonials.map((t, i) => (
            <SwiperSlide key={i}>
              <div className="bg-green-700 rounded-xl p-6 h-full">
                <FaQuoteLeft className="text-amber-400 text-2xl mb-3" />
                <p className="text-green-100 mb-4 text-sm leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-green-300 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}

export default Testimonials
