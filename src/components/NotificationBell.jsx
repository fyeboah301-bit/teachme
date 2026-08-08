import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { BLUE, YELLOW, GREY_BG, GREY_LIGHT, TEXT_MUTED } from '../styles/colors'
import { useNavigate } from 'react-router-dom'

export default function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    fetchNotifications()

    // Real-time subscription
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, () => fetchNotifications())
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    setNotifications(data || [])
  }

  const markAllRead = async () => {
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleClick = async (notification) => {
    if (!notification.read) {
      await supabase.from('notifications').update({ read: true }).eq('id', notification.id)
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n))
    }
    setOpen(false)
    if (notification.link) navigate(notification.link)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const typeIcon = (type) => {
    if (type === 'booking_new') return '📅'
    if (type === 'booking_confirmed') return '✅'
    if (type === 'booking_declined') return '❌'
    if (type === 'enrollment') return '🎥'
    return '🔔'
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => { setOpen(o => !o); if (!open && unreadCount > 0) {} }}
        style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <span style={{ fontSize: '22px' }}>🔔</span>
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: '0px', right: '0px', background: '#EF4444', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '340px', background: '#fff', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: `1px solid ${GREY_LIGHT}`, zIndex: 1000, overflow: 'hidden' }}>
          {/* HEADER */}
          <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${GREY_LIGHT}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: GREY_BG }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#111' }}>Notifications {unreadCount > 0 && <span style={{ fontSize: '12px', background: '#EF4444', color: '#fff', padding: '1px 7px', borderRadius: '20px', marginLeft: '6px' }}>{unreadCount}</span>}</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ fontSize: '12px', color: BLUE, background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Mark all read</button>
            )}
          </div>

          {/* LIST */}
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: TEXT_MUTED }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔔</div>
                <p style={{ fontSize: '13px' }}>No notifications yet</p>
              </div>
            ) : notifications.map(n => (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                style={{ padding: '12px 16px', borderBottom: `1px solid ${GREY_LIGHT}`, cursor: n.link ? 'pointer' : 'default', background: n.read ? '#fff' : '#EFF6FF', display: 'flex', gap: '12px', alignItems: 'flex-start' }}
              >
                <span style={{ fontSize: '20px', flexShrink: 0, marginTop: '2px' }}>{typeIcon(n.type)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: n.read ? '500' : '700', color: '#111', marginBottom: '2px' }}>{n.title}</div>
                  <div style={{ fontSize: '12px', color: TEXT_MUTED, lineHeight: '1.4' }}>{n.message}</div>
                  <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>{new Date(n.created_at).toLocaleString()}</div>
                </div>
                {!n.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: BLUE, flexShrink: 0, marginTop: '6px' }} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}