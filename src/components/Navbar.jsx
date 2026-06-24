import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const links = [
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Services', href: '#services' },
  { label: 'Certificates', href: '#certificates' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (href) => {
    setOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'py-3 bg-navy/90 backdrop-blur-xl border-b border-gold/10' : 'py-5'
      }`}
    >
      <div className="container-max px-6 flex items-center justify-between">
        <motion.a href="/" className="font-display text-xl font-bold text-gradient" whileHover={{ scale: 1.05 }}>
          Eric.dev
        </motion.a>

        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <motion.button
              key={`nav-${link.label}`}
              onClick={() => scrollTo(link.href)}
              className="text-sm text-white/70 hover:text-gold transition-colors duration-300 relative group"
              whileHover={{ y: -1 }}
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold group-hover:w-full transition-all duration-300" />
            </motion.button>
          ))}
          <motion.button
            onClick={() => scrollTo('#contact')}
            className="px-5 py-2 border border-gold/50 text-gold text-sm rounded-full hover:bg-gold/10 transition-all duration-300 gold-glow"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
          >
            Hire Me
          </motion.button>
        </div>

        <motion.button className="md:hidden text-white/80 hover:text-gold" onClick={() => setOpen(!open)} whileTap={{ scale: 0.9 }}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-navy/95 backdrop-blur-xl border-t border-gold/10"
          >
            <div className="flex flex-col p-6 gap-4">
              {links.map((link, i) => (
                <motion.button
                  key={`mob-${link.label}`}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                  onClick={() => scrollTo(link.href)}
                  className="text-left text-white/80 hover:text-gold py-2 border-b border-white/5 transition-colors"
                >
                  {link.label}
                </motion.button>
              ))}
              <motion.button
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
                onClick={() => scrollTo('#contact')}
                className="mt-2 px-5 py-3 bg-gold/10 border border-gold/50 text-gold rounded-full text-sm"
              >
                Hire Me
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
