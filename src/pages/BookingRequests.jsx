import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  BLUE, YELLOW, DARK_BLUE, LIGHT_BLUE, GREY_BG, GREY_LIGHT,
  TEXT, TEXT_MUTED, GRADIENT_BLUE, GRADIENT_HERO,
  SHADOW_LG, SHADOW_XL, SHADOW_BLUE, SHADOW_YELLOW,
  TRANSITION, BORDER,
} from '../styles/colors'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import usePageMeta from '../hooks/usePageMeta'

const sendEmail = async (payload) => {
  try { await supabase.functions.invoke('send-booking-email', { body: payload }) }
  catch (err) { console.log('Email error:', err) }
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 769)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

const STATUS = {
  pending:   { bg: '#FEF9C3', color: '#854D0E', label: '⏳ Pending',   border: '#FDE68A' },
  confirmed: { bg: '#DCFCE7', color: '#166534', label: '✅ Confirmed', border: '#BBF7D0' },
  declined:  { bg: '#FEE2E2', color: '#991B1B', label: '✗ Declined',  border: '#FECACA' },
}

export default function BookingRequests() {
  usePageMeta('Booking Requests')

  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [updating, setUpdating] = useState(null)
  const [tab, setTab] = useState('pending')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    if (!user) navigate('/login')
    else if (profile?.role !== 'teacher') navigate('/dashboard')
    else fetchBookings()
  }, [user, profile])

  const fetchBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*, profiles:client_id (full_name, city, country, phone, email, avatar_url)')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false })
    setBookings(data || [])
    setLoading(false)
  }

  const updateStatus = async (bookingId, status) => {
    setUpdating(bookingId)
    try {
      const updateData = { status }
      if (status === 'confirmed') {
        updateData.room_id = 'teachme-' + bookingId.slice(0, 8) + '-' + Date.now()
      }
      const { error } = await supabase.from('bookings').update(updateData).eq('id', bookingId)
      if (error) throw error

      const booking = bookings.find(b => b.id === bookingId)
      await sendEmail({
        type: status === 'confirmed' ? 'booking_confirmed' : 'booking_declined',
        clientEmail: booking.profiles?.email,
        clientName: booking.profiles?.full_name,
        teacherName: profile?.full_name,
        subject: booking.subject,
        amount: booking.amount,
      })
      await supabase.from('notifications').insert({
        user_id: booking.client_id,
        title: status === 'confirmed' ? '🎉 Booking confirmed!' : 'Booking update',
        message: status === 'confirmed'
          ? `${profile?.full_name} has confirmed your ${booking.subject} booking.`
          : `${profile?.full_name} is unable to take your ${booking.subject} booking.`,
        type: status === 'confirmed' ? 'booking_confirmed' : 'booking_declined',
        link: '/booking'
      })
      setMessage(`✅ Booking ${status}.`)
      fetchBookings()
    } catch (err) {
      setMessage('Error: ' + err.message)
    } finally {
      setUpdating(null)
    }
  }

  const pending   = bookings.filter(b => b.status === 'pending')
  const confirmed = bookings.filter(b => b.status === 'confirmed')
  const declined  = bookings.filter(b => b.status === 'declined')
  const responded = bookings.filter(b => b.status !== 'pending')
  const displayed = tab === 'pending' ? pending : responded

  return (
    <div style={{ minHeight: '100vh', background: GREY_BG, fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <NavBar />

      <div style={{ background: GRADIENT_HERO, padding: isMobile ? '2rem 1.25rem' : '2.5rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.3)', color: YELLOW, fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 14px', borderRadius: '50px', marginBottom: '12px' }}>
              📋 Teacher dashboard
            </div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? '26px' : '36px', color: '#fff', marginBottom: '8px', fontWeight: '700', letterSpacing: '-0.02em', lineHeight: '1.15' }}>
              Booking Requests
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: '1.6' }}>
              Review and respond to home tuition requests from parents and learners
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {[
              ['⏳', pending.length, 'Pending'],
              ['✅', confirmed.length, 'Confirmed'],
              ['✗', declined.length, 'Declined'],
            ].map(([icon, count, label]) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)', borderRadius: '14px', padding: isMobile ? '1rem' : '1.25rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.15)' }}>
                <div style={{ fontSize: isMobile ? '20px' : '24px', marginBottom: '6px' }}>{icon}</div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? '26px' : '34px', fontWeight: '700', color: YELLOW, lineHeight: 1 }}>{count}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', marginTop: '5px', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: '600' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: isMobile ? '1.25rem' : '1.75rem 2rem', flex: 1, width: '100%', boxSizing: 'border-box' }}>

        {message && (
          <div style={{ background: message.startsWith('✅') ? '#DCFCE7' : '#FEE2E2', color: message.startsWith('✅') ? '#166534' : '#991B1B', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <span style={{ flex: 1 }}>{message}</span>
            <button onClick={() => setMessage('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'inherit', opacity: 0.6, padding: 0 }}>×</button>
          </div>
        )}

        <div style={{ display: 'flex', gap: '4px', marginBottom: '1.5rem', background: '#fff', padding: '4px', borderRadius: '50px', border: BORDER, width: 'fit-content', boxShadow: SHADOW_LG }}>
          {[
            ['pending', '⏳ Pending', pending.length],
            ['responded', '📋 Responded', responded.length],
          ].map(([key, label, count]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ padding: '9px 22px', border: 'none', borderRadius: '50px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', background: tab === key ? BLUE : 'transparent', color: tab === key ? '#fff' : TEXT_MUTED, fontWeight: tab === key ? '700' : '400', display: 'flex', alignItems: 'center', gap: '7px', boxShadow: tab === key ? SHADOW_BLUE : 'none', transition: TRANSITION }}>
              {label}
              <span style={{ background: tab === key ? 'rgba(255,255,255,0.25)' : GREY_LIGHT, color: tab === key ? '#fff' : TEXT_MUTED, borderRadius: '50px', padding: '1px 8px', fontSize: '11px', fontWeight: '800' }}>{count}</span>
            </button>
          ))}
        </div>

        {tab === 'pending' && pending.length > 0 && (
          <div style={{ background: '#FFFBEB', borderRadius: '14px', padding: '12px 16px', marginBottom: '1.25rem', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>⚡</span>
            <p style={{ fontSize: '13px', color: '#854D0E', margin: 0, fontWeight: '600', lineHeight: '1.6' }}>
              You have <strong>{pending.length}</strong> pending request{pending.length !== 1 ? 's' : ''}. Respond promptly — parents appreciate quick replies.
            </p>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: '#fff', borderRadius: '20px', border: BORDER, padding: '1.5rem', animation: 'pulse 1.5s infinite', display: 'flex', gap: '1rem' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: GREY_BG, flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ height: '16px', background: GREY_BG, borderRadius: '6px', width: '40%' }} />
                  <div style={{ height: '13px', background: GREY_BG, borderRadius: '6px', width: '25%' }} />
                  <div style={{ height: '13px', background: GREY_BG, borderRadius: '6px', width: '75%' }} />
                </div>
                <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, padding: '5rem 2rem', textAlign: 'center', boxShadow: SHADOW_LG }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: LIGHT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', margin: '0 auto 1rem' }}>📭</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: TEXT, marginBottom: '8px', letterSpacing: '-0.01em' }}>No {tab} requests</h3>
            <p style={{ fontSize: '14px', color: TEXT_MUTED, lineHeight: '1.6' }}>
              {tab === 'pending' ? 'New booking requests will appear here when parents and learners reach out.' : 'Accepted and declined requests will appear here.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {displayed.map(booking => {
              const sc = STATUS[booking.status] || STATUS.pending
              const isExpanded = expandedId === booking.id
              const isPending = booking.status === 'pending'
              const isConfirmed = booking.status === 'confirmed'

              return (
                <div key={booking.id}
                  style={{ background: '#fff', borderRadius: '20px', border: `1px solid ${isPending ? '#FDE68A' : GREY_LIGHT}`, overflow: 'hidden', boxShadow: isPending ? '0 4px 16px rgba(255,215,0,0.08)' : SHADOW_LG, transition: TRANSITION }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = isPending ? '0 8px 24px rgba(255,215,0,0.15)' : SHADOW_BLUE; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = isPending ? '0 4px 16px rgba(255,215,0,0.08)' : SHADOW_LG; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  {isPending && (
                    <div style={{ background: '#FFFBEB', padding: '6px 18px', fontSize: '12px', fontWeight: '800', color: '#854D0E', borderBottom: '1px solid #FDE68A' }}>
                      ⏳ Awaiting your response
                    </div>
                  )}
                  {isConfirmed && (
                    <div style={{ background: '#DCFCE7', padding: '6px 18px', fontSize: '12px', fontWeight: '800', color: '#166534', borderBottom: '1px solid #BBF7D0' }}>
                      ✅ Confirmed — session in progress
                    </div>
                  )}

                  <div style={{ padding: '1.25rem 1.5rem', cursor: 'pointer' }} onClick={() => setExpandedId(isExpanded ? null : booking.id)}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      {booking.profiles?.avatar_url ? (
                        <img src={booking.profiles.avatar_url} alt="" style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2px solid ${GREY_LIGHT}` }} />
                      ) : (
                        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: GRADIENT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800', color: '#fff', flexShrink: 0 }}>
                          {booking.profiles?.full_name?.charAt(0)}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                          <div>
                            <h4 style={{ fontSize: '16px', fontWeight: '800', color: TEXT, margin: 0, letterSpacing: '-0.01em' }}>
                              {booking.profiles?.full_name}
                            </h4>
                            <div style={{ fontSize: '13px', color: TEXT_MUTED, marginTop: '2px' }}>
                              📍 {booking.profiles?.city}, {booking.profiles?.country}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: sc.color, background: sc.bg, padding: '4px 12px', borderRadius: '50px', border: `1px solid ${sc.border}` }}>
                              {sc.label}
                            </span>
                            <span style={{ fontSize: '16px', color: TEXT_MUTED, transition: TRANSITION, display: 'inline-block', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>▾</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                          {booking.subject && (
                            <span style={{ fontSize: '12px', background: LIGHT_BLUE, color: BLUE, padding: '3px 11px', borderRadius: '50px', fontWeight: '700' }}>{booking.subject}</span>
                          )}
                          <span style={{ fontSize: '12px', color: TEXT_MUTED }}>
                            📅 {new Date(booking.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          {booking.amount > 0 && (
                            <span style={{ fontSize: '13px', fontWeight: '700', color: BLUE, fontFamily: 'Georgia, serif' }}>GH₵ {booking.amount}</span>
                          )}
                          {booking.payment_status === 'paid' && (
                            <span style={{ fontSize: '12px', background: '#DCFCE7', color: '#166534', padding: '3px 10px', borderRadius: '50px', fontWeight: '700' }}>💳 Paid</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ borderTop: BORDER }}>
                      <div style={{ padding: '1.25rem 1.5rem', borderBottom: BORDER }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>Their message</div>
                        <div style={{ background: GREY_BG, borderRadius: '14px', padding: '1rem 1.25rem', border: BORDER }}>
                          <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.75', margin: 0 }}>
                            {booking.message || <em style={{ color: TEXT_MUTED }}>No message provided.</em>}
                          </p>
                        </div>
                      </div>

                      <div style={{ padding: '1.25rem 1.5rem', borderBottom: isPending || isConfirmed ? BORDER : 'none' }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' }}>Client details</div>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '8px' }}>
                          {[
                            ['📧', 'Email', booking.profiles?.email],
                            ['📱', 'Phone', booking.profiles?.phone],
                            ['📍', 'Location', [booking.profiles?.city, booking.profiles?.country].filter(Boolean).join(', ')],
                            ['📅', 'Requested', new Date(booking.created_at).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })],
                          ].map(([icon, label, value]) => (
                            <div key={label} style={{ background: GREY_BG, borderRadius: '10px', padding: '10px 14px', border: BORDER }}>
                              <div style={{ fontSize: '11px', fontWeight: '700', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{icon} {label}</div>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT }}>{value || '—'}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {isPending && (
                        <div style={{ padding: '1.25rem 1.5rem', background: GREY_BG }}>
                          <div style={{ fontSize: '11px', fontWeight: '800', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px' }}>Respond to request</div>
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button onClick={() => updateStatus(booking.id, 'confirmed')} disabled={updating === booking.id}
                              style={{ flex: 1, padding: '13px 24px', background: '#DCFCE7', color: '#166534', border: '2px solid #BBF7D0', borderRadius: '50px', fontSize: '14px', cursor: updating === booking.id ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: '800', transition: TRANSITION, minWidth: '140px' }}>
                              {updating === booking.id ? '⏳ Updating...' : '✓ Accept booking'}
                            </button>
                            <button onClick={() => updateStatus(booking.id, 'declined')} disabled={updating === booking.id}
                              style={{ flex: 1, padding: '13px 24px', background: '#FEE2E2', color: '#991B1B', border: '2px solid #FECACA', borderRadius: '50px', fontSize: '14px', cursor: updating === booking.id ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: '800', transition: TRANSITION, minWidth: '140px' }}>
                              {updating === booking.id ? '⏳ Updating...' : '✗ Decline'}
                            </button>
                          </div>
                          <p style={{ fontSize: '12px', color: TEXT_MUTED, marginTop: '10px', lineHeight: '1.6' }}>
                            Accepting creates a video call room and notifies the client by email. Payment is collected after acceptance.
                          </p>
                        </div>
                      )}

                      {isConfirmed && (
                        <div style={{ padding: '1.25rem 1.5rem', background: GREY_BG }}>
                          <div style={{ fontSize: '11px', fontWeight: '800', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px' }}>Quick actions</div>
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <Link to={`/messages?booking=${booking.id}`}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '11px 20px', background: '#fff', color: BLUE, border: BORDER, borderRadius: '50px', fontSize: '13px', textDecoration: 'none', fontWeight: '700', transition: TRANSITION }}>
                              💬 Message {booking.profiles?.full_name?.split(' ')[0]}
                            </Link>
                            {booking.room_id && (
                              <Link to={`/call/${booking.room_id}`}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '11px 20px', background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', color: '#fff', borderRadius: '50px', fontSize: '13px', fontWeight: '800', textDecoration: 'none', boxShadow: '0 4px 12px rgba(34,197,94,0.3)' }}>
                                🎥 Join call
                              </Link>
                            )}
                            <Link to="/assignments"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '11px 20px', background: '#fff', color: TEXT_MUTED, border: BORDER, borderRadius: '50px', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>
                              📝 Set assignment
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}