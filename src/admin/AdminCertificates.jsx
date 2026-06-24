import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Upload, Award } from 'lucide-react'
import { supabase, uploadFile } from '../lib/supabase'

const EMPTY = { title:'', institution:'', issued_date:'', credential_url:'', image_url:'', display_order:0 }

export default function AdminCertificates() {
  const [certs, setCerts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('certificates').select('*').order('display_order')
    setCerts(data||[])
  }
  useEffect(() => { load() }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setShowForm(true) }
  const openEdit = (c) => { setEditing(c.id); setForm({ ...c }); setShowForm(true) }
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(EMPTY) }

  const handleSave = async () => {
    setSaving(true)
    if (editing) await supabase.from('certificates').update(form).eq('id', editing)
    else await supabase.from('certificates').insert([form])
    setSaving(false); closeForm(); load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this certificate?')) return
    await supabase.from('certificates').delete().eq('id', id)
    load()
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return
    setUploading(true)
    try {
      const url = await uploadFile('portfolio-images', file, `certificates/${Date.now()}.${file.name.split('.').pop()}`)
      setForm(f => ({ ...f, image_url:url }))
    } catch (err) { alert('Upload failed: ' + err.message) }
    setUploading(false)
  }

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/40 transition-colors"

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Certificates</h1>
          <p className="text-white/40 text-sm">{certs.length} certificate{certs.length!==1?'s':''}</p>
        </div>
        <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }} onClick={openNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-gold text-navy text-sm font-semibold rounded-xl hover:bg-gold-light transition-colors">
          <Plus size={16} /> Add Certificate
        </motion.button>
      </div>

      {certs.length===0 ? (
        <div className="card-glass rounded-2xl p-12 text-center">
          <Award size={40} className="text-gold/20 mx-auto mb-4" />
          <p className="text-white/30 mb-2">No certificates yet.</p>
          <p className="text-white/20 text-sm">Add your New Horizons certificate when you receive it!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {certs.map((cert, i) => (
            <motion.div key={cert.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
              className="card-glass rounded-2xl overflow-hidden">
              <div className="h-32 overflow-hidden relative" style={{ background:'linear-gradient(135deg, rgba(226,185,111,0.08), rgba(139,92,246,0.05))' }}>
                {cert.image_url ? <img src={cert.image_url} alt={cert.title} className="w-full h-full object-cover" /> :
                  <div className="w-full h-full flex items-center justify-center"><Award size={32} className="text-gold/20" /></div>}
              </div>
              <div className="p-5">
                <h3 className="font-display text-base font-semibold mb-1 line-clamp-2">{cert.title}</h3>
                <p className="text-white/50 text-xs mb-1">{cert.institution}</p>
                {cert.issued_date && <p className="text-white/30 text-xs mb-3">Issued: {cert.issued_date}</p>}
                <div className="flex gap-2">
                  <button onClick={() => openEdit(cert)} className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 text-white/50 hover:text-white text-xs rounded-lg transition-colors">
                    <Pencil size={12} /> Edit
                  </button>
                  <button onClick={() => handleDelete(cert.id)} className="flex items-center gap-1.5 px-3 py-1.5 border border-red-400/20 text-red-400/50 hover:text-red-400 text-xs rounded-lg transition-colors">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto" onClick={closeForm}>
            <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.9, opacity:0 }}
              transition={{ type:'spring', stiffness:300, damping:30 }}
              className="w-full max-w-lg bg-[#0d0d1f] border border-white/10 rounded-3xl p-8 my-8" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold">{editing ? 'Edit Certificate' : 'Add Certificate'}</h2>
                <button onClick={closeForm} className="p-2 rounded-xl hover:bg-white/10 text-white/50"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <div><label className="block text-white/50 text-xs mb-1.5">Certificate Title *</label><input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title:e.target.value }))} placeholder="e.g. Professional Diploma in Web Development" /></div>
                <div><label className="block text-white/50 text-xs mb-1.5">Institution *</label><input className={inputCls} value={form.institution} onChange={e => setForm(f => ({ ...f, institution:e.target.value }))} placeholder="e.g. New Horizons Computer Learning Centers Nigeria" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-white/50 text-xs mb-1.5">Date Issued</label><input className={inputCls} value={form.issued_date} onChange={e => setForm(f => ({ ...f, issued_date:e.target.value }))} placeholder="e.g. May 2026" /></div>
                  <div><label className="block text-white/50 text-xs mb-1.5">Display Order</label><input type="number" className={inputCls} value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order:+e.target.value }))} /></div>
                </div>
                <div><label className="block text-white/50 text-xs mb-1.5">Certificate URL (optional)</label><input className={inputCls} value={form.credential_url} onChange={e => setForm(f => ({ ...f, credential_url:e.target.value }))} placeholder="Link to verify certificate online" /></div>
                <div>
                  <label className="block text-white/50 text-xs mb-2">Certificate Image / Scan</label>
                  {form.image_url && <img src={form.image_url} alt="preview" className="w-full h-32 object-cover rounded-xl mb-2 border border-white/10" />}
                  <label className="flex items-center gap-2 px-4 py-3 border border-dashed border-white/20 rounded-xl text-white/50 hover:border-gold/40 hover:text-gold cursor-pointer transition-all text-sm w-full justify-center">
                    <Upload size={16} /> {uploading ? 'Uploading...' : form.image_url ? 'Replace Image' : 'Upload Certificate Image/Scan'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={closeForm} className="flex-1 py-3 border border-white/10 rounded-xl text-white/50 hover:text-white transition-all text-sm">Cancel</button>
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                  onClick={handleSave} disabled={saving||!form.title||!form.institution}
                  className="flex-1 py-3 bg-gold text-navy font-semibold rounded-xl hover:bg-gold-light transition-all text-sm disabled:opacity-50">
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Certificate'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
