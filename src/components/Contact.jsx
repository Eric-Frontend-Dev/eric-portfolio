import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { detectLink, PlatformIcon } from '../lib/linkDetector.jsx'

export default function Contact() {
  const [links, setLinks] = useState([])
  const [form, setForm] = useState({ name:'', email:'', budget:'', message:'' })
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    supabase.from('links').select('*').order('display_order').then(({ data }) => setLinks(data || []))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setStatus('loading')
    const { error } = await supabase.from('messages').insert([form])
    if (error) { setStatus('error'); return }
    setStatus('success')
    setForm({ name:'', email:'', budget:'', message:'' })
    setTimeout(() => setStatus('idle'), 5000)
  }

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-gold/40 transition-colors"

  return (
    <section id="contact" className="relative section-pad overflow-hidden"
      style={{ background:'linear-gradient(180deg, #080812 0%, #090910 100%)' }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage:'radial-gradient(circle at 20% 50%, rgba(226,185,111,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(99,102,241,0.04) 0%, transparent 50%)' }} />
        {[...Array(5)].map((_, i) => (
          <motion.div key={i} className="absolute left-0 right-0 h-px"
            style={{ top:`${20+i*15}%`, background:'linear-gradient(90deg, transparent, rgba(226,185,111,0.06), transparent)' }}
            animate={{ opacity:[0.3,0.8,0.3] }} transition={{ duration:4+i, repeat:Infinity, delay:i*0.8 }} />
        ))}
      </div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      <div className="container-max px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.p initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-gold text-sm tracking-widest uppercase mb-3">Get in touch</motion.p>
          <motion.h2 initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:0.1 }} viewport={{ once:true }} className="font-display text-4xl md:text-5xl font-bold mb-4">
            Let's Build Something <span className="text-gradient">Great Together</span>
          </motion.h2>
          <motion.p initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:0.2 }} viewport={{ once:true }} className="text-white/50">I typically reply within 24 hours.</motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <motion.form initial={{ opacity:0, x:-40 }} whileInView={{ opacity:1, x:0 }} transition={{ duration:0.7 }} viewport={{ once:true }}
            onSubmit={handleSubmit} className="space-y-4">
            {[
              { id:'name', label:'Your Name', type:'text', placeholder:'John Doe' },
              { id:'email', label:'Email Address', type:'email', placeholder:'john@example.com' },
            ].map(f => (
              <div key={f.id}>
                <label className="block text-white/50 text-sm mb-2">{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={form[f.id]} onChange={e => setForm(p => ({ ...p, [f.id]:e.target.value }))} required className={inputCls} />
              </div>
            ))}
            <div>
              <label className="block text-white/50 text-sm mb-2">Budget Range</label>
              <select value={form.budget} onChange={e => setForm(p => ({ ...p, budget:e.target.value }))} className={inputCls}>
                <option value="" className="bg-navy">Select a budget range</option>
                <option value="under-200" className="bg-navy">Under $200</option>
                <option value="200-500" className="bg-navy">$200 – $500</option>
                <option value="500-1000" className="bg-navy">$500 – $1,000</option>
                <option value="1000+" className="bg-navy">$1,000+</option>
                <option value="discuss" className="bg-navy">Let's discuss</option>
              </select>
            </div>
            <div>
              <label className="block text-white/50 text-sm mb-2">Message</label>
              <textarea rows={5} placeholder="Tell me about your project..." value={form.message} onChange={e => setForm(p => ({ ...p, message:e.target.value }))} required className={`${inputCls} resize-none`} />
            </div>
            <motion.button type="submit" disabled={status==='loading'||status==='success'} whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
              className="w-full py-4 bg-gold text-navy font-semibold rounded-xl gold-glow hover:bg-gold-light transition-all flex items-center justify-center gap-2 disabled:opacity-60">
              {status==='loading' ? <div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                : status==='success' ? <><CheckCircle size={18} /> Message Sent!</>
                : <><Send size={18} /> Send Message</>}
            </motion.button>
            {status==='error' && <p className="text-red-400 text-sm text-center">Something went wrong. Please try again.</p>}
          </motion.form>

          <motion.div initial={{ opacity:0, x:40 }} whileInView={{ opacity:1, x:0 }} transition={{ duration:0.7 }} viewport={{ once:true }} className="flex flex-col gap-6">
            <div>
              <h3 className="font-display text-2xl font-semibold mb-2">Reach me directly</h3>
              <p className="text-white/50 text-sm">Prefer a quick chat? Use any of the options below.</p>
            </div>
            {links.map((link, i) => {
              const info = detectLink(link.url)
              const display = link.url.startsWith('mailto:') ? link.url.replace('mailto:','') : info.label
              return (
                <motion.a key={link.id} href={link.url}
                  target={link.url.startsWith('mailto:') ? '_self' : '_blank'} rel="noreferrer"
                  initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }} viewport={{ once:true }}
                  whileHover={{ x:6 }}
                  className="flex items-center gap-4 p-4 rounded-xl group transition-all duration-300"
                  style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background:info.bg+'18', border:`1px solid ${info.bg}30` }}>
                    <span style={{ color:info.bg==='#ffffff'||info.bg==='#fffc00' ? '#e2b96f' : info.bg }}>
                      <PlatformIcon id={info.id} size={18} />
                    </span>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">{info.label}</p>
                    <p className="text-white text-sm font-medium">{display}</p>
                  </div>
                </motion.a>
              )
            })}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
