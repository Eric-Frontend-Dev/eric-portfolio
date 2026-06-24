import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, GripVertical } from 'lucide-react'
import { supabase } from '../lib/supabase'

const EMPTY = { title:'', description:'', icon:'code', pricing_label:'Contact for pricing', display_order:0 }
const ICONS = ['code','layout','globe','smartphone','palette','database','settings','zap']

export default function AdminServices() {
  const [services, setServices] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('services').select('*').order('display_order')
    setServices(data||[])
  }
  useEffect(() => { load() }, [])

  const openNew = () => { setEditing(null); setForm({ ...EMPTY, display_order:services.length+1 }); setShowForm(true) }
  const openEdit = (s) => { setEditing(s.id); setForm({ ...s }); setShowForm(true) }
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(EMPTY) }

  const handleSave = async () => {
    if (!form.title||!form.description) return
    setSaving(true)
    if (editing) await supabase.from('services').update(form).eq('id', editing)
    else await supabase.from('services').insert([form])
    setSaving(false); closeForm(); load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this service?')) return
    await supabase.from('services').delete().eq('id', id)
    load()
  }

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/40 transition-colors"

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Services</h1>
          <p className="text-white/40 text-sm">{services.length} service{services.length!==1?'s':''} — shown on your portfolio</p>
        </div>
        <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }} onClick={openNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-gold text-navy text-sm font-semibold rounded-xl hover:bg-gold-light transition-colors">
          <Plus size={16} /> Add Service
        </motion.button>
      </div>

      {services.length===0 ? (
        <div className="card-glass rounded-2xl p-12 text-center text-white/30">No services yet. Add your first one!</div>
      ) : (
        <div className="space-y-3">
          {services.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
              className="card-glass rounded-2xl p-5 flex items-start gap-4">
              <div className="text-white/20 mt-1 flex-shrink-0"><GripVertical size={16} /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                  <span className="px-2 py-0.5 bg-gold/10 text-gold text-xs rounded-md">{s.pricing_label}</span>
                </div>
                <p className="text-white/50 text-sm leading-relaxed line-clamp-2">{s.description}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEdit(s)} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(s.id)} className="p-2 rounded-lg hover:bg-red-400/10 text-white/40 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
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
                <h2 className="font-display text-2xl font-bold">{editing ? 'Edit Service' : 'Add New Service'}</h2>
                <button onClick={closeForm} className="p-2 rounded-xl hover:bg-white/10 text-white/50"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <div><label className="block text-white/50 text-xs mb-1.5">Service Title *</label><input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title:e.target.value }))} placeholder="e.g. Web Development" /></div>
                <div><label className="block text-white/50 text-xs mb-1.5">Description *</label><textarea className={inputCls} rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description:e.target.value }))} placeholder="Describe what this service includes..." /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-white/50 text-xs mb-1.5">Pricing Label</label><input className={inputCls} value={form.pricing_label} onChange={e => setForm(f => ({ ...f, pricing_label:e.target.value }))} placeholder="Contact for pricing" /></div>
                  <div><label className="block text-white/50 text-xs mb-1.5">Display Order</label><input type="number" className={inputCls} value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order:+e.target.value }))} /></div>
                </div>
                <div>
                  <label className="block text-white/50 text-xs mb-2">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {ICONS.map(icon => (
                      <button key={icon} type="button" onClick={() => setForm(f => ({ ...f, icon }))}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-all ${form.icon===icon ? 'bg-gold text-navy font-semibold' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={closeForm} className="flex-1 py-3 border border-white/10 rounded-xl text-white/50 hover:text-white transition-all text-sm">Cancel</button>
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                  onClick={handleSave} disabled={saving||!form.title||!form.description}
                  className="flex-1 py-3 bg-gold text-navy font-semibold rounded-xl hover:bg-gold-light transition-all text-sm disabled:opacity-50">
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Service'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
