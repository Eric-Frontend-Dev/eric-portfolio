import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Upload, Check, Clock, Star } from 'lucide-react'
import { supabase, uploadFile } from '../lib/supabase'

const EMPTY = { name:'', role:'', company:'', quote:'', rating:5, avatar_url:'', display_order:0, is_approved:true }

export default function AdminTestimonials() {
  const [items, setItems] = useState([])
  const [tab, setTab] = useState('approved')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('testimonials').select('*').order('created_at', { ascending:false })
    setItems(data||[])
  }
  useEffect(() => { load() }, [])

  const approved = items.filter(t => t.is_approved)
  const pending = items.filter(t => !t.is_approved)
  const displayed = tab==='approved' ? approved : pending

  const openEdit = (t) => { setEditing(t.id); setForm({ ...t }); setShowForm(true) }
  const openNew = () => { setEditing(null); setForm(EMPTY); setShowForm(true) }
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(EMPTY) }

  const handleSave = async () => {
    setSaving(true)
    if (editing) await supabase.from('testimonials').update(form).eq('id', editing)
    else await supabase.from('testimonials').insert([form])
    setSaving(false); closeForm(); load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this testimonial?')) return
    await supabase.from('testimonials').delete().eq('id', id)
    load()
  }

  const handleApprove = async (id) => {
    await supabase.from('testimonials').update({ is_approved:true }).eq('id', id)
    load()
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return
    setUploading(true)
    try {
      const url = await uploadFile('portfolio-images', file, `avatars/${Date.now()}.${file.name.split('.').pop()}`)
      setForm(f => ({ ...f, avatar_url:url }))
    } catch (err) { alert('Upload failed: ' + err.message) }
    setUploading(false)
  }

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/40 transition-colors"

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Testimonials</h1>
          <p className="text-white/40 text-sm">{approved.length} approved · <span className={pending.length>0 ? 'text-gold' : ''}>{pending.length} pending</span></p>
        </div>
        <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }} onClick={openNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-gold text-navy text-sm font-semibold rounded-xl hover:bg-gold-light transition-colors">
          <Plus size={16} /> Add Manually
        </motion.button>
      </div>

      <div className="flex gap-2 mb-6">
        {[{id:'approved',label:'Approved',count:approved.length,icon:Check},{id:'pending',label:'Pending',count:pending.length,icon:Clock}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${tab===t.id ? 'bg-gold/15 text-gold border border-gold/20' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
            <t.icon size={14} /> {t.label} ({t.count})
            {t.id==='pending' && t.count>0 && <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />}
          </button>
        ))}
      </div>

      {tab==='pending' && pending.length>0 && (
        <div className="mb-4 px-4 py-3 bg-gold/10 border border-gold/20 rounded-xl text-gold text-sm">
          These reviews were submitted by visitors. Approve the ones you want to show publicly.
        </div>
      )}

      {displayed.length===0 ? (
        <div className="card-glass rounded-2xl p-12 text-center text-white/30">
          {tab==='pending' ? 'No pending reviews!' : 'No testimonials yet.'}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {displayed.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
              className={`card-glass rounded-2xl p-6 border ${!t.is_approved ? 'border-gold/20' : 'border-white/5'}`}>
              <div className="flex gap-0.5 mb-3">
                {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s<=(t.rating||5) ? 'text-gold fill-gold' : 'text-white/20'} />)}
              </div>
              <p className="text-white/70 text-sm leading-relaxed mb-4 italic line-clamp-3">"{t.quote}"</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {t.avatar_url ? <img src={t.avatar_url} alt={t.name} className="w-9 h-9 rounded-full object-cover border border-gold/20" /> :
                    <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center"><span className="text-gold text-xs font-bold">{t.name[0]}</span></div>}
                  <div><p className="text-white text-sm font-medium">{t.name}</p><p className="text-white/40 text-xs">{t.role}{t.company?`, ${t.company}`:''}</p></div>
                </div>
                <div className="flex gap-1.5">
                  {!t.is_approved && <button onClick={() => handleApprove(t.id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-400/10 border border-green-400/30 text-green-400 rounded-lg text-xs hover:bg-green-400/20 transition-colors"><Check size={12} /> Approve</button>}
                  <button onClick={() => openEdit(t)} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"><Pencil size={13} /></button>
                  <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg hover:bg-red-400/10 text-white/40 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={closeForm}>
            <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.9, opacity:0 }}
              transition={{ type:'spring', stiffness:300, damping:30 }}
              className="w-full max-w-lg bg-[#0d0d1f] border border-white/10 rounded-3xl p-8" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold">{editing ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
                <button onClick={closeForm} className="p-2 rounded-xl hover:bg-white/10 text-white/50"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-white/50 text-xs mb-1.5">Full Name *</label><input className={inputCls} value={form.name} onChange={e => setForm(p => ({ ...p, name:e.target.value }))} placeholder="Jane Smith" /></div>
                  <div><label className="block text-white/50 text-xs mb-1.5">Job Title *</label><input className={inputCls} value={form.role} onChange={e => setForm(p => ({ ...p, role:e.target.value }))} placeholder="Product Manager" /></div>
                </div>
                <div><label className="block text-white/50 text-xs mb-1.5">Company</label><input className={inputCls} value={form.company} onChange={e => setForm(p => ({ ...p, company:e.target.value }))} placeholder="Tech Inc." /></div>
                <div>
                  <label className="block text-white/50 text-xs mb-1.5">Rating</label>
                  <div className="flex gap-1">{[1,2,3,4,5].map(s => <button key={s} type="button" onClick={() => setForm(f => ({ ...f, rating:s }))} className="transition-transform hover:scale-110"><Star size={22} className={s<=form.rating ? 'text-gold fill-gold' : 'text-white/20'} /></button>)}</div>
                </div>
                <div><label className="block text-white/50 text-xs mb-1.5">Quote *</label><textarea className={inputCls} rows={4} value={form.quote} onChange={e => setForm(p => ({ ...p, quote:e.target.value }))} placeholder="What they said..." /></div>
                <div>
                  <label className="block text-white/50 text-xs mb-1.5">Approved</label>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={form.is_approved} onChange={e => setForm(p => ({ ...p, is_approved:e.target.checked }))} className="w-4 h-4 accent-gold" />
                    <span className="text-white/60 text-sm">Show publicly on portfolio</span>
                  </div>
                </div>
                <div>
                  <label className="block text-white/50 text-xs mb-2">Avatar Photo</label>
                  <div className="flex items-center gap-3">
                    {form.avatar_url && <img src={form.avatar_url} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-gold/20" />}
                    <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-white/20 rounded-xl text-white/50 hover:border-gold/40 hover:text-gold cursor-pointer transition-all text-sm">
                      <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload Photo'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={closeForm} className="flex-1 py-3 border border-white/10 rounded-xl text-white/50 hover:text-white transition-all text-sm">Cancel</button>
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                  onClick={handleSave} disabled={saving||!form.name||!form.role||!form.quote}
                  className="flex-1 py-3 bg-gold text-navy font-semibold rounded-xl hover:bg-gold-light transition-all text-sm disabled:opacity-50">
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Testimonial'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
