import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  BLUE, YELLOW, DARK_BLUE, LIGHT_BLUE, GREY_BG, GREY_LIGHT,
  TEXT, TEXT_MUTED, GRADIENT_BLUE, GRADIENT_HERO,
  SHADOW_LG, SHADOW_BLUE, TRANSITION, BORDER,
} from '../styles/colors'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import usePageMeta from '../hooks/usePageMeta'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 769)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(date) {
  const d = new Date(date)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
}

function groupMessagesByDate(messages) {
  const groups = []
  let currentDate = null
  messages.forEach(msg => {
    const msgDate = new Date(msg.created_at).toDateString()
    if (msgDate !== currentDate) {
      currentDate = msgDate
      groups.push({ type: 'date', label: formatDate(msg.created_at), key: msg.created_at + '_date' })
    }
    groups.push({ type: 'message', ...msg })
  })
  return groups
}

export default function Messages() {
  usePageMeta('Messages')

  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [searchParams] = useSearchParams()
  const [conversations, setConversations] = useState([])
  const [conversationMeta, setConversationMeta] = useState({})
  const [activeBooking, setActiveBooking] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')
  const [showList, setShowList] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!user) navigate('/login')
    else fetchConversations()
  }, [user])

  useEffect(() => {
    const bookingId = searchParams.get('booking')
    if (bookingId && conversations.length > 0) {
      const conv = conversations.find(c => c.id === bookingId)
      if (conv) openConversation(conv)
    }
  }, [conversations, searchParams])

  useEffect(() => {
    if (!activeBooking) return
    fetchMessages(activeBooking.id)
    const channel = supabase.channel(`messages-${activeBooking.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `booking_id=eq.${activeBooking.id}` }, payload => {
        setMessages(prev => [...prev, payload.new])
        if (payload.new.receiver_id === user.id) {
          supabase.from('messages').update({ read: true }).eq('id', payload.new.id)
        }
      }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [activeBooking])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*, profiles:client_id (full_name, avatar_url), teachers (id, profiles (full_name, avatar_url))')
      .eq('status', 'confirmed')
      .or(`client_id.eq.${user.id},teacher_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
    const convs = data || []
    setConversations(convs)
    const meta = {}
    await Promise.all(convs.map(async conv => {
      const { data: msgs } = await supabase.from('messages').select('*').eq('booking_id', conv.id).order('created_at', { ascending: false }).limit(1)
      const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('booking_id', conv.id).eq('receiver_id', user.id).eq('read', false)
      meta[conv.id] = { lastMessage: msgs?.[0] || null, unread: count || 0 }
    }))
    setConversationMeta(meta)
    setLoading(false)
  }

  const fetchMessages = async (bookingId) => {
    const { data } = await supabase.from('messages').select('*').eq('booking_id', bookingId).order('created_at', { ascending: true })
    setMessages(data || [])
    await supabase.from('messages').update({ read: true }).eq('booking_id', bookingId).eq('receiver_id', user.id)
    setConversationMeta(prev => ({ ...prev, [bookingId]: { ...prev[bookingId], unread: 0 } }))
  }

  const openConversation = (conv) => {
    setActiveBooking(conv)
    if (isMobile) setShowList(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const getOtherPersonId = (conv) => conv.client_id === user.id ? conv.teacher_id : conv.client_id
  const getOtherPersonName = (conv) => conv.client_id === user.id ? conv.teachers?.profiles?.full_name : conv.profiles?.full_name
  const getOtherPersonAvatar = (conv) => conv.client_id === user.id ? conv.teachers?.profiles?.avatar_url : conv.profiles?.avatar_url

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeBooking) return
    setSending(true)
    const messageText = newMessage.trim()
    setNewMessage('')
    try {
      const receiverId = getOtherPersonId(activeBooking)
      const { data, error } = await supabase.from('messages').insert({
        booking_id: activeBooking.id, sender_id: user.id, receiver_id: receiverId, content: messageText
      }).select().single()
      if (error) throw error
      setMessages(prev => [...prev, data])
      await supabase.from('notifications').insert({
        user_id: receiverId, title: 'New message',
        message: `${profile?.full_name}: ${messageText.slice(0, 60)}`,
        type: 'message', link: `/messages?booking=${activeBooking.id}`
      })
      setConversationMeta(prev => ({ ...prev, [activeBooking.id]: { ...prev[activeBooking.id], lastMessage: data } }))
    } catch (err) { console.log(err) }
    finally { setSending(false) }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e) }
  }

  const filteredConversations = conversations.filter(conv => {
    const name = getOtherPersonName(conv)?.toLowerCase() || ''
    const subject = conv.subject?.toLowerCase() || ''
    const q = search.toLowerCase()
    return name.includes(q) || subject.includes(q)
  })

  const totalUnread = Object.values(conversationMeta).reduce((sum, m) => sum + (m.unread || 0), 0)
  const grouped = groupMessagesByDate(messages)

  function Avatar({ url, name, size = 44, color = GRADIENT_BLUE }) {
    return url ? (
      <img src={url} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
    ) : (
      <div style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.round(size * 0.36), fontWeight: '800', color: '#fff', flexShrink: 0 }}>
        {name?.charAt(0)}
      </div>
    )
  }

  const ConversationList = () => (
    <div style={{ background: '#fff', borderRadius: isMobile ? 0 : '20px', border: isMobile ? 'none' : BORDER, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: isMobile ? 'none' : SHADOW_LG }}>
      <div style={{ background: GRADIENT_HERO, padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#fff', margin: 0, fontWeight: '700', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Messages
            {totalUnread > 0 && (
              <span style={{ fontSize: '12px', background: YELLOW, color: BLUE, padding: '2px 10px', borderRadius: '50px', fontWeight: '800' }}>{totalUnread}</span>
            )}
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.12)', borderRadius: '50px', padding: '0 14px', border: '1px solid rgba(255,255,255,0.2)' }}>
          <span style={{ fontSize: '14px', marginRight: '8px', opacity: 0.7 }}>🔍</span>
          <input
            style={{ flex: 1, padding: '9px 0', border: 'none', fontSize: '13px', fontFamily: 'inherit', outline: 'none', background: 'transparent', color: '#fff' }}
            placeholder="Search conversations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '16px', padding: 0 }}>×</button>}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px', animation: 'pulse 1.5s infinite' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: GREY_BG, flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ height: '14px', background: GREY_BG, borderRadius: '6px', width: '60%' }} />
                  <div style={{ height: '12px', background: GREY_BG, borderRadius: '6px', width: '85%' }} />
                </div>
              </div>
            ))}
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: LIGHT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 1rem' }}>💬</div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: TEXT, marginBottom: '6px' }}>{search ? 'No results' : 'No conversations yet'}</p>
            <p style={{ fontSize: '13px', color: TEXT_MUTED, lineHeight: '1.6', marginBottom: '1rem' }}>
              {search ? 'Try a different search term.' : 'Messaging unlocks once a booking is confirmed.'}
            </p>
            {!search && (
              <Link to="/booking" style={{ fontSize: '13px', color: '#fff', fontWeight: '700', textDecoration: 'none', background: GRADIENT_BLUE, padding: '9px 20px', borderRadius: '50px', display: 'inline-block', boxShadow: SHADOW_BLUE }}>
                Book a teacher →
              </Link>
            )}
          </div>
        ) : filteredConversations.map(conv => {
          const isActive = activeBooking?.id === conv.id
          const meta = conversationMeta[conv.id] || {}
          const lastMsg = meta.lastMessage
          const unread = meta.unread || 0
          const name = getOtherPersonName(conv)
          const avatar = getOtherPersonAvatar(conv)
          return (
            <div key={conv.id} onClick={() => openConversation(conv)}
              style={{ padding: '0.875rem 1.25rem', borderBottom: BORDER, cursor: 'pointer', background: isActive ? LIGHT_BLUE : '#fff', transition: TRANSITION, display: 'flex', gap: '12px', alignItems: 'center' }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = GREY_BG }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = '#fff' }}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <Avatar url={avatar} name={name} size={46} color={isActive ? GRADIENT_BLUE : `linear-gradient(135deg, ${DARK_BLUE}, ${BLUE})`} />
                {unread > 0 && (
                  <div style={{ position: 'absolute', top: '-2px', right: '-2px', background: '#EF4444', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800', border: '2px solid #fff' }}>
                    {unread > 9 ? '9+' : unread}
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <span style={{ fontSize: '14px', fontWeight: unread > 0 ? '800' : '600', color: isActive ? BLUE : TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                  {lastMsg && <span style={{ fontSize: '10px', color: TEXT_MUTED, flexShrink: 0, marginLeft: '6px', fontWeight: '500' }}>{formatTime(lastMsg.created_at)}</span>}
                </div>
                <div style={{ fontSize: '12px', color: unread > 0 ? TEXT : TEXT_MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '5px', fontWeight: unread > 0 ? '600' : '400' }}>
                  {lastMsg ? (
                    <>{lastMsg.sender_id === user.id ? 'You: ' : ''}{lastMsg.content}</>
                  ) : (
                    <span style={{ fontStyle: 'italic', color: TEXT_MUTED }}>No messages yet — say hello!</span>
                  )}
                </div>
                <span style={{ fontSize: '11px', background: isActive ? 'rgba(37,99,235,0.15)' : GREY_BG, color: isActive ? BLUE : TEXT_MUTED, padding: '2px 9px', borderRadius: '50px', fontWeight: '600' }}>
                  {conv.subject}
                </span>
              </div>
              {unread > 0 && !isActive && (
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: BLUE, flexShrink: 0 }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  const ChatWindow = () => (
    <div style={{ background: '#fff', borderRadius: isMobile ? 0 : '20px', border: isMobile ? 'none' : BORDER, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: isMobile ? 'none' : SHADOW_LG }}>
      {activeBooking ? (
        <>
          <div style={{ background: GRADIENT_HERO, padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isMobile && (
              <button onClick={() => setShowList(true)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '16px', padding: '6px 10px', borderRadius: '50px', flexShrink: 0, fontFamily: 'inherit' }}>←</button>
            )}
            <Avatar url={getOtherPersonAvatar(activeBooking)} name={getOtherPersonName(activeBooking)} size={40} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
                {getOtherPersonName(activeBooking)}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', marginTop: '1px' }}>📚 {activeBooking.subject}</div>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              {activeBooking.room_id && (
                <Link to={`/call/${activeBooking.room_id}`} style={{ padding: '7px 14px', background: '#16A34A', color: '#fff', borderRadius: '50px', fontSize: '12px', textDecoration: 'none', fontWeight: '700', boxShadow: '0 2px 8px rgba(22,163,74,0.3)' }}>
                  🎥 Call
                </Link>
              )}
              <Link to="/booking" style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.12)', color: '#fff', borderRadius: '50px', fontSize: '12px', textDecoration: 'none', fontWeight: '600', border: '1px solid rgba(255,255,255,0.2)' }}>
                📋 Booking
              </Link>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '2px', background: GREY_BG }}>
            {messages.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '3rem' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: LIGHT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>👋</div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: TEXT, marginBottom: '6px', letterSpacing: '-0.01em' }}>Say hello!</p>
                  <p style={{ fontSize: '13px', color: TEXT_MUTED, lineHeight: '1.6', margin: 0 }}>No messages yet. Start the conversation with {getOtherPersonName(activeBooking)}.</p>
                </div>
              </div>
            ) : grouped.map((item, idx) => {
              if (item.type === 'date') {
                return (
                  <div key={item.key} style={{ textAlign: 'center', margin: '14px 0 10px' }}>
                    <span style={{ fontSize: '11px', background: '#E2E8F0', color: '#64748B', padding: '4px 14px', borderRadius: '50px', fontWeight: '600', letterSpacing: '0.03em' }}>{item.label}</span>
                  </div>
                )
              }
              const isMe = item.sender_id === user.id
              const myAvatar = profile?.avatar_url
              const theirAvatar = getOtherPersonAvatar(activeBooking)
              const nextItem = grouped[idx + 1]
              const showAvatar = !isMe && (nextItem?.type === 'date' || nextItem?.sender_id !== item.sender_id || !nextItem)
              const isFirstInGroup = idx === 0 || grouped[idx - 1]?.type === 'date' || grouped[idx - 1]?.sender_id !== item.sender_id
              return (
                <div key={item.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: '8px', marginBottom: showAvatar ? '10px' : '2px' }}>
                  {!isMe && (
                    <div style={{ width: '30px', height: '30px', flexShrink: 0, visibility: showAvatar ? 'visible' : 'hidden' }}>
                      <Avatar url={theirAvatar} name={getOtherPersonName(activeBooking)} size={30} />
                    </div>
                  )}
                  <div style={{ maxWidth: '68%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', gap: '3px' }}>
                    {isFirstInGroup && !isMe && (
                      <span style={{ fontSize: '11px', color: TEXT_MUTED, paddingLeft: '4px', fontWeight: '600' }}>{getOtherPersonName(activeBooking)?.split(' ')[0]}</span>
                    )}
                    <div style={{ background: isMe ? GRADIENT_BLUE : '#fff', color: isMe ? '#fff' : TEXT, padding: '10px 16px', borderRadius: isMe ? '20px 20px 6px 20px' : '20px 20px 20px 6px', fontSize: '14px', lineHeight: '1.6', boxShadow: isMe ? SHADOW_BLUE : '0 1px 4px rgba(0,0,0,0.06)', border: isMe ? 'none' : BORDER, wordBreak: 'break-word', letterSpacing: '0.01em' }}>
                      {item.content}
                    </div>
                    <div style={{ fontSize: '10px', color: TEXT_MUTED, display: 'flex', alignItems: 'center', gap: '4px', paddingLeft: isMe ? 0 : '4px', paddingRight: isMe ? '4px' : 0 }}>
                      {formatTime(item.created_at)}
                      {isMe && <span style={{ color: item.read ? '#60A5FA' : '#94A3B8', fontSize: '11px' }}>{item.read ? '✓✓' : '✓'}</span>}
                    </div>
                  </div>
                  {isMe && (
                    <div style={{ width: '30px', height: '30px', flexShrink: 0 }}>
                      <Avatar url={myAvatar} name={profile?.full_name} size={30} color={GRADIENT_BLUE} />
                    </div>
                  )}
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '6px 1.25rem', background: '#FFFBEB', borderTop: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', flexShrink: 0 }}>🔒</span>
            <p style={{ fontSize: '11px', color: '#854D0E', margin: 0, fontWeight: '500' }}>
              Never share personal contact details. Keep all communication on TeachMe.
            </p>
          </div>

          <form onSubmit={sendMessage} style={{ padding: '0.875rem 1.25rem', borderTop: BORDER, display: 'flex', gap: '10px', alignItems: 'flex-end', background: '#fff' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', background: GREY_BG, borderRadius: '20px', border: `1px solid ${newMessage.trim() ? BLUE : GREY_LIGHT}`, padding: '0 14px', transition: TRANSITION }}>
              <textarea
                ref={inputRef}
                style={{ flex: 1, padding: '11px 0', border: 'none', fontSize: '14px', fontFamily: 'inherit', outline: 'none', resize: 'none', maxHeight: '100px', minHeight: '22px', overflowY: 'auto', lineHeight: '1.5', boxSizing: 'border-box', background: 'transparent', color: TEXT }}
                placeholder="Type a message… (Enter to send)"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
            </div>
            <button type="submit" disabled={sending || !newMessage.trim()}
              style={{ width: '44px', height: '44px', background: newMessage.trim() ? GRADIENT_BLUE : GREY_LIGHT, color: newMessage.trim() ? '#fff' : TEXT_MUTED, border: 'none', borderRadius: '50%', fontSize: '18px', cursor: newMessage.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: TRANSITION, boxShadow: newMessage.trim() ? SHADOW_BLUE : 'none' }}>
              {sending ? '⏳' : '➤'}
            </button>
          </form>
        </>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: GREY_BG, gap: '16px', padding: '3rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: LIGHT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>💬</div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: TEXT, marginBottom: '8px', letterSpacing: '-0.01em' }}>Your messages</h3>
            <p style={{ fontSize: '14px', color: TEXT_MUTED, maxWidth: '260px', lineHeight: '1.7', margin: '0 auto 1.5rem' }}>
              Select a conversation on the left to start messaging your teacher or student
            </p>
            {conversations.length === 0 && (
              <Link to="/booking" style={{ padding: '11px 24px', background: GRADIENT_BLUE, color: '#fff', borderRadius: '50px', fontSize: '13px', textDecoration: 'none', fontWeight: '700', boxShadow: SHADOW_BLUE, display: 'inline-block' }}>
                Book a teacher to start messaging
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: GREY_BG, fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: isMobile ? 0 : '1.25rem 1.5rem', boxSizing: 'border-box' }}>
        {isMobile ? (
          <div style={{ flex: 1, height: 'calc(100vh - 60px)' }}>
            {showList ? <ConversationList /> : <ChatWindow />}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.25rem', height: 'calc(100vh - 110px)', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
            <ConversationList />
            <ChatWindow />
          </div>
        )}
      </div>
      {!isMobile && <Footer />}
    </div>
  )
}