import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Upload, User, Link, Briefcase, FileText, CheckCircle } from 'lucide-react'
import { supabase, uploadFile } from '../lib/supabase'

export default function AdminSettings() {
  const [profile, setProfile] = useState(null)
  const [socials, setSocials] = useState(null)
  const [saving, setSaving] = useState({})
  const [uploading, setUploading] = useState({})
  const [saved, setSaved] = useState({})
  const [tab, setTab] = useState('profile')

  useEffect(() => {
    supabase.from('profile').select('*').single().then(({ data }) => {
      if (data) setProfile({ ...data, tech_stack: (data.tech_stack || []).join(', ') })
    })
    supabase.from('socials').select('*').single().then(({ data }) => setSocials(data))
  }, [])

  const showSaved = (key) => {
    setSaved(s => ({ ...s, [key]: true }))
    setTimeout(() => setSaved(s => ({ ...s, [key]: false })), 2000)
  }

  const saveProfile = async () => {
    setSaving(s => ({ ...s, profile: true }))
    const payload = { ...profile, tech_stack: profile.tech_stack.split(',').map(t => t.trim()).filter(Boolean) }
    const { id, created_at, ...rest } = payload
    await supabase.from('profile').update(rest).eq('id', id)
    setSaving(s => ({ ...s, profile: false }))
    showSaved('profile')
  }

  const saveSocials = async () => {
    setSaving(s => ({ ...s, socials: true }))
    const { id, ...rest } = socials
    await supabase.from('socials').update({ ...rest, updated_at: new Date().toISOString() }).eq('id', id)
    setSaving(s => ({ ...s, socials: false }))
    showSaved('socials')
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return
    setUploading(u => ({ ...u, avatar: true }))
    try {
      const url = await uploadFile('portfolio-images', file, `avatar/${Date.now()}.${file.name.split('.').pop()}`)
      setProfile(p => ({ ...p, avatar_url: url }))
      // Auto save avatar
      await supabase.from('profile').update({ avatar_url: url }).eq('id', profile.id)
      showSaved('avatar')
    } catch (err) { alert(err.message) }
    setUploading(u => ({ ...u, avatar: false }))
  }

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return
    if (!file.name.endsWith('.pdf')) { alert('Please upload a PDF file only'); return }
    setUploading(u => ({ ...u, resume: true }))
    try {
      const url = await uploadFile('portfolio-resume', file, `resume-${Date.now()}.pdf`)
      setProfile(p => ({ ...p, resume_url: url }))
      await supabase.from('profile').update({ resume_url: url }).eq('id', profile.id)
      showSaved('resume')
    } catch (err) { alert(err.message) }
    setUploading(u => ({ ...u, resume: false }))
  }

  const removeResume = async () => {
    if (!confirm('Remove resume? The Download Resume button on your portfolio will disappear.')) return
    setProfile(p => ({ ...p, resume_url: null }))
    await supabase.from('profile').update({ resume_url: null }).eq('id', profile.id)
  }

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/40 transition-colors"
  const labelCls = "block text-white/50 text-xs mb-1.5"

  const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'socials', label: 'Social Links', icon: Link },
  ]

  if (!profile || !socials) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-1">Settings</h1>
        <p className="text-white/40 text-sm">Manage your portfolio content</p>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-2 mb-8">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${tab === t.id ? 'bg-gold/15 text-gold border border-gold/20' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {/* PROFILE TAB */}
      {tab === 'profile' && (
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="card-glass rounded-2xl p-6 space-y-5">
          {/* Avatar */}
          <div>
            <label className={labelCls}>Profile Photo</label>
            <div className="flex items-center gap-4">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-20 h-20 rounded-xl object-cover border-2 border-gold/20" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gold/10 border-2 border-gold/20 flex items-center justify-center">
                  <span className="text-gold font-bold text-2xl">EK</span>
                </div>
              )}
              <div>
                <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-white/20 rounded-xl text-white/50 hover:border-gold/40 hover:text-gold cursor-pointer transition-all text-sm">
                  <Upload size={14} />
                  {uploading.avatar ? 'Uploading...' : profile.avatar_url ? 'Change Photo' : 'Upload Photo'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading.avatar} />
                </label>
                {saved.avatar && <p className="text-green-400 text-xs mt-1 flex items-center gap-1"><CheckCircle size={11} /> Saved!</p>}
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>Display Name</label>
            <input className={inputCls} value={profile.name || ''} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>Tagline</label>
            <input className={inputCls} value={profile.tagline || ''} onChange={e => setProfile(p => ({ ...p, tagline: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>Bio / About Text</label>
            <textarea className={inputCls} rows={5} value={profile.bio || ''} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>Tech Stack (comma separated)</label>
            <input className={inputCls} value={profile.tech_stack || ''} onChange={e => setProfile(p => ({ ...p, tech_stack: e.target.value }))} placeholder="React, JavaScript, Tailwind CSS..." />
          </div>
          <div>
            <label className={labelCls}>Availability Status</label>
            <select className={inputCls} value={profile.availability || 'open'} onChange={e => setProfile(p => ({ ...p, availability: e.target.value }))}>
              <option value="open" className="bg-navy">Open to work</option>
              <option value="busy" className="bg-navy">Currently busy</option>
              <option value="freelance" className="bg-navy">Freelance only</option>
            </select>
          </div>
          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
            onClick={saveProfile} disabled={saving.profile}
            className="flex items-center gap-2 px-6 py-3 bg-gold text-navy font-semibold rounded-xl hover:bg-gold-light transition-all text-sm disabled:opacity-60">
            {saved.profile ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> {saving.profile ? 'Saving...' : 'Save Profile'}</>}
          </motion.button>
        </motion.div>
      )}

      {/* RESUME TAB */}
      {tab === 'resume' && (
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="card-glass rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
              <FileText size={24} className="text-gold" />
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold">Resume PDF</h3>
              <p className="text-white/40 text-sm">Upload your resume to enable the Download button on your portfolio hero section</p>
            </div>
          </div>

          {profile.resume_url ? (
            <div className="mb-6 p-4 rounded-xl bg-green-400/5 border border-green-400/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-400" />
                  <div>
                    <p className="text-white text-sm font-medium">Resume uploaded ✓</p>
                    <p className="text-white/40 text-xs">The "Download Resume" button is now visible on your portfolio</p>
                  </div>
                </div>
                <a href={profile.resume_url} target="_blank" rel="noreferrer"
                  className="text-gold text-xs hover:text-gold-light transition-colors">View →</a>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 rounded-xl bg-white/3 border border-white/8">
              <p className="text-white/40 text-sm">⚠️ No resume uploaded yet. The "Download Resume" button on your portfolio hero is hidden until you upload one.</p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 px-6 py-3 bg-gold text-navy font-semibold rounded-xl hover:bg-gold-light transition-all cursor-pointer text-sm">
              <Upload size={16} />
              {uploading.resume ? 'Uploading...' : profile.resume_url ? 'Replace Resume PDF' : 'Upload Resume PDF'}
              <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} disabled={uploading.resume} />
            </label>
            {profile.resume_url && (
              <button onClick={removeResume}
                className="flex items-center gap-2 px-6 py-3 border border-red-400/30 text-red-400/70 hover:text-red-400 hover:border-red-400/50 rounded-xl transition-all text-sm">
                Remove Resume
              </button>
            )}
          </div>
          {saved.resume && <p className="text-green-400 text-sm mt-3 flex items-center gap-2"><CheckCircle size={14} /> Resume uploaded and saved!</p>}
          <p className="text-white/20 text-xs mt-4">PDF files only. Keep it under 5MB for fast loading.</p>
        </motion.div>
      )}

      {/* SOCIALS TAB */}
      {tab === 'socials' && (
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="card-glass rounded-2xl p-6 space-y-4">
          <p className="text-white/40 text-xs">These are used as fallback contact info. For your main social links, use the Social Links page in the sidebar.</p>
          {[
            { key: 'github', label: 'GitHub URL', placeholder: 'https://github.com/...' },
            { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/...' },
            { key: 'whatsapp', label: 'WhatsApp Link', placeholder: 'https://wa.me/234...' },
            { key: 'email', label: 'Email Address', placeholder: 'you@email.com' },
            { key: 'twitter', label: 'Twitter/X URL', placeholder: 'https://twitter.com/...' },
          ].map(f => (
            <div key={f.key}>
              <label className={labelCls}>{f.label}</label>
              <input className={inputCls} value={socials[f.key] || ''} onChange={e => setSocials(s => ({ ...s, [f.key]: e.target.value }))} placeholder={f.placeholder} />
            </div>
          ))}
          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
            onClick={saveSocials} disabled={saving.socials}
            className="flex items-center gap-2 px-6 py-3 bg-gold text-navy font-semibold rounded-xl hover:bg-gold-light transition-all text-sm disabled:opacity-60">
            {saved.socials ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> {saving.socials ? 'Saving...' : 'Save Links'}</>}
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
