import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, ExternalLink, Calendar, Building2, X, ZoomIn } from 'lucide-react'
import { supabase } from '../lib/supabase'

// Fullscreen lightbox for certificate image
function CertLightbox({ cert, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handleKey) }
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white z-10">
        <X size={18} />
      </button>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="max-w-3xl w-full" onClick={e => e.stopPropagation()}
      >
        <img src={cert.image_url} alt={cert.title}
          className="w-full h-auto rounded-2xl shadow-2xl" />
        <div className="text-center mt-4">
          <p className="text-white font-semibold">{cert.title}</p>
          <p className="text-white/50 text-sm">{cert.institution} · {cert.issued_date}</p>
          <p className="text-white/30 text-xs mt-1">Certificate No. NHN75511</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

function CertCard({ cert, i }) {
  const [lightbox, setLightbox] = useState(false)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1, duration: 0.6 }}
        viewport={{ once: true }}
        whileHover={{ y: -6, transition: { duration: 0.3 } }}
        className="group relative rounded-2xl overflow-hidden flex flex-col transition-all duration-300"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Hover border glow */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ border: '1px solid rgba(226,185,111,0.25)' }} />

        {/* Certificate image — full display, no cropping */}
        <div
          className="relative overflow-hidden bg-gradient-to-br from-blue-900/30 to-navy cursor-pointer"
          onClick={() => cert.image_url && setLightbox(true)}
        >
          {cert.image_url ? (
            <>
              {/* Full image — object-contain so nothing is cut off */}
              <img
                src={cert.image_url}
                alt={cert.title}
                className="w-full h-auto object-contain group-hover:scale-102 transition-transform duration-500"
                style={{ display: 'block' }}
              />
              {/* Click to expand overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur rounded-full text-white text-sm">
                  <ZoomIn size={16} /> Click to view fullscreen
                </div>
              </div>
            </>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center gap-3"
              style={{ background: 'linear-gradient(135deg, rgba(226,185,111,0.08) 0%, rgba(139,92,246,0.05) 100%)' }}>
              <div className="w-16 h-16 rounded-2xl bg-gold/10 border-2 border-gold/20 flex items-center justify-center">
                <Award size={28} className="text-gold" />
              </div>
              <p className="text-white/20 text-xs tracking-widest uppercase">Upload Certificate Image</p>
            </div>
          )}
        </div>

        {/* Card info */}
        <div className="p-6 flex flex-col flex-1">
          <h3 className="font-display text-base font-semibold leading-snug mb-3 group-hover:text-gold transition-colors">
            {cert.title}
          </h3>
          <div className="flex flex-col gap-2 mb-5 flex-1">
            <div className="flex items-center gap-2 text-white/50 text-xs">
              <Building2 size={12} className="text-gold/60 flex-shrink-0" />
              <span>{cert.institution}</span>
            </div>
            {cert.issued_date && (
              <div className="flex items-center gap-2 text-white/40 text-xs">
                <Calendar size={12} className="text-gold/60 flex-shrink-0" />
                <span>Issued {cert.issued_date}</span>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            {cert.image_url && (
              <button
                onClick={() => setLightbox(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gold/10 border border-gold/25 text-gold text-xs font-medium rounded-full hover:bg-gold/20 transition-all"
              >
                <ZoomIn size={12} /> View Certificate
              </button>
            )}
            {cert.credential_url && (
              <a href={cert.credential_url} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2 border border-white/10 text-white/50 text-xs rounded-full hover:border-gold/30 hover:text-gold transition-all">
                <ExternalLink size={12} /> Verify
              </a>
            )}
            {!cert.image_url && !cert.credential_url && (
              <span className="flex items-center gap-2 px-4 py-2 bg-white/3 border border-white/8 text-white/20 text-xs rounded-full">
                <Award size={12} /> Image coming soon
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && <CertLightbox cert={cert} onClose={() => setLightbox(false)} />}
      </AnimatePresence>
    </>
  )
}

export default function Certificates() {
  const [certs, setCerts] = useState([])

  useEffect(() => {
    supabase.from('certificates').select('*').order('display_order').then(({ data }) => setCerts(data || []))
  }, [])

  if (!certs.length) return null

  return (
    <section id="certificates" className="relative section-pad overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #080812 0%, #08080f 50%, #080812 100%)' }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.025]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="diag" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="40" stroke="#e2b96f" strokeWidth="0.5"/>
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#diag)"/>
        </svg>
      </div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      <div className="container-max px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.p initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            className="text-gold text-sm tracking-widest uppercase mb-3">Credentials</motion.p>
          <motion.h2 initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:0.1 }} viewport={{ once:true }}
            className="font-display text-4xl md:text-5xl font-bold mb-4">Certificates</motion.h2>
          <motion.p initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:0.15 }} viewport={{ once:true }}
            className="text-white/40 text-sm max-w-lg mx-auto">Formal training and certifications that back up my skills.</motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {certs.map((cert, i) => <CertCard key={cert.id} cert={cert} i={i} />)}
        </div>
      </div>
    </section>
  )
}
