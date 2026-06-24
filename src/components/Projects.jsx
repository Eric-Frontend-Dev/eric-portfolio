import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Github, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

function CodeRainBg() {
  const chars = ['<', '>', '/', '{', '}', '=>', '0', '1', 'if', 'fn']
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.span key={i}
          className="absolute text-gold/5 font-mono text-sm select-none"
          style={{ left: `${(i / 18) * 100}%`, top: `${Math.random() * 100}%` }}
          animate={{ y: [0, -20, 0], opacity: [0.03, 0.07, 0.03] }}
          transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 5 }}>
          {chars[i % chars.length]}
        </motion.span>
      ))}
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(rgba(226,185,111,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(226,185,111,0.015) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />
    </div>
  )
}

function ProjectCard({ project }) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true }}
      className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-500"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Cover image — fixed height, object-contain so full image shows without cropping */}
      <div
        className="relative overflow-hidden bg-[#0d0d1f] cursor-pointer flex-shrink-0 flex items-center justify-center"
        style={{ height: '220px' }}
        onClick={() => navigate(`/project/${project.id}`)}
      >
        {project.cover_image_url ? (
          <>
            {/* Blurred background to fill empty space nicely */}
            <div
              className="absolute inset-0 bg-cover bg-center blur-lg opacity-20 scale-110"
              style={{ backgroundImage: `url(${project.cover_image_url})` }}
            />
            {/* Full image — contained so nothing is cropped */}
            <img
              src={project.cover_image_url}
              alt={project.title}
              className="relative z-10 w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display text-5xl text-gold/10">{project.title[0]}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 z-20 bg-navy/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="flex items-center gap-2 text-gold text-sm font-medium px-4 py-2 border border-gold/40 rounded-full">
            View Details <ArrowRight size={14} />
          </span>
        </div>

        {/* Category badge */}
        <div className="absolute top-3 left-3 z-20 px-3 py-1 bg-[#080812]/80 backdrop-blur text-gold text-xs rounded-full border border-gold/20">
          {project.category}
        </div>

        {/* Media indicators */}
        <div className="absolute top-3 right-3 z-20 flex gap-1">
          {(project.screenshots||[]).length > 0 && (
            <span className="px-2 py-0.5 bg-[#080812]/80 backdrop-blur text-white/50 text-xs rounded-full border border-white/10">
              {(project.screenshots||[]).length + (project.cover_image_url ? 1 : 0)} imgs
            </span>
          )}
          {project.video_url && (
            <span className="px-2 py-0.5 bg-[#080812]/80 backdrop-blur text-gold/70 text-xs rounded-full border border-gold/20">
              ▶ video
            </span>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-5">
        <h3
          className="font-display text-lg font-semibold mb-2 group-hover:text-gold transition-colors cursor-pointer"
          onClick={() => navigate(`/project/${project.id}`)}
        >
          {project.title}
        </h3>

        {/* Fixed min-height so all cards align */}
        <p className="text-white/55 text-sm leading-relaxed mb-4 flex-1" style={{ minHeight: '48px' }}>
          {project.short_desc}
        </p>

        {/* Tech tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(project.tech_stack || []).slice(0, 4).map(t => (
            <span key={t} className="px-2 py-0.5 text-xs border border-gold/12 text-gold/55 rounded-md bg-gold/4">{t}</span>
          ))}
          {(project.tech_stack || []).length > 4 && (
            <span className="px-2 py-0.5 text-xs border border-white/8 text-white/25 rounded-md">+{project.tech_stack.length - 4}</span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-auto" onClick={e => e.stopPropagation()}>
          {project.live_url ? (
            <a href={project.live_url} target="_blank" rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gold text-navy text-xs font-bold rounded-lg hover:bg-gold-light transition-colors">
              <ExternalLink size={12} /> Live Demo
            </a>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white/4 text-white/20 text-xs rounded-lg border border-white/6 cursor-not-allowed">
              <ExternalLink size={12} /> No Demo Yet
            </div>
          )}
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-white/10 text-white/55 text-xs rounded-lg hover:border-gold/30 hover:text-gold transition-colors">
              <Github size={12} /> Code
            </a>
          )}
          <button
            onClick={() => navigate(`/project/${project.id}`)}
            className="flex items-center justify-center px-3 py-2.5 border border-gold/15 text-gold/50 text-xs rounded-lg hover:bg-gold/8 hover:text-gold transition-colors"
            title="Full details"
          >
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

const CATEGORIES = ['All', 'React', 'WordPress', 'Landing Page', 'Other']

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    supabase.from('projects').select('*').order('display_order').then(({ data }) => setProjects(data || []))
  }, [])

  const filtered = filter === 'All' ? projects : projects.filter(p => p.category === filter)

  return (
    <section id="projects" className="relative section-pad overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #080812 0%, #07070f 50%, #080812 100%)' }}>
      <CodeRainBg />
      <div className="container-max px-6 relative z-10">
        <div className="text-center mb-12">
          <motion.p initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            className="text-gold text-sm tracking-widest uppercase mb-3">What I've built</motion.p>
          <motion.h2 initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:0.1 }} viewport={{ once:true }}
            className="font-display text-4xl md:text-5xl font-bold mb-3">Projects</motion.h2>
          <motion.p initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:0.15 }} viewport={{ once:true }}
            className="text-white/40 text-sm">Click any project to see full details, screenshots and demo video.</motion.p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {CATEGORIES.map(cat => (
            <motion.button key={cat} onClick={() => setFilter(cat)} whileHover={{ scale:1.05 }} whileTap={{ scale:0.97 }}
              className={`px-5 py-2 rounded-full text-sm transition-all duration-300 ${filter === cat ? 'bg-gold text-navy font-semibold' : 'border border-white/10 text-white/60 hover:border-gold/30 hover:text-gold'}`}>
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Grid — always 3 columns on large screens so cards fill evenly */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map(project => <ProjectCard key={project.id} project={project} />)}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-white/30">No projects in this category yet.</div>
        )}
      </div>
    </section>
  )
}
