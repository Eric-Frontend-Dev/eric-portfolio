import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, MailOpen, Trash2, ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function AdminMessages() {
  const [messages, setMessages] = useState([])
  const [expanded, setExpanded] = useState(null)

  const load = async () => {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending:false })
    setMessages(data||[])
  }

  useEffect(() => { load() }, [])

  const toggleExpand = async (msg) => {
    if (expanded === msg.id) { setExpanded(null); return }
    setExpanded(msg.id)
    if (!msg.is_read) {
      await supabase.from('messages').update({ is_read:true }).eq('id', msg.id)
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read:true } : m))
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return
    await supabase.from('messages').delete().eq('id', id)
    load()
  }

  const unreadCount = messages.filter(m => !m.is_read).length

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-1">Messages</h1>
        <p className="text-white/40 text-sm">{messages.length} total — <span className="text-gold">{unreadCount} unread</span></p>
      </div>
      {messages.length === 0 ? (
        <div className="card-glass rounded-2xl p-12 text-center text-white/30">No messages yet.</div>
      ) : (
        <div className="space-y-2">
          {messages.map((msg, i) => (
            <motion.div key={msg.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
              className={`card-glass rounded-2xl overflow-hidden border transition-all ${!msg.is_read ? 'border-gold/20' : 'border-white/5'}`}>
              <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/3 transition-colors" onClick={() => toggleExpand(msg)}>
                <div className={`flex-shrink-0 ${!msg.is_read ? 'text-gold' : 'text-white/30'}`}>
                  {msg.is_read ? <MailOpen size={18} /> : <Mail size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`font-medium text-sm ${!msg.is_read ? 'text-white' : 'text-white/70'}`}>{msg.name}</span>
                    <span className="text-white/30 text-xs">{msg.email}</span>
                    {msg.budget && <span className="px-2 py-0.5 bg-white/5 text-white/40 text-xs rounded-md">{msg.budget}</span>}
                    {!msg.is_read && <span className="px-2 py-0.5 bg-gold/15 text-gold text-xs rounded-full">New</span>}
                  </div>
                  <p className="text-white/40 text-xs mt-0.5 truncate">{msg.message}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-white/20 text-xs hidden md:block">{new Date(msg.created_at).toLocaleDateString()}</span>
                  <motion.div animate={{ rotate:expanded===msg.id ? 180 : 0 }} className="text-white/30"><ChevronDown size={16} /></motion.div>
                </div>
              </div>
              <AnimatePresence>
                {expanded===msg.id && (
                  <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.25 }} className="overflow-hidden">
                    <div className="px-5 pb-5 border-t border-white/5 pt-4">
                      <p className="text-white/70 text-sm leading-relaxed mb-4 whitespace-pre-wrap">{msg.message}</p>
                      <div className="flex items-center justify-between">
                        <a href={`mailto:${msg.email}`} className="text-sm text-gold hover:text-gold-light transition-colors">Reply to {msg.name} →</a>
                        <button onClick={() => handleDelete(msg.id)} className="flex items-center gap-1.5 text-xs text-white/30 hover:text-red-400 transition-colors">
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
