import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function AnnouncementBanner() {
  const { profile } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [dismissed, setDismissed] = useState([])

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      setAnnouncements(data || [])
    }
    fetchAnnouncements()
  }, [])

  const visible = announcements.filter(a => {
    if (dismissed.includes(a.id)) return false
    if (a.target_role === 'all') return true
    return a.target_role === profile?.role
  })

  if (visible.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
      {visible.map(a => (
        <div key={a.id} style={{ background: '#FFF9E6', border: '1px solid #FFD700', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ fontWeight: '700', fontSize: '14px', color: '#1A3FA0', marginBottom: '2px' }}>📢 {a.title}</div>
            <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>{a.message}</div>
          </div>
          <button
            onClick={() => setDismissed(prev => [...prev, a.id])}
            style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#9CA3AF', flexShrink: 0, lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}