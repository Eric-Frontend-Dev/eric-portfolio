import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { detectLink, PlatformIcon } from '../lib/linkDetector.jsx'

export default function Footer() {
  const [links, setLinks] = useState([])
  useEffect(() => {
    supabase.from('links').select('*').order('display_order').then(({ data }) => setLinks(data || []))
  }, [])
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' })
  const navLinks = ['about','projects','services','certificates','contact']
  return (
    <footer className="relative border-t border-white/5 py-16 overflow-hidden"
      style={{ background:'linear-gradient(180deg, #090910 0%, #06060e 100%)' }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-32 bg-gold/3 blur-[60px] pointer-events-none" />
      <div className="container-max px-6 relative z-10">
        <div className="grid md:grid-cols-3 gap-10 mb-12">
          <div>
            <p className="font-display text-2xl font-bold text-gradient mb-3">Eric.dev</p>
            <p className="text-white/35 text-sm leading-relaxed max-w-xs">Building clean, fast, and conversion-focused web experiences. Based in Nigeria, available worldwide.</p>
          </div>
          <div>
            <p className="text-white/25 text-xs tracking-widest uppercase mb-4">Navigation</p>
            <div className="flex flex-col gap-3">
              {navLinks.map(l => (
                <button key={l} onClick={() => scrollTo(l)} className="text-left text-white/45 hover:text-gold text-sm transition-colors w-fit capitalize">{l}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-white/25 text-xs tracking-widest uppercase mb-4">Connect</p>
            <div className="flex flex-wrap gap-2">
              {links.map(link => {
                const info = detectLink(link.url)
                return (
                  <motion.a key={link.id} href={link.url}
                    target={link.url.startsWith('mailto:') ? '_self' : '_blank'} rel="noreferrer"
                    whileHover={{ scale:1.15, y:-3 }} whileTap={{ scale:0.95 }} title={info.label}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
                    style={{ background:info.bg+'15', border:`1px solid ${info.bg}25` }}>
                    <span style={{ color:info.bg==='#ffffff'||info.bg==='#fffc00' ? '#e2b96f' : info.bg }}>
                      <PlatformIcon id={info.id} size={16} />
                    </span>
                  </motion.a>
                )
              })}
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/25">
          <p>© {new Date().getFullYear()} Eric (Adura) Kachikwu. All rights reserved.</p>
          <p className="flex items-center gap-1.5">Built with <Heart size={12} className="text-gold fill-gold" /> using React & Supabase</p>
        </div>
      </div>
    </footer>
  )
}
