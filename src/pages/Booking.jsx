import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BLUE, YELLOW, LIGHT_BLUE, GREY_BG, GREY_LIGHT, TEXT_MUTED } from '../styles/colors'

export default function Booking() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [bookings, setBookings] = useState([])
 const [form, setForm] = useState({ subject: '', message: '', sessions: '' })

  useEffect(() => {
    if (!user) navigate('/login')
    else { fetchTeachers(); fetchMyBookings() }
  }, [user])

  const fetchTeachers = async () => {
    const { data } = await supabase.from('teachers').select('*, profiles (full_name, city, country)')
    setTeachers(data || [])
    setLoading(false)
  }

  const fetchMyBookings = async () => {
    const { data } = await supabase.from('bookings').select('*, teachers (id, profiles (full_name))').eq('client_id', user.id).order('created_at', { ascending: false })
    setBookings(data || [])
  }

  const submitBooking = async (e) => {
  e.preventDefault()
  if (!selectedTeacher) return setMessage('Please select a teacher.')
  setSubmitting(true)
  setMessage('')
  try {
    const hourlyRate = selectedTeacher.hourly_rate || 0
    const totalAmount = hourlyRate * parseInt(form.sessions || 1)
    const { error } = await supabase.from('bookings').insert({
      teacher_id: selectedTeacher.id, client_id: user.id, subject: form.subject, message: form.message, status: 'pending', amount: totalAmount
    })
    if (error) throw error
    setMessage('✅ Booking request sent! The teacher will respond shortly.')
    setSelectedTeacher(null)
    setForm({ subject: '', message: '', sessions: '' })
    fetchMyBookings()
  } catch (err) {
    setMessage('Error: ' + err.message)
  } finally {
    setSubmitting(false)
  }
}

  const statusColor = (status) => {
    if (status === 'confirmed') return { bg: '#E8F5E9', color: '#2E7D32' }
    if (status === 'declined') return { bg: LIGHT_BLUE, color: BLUE }
    return { bg: '#FFF8E1', color: '#795500' }
  }

  return (
    <div style={{ minHeight: '100vh', background: GREY_BG, fontFamily: 'DM Sans, sans-serif' }}>

      {/* NAV */}
      <nav style={{ background: BLUE, padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '700', color: '#fff', textDecoration: 'none' }}>
          Teach<span style={{ color: YELLOW }}>Me</span>
        </Link>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/teachers" style={{ padding: '8px 18px', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', borderRadius: '5px', fontSize: '13px', textDecoration: 'none' }}>Find teachers</Link>
          <Link to="/dashboard" style={{ padding: '8px 18px', background: YELLOW, color: BLUE, borderRadius: '5px', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>Dashboard</Link>
        </div>
      </nav>

      {/* HEADER */}
      <div style={{ background: BLUE, padding: '2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: '#fff', marginBottom: '6px' }}>Book Home Tuition</h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>Send a booking request to a verified teacher</p>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        {message && (
          <div style={{ background: message.startsWith('✅') ? '#E8F5E9' : LIGHT_BLUE, color: message.startsWith('✅') ? '#2E7D32' : BLUE, padding: '12px 16px', borderRadius: '8px', fontSize: '13px', marginBottom: '1.5rem' }}>
            {message}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* BOOKING FORM */}
          <div style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, overflow: 'hidden' }}>
            <div style={{ background: BLUE, padding: '1rem 1.5rem' }}>
              <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '500' }}>New booking request</h3>
            </div>
            <form onSubmit={submitBooking} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={lbl}>Select a teacher</label>
                {loading ? (
                  <p style={{ fontSize: '13px', color: TEXT_MUTED }}>Loading teachers...</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                    {teachers.map(teacher => (
                      <div key={teacher.id} onClick={() => setSelectedTeacher(teacher)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: `2px solid ${selectedTeacher?.id === teacher.id ? BLUE : GREY_LIGHT}`, borderRadius: '7px', cursor: 'pointer', background: selectedTeacher?.id === teacher.id ? LIGHT_BLUE : '#fff' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600', color: '#fff', flexShrink: 0 }}>
                          {teacher.profiles?.full_name?.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: selectedTeacher?.id === teacher.id ? BLUE : '#111' }}>{teacher.profiles?.full_name}</div>
                          <div style={{ fontSize: '12px', color: TEXT_MUTED }}>📍 {teacher.profiles?.city}, {teacher.profiles?.country}</div>
                        </div>
                        {teacher.subjects && (
                          <div style={{ marginLeft: 'auto', fontSize: '11px', color: TEXT_MUTED }}>{teacher.subjects.slice(0, 2).join(', ')}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label style={lbl}>Subject needed</label>
                <input style={inp} placeholder="e.g. Mathematics, Physics" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
              </div>
              <div>
                <label style={lbl}>Message to teacher</label>
                <textarea style={{ ...inp, height: '100px', resize: 'vertical' }} placeholder="Introduce yourself and describe what you need..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
              </div>
              <div>
                <label style={lbl}>Number of sessions</label>
                <input style={inp} type="number" min="1" placeholder="e.g. 4" value={form.sessions || ''} onChange={e => setForm({ ...form, sessions: e.target.value })} required />
                </div>
              <button type="submit" disabled={submitting} style={{ padding: '11px', background: BLUE, color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>
                {submitting ? 'Sending...' : 'Send booking request'}
              </button>
            </form>
          </div>

          {/* MY BOOKINGS */}
          <div style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, overflow: 'hidden' }}>
            <div style={{ background: BLUE, padding: '1rem 1.5rem' }}>
              <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '500' }}>My booking requests</h3>
            </div>
            <div style={{ padding: '1.25rem' }}>
              {bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: TEXT_MUTED }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
                  <p style={{ fontSize: '13px' }}>No bookings yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {bookings.map(booking => {
  const sc = statusColor(booking.status)
  return (
    <div key={booking.id} style={{ padding: '12px', border: `1px solid ${GREY_LIGHT}`, borderRadius: '7px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ fontSize: '14px', fontWeight: '500' }}>{booking.subject}</div>
        <span style={{ fontSize: '11px', background: sc.bg, color: sc.color, padding: '3px 10px', borderRadius: '20px', textTransform: 'capitalize' }}>{booking.status}</span>
      </div>
      <div style={{ fontSize: '12px', color: TEXT_MUTED }}>{booking.message?.slice(0, 80)}...</div>
      <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>{new Date(booking.created_at).toLocaleDateString()}</div>
      {booking.amount > 0 && (
        <div style={{ fontSize: '13px', fontWeight: '600', color: BLUE, marginTop: '6px' }}>
          GH₵ {booking.amount} {booking.payment_status === 'paid' ? '✅ Paid' : ''}
        </div>
      )}
      {booking.status === 'confirmed' && booking.payment_status !== 'paid' && booking.amount > 0 && (
        <PayButton booking={booking} userEmail={user.email} onSuccess={fetchMyBookings} />
      )}
      {booking.status === 'confirmed' && (
  <Link to={`/messages?booking=${booking.id}`} style={{ display: 'inline-block', marginTop: '8px', marginLeft: '8px', fontSize: '12px', color: BLUE }}>
    💬 Message teacher
  </Link>
)}
{booking.status === 'confirmed' && booking.payment_status === 'paid' && (
  <ReviewSection booking={booking} userId={user.id} onSuccess={fetchMyBookings} />
)}
    </div>
  )
})}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const lbl = { fontSize: '11px', fontWeight: '500', color: TEXT_MUTED, display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }
const inp = { width: '100%', padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit', outline: 'none' }
function PayButton({ booking, userEmail, onSuccess }) {
  const [loading, setLoading] = useState(false)

  const handlePay = () => {
    setLoading(true)
    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: userEmail,
      amount: booking.amount * 100,
      currency: 'GHS',
      ref: 'TM-' + Date.now() + '-' + booking.id.slice(0, 8),
      callback: function (response) {
        confirmPayment(response.reference)
      },
      onClose: function () {
        setLoading(false)
      }
    })
    handler.openIframe()
  }

  const confirmPayment = async (reference) => {
    try {
      await supabase.from('payments').insert({
        booking_id: booking.id,
        payer_id: booking.client_id,
        amount: booking.amount,
        reference: reference,
        status: 'success'
      })
      await supabase.from('bookings').update({ payment_status: 'paid' }).eq('id', booking.id)
      onSuccess()
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handlePay} disabled={loading} style={{ marginTop: '8px', padding: '8px 18px', background: '#2E7D32', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>
      {loading ? 'Processing...' : '💳 Pay Now'}
    </button>
  )
}

function ReviewSection({ booking, userId, onSuccess }) {
  const [existingReview, setExistingReview] = useState(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const checkReview = async () => {
      const { data } = await supabase.from('reviews').select('*').eq('booking_id', booking.id).maybeSingle()
      setExistingReview(data)
      setLoading(false)
    }
    checkReview()
  }, [booking.id])

  const submitReview = async () => {
    if (rating === 0) return
    setSubmitting(true)
    try {
      const { error } = await supabase.from('reviews').insert({
        booking_id: booking.id,
        teacher_id: booking.teacher_id,
        reviewer_id: userId,
        rating,
        comment
      })
      if (error) throw error
      setExistingReview({ rating, comment })
      onSuccess()
    } catch (err) {
      console.log(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return null

  if (existingReview) {
    return (
      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${GREY_LIGHT}` }}>
        <div style={{ fontSize: '11px', color: TEXT_MUTED, marginBottom: '4px' }}>Your review</div>
        <div style={{ fontSize: '14px' }}>{'⭐'.repeat(existingReview.rating)}{'☆'.repeat(5 - existingReview.rating)}</div>
        {existingReview.comment && <p style={{ fontSize: '12px', color: '#444', marginTop: '4px' }}>{existingReview.comment}</p>}
      </div>
    )
  }

  return (
    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${GREY_LIGHT}` }}>
      <div style={{ fontSize: '12px', fontWeight: '500', marginBottom: '6px' }}>Rate your experience</div>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
        {[1, 2, 3, 4, 5].map(n => (
          <span key={n} onClick={() => setRating(n)} style={{ fontSize: '22px', cursor: 'pointer', color: n <= rating ? '#FFD700' : '#E0E0E0' }}>★</span>
        ))}
      </div>
      <textarea
        style={{ width: '100%', padding: '8px 10px', border: `1px solid ${GREY_LIGHT}`, borderRadius: '6px', fontSize: '12px', fontFamily: 'inherit', outline: 'none', height: '60px', resize: 'vertical', marginBottom: '8px' }}
        placeholder="Leave a comment (optional)..."
        value={comment}
        onChange={e => setComment(e.target.value)}
      />
      <button onClick={submitReview} disabled={rating === 0 || submitting} style={{ padding: '8px 18px', background: rating === 0 ? '#ccc' : BLUE, color: '#fff', border: 'none', borderRadius: '5px', fontSize: '12px', cursor: rating === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>
        {submitting ? 'Submitting...' : 'Submit review'}
      </button>
    </div>
  )
}