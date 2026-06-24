import { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { supabase } from '../lib/supabase'

function CircuitBg() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.04]">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M10 10 L40 10 L40 40 L70 40 L70 10 L90 10" stroke="#e2b96f" strokeWidth="1" fill="none"/>
            <path d="M10 60 L30 60 L30 80 L60 80 L60 60 L90 60" stroke="#e2b96f" strokeWidth="1" fill="none"/>
            <path d="M50 10 L50 30 L80 30" stroke="#e2b96f" strokeWidth="1" fill="none"/>
            <path d="M20 40 L20 90" stroke="#e2b96f" strokeWidth="1" fill="none"/>
            <circle cx="10" cy="10" r="2" fill="#e2b96f"/>
            <circle cx="40" cy="10" r="2" fill="#e2b96f"/>
            <circle cx="70" cy="40" r="2" fill="#e2b96f"/>
            <circle cx="50" cy="30" r="2" fill="#e2b96f"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit)"/>
      </svg>
    </div>
  )
}

function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    const end = parseInt(target)
    if (isNaN(end)) { setCount(target); return }
    let start = 0
    const step = Math.max(30, 1500 / end)
    const timer = setInterval(() => {
      start += 1; setCount(start)
      if (start >= end) clearInterval(timer)
    }, step)
    return () => clearInterval(timer)
  }, [inView, target])
  return <span ref={ref}>{isNaN(parseInt(target)) ? target : count}{suffix}</span>
}

export default function About() {
  const [profile, setProfile] = useState(null)
  const [projectCount, setProjectCount] = useState(0)

  useEffect(() => {
    supabase.from('profile').select('*').single().then(({ data }) => setProfile(data))
    supabase.from('projects').select('id', { count: 'exact', head: true }).then(({ count }) => setProjectCount(count || 0))
  }, [])

  return (
    <section id="about" className="relative section-pad overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #080812 0%, #0a0a1a 50%, #080812 100%)' }}>
      <CircuitBg />
      <div className="absolute top-20 right-20 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-gold/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="container-max px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.p initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-gold text-sm tracking-widest uppercase mb-3">Get to know me</motion.p>
          <motion.h2 initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:0.1 }} viewport={{ once:true }} className="font-display text-4xl md:text-5xl font-bold">About Me</motion.h2>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity:0, x:-50 }} whileInView={{ opacity:1, x:0 }} transition={{ duration:0.7 }} viewport={{ once:true }} className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="absolute -inset-3 rounded-2xl border border-gold/10 animate-pulse" />
              <div className="w-64 h-64 rounded-2xl overflow-hidden border-2 border-gold/20 relative">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Eric Kachikwu" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gold/10 to-transparent flex items-center justify-center">
                    <span className="font-display text-6xl text-gold/30">EK</span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-[#0d0d1f] border border-gold/20 rounded-full text-sm text-gold/80 whitespace-nowrap">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                {profile?.availability === 'open' ? 'Open to work' : 'Currently busy'}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 w-full">
              {[
                { val: projectCount, suffix: '+', label: 'Projects' },
                { val: 100, suffix: '%', label: 'On-Time' },
                { val: '∞', suffix: '', label: 'Passion' },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:i*0.1+0.3 }} viewport={{ once:true }}
                  className="text-center p-4 card-glass rounded-xl">
                  <p className="font-display text-2xl font-bold text-gold">
                    <Counter target={s.val} suffix={s.suffix} />
                  </p>
                  <p className="text-xs text-white/50 mt-1">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity:0, x:50 }} whileInView={{ opacity:1, x:0 }} transition={{ duration:0.7 }} viewport={{ once:true }}>
            <p className="text-white/70 text-lg leading-relaxed mb-8">
              {profile?.bio || "I'm a Frontend Developer based in Nigeria with a passion for crafting clean, responsive, and intuitive web interfaces."}
            </p>
            <h3 className="text-white/50 text-sm tracking-widest uppercase mb-4">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {(profile?.tech_stack || ['React','JavaScript','Tailwind CSS','Framer Motion','HTML5','CSS3','WordPress','Git','Supabase']).map((tech, i) => (
                <motion.span key={tech}
                  initial={{ opacity:0, scale:0.8 }} whileInView={{ opacity:1, scale:1 }} transition={{ delay:i*0.05 }} viewport={{ once:true }}
                  whileHover={{ scale:1.1, borderColor:'rgba(226,185,111,0.6)', color:'#e2b96f' }}
                  className="px-3 py-1.5 text-sm border border-white/10 text-white/70 rounded-full cursor-default transition-all duration-300">
                  {tech}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
