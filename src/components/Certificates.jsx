import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, ExternalLink, Calendar, Building2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Certificates() {
  const [certs, setCerts] = useState([])

  useEffect(() => {
    supabase.from('certificates').select('*').order('display_order').then(({ data }) => setCerts(data || []))
  }, [])

  if (!certs.length) return null

  return (
    <section id="certificates" className="relative section-pad overflow-hidden"
      style={{ background:'linear-gradient(180deg, #080812 0%, #08080f 50%, #080812 100%)' }}>
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
          <motion.p initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-gold text-sm tracking-widest uppercase mb-3">Credentials</motion.p>
          <motion.h2 initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:0.1 }} viewport={{ once:true }} className="font-display text-4xl md:text-5xl font-bold mb-4">Certificates</motion.h2>
          <motion.p initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:0.15 }} viewport={{ once:true }} className="text-white/40 text-sm max-w-lg mx-auto">Formal training and certifications that back up my skills.</motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {certs.map((cert, i) => (
            <motion.div key={cert.id}
              initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }}
              transition={{ delay:i*0.1, duration:0.6 }} viewport={{ once:true }}
              whileHover={{ y:-6, transition:{ duration:0.3 } }}
              className="group relative rounded-2xl overflow-hidden transition-all duration-300 flex flex-col"
              style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ border:'1px solid rgba(226,185,111,0.25)' }} />

              <div className="relative h-44 overflow-hidden"
                style={{ background:'linear-gradient(135deg, rgba(226,185,111,0.08) 0%, rgba(139,92,246,0.05) 100%)' }}>
                {cert.image_url ? (
                  <img src={cert.image_url} alt={cert.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-gold/10 border-2 border-gold/20 flex items-center justify-center">
                      <Award size={28} className="text-gold" />
                    </div>
                    <p className="text-white/20 text-xs tracking-widest uppercase">Certificate</p>
                  </div>
                )}
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-display text-base font-semibold leading-snug mb-3 group-hover:text-gold transition-colors">{cert.title}</h3>
                <div className="flex flex-col gap-2 mb-5 flex-1">
                  <div className="flex items-center gap-2 text-white/50 text-xs"><Building2 size={12} className="text-gold/60 flex-shrink-0" /><span>{cert.institution}</span></div>
                  {cert.issued_date && <div className="flex items-center gap-2 text-white/40 text-xs"><Calendar size={12} className="text-gold/60 flex-shrink-0" /><span>Issued {cert.issued_date}</span></div>}
                </div>
                {cert.credential_url ? (
                  <a href={cert.credential_url} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/25 text-gold text-xs font-medium rounded-full hover:bg-gold/20 transition-all">
                    <ExternalLink size={12} /> View Certificate
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/3 border border-white/8 text-white/25 text-xs rounded-full">
                    <Award size={12} /> Certificate Pending Upload
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
