import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BLUE, YELLOW, LIGHT_BLUE, GREY_BG, GREY_LIGHT, TEXT_MUTED } from '../styles/colors'

export default function Messages() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [conversations, setConversations] = useState([])
  const [activeBooking, setActiveBooking] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

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
  }, [conversations])

  useEffect(() => {
    if (!activeBooking) return
    fetchMessages(activeBooking.id)

    const channel = supabase
      .channel(`messages-${activeBooking.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `booking_id=eq.${activeBooking.id}` }, payload => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeBooking])

  const fetchConversations = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*, profiles:client_id (full_name), teachers (id, profiles (full_name))')
      .eq('status', 'confirmed')
      .or(`client_id.eq.${user.id},teacher_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
    setConversations(data || [])
    setLoading(false)
  }

  const fetchMessages = async (bookingId) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true })
    setMessages(data || [])

    // Mark as read
    await supabase.from('messages').update({ read: true }).eq('booking_id', bookingId).eq('receiver_id', user.id)
  }

  const openConversation = (conv) => {
    setActiveBooking(conv)
  }

  const getOtherPersonId = (conv) => {
    return conv.client_id === user.id ? conv.teacher_id : conv.client_id
  }

  const getOtherPersonName = (conv) => {
    return conv.client_id === user.id ? conv.teachers?.profiles?.full_name : conv.profiles?.full_name
  }

  const sendMessage = async (e) => {
  e.preventDefault()
  if (!newMessage.trim() || !activeBooking) return
  setSending(true)
  const messageText = newMessage.trim()
  setNewMessage('')
  try {
    const receiverId = getOtherPersonId(activeBooking)
    const { data, error } = await supabase.from('messages').insert({
      booking_id: activeBooking.id,
      sender_id: user.id,
      receiver_id: receiverId,
      content: messageText
    }).select().single()
    if (error) throw error
    setMessages(prev => [...prev, data])
  } catch (err) {
    console.log(err)
  } finally {
    setSending(false)
  }
}

  return (
    <div style={{ minHeight: '100vh', background: GREY_BG, fontFamily: 'DM Sans, sans-serif' }}>

      {/* NAV */}
      <nav style={{ background: BLUE, padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '700', color: '#fff', textDecoration: 'none' }}>
          Teach<span style={{ color: YELLOW }}>Me</span>
        </Link>
        <Link to="/dashboard" style={{ padding: '8px 18px', background: YELLOW, color: BLUE, borderRadius: '5px', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>Dashboard</Link>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: BLUE, marginBottom: '1.5rem' }}>Messages</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', height: '600px' }}>

          {/* CONVERSATIONS LIST */}
          <div style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: BLUE, padding: '1rem 1.25rem' }}>
              <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>Conversations</h3>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loading ? (
                <p style={{ padding: '1.25rem', fontSize: '13px', color: TEXT_MUTED }}>Loading...</p>
              ) : conversations.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: TEXT_MUTED }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
                  <p style={{ fontSize: '13px' }}>No conversations yet. Messaging unlocks once a booking is confirmed.</p>
                </div>
              ) : (
                conversations.map(conv => (
                  <div key={conv.id} onClick={() => openConversation(conv)} style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${GREY_LIGHT}`, cursor: 'pointer', background: activeBooking?.id === conv.id ? LIGHT_BLUE : '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600', color: '#fff', flexShrink: 0 }}>
                        {getOtherPersonName(conv)?.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: activeBooking?.id === conv.id ? BLUE : '#111' }}>{getOtherPersonName(conv)}</div>
                        <div style={{ fontSize: '11px', color: TEXT_MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.subject}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* CHAT WINDOW */}
          <div style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {activeBooking ? (
              <>
                <div style={{ background: BLUE, padding: '1rem 1.25rem' }}>
                  <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>{getOtherPersonName(activeBooking)}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>{activeBooking.subject}</p>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {messages.length === 0 ? (
                    <p style={{ textAlign: 'center', color: TEXT_MUTED, fontSize: '13px', marginTop: '2rem' }}>No messages yet. Say hello!</p>
                  ) : messages.map(msg => (
                    <div key={msg.id} style={{ alignSelf: msg.sender_id === user.id ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                      <div style={{ background: msg.sender_id === user.id ? BLUE : GREY_BG, color: msg.sender_id === user.id ? '#fff' : '#111', padding: '8px 14px', borderRadius: '12px', fontSize: '13px' }}>
                        {msg.content}
                      </div>
                      <div style={{ fontSize: '10px', color: TEXT_MUTED, marginTop: '2px', textAlign: msg.sender_id === user.id ? 'right' : 'left' }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={sendMessage} style={{ padding: '1rem', borderTop: `1px solid ${GREY_LIGHT}`, display: 'flex', gap: '10px' }}>
                  <input
                    style={{ flex: 1, padding: '10px 14px', border: `1px solid ${GREY_LIGHT}`, borderRadius: '20px', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                  />
                  <button type="submit" disabled={sending} style={{ padding: '10px 20px', background: BLUE, color: '#fff', border: 'none', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: TEXT_MUTED }}>
                <div style={{ fontSize: '40px', marginBottom: '1rem' }}>💬</div>
                <p style={{ fontSize: '14px' }}>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>

        {/* Privacy notice */}
        <div style={{ background: LIGHT_BLUE, borderRadius: '10px', padding: '1rem 1.25rem', marginTop: '1.5rem', border: `1px solid ${GREY_LIGHT}` }}>
          <p style={{ fontSize: '12px', color: BLUE }}>
            🔒 For your safety, never share personal contact details (phone, email, address) in messages. All communication and bookings should remain on TeachMe.
          </p>
        </div>
      </div>
    </div>
  )
}