import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

const slides = [
  {
    title: 'Earn Money Completing Micro Tasks',
    subtitle: 'Join thousands of workers completing simple tasks and getting paid instantly.',
    bg: 'from-green-800 to-green-600',
    cta: 'Start Earning',
    link: '/register',
  },
  {
    title: 'Post Tasks, Get Results Fast',
    subtitle: 'Buyers can post tasks and get them completed by our skilled worker community.',
    bg: 'from-emerald-800 to-teal-600',
    cta: 'Post a Task',
    link: '/register',
  },
  {
    title: 'Trusted Platform for Everyone',
    subtitle: 'Secure payments, verified workers, and transparent task management.',
    bg: 'from-teal-800 to-green-700',
    cta: 'Join Now',
    link: '/register',
  },
]

const HeroSlider = () => {
  return (
    <Swiper
      modules={[Autoplay, Pagination, Navigation]}
      autoplay={{ delay: 4000, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      navigation
      loop
      className="w-full"
    >
      {slides.map((slide, i) => (
        <SwiperSlide key={i}>
          <div className={`bg-gradient-to-r ${slide.bg} min-h-[500px] md:min-h-[600px] flex items-center justify-center text-white px-4`}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center max-w-3xl"
            >
              <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">{slide.title}</h1>
              <p className="text-lg md:text-xl text-green-100 mb-8">{slide.subtitle}</p>
              <Link to={slide.link} className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-full font-semibold text-lg transition-colors inline-block">
                {slide.cta}
              </Link>
            </motion.div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

export default HeroSlider
