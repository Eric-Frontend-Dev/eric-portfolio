import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FolderOpen, MessageSquare, Star, Eye } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function AdminHome() {
  const [stats, setStats] = useState({ projects:0, messages:0, unread:0, testimonials:0 })
  const [recentMessages, setRecentMessages] = useState([])

  useEffect(() => {
    const load = async () => {
      const [p, m, t] = await Promise.all([
        supabase.from('projects').select('id', { count:'exact', head:true }),
        supabase.from('messages').select('id, is_read', { count:'exact' }),
        supabase.from('testimonials').select('id', { count:'exact', head:true }),
      ])
      const unread = (m.data||[]).filter(x => !x.is_read).length
      setStats({ projects:p.count||0, messages:m.count||0, unread, testimonials:t.count||0 })
      const { data: msgs } = await supabase.from('messages').select('*').order('created_at', { ascending:false }).limit(5)
      setRecentMessages(msgs||[])
    }
    load()
  }, [])

  const cards = [
    { label:'Total Projects', value:stats.projects, icon:FolderOpen, color:'text-blue-400', bg:'bg-blue-400/10 border-blue-400/20' },
    { label:'Total Messages', value:stats.messages, icon:MessageSquare, color:'text-green-400', bg:'bg-green-400/10 border-green-400/20' },
    { label:'Unread Messages', value:stats.unread, icon:Eye, color:'text-gold', bg:'bg-gold/10 border-gold/20' },
    { label:'Testimonials', value:stats.testimonials, icon:Star, color:'text-purple-400', bg:'bg-purple-400/10 border-purple-400/20' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-1">Dashboard</h1>
        <p className="text-white/40 text-sm">Welcome back, Eric.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}
            className={`card-glass rounded-2xl p-5 border ${c.bg}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-white/50 text-xs">{c.label}</p>
              <c.icon size={18} className={c.color} />
            </div>
            <p className={`font-display text-3xl font-bold ${c.color}`}>{c.value}</p>
          </motion.div>
        ))}
      </div>
      <div>
        <h2 className="font-display text-xl font-semibold mb-4">Recent Messages</h2>
        {recentMessages.length === 0 ? (
          <div className="card-glass rounded-2xl p-8 text-center text-white/30">No messages yet.</div>
        ) : (
          <div className="card-glass rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-white/30 font-normal">Name</th>
                <th className="text-left px-5 py-3 text-white/30 font-normal hidden md:table-cell">Email</th>
                <th className="text-left px-5 py-3 text-white/30 font-normal">Status</th>
              </tr></thead>
              <tbody>
                {recentMessages.map(msg => (
                  <tr key={msg.id} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3 text-white">{msg.name}</td>
                    <td className="px-5 py-3 text-white/50 hidden md:table-cell">{msg.email}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${msg.is_read ? 'bg-white/5 text-white/30' : 'bg-gold/15 text-gold'}`}>
                        {msg.is_read ? 'Read' : 'New'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
