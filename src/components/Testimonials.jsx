import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Quote, Send, Star, CheckCircle, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(star => (
        <button key={star} type="button" onClick={() => onChange && onChange(star)}
          onMouseEnter={() => onChange && setHovered(star)} onMouseLeave={() => onChange && setHovered(0)}
          className="transition-transform hover:scale-110">
          <Star size={22} className={`transition-colors duration-150 ${star <= (hovered || value) ? 'text-gold fill-gold' : 'text-white/20'}`} />
        </button>
      ))}
    </div>
  )
}

function SubmitReviewModal({ onClose }) {
  const [form, setForm] = useState({ name:'', role:'', company:'', quote:'', rating:5 })
  const [status, setStatus] = useState('idle')
  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-gold/40 transition-colors"

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.role || !form.quote) return
    setStatus('loading')
    await supabase.from('testimonials').insert([{ ...form, is_approved:false, display_order:99 }])
    setStatus('success')
  }

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/90 backdrop-blur-xl"
      onClick={onClose}>
      <motion.div initial={{ scale:0.85, opacity:0, y:30 }} animate={{ scale:1, opacity:1, y:0 }} exit={{ scale:0.85, opacity:0, y:30 }}
        transition={{ type:'spring', stiffness:300, damping:28 }}
        className="w-full max-w-lg bg-[#0d0d1f] border border-white/10 rounded-3xl p-8 relative"
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"><X size={14} /></button>
        {status === 'success' ? (
          <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} className="text-center py-6">
            <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
            <h3 className="font-display text-2xl font-bold mb-2">Thank you!</h3>
            <p className="text-white/50 text-sm">Your review has been submitted and will appear after approval.</p>
            <motion.button whileHover={{ scale:1.03 }} onClick={onClose} className="mt-6 px-6 py-2.5 bg-gold text-navy font-semibold rounded-xl text-sm">Close</motion.button>
          </motion.div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="font-display text-2xl font-bold mb-1">Leave a Review</h3>
              <p className="text-white/40 text-sm">Your review will appear after approval.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-white/50 text-xs mb-2">Rating</label><StarRating value={form.rating} onChange={r => setForm(f => ({ ...f, rating:r }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-white/50 text-xs mb-1.5">Your Name *</label><input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name:e.target.value }))} placeholder="Jane Smith" required /></div>
                <div><label className="block text-white/50 text-xs mb-1.5">Your Role *</label><input className={inputCls} value={form.role} onChange={e => setForm(f => ({ ...f, role:e.target.value }))} placeholder="CEO, Designer..." required /></div>
              </div>
              <div><label className="block text-white/50 text-xs mb-1.5">Company</label><input className={inputCls} value={form.company} onChange={e => setForm(f => ({ ...f, company:e.target.value }))} placeholder="Company name" /></div>
              <div><label className="block text-white/50 text-xs mb-1.5">Your Review *</label><textarea className={inputCls} rows={4} value={form.quote} onChange={e => setForm(f => ({ ...f, quote:e.target.value }))} placeholder="Share your experience..." required /></div>
              <motion.button type="submit" disabled={status==='loading'} whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                className="w-full py-3.5 bg-gold text-navy font-semibold rounded-xl hover:bg-gold-light transition-all flex items-center justify-center gap-2 text-sm">
                {status==='loading' ? <div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" /> : <><Send size={15} /> Submit Review</>}
              </motion.button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    supabase.from('testimonials').select('*').eq('is_approved', true).order('display_order')
      .then(({ data }) => setTestimonials(data || []))
  }, [])

  useEffect(() => {
    if (paused || testimonials.length <= 1) return
    const t = setInterval(() => setIndex(i => (i+1) % testimonials.length), 4000)
    return () => clearInterval(t)
  }, [paused, testimonials.length])

  const current = testimonials[index]

  return (
    <section className="relative section-pad overflow-hidden" style={{ background:'linear-gradient(180deg, #080812 0%, #090910 50%, #080812 100%)' }}>
      <div className="container-max px-6 relative z-10">
        <div className="text-center mb-12">
          <motion.p initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-gold text-sm tracking-widest uppercase mb-3">Kind words</motion.p>
          <motion.h2 initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:0.1 }} viewport={{ once:true }} className="font-display text-4xl md:text-5xl font-bold mb-3">Testimonials</motion.h2>
          <motion.p initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:0.15 }} viewport={{ once:true }} className="text-white/40 text-sm">
            Worked with me before?{' '}
            <button onClick={() => setShowForm(true)} className="text-gold hover:text-gold-light underline underline-offset-2 transition-colors">Leave a review →</button>
          </motion.p>
        </div>

        {testimonials.length > 0 ? (
          <div className="max-w-2xl mx-auto" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            <AnimatePresence mode="wait">
              <motion.div key={current.id} initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-30 }} transition={{ duration:0.5 }}
                className="rounded-3xl p-10 text-center" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(226,185,111,0.1)' }}>
                {current.rating && <div className="flex justify-center mb-4"><StarRating value={current.rating} /></div>}
                <Quote size={32} className="text-gold/25 mx-auto mb-6" />
                <p className="text-white/80 text-lg leading-relaxed mb-8 italic">"{current.quote}"</p>
                <div className="flex flex-col items-center gap-2">
                  {current.avatar_url ? (
                    <img src={current.avatar_url} alt={current.name} className="w-12 h-12 rounded-full object-cover border-2 border-gold/30" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gold/10 border-2 border-gold/30 flex items-center justify-center">
                      <span className="text-gold font-semibold">{current.name[0]}</span>
                    </div>
                  )}
                  <p className="font-semibold text-white">{current.name}</p>
                  <p className="text-white/50 text-sm">{current.role}{current.company ? `, ${current.company}` : ''}</p>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setIndex(i)}
                  className={`transition-all duration-300 rounded-full ${i === index ? 'w-6 h-2 bg-gold' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`} />
              ))}
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            className="max-w-2xl mx-auto rounded-3xl p-12 text-center" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
            <Quote size={40} className="text-gold/15 mx-auto mb-4" />
            <p className="text-white/30 mb-6">No reviews yet — be the first!</p>
            <motion.button whileHover={{ scale:1.04 }} onClick={() => setShowForm(true)}
              className="px-6 py-3 border border-gold/30 text-gold rounded-full text-sm hover:bg-gold/10 transition-all">Leave a Review</motion.button>
          </motion.div>
        )}

        <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} transition={{ delay:0.2 }} viewport={{ once:true }} className="text-center mt-8">
          <motion.button whileHover={{ scale:1.04 }} onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 border border-gold/25 text-gold rounded-full text-sm hover:bg-gold/10 transition-all duration-300">
            <Star size={15} className="fill-gold text-gold" /> Share Your Experience
          </motion.button>
        </motion.div>
      </div>
      <AnimatePresence>{showForm && <SubmitReviewModal onClose={() => setShowForm(false)} />}</AnimatePresence>
    </section>
  )
}
