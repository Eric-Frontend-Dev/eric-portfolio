import { useState } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, FolderOpen, Settings, MessageSquare, Star, LogOut, Menu, X, ExternalLink, Link, Award, Briefcase } from 'lucide-react'
import { supabase } from '../lib/supabase'
import AdminHome from './AdminHome'
import AdminProjects from './AdminProjects'
import AdminMessages from './AdminMessages'
import AdminSettings from './AdminSettings'
import AdminTestimonials from './AdminTestimonials'
import AdminLinks from './AdminLinks'
import AdminCertificates from './AdminCertificates'
import AdminServices from './AdminServices'

const navItems = [
  { to:'/admin', icon:LayoutDashboard, label:'Dashboard', end:true },
  { to:'/admin/projects', icon:FolderOpen, label:'Projects' },
  { to:'/admin/services', icon:Briefcase, label:'Services' },
  { to:'/admin/certificates', icon:Award, label:'Certificates' },
  { to:'/admin/links', icon:Link, label:'Social Links' },
  { to:'/admin/testimonials', icon:Star, label:'Testimonials' },
  { to:'/admin/messages', icon:MessageSquare, label:'Messages' },
  { to:'/admin/settings', icon:Settings, label:'Settings' },
]

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  const Sidebar = ({ mobile=false }) => (
    <div className="flex flex-col h-full p-6">
      <div className="flex items-center justify-between mb-8">
        <span className="font-display text-xl font-bold text-gradient">Eric.dev</span>
        {mobile && <button onClick={() => setSidebarOpen(false)} className="text-white/50 hover:text-white"><X size={20} /></button>}
      </div>
      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.end} onClick={() => mobile && setSidebarOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${isActive ? 'bg-gold/15 text-gold border border-gold/20' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
            <item.icon size={17} />{item.label}
          </NavLink>
        ))}
      </nav>
      <div className="flex flex-col gap-1 mt-4 border-t border-white/5 pt-4">
        <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-all">
          <ExternalLink size={17} /> View Portfolio
        </a>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-400/5 transition-all">
          <LogOut size={17} /> Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-navy flex">
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 flex-shrink-0 sticky top-0 h-screen overflow-hidden">
        <Sidebar />
      </aside>
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x:-280 }} animate={{ x:0 }} exit={{ x:-280 }} transition={{ type:'spring', stiffness:300, damping:30 }} className="fixed left-0 top-0 bottom-0 w-64 bg-navy border-r border-white/5 z-50 md:hidden overflow-hidden">
              <Sidebar mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 bg-navy/90 backdrop-blur z-30">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-white/60 hover:text-white"><Menu size={22} /></button>
          <div className="hidden md:block" />
          <p className="text-white/30 text-sm">Admin Panel</p>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Routes>
            <Route index element={<AdminHome />} />
            <Route path="projects/*" element={<AdminProjects />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="certificates" element={<AdminCertificates />} />
            <Route path="links" element={<AdminLinks />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="settings" element={<AdminSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
