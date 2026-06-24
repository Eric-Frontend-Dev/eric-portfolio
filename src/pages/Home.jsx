import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import About from '../components/About'
import Projects from '../components/Projects'
import Services from '../components/Services'
import Certificates from '../components/Certificates'
import Testimonials from '../components/Testimonials'
import Contact from '../components/Contact'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.4 }}>
      <Navbar />
      <Hero />
      <About />
      <Projects />
      <Services />
      <Certificates />
      <Testimonials />
      <Contact />
      <Footer />
    </motion.div>
  )
}
