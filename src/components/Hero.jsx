import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, MessageCircle, ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'

function ParticleNetwork() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    let particles = []
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        dx: (Math.random() - 0.5) * 0.4, dy: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.6 + 0.1,
      })
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(226,185,111,${p.opacity})`; ctx.fill()
        p.x += p.dx; p.y += p.dy
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1
      })
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y)
          if (dist < 130) {
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(226,185,111,${0.08 * (1 - dist / 130)})`; ctx.stroke()
          }
        })
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
}

const words = ['Fast.', 'Beautiful.', 'Conversion-Focused.']

export default function Hero() {
  const [profile, setProfile] = useState(null)
  const [wordIndex, setWordIndex] = useState(0)

  useEffect(() => {
    supabase.from('profile').select('*').single().then(({ data }) => setProfile(data))
  }, [])

  useEffect(() => {
    const t = setInterval(() => setWordIndex(i => (i + 1) % words.length), 2000)
    return () => clearInterval(t)
  }, [])

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } } }
  const item = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22,1,0.36,1] } } }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#080812]">
      <ParticleNetwork />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gold/5 rounded-full blur-[140px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px]" />
      </div>

      <motion.div className="relative z-10 container-max px-6 text-center" variants={container} initial="hidden" animate="visible">
        <motion.div variants={item} className="flex justify-center mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/20 bg-gold/5 text-sm text-gold/80">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            {profile?.availability === 'open' ? 'Available for hire' : 'Currently busy'}
          </span>
        </motion.div>

        <motion.div variants={item}>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-2">
            Hi, I'm <span className="text-gradient">{profile?.name || 'Eric (Adura) Kachikwu'}</span>
          </h1>
          <h2 className="font-display text-2xl md:text-4xl font-semibold text-white/80 mb-2">Frontend Developer</h2>
        </motion.div>

        <motion.div variants={item} className="h-12 flex items-center justify-center mb-6">
          <motion.span key={wordIndex} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}
            transition={{ duration:0.4 }} className="text-xl md:text-2xl text-gold font-medium">
            {words[wordIndex]}
          </motion.span>
        </motion.div>

        <motion.p variants={item} className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          {profile?.tagline || 'I build fast, beautiful, and conversion-focused web experiences.'}
        </motion.p>

        <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* Resume button — shows if resume uploaded, otherwise shows contact */}
          {profile?.resume_url ? (
            <motion.a
              href={profile.resume_url} target="_blank" rel="noreferrer"
              whileHover={{ scale:1.05 }} whileTap={{ scale:0.97 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-navy font-semibold rounded-full gold-glow hover:bg-gold-light transition-all">
              <Download size={18} /> Download Resume
            </motion.a>
          ) : (
            <motion.button
              whileHover={{ scale:1.05 }} whileTap={{ scale:0.97 }}
              onClick={() => scrollTo('contact')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-navy font-semibold rounded-full gold-glow hover:bg-gold-light transition-all">
              <MessageCircle size={18} /> Let's Talk
            </motion.button>
          )}
          <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.97 }}
            onClick={() => scrollTo('projects')}
            className="inline-flex items-center gap-2 px-8 py-4 border border-gold/40 text-gold font-semibold rounded-full hover:bg-gold/10 transition-all">
            View My Work
          </motion.button>
        </motion.div>

        <motion.button variants={item} onClick={() => scrollTo('about')}
          className="mt-16 flex flex-col items-center gap-2 text-white/30 hover:text-gold transition-colors mx-auto"
          animate={{ y:[0,8,0] }} transition={{ repeat:Infinity, duration:2 }}>
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown size={16} />
        </motion.button>
      </motion.div>
    </section>
  )
}
