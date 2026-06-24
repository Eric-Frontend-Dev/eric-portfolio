import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { detectLink, PlatformIcon } from '../lib/linkDetector.jsx'

export default function AdminLinks() {
  const [links, setLinks] = useState([])
  const [newUrl, setNewUrl] = useState('')
  const [adding, setAdding] = useState(false)
  const [preview, setPreview] = useState(null)

  const load = async () => {
    const { data } = await supabase.from('links').select('*').order('display_order')
    setLinks(data||[])
  }
  useEffect(() => { load() }, [])

  const handleUrlChange = (val) => {
    setNewUrl(val)
    if (val.length > 5) setPreview(detectLink(val))
    else setPreview(null)
  }

  const handleAdd = async () => {
    if (!newUrl.trim()) return
    setAdding(true)
    await supabase.from('links').insert([{ url:newUrl.trim(), display_order:links.length+1 }])
    setNewUrl(''); setPreview(null); setAdding(false); load()
  }

  const handleDelete = async (id) => {
    await supabase.from('links').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-1">Social Links</h1>
        <p className="text-white/40 text-sm">Paste any link — it automatically detects the platform and shows the right icon.</p>
      </div>

      <div className="card-glass rounded-2xl p-6 mb-6">
        <label className="block text-white/50 text-xs mb-3 tracking-widest uppercase">Add a new link</label>
        <div className="flex gap-3">
          <div className="flex-1">
            <input value={newUrl} onChange={e => handleUrlChange(e.target.value)} onKeyDown={e => e.key==='Enter' && handleAdd()}
              placeholder="Paste any link — github, linkedin, instagram, tiktok..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/40 transition-colors" />
          </div>
          <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }} onClick={handleAdd} disabled={adding||!newUrl.trim()}
            className="flex items-center gap-2 px-5 py-3 bg-gold text-navy text-sm font-semibold rounded-xl hover:bg-gold-light transition-colors disabled:opacity-50">
            <Plus size={16} /> {adding ? 'Adding...' : 'Add'}
          </motion.button>
        </div>
        <AnimatePresence>
          {preview && (
            <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} className="mt-3 flex items-center gap-3">
              <span className="text-white/30 text-xs">Detected:</span>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background:preview.bg+'22', border:`1px solid ${preview.bg}44`, color:preview.bg==='#ffffff' ? '#e2b96f' : preview.bg }}>
                <span style={{ color:preview.bg==='#ffffff' ? '#e2b96f' : preview.bg }}><PlatformIcon id={preview.id} size={14} /></span>
                {preview.label}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="card-glass rounded-2xl overflow-hidden">
        {links.length === 0 ? (
          <div className="p-12 text-center text-white/30">No links yet. Add your first one above!</div>
        ) : (
          <div>
            {links.map((link, i) => {
              const info = detectLink(link.url)
              return (
                <motion.div key={link.id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }}
                  className="flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors group">
                  <div className="w-8 text-white/20 cursor-grab flex-shrink-0"><GripVertical size={16} /></div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background:info.bg+'22', border:`1px solid ${info.bg}33` }}>
                    <span style={{ color:info.bg==='#ffffff'||info.bg==='#fffc00' ? '#e2b96f' : info.bg }}>
                      <PlatformIcon id={info.id} size={18} />
                    </span>
                  </div>
                  <a href={link.url} target="_blank" rel="noreferrer"
                    className="flex-1 text-white/70 text-sm truncate hover:text-gold transition-colors">{link.url}</a>
                  <span className="w-24 text-xs px-2 py-1 rounded-full text-center hidden md:block"
                    style={{ background:info.bg+'22', color:info.bg==='#ffffff'||info.bg==='#fffc00' ? '#e2b96f' : info.bg }}>
                    {info.label}
                  </span>
                  <button onClick={() => handleDelete(link.id)}
                    className="w-10 flex items-center justify-center p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-400/10 text-white/30 hover:text-red-400 transition-all">
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
      <p className="text-white/20 text-xs mt-4 text-center">These links appear in the Contact section and Footer of your portfolio.</p>
    </div>
  )
}
