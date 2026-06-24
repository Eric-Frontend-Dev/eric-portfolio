import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Upload, ExternalLink, Github, Image, Video, RefreshCw } from 'lucide-react'
import { supabase, uploadFile } from '../lib/supabase'

const EMPTY = {
  title:'', short_desc:'', full_desc:'', category:'React',
  tech_stack:'', live_url:'', github_url:'', featured:false,
  display_order:0, cover_image_url:'', screenshots:[], video_url:''
}
const CATEGORIES = ['React','WordPress','Landing Page','Other']

export default function AdminProjects() {
  const [projects, setProjects] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState({})

  const load = async () => {
    const { data } = await supabase.from('projects').select('*').order('display_order')
    setProjects(data||[])
  }
  useEffect(() => { load() }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setShowForm(true) }
  const openEdit = (p) => {
    setEditing(p.id)
    setForm({ ...p, tech_stack:(p.tech_stack||[]).join(', '), screenshots:p.screenshots||[] })
    setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(EMPTY) }

  const handleSave = async () => {
    if (!form.title||!form.short_desc) return
    setSaving(true)
    const payload = { ...form, tech_stack:form.tech_stack.split(',').map(t => t.trim()).filter(Boolean) }
    if (editing) await supabase.from('projects').update(payload).eq('id', editing)
    else await supabase.from('projects').insert([payload])
    setSaving(false); closeForm(); load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return
    await supabase.from('projects').delete().eq('id', id)
    load()
  }

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return
    setUploading(u => ({ ...u, cover:true }))
    try {
      const url = await uploadFile('portfolio-images', file, `covers/${Date.now()}.${file.name.split('.').pop()}`)
      setForm(f => ({ ...f, cover_image_url:url }))
    } catch (err) { alert('Upload failed: ' + err.message) }
    setUploading(u => ({ ...u, cover:false }))
  }

  const removeCover = () => setForm(f => ({ ...f, cover_image_url:'' }))

  const handleScreenshotsUpload = async (e) => {
    const files = Array.from(e.target.files); if (!files.length) return
    setUploading(u => ({ ...u, screenshots:true }))
    try {
      const urls = await Promise.all(files.map(async (file) => {
        const ext = file.name.split('.').pop()
        return uploadFile('portfolio-images', file, `screenshots/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`)
      }))
      setForm(f => ({ ...f, screenshots:[...(f.screenshots||[]), ...urls] }))
    } catch (err) { alert('Upload failed: ' + err.message) }
    setUploading(u => ({ ...u, screenshots:false }))
  }

  const removeScreenshot = (idx) => setForm(f => ({ ...f, screenshots:f.screenshots.filter((_,i) => i!==idx) }))

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return
    if (file.size > 50*1024*1024) {
      alert('Video is too large. Please use a video under 50MB. Compress it at compress-video.com')
      return
    }
    setUploading(u => ({ ...u, video:true }))
    try {
      const url = await uploadFile('portfolio-videos', file, `videos/${Date.now()}.${file.name.split('.').pop()}`)
      setForm(f => ({ ...f, video_url:url }))
    } catch (err) { alert('Upload failed: ' + err.message) }
    setUploading(u => ({ ...u, video:false }))
  }

  const removeVideo = () => setForm(f => ({ ...f, video_url:'' }))

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/40 transition-colors"

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Projects</h1>
          <p className="text-white/40 text-sm">{projects.length} project{projects.length!==1?'s':''}</p>
        </div>
        <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }} onClick={openNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-gold text-navy text-sm font-semibold rounded-xl hover:bg-gold-light transition-colors">
          <Plus size={16} /> Add Project
        </motion.button>
      </div>

      {projects.length===0 ? (
        <div className="card-glass rounded-2xl p-12 text-center text-white/30">No projects yet. Add your first one!</div>
      ) : (
        <div className="card-glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-white/30 font-normal">Project</th>
                <th className="text-left px-5 py-3 text-white/30 font-normal hidden md:table-cell">Category</th>
                <th className="text-left px-5 py-3 text-white/30 font-normal hidden lg:table-cell">Media</th>
                <th className="px-5 py-3 text-white/30 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {p.cover_image_url ? (
                        <img src={p.cover_image_url} alt={p.title} className="w-12 h-10 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-gold text-xs font-bold">{p.title[0]}</span>
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">{p.title}</p>
                        <p className="text-white/40 text-xs line-clamp-1">{p.short_desc}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="px-2 py-1 bg-gold/10 text-gold text-xs rounded-md">{p.category}</span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-3 text-white/30 text-xs">
                      <span className={`flex items-center gap-1 ${p.cover_image_url ? 'text-green-400' : ''}`}><Image size={12} /> Cover</span>
                      <span className={`flex items-center gap-1 ${(p.screenshots||[]).length>0 ? 'text-green-400' : ''}`}><Image size={12} /> {(p.screenshots||[]).length} shots</span>
                      <span className={`flex items-center gap-1 ${p.video_url ? 'text-green-400' : ''}`}><Video size={12} /> Video</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-400/10 text-white/40 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-6 bg-black/80 backdrop-blur-sm overflow-y-auto"
            onClick={closeForm}>
            <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.9, opacity:0 }}
              transition={{ type:'spring', stiffness:300, damping:30 }}
              className="w-full max-w-2xl bg-[#0d0d1f] border border-white/10 rounded-3xl p-8 mb-8"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold">{editing ? 'Edit Project' : 'Add New Project'}</h2>
                <button onClick={closeForm} className="p-2 rounded-xl hover:bg-white/10 text-white/50"><X size={18} /></button>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/50 text-xs mb-1.5">Project Title *</label>
                    <input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title:e.target.value }))} placeholder="e.g. Kachiflix" />
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs mb-1.5">Category</label>
                    <select className={inputCls} value={form.category} onChange={e => setForm(f => ({ ...f, category:e.target.value }))}>
                      {CATEGORIES.map(c => <option key={c} value={c} className="bg-navy">{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-white/50 text-xs mb-1.5">Short Description * <span className="text-white/20">(shown on card)</span></label>
                  <input className={inputCls} value={form.short_desc} onChange={e => setForm(f => ({ ...f, short_desc:e.target.value }))} placeholder="One line summary" />
                </div>

                <div>
                  <label className="block text-white/50 text-xs mb-1.5">Full Description <span className="text-white/20">(shown on detail page)</span></label>
                  <textarea className={inputCls} rows={4} value={form.full_desc} onChange={e => setForm(f => ({ ...f, full_desc:e.target.value }))} placeholder="Detailed description..." />
                </div>

                <div>
                  <label className="block text-white/50 text-xs mb-1.5">Tech Stack <span className="text-white/20">(comma separated)</span></label>
                  <input className={inputCls} value={form.tech_stack} onChange={e => setForm(f => ({ ...f, tech_stack:e.target.value }))} placeholder="React, JavaScript, Tailwind CSS" />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/50 text-xs mb-1.5">Live Demo URL</label>
                    <input className={inputCls} value={form.live_url} onChange={e => setForm(f => ({ ...f, live_url:e.target.value }))} placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs mb-1.5">GitHub URL</label>
                    <input className={inputCls} value={form.github_url} onChange={e => setForm(f => ({ ...f, github_url:e.target.value }))} placeholder="https://github.com/..." />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/50 text-xs mb-1.5">Display Order</label>
                    <input type="number" className={inputCls} value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order:+e.target.value }))} />
                  </div>
                  <div className="flex items-center gap-3 mt-5">
                    <input type="checkbox" id="featured" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured:e.target.checked }))} className="w-4 h-4 accent-gold" />
                    <label htmlFor="featured" className="text-white/60 text-sm">Show as featured</label>
                  </div>
                </div>

                {/* Media */}
                <div className="border-t border-white/8 pt-5 mt-2">
                  <p className="text-white/30 text-xs tracking-widest uppercase mb-4">Media Uploads</p>

                  {/* Cover */}
                  <div className="mb-5">
                    <label className="block text-white/50 text-xs mb-2">Cover Image <span className="text-white/20">(shown on project card)</span></label>
                    {form.cover_image_url && (
                      <div className="relative inline-block mb-2">
                        <img src={form.cover_image_url} alt="cover" className="w-32 h-24 rounded-xl object-cover border border-white/10" />
                        <button onClick={removeCover} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600"><X size={12} /></button>
                      </div>
                    )}
                    <div>
                      <label className="inline-flex items-center gap-2 px-4 py-2.5 border border-dashed border-white/20 rounded-xl text-white/50 hover:border-gold/40 hover:text-gold cursor-pointer transition-all text-sm">
                        {form.cover_image_url ? <><RefreshCw size={14} /> Replace Cover</> : <><Image size={14} /> Upload Cover Image</>}
                        <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploading.cover} />
                      </label>
                      {uploading.cover && <span className="ml-3 text-gold text-xs animate-pulse">Uploading...</span>}
                    </div>
                  </div>

                  {/* Screenshots */}
                  <div className="mb-5">
                    <label className="block text-white/50 text-xs mb-2">Screenshots <span className="text-white/20">(shown on detail page)</span></label>
                    {(form.screenshots||[]).length>0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {form.screenshots.map((url, i) => (
                          <div key={i} className="relative group">
                            <img src={url} alt={`ss${i}`} className="w-20 h-16 rounded-lg object-cover border border-white/10" />
                            <button onClick={() => removeScreenshot(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"><X size={10} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 border border-dashed border-white/20 rounded-xl text-white/50 hover:border-gold/40 hover:text-gold cursor-pointer transition-all text-sm">
                      <Upload size={14} /> Add Screenshots
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleScreenshotsUpload} disabled={uploading.screenshots} />
                    </label>
                    {uploading.screenshots && <span className="ml-3 text-gold text-xs animate-pulse">Uploading...</span>}
                  </div>

                  {/* Video */}
                  <div>
                    <label className="block text-white/50 text-xs mb-2">Demo Video <span className="text-white/20">(max 50MB)</span></label>
                    {form.video_url && (
                      <div className="mb-2 relative inline-block">
                        <video src={form.video_url} className="w-48 rounded-xl border border-white/10" controls />
                        <button onClick={removeVideo} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600"><X size={12} /></button>
                      </div>
                    )}
                    <div>
                      <label className="inline-flex items-center gap-2 px-4 py-2.5 border border-dashed border-white/20 rounded-xl text-white/50 hover:border-gold/40 hover:text-gold cursor-pointer transition-all text-sm">
                        {form.video_url ? <><RefreshCw size={14} /> Replace Video</> : <><Video size={14} /> Upload Demo Video</>}
                        <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} disabled={uploading.video} />
                      </label>
                      {uploading.video && <span className="ml-3 text-gold text-xs animate-pulse">Uploading...</span>}
                    </div>
                    <p className="text-white/20 text-xs mt-1.5">Tip: Keep videos under 50MB. Record a 30-90 second demo.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={closeForm} className="flex-1 py-3 border border-white/10 rounded-xl text-white/50 hover:text-white hover:border-white/20 transition-all text-sm">Cancel</button>
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                  onClick={handleSave} disabled={saving||!form.title||!form.short_desc}
                  className="flex-1 py-3 bg-gold text-navy font-semibold rounded-xl hover:bg-gold-light transition-all text-sm disabled:opacity-50">
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Project'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
