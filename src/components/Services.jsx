import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Code, Layout, Globe, Smartphone, Palette, Database, Settings, Zap, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'

const iconMap = { code: Code, layout: Layout, globe: Globe, smartphone: Smartphone, palette: Palette, database: Database, settings: Settings, zap: Zap }

function HexBg() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hex" x="0" y="0" width="56" height="100" patternUnits="userSpaceOnUse">
            <polygon points="28,2 54,16 54,44 28,58 2,44 2,16" stroke="#e2b96f" strokeWidth="1" fill="none"/>
            <polygon points="28,52 54,66 54,94 28,108 2,94 2,66" stroke="#e2b96f" strokeWidth="1" fill="none"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex)"/>
      </svg>
    </div>
  )
}

export default function Services() {
  const [services, setServices] = useState([])

  useEffect(() => {
    supabase.from('services').select('*').order('display_order').then(({ data }) => setServices(data || []))
  }, [])

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="services" className="relative section-pad overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #080812 0%, #0b0a14 50%, #080812 100%)' }}>
      <HexBg />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="container-max px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.p initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            className="text-gold text-sm tracking-widest uppercase mb-3">What I offer</motion.p>
          <motion.h2 initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:0.1 }} viewport={{ once:true }}
            className="font-display text-4xl md:text-5xl font-bold">Services</motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {services.map((s, i) => {
            const Icon = iconMap[s.icon] || Code
            return (
              <motion.div key={s.id}
                initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }}
                transition={{ delay:i*0.1, duration:0.6 }} viewport={{ once:true }}
                whileHover={{ y:-8, transition:{ duration:0.3 } }}
                className="relative rounded-2xl p-8 group flex flex-col overflow-hidden"
                style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', minHeight: '280px' }}
              >
                {/* Glow on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background:'radial-gradient(circle at 50% 0%, rgba(226,185,111,0.06) 0%, transparent 70%)', border:'1px solid rgba(226,185,111,0.2)' }} />

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                  <Icon size={22} className="text-gold" />
                </div>

                {/* Title */}
                <h3 className="font-display text-xl font-semibold mb-3">{s.title}</h3>

                {/* Description — flex-1 pushes pricing to bottom */}
                <p className="text-white/55 text-sm leading-relaxed flex-1">{s.description}</p>

                {/* Pricing — always at bottom, always aligned */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                  <button
                    onClick={scrollToContact}
                    className="text-gold text-sm font-medium hover:text-gold-light transition-colors"
                  >
                    {s.pricing_label}
                  </button>
                  <motion.div whileHover={{ x:4 }} className="text-gold/40 group-hover:text-gold transition-colors">
                    <ArrowRight size={16} />
                  </motion.div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center">
          <p className="text-white/40 mb-4">Need something custom or not listed above?</p>
          <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.97 }}
            onClick={scrollToContact}
            className="inline-flex items-center gap-2 px-6 py-3 border border-gold/30 text-gold rounded-full text-sm hover:bg-gold/10 transition-all duration-300">
            Let's talk about your project <ArrowRight size={14} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
