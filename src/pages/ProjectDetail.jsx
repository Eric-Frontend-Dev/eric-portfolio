import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ExternalLink, Github, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

function Lightbox({ images, index, onClose }) {
  const [current, setCurrent] = useState(index)
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setCurrent(i => (i+1) % images.length)
      if (e.key === 'ArrowLeft') setCurrent(i => (i-1+images.length) % images.length)
    }
    window.addEventListener('keydown', handleKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handleKey) }
  }, [images.length, onClose])
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white z-10"><X size={18} /></button>
      <img src={images[current]} alt="" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={e => e.stopPropagation()} />
      {images.length > 1 && (
        <div className="absolute bottom-4 flex gap-2">
          {images.map((_, i) => (
            <button key={i} onClick={e => { e.stopPropagation(); setCurrent(i) }}
              className={`rounded-full transition-all ${i === current ? 'w-6 h-2 bg-gold' : 'w-2 h-2 bg-white/40'}`} />
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    supabase.from('projects').select('*').eq('id', id).single().then(({ data }) => {
      setProject(data); setLoading(false)
    })
    window.scrollTo(0, 0)
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-[#080812] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!project) return (
    <div className="min-h-screen bg-[#080812] flex flex-col items-center justify-center gap-4">
      <p className="text-white/50">Project not found.</p>
      <button onClick={() => navigate('/')} className="text-gold hover:text-gold-light transition-colors">← Back</button>
    </div>
  )

  const screenshots = (project.screenshots || []).filter(Boolean)
  const allImages = [...(project.cover_image_url ? [project.cover_image_url] : []), ...screenshots]

  return (
    <div className="min-h-screen bg-[#080812]" style={{ backgroundImage:'radial-gradient(ellipse at top, rgba(226,185,111,0.04) 0%, transparent 60%)' }}>
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-[#080812]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="container-max flex items-center justify-between">
          <motion.button whileHover={{ x:-4 }} onClick={() => navigate('/#projects')}
            className="flex items-center gap-2 text-white/60 hover:text-gold transition-colors text-sm">
            <ArrowLeft size={16} /> Back to Projects
          </motion.button>
          <span className="font-display text-lg font-bold text-gradient">Eric.dev</span>
          <div className="flex gap-3">
            {project.live_url && (
              <a href={project.live_url} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-gold text-navy text-sm font-bold rounded-full hover:bg-gold-light transition-colors">
                <ExternalLink size={14} /> Live Demo
              </a>
            )}
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noreferrer"
                className="hidden md:flex items-center gap-1.5 px-4 py-2 border border-white/15 text-white/70 text-sm rounded-full hover:border-gold/40 hover:text-gold transition-colors">
                <Github size={14} /> GitHub
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="container-max px-6 py-12 max-w-4xl mx-auto">
        {/* Title */}
        <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="px-3 py-1 bg-gold/10 border border-gold/20 text-gold text-xs rounded-full">{project.category}</span>
            {project.featured && <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs rounded-full">Featured</span>}
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">{project.title}</h1>
          <p className="text-white/60 text-lg leading-relaxed">{project.short_desc}</p>
        </motion.div>

        {/* Full description */}
        {project.full_desc && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="mb-10">
            <h2 className="font-display text-2xl font-bold mb-4">About this project</h2>
            <p className="text-white/65 leading-relaxed text-[15px] whitespace-pre-line">{project.full_desc}</p>
          </motion.div>
        )}

        {/* Tech stack */}
        {(project.tech_stack||[]).length > 0 && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }} className="mb-10">
            <h3 className="text-white/40 text-xs tracking-widest uppercase mb-3">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {project.tech_stack.map(t => (
                <span key={t} className="px-3 py-1.5 text-xs border border-gold/20 text-gold/80 rounded-full bg-gold/5">{t}</span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Links */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }} className="mb-12 flex flex-wrap gap-3">
          {project.live_url && (
            <a href={project.live_url} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-5 py-3 bg-gold text-navy font-bold rounded-xl hover:bg-gold-light transition-colors text-sm">
              <ExternalLink size={15} /> View Live Demo
            </a>
          )}
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-5 py-3 border border-white/15 text-white/70 rounded-xl hover:border-gold/40 hover:text-gold transition-colors text-sm">
              <Github size={15} /> View Source Code
            </a>
          )}
        </motion.div>

        {/* Video */}
        {project.video_url && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }} className="mb-10">
            <h3 className="text-white/40 text-xs tracking-widest uppercase mb-4">Demo Video</h3>
            <div className="rounded-2xl overflow-hidden border border-white/8">
              <video src={project.video_url} controls className="w-full" style={{ maxHeight:'70vh' }} />
            </div>
          </motion.div>
        )}

        {/* Screenshots — natural masonry layout */}
        {allImages.length > 0 && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }} className="mb-12">
            <h3 className="text-white/40 text-xs tracking-widest uppercase mb-4">
              Screenshots {allImages.length > 1 ? `(${allImages.length})` : ''}
            </h3>

            {allImages.length === 1 && (
              <div className="rounded-2xl overflow-hidden border border-white/8 cursor-pointer" onClick={() => setLightbox({ images:allImages, index:0 })}>
                <img src={allImages[0]} alt="screenshot" className="w-full h-auto" />
              </div>
            )}

            {allImages.length === 2 && (
              <div className="grid grid-cols-2 gap-3">
                {allImages.map((img, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden border border-white/8 cursor-pointer hover:border-gold/30 transition-colors" onClick={() => setLightbox({ images:allImages, index:i })}>
                    <img src={img} alt={`screenshot ${i+1}`} className="w-full h-auto" />
                  </div>
                ))}
              </div>
            )}

            {allImages.length >= 3 && (
              <div className="columns-1 md:columns-2 gap-3 space-y-3">
                {allImages.map((img, i) => (
                  <div key={i} className="break-inside-avoid rounded-2xl overflow-hidden border border-white/8 cursor-pointer hover:border-gold/30 transition-all duration-300 group" onClick={() => setLightbox({ images:allImages, index:i })}>
                    <div className="relative">
                      <img src={img} alt={`screenshot ${i+1}`} className="w-full h-auto group-hover:opacity-90 transition-opacity" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="text-white text-xs bg-black/50 px-3 py-1 rounded-full">Click to expand</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-white/20 text-xs mt-3 text-center">Click any image to view fullscreen</p>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
          className="p-8 rounded-3xl border border-gold/15 bg-gold/3 text-center">
          <h3 className="font-display text-2xl font-bold mb-2">Like what you see?</h3>
          <p className="text-white/50 text-sm mb-6">Let's build something amazing together.</p>
          <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.97 }}
            onClick={() => navigate('/#contact')}
            className="px-8 py-3.5 bg-gold text-navy font-bold rounded-full hover:bg-gold-light transition-colors gold-glow">
            Hire Me →
          </motion.button>
        </motion.div>
      </div>

      <AnimatePresence>
        {lightbox && <Lightbox images={lightbox.images} index={lightbox.index} onClose={() => setLightbox(null)} />}
      </AnimatePresence>
    </div>
  )
}
