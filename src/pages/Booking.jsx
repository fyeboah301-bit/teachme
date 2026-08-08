import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
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

const MESSAGE_TEMPLATES = [
  'My child needs help preparing for BECE exams.',
  'Looking for weekly after-school lessons.',
  'Need urgent help before upcoming exams.',
  'My child is struggling and needs extra support.',
]

const DAYS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 769)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

function BookingConfirmation({ booking, teacher, navigate }) {
  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '2rem 1.25rem' }}>
      <div style={{ background: 'linear-gradient(135deg, #166534 0%, #14532D 100%)', borderRadius: '20px', padding: '2.5rem 2rem', textAlign: 'center', marginBottom: '1.25rem', boxShadow: '0 12px 32px rgba(22,101,52,0.25)' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', margin: '0 auto 1rem' }}>🎉</div>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: '700', color: '#fff', marginBottom: '8px', letterSpacing: '-0.02em' }}>Booking request sent!</h2>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: '1.6' }}>
          Your request has been sent to <strong>{teacher?.profiles?.full_name}</strong>. They'll respond within 24 hours.
        </p>
      </div>

      <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, overflow: 'hidden', marginBottom: '1rem', boxShadow: SHADOW_LG }}>
        <div style={{ background: GRADIENT_BLUE, padding: '1rem 1.5rem' }}>
          <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '700', margin: 0 }}>📋 Booking summary</h3>
        </div>
        <div style={{ padding: '1.25rem 1.5rem' }}>
          {[
            ['Teacher', teacher?.profiles?.full_name],
            ['Subject', booking?.subject],
            ['Sessions', booking?.sessions ? `${booking.sessions} session${booking.sessions > 1 ? 's' : ''}` : '—'],
            ['Estimated total', booking?.amount > 0 ? `GH₵ ${booking.amount}` : 'To be confirmed'],
            ['Status', '⏳ Pending teacher response'],
          ].map(([label, value], i, arr) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i < arr.length - 1 ? BORDER : 'none' }}>
              <span style={{ fontSize: '13px', color: TEXT_MUTED, fontWeight: '500' }}>{label}</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: label === 'Status' ? '#854D0E' : TEXT }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, overflow: 'hidden', marginBottom: '1rem', boxShadow: SHADOW_LG }}>
        <div style={{ background: GRADIENT_BLUE, padding: '1rem 1.5rem' }}>
          <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '700', margin: 0 }}>⏭ What happens next</h3>
        </div>
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { icon: '🔔', step: '1', title: 'Teacher is notified', desc: 'They received your request and will respond soon.' },
            { icon: '✅', step: '2', title: 'They accept or decline', desc: "You'll get a notification and email when they respond." },
            { icon: '💳', step: '3', title: 'Pay to confirm', desc: 'If accepted, a Pay Now button appears to secure your sessions.' },
            { icon: '🎥', step: '4', title: 'Start learning', desc: 'Once paid, message your teacher and join video calls.' },
          ].map(({ icon, step, title, desc }) => (
            <div key={step} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: LIGHT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: TEXT, marginBottom: '3px' }}>{title}</div>
                <div style={{ fontSize: '13px', color: TEXT_MUTED, lineHeight: '1.6' }}>{desc}</div>
              </div>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: GRADIENT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fff', fontWeight: '800', flexShrink: 0 }}>{step}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#FFFBEB', borderRadius: '12px', padding: '12px 16px', marginBottom: '1.25rem', fontSize: '13px', color: '#854D0E', border: '1px solid #FDE68A', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <span style={{ flexShrink: 0 }}>🔒</span>
        Your contact details are never shared until you choose to. All communication stays on TeachMe.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button onClick={() => navigate('/booking')} style={{ padding: '14px', background: YELLOW, color: BLUE, border: 'none', borderRadius: '50px', fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '800', boxShadow: SHADOW_YELLOW, transition: TRANSITION }}>
          📅 View my bookings
        </button>
        <button onClick={() => navigate('/teachers')} style={{ padding: '12px', background: '#fff', color: TEXT_MUTED, border: BORDER, borderRadius: '50px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600' }}>
          🔍 Find another teacher
        </button>
        <button onClick={() => navigate('/sessions')} style={{ padding: '12px', background: '#fff', color: TEXT_MUTED, border: BORDER, borderRadius: '50px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600' }}>
          🎥 Browse live sessions
        </button>
      </div>
    </div>
  )
}

export default function Booking() {
  usePageMeta('Book a Teacher', 'Send a free booking request to a verified teacher. No payment until confirmed.')

  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [searchParams] = useSearchParams()
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [teacherAvailability, setTeacherAvailability] = useState([])
  const [bookings, setBookings] = useState([])
  const [search, setSearch] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [form, setForm] = useState({ subject: '', message: '', sessions: '' })
  const [activeTab, setActiveTab] = useState('new')
  const [confirmation, setConfirmation] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)
  const [templateUsed, setTemplateUsed] = useState(null)

  useEffect(() => {
    if (!user) navigate('/login')
    else { fetchTeachers(); fetchMyBookings() }
  }, [user])

  useEffect(() => {
    const teacherId = searchParams.get('teacher')
    if (teacherId && teachers.length > 0) {
      const t = teachers.find(t => t.id === teacherId)
      if (t) selectTeacher(t)
    }
  }, [teachers, searchParams])

  const fetchTeachers = async () => {
    const { data } = await supabase.from('teachers').select('*, profiles (full_name, city, country, email, avatar_url), reviews (rating), certificates (status)')
    setTeachers(data || [])
    setLoading(false)
  }

  const fetchMyBookings = async () => {
    const { data } = await supabase.from('bookings').select('*, teachers (id, profiles (full_name, avatar_url)), room_id').eq('client_id', user.id).order('created_at', { ascending: false })
    setBookings(data || [])
  }

  const selectTeacher = async (teacher) => {
    setSelectedTeacher(teacher)
    const subjectParam = searchParams.get('subject')
    if (subjectParam) setForm(f => ({ ...f, subject: subjectParam }))
    const { data } = await supabase.from('teacher_availability').select('*').eq('teacher_id', teacher.id).order('day_of_week')
    setTeacherAvailability(data || [])
  }

  const submitBooking = async (e) => {
    e.preventDefault()
    if (!selectedTeacher) return
    setSubmitting(true)
    try {
      const hourlyRate = selectedTeacher.hourly_rate || 0
      const sessions = parseInt(form.sessions || 1)
      const totalAmount = hourlyRate * sessions
      const { error } = await supabase.from('bookings').insert({
        teacher_id: selectedTeacher.id, client_id: user.id,
        subject: form.subject, message: form.message, status: 'pending', amount: totalAmount
      })
      if (error) throw error
      const { data: teacherProfile } = await supabase.from('profiles').select('email, full_name').eq('id', selectedTeacher.id).single()
      await sendEmail({ type: 'new_booking_teacher', teacherEmail: teacherProfile?.email, teacherName: teacherProfile?.full_name || selectedTeacher.profiles?.full_name, clientName: profile?.full_name, subject: form.subject, amount: totalAmount, message: form.message })
      await supabase.from('notifications').insert({ user_id: selectedTeacher.id, title: 'New booking request', message: `${profile?.full_name} has requested ${form.subject} tuition.`, type: 'booking_new', link: '/booking-requests' })
      setConfirmation({ booking: { subject: form.subject, sessions, amount: totalAmount }, teacher: selectedTeacher })
      setSelectedTeacher(null); setTeacherAvailability([]); setForm({ subject: '', message: '', sessions: '' })
      fetchMyBookings()
    } catch (err) { console.log(err) }
    finally { setSubmitting(false) }
  }

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Cancel this booking request?')) return
    setCancellingId(bookingId)
    await supabase.from('bookings').update({ status: 'declined' }).eq('id', bookingId)
    fetchMyBookings(); setCancellingId(null)
  }

  const quickRebook = (booking) => {
    const teacher = teachers.find(t => t.id === booking.teacher_id)
    if (teacher) { selectTeacher(teacher); setForm({ subject: booking.subject || '', message: booking.message || '', sessions: '' }); setActiveTab('new'); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  }

  const allLocations = [...new Set(teachers.map(t => t.profiles?.country).filter(Boolean))].sort()
  const allSubjects = [...new Set(teachers.flatMap(t => t.subjects || []))].sort()

  const filteredTeachers = teachers.filter(teacher => {
    const name = teacher.profiles?.full_name?.toLowerCase() || ''
    const subjects = teacher.subjects || []
    if (search.trim()) { const q = search.toLowerCase(); if (!name.includes(q) && !subjects.join(' ').toLowerCase().includes(q)) return false }
    if (locationFilter && teacher.profiles?.country !== locationFilter) return false
    if (subjectFilter && !subjects.includes(subjectFilter)) return false
    return true
  })

  const availableDays = DAYS_FULL.filter(day => teacherAvailability.some(s => s.day_of_week === day))
  const estimatedTotal = selectedTeacher?.hourly_rate > 0 && form.sessions && parseInt(form.sessions) > 0
    ? selectedTeacher.hourly_rate * parseInt(form.sessions) : null

  const bookingsByTeacher = bookings.reduce((acc, b) => {
    const tid = b.teacher_id
    if (!acc[tid]) acc[tid] = { teacher: b.teachers, bookings: [] }
    acc[tid].bookings.push(b)
    return acc
  }, {})

  const statusStyle = (s) => ({
    confirmed: { bg: '#DCFCE7', color: '#166534' },
    declined: { bg: '#FEE2E2', color: '#991B1B' },
    pending: { bg: '#FEF9C3', color: '#854D0E' },
  }[s] || { bg: GREY_BG, color: TEXT_MUTED })

  if (confirmation) return (
    <div style={{ minHeight: '100vh', background: GREY_BG, fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <div style={{ background: GRADIENT_HERO, padding: isMobile ? '1.5rem 1.25rem' : '2rem 2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? '22px' : '28px', color: '#fff', margin: 0, fontWeight: '700', letterSpacing: '-0.02em' }}>Booking sent ✓</h1>
        </div>
      </div>
      <div style={{ flex: 1 }}><BookingConfirmation booking={confirmation.booking} teacher={confirmation.teacher} navigate={navigate} /></div>
      <Footer />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: GREY_BG, fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <NavBar />

      <div style={{ background: GRADIENT_HERO, padding: isMobile ? '2rem 1.25rem' : '2.5rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: YELLOW, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Home tuition</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? '26px' : '36px', color: '#fff', marginBottom: '8px', fontWeight: '700', letterSpacing: '-0.02em' }}>Book a verified teacher</h1>
          <p style={{ fontSize: isMobile ? '14px' : '15px', color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: '1.6' }}>Send a request — free, secure, no commitment until accepted</p>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '1.25rem' : '1.75rem 2rem', flex: 1, width: '100%', boxSizing: 'border-box' }}>

        <div style={{ display: 'flex', gap: '4px', background: '#fff', padding: '4px', borderRadius: '50px', border: BORDER, marginBottom: '1.75rem', width: 'fit-content', boxShadow: SHADOW_LG }}>
          {[['new', '📅 New booking'], ['history', `📋 My bookings (${bookings.length})`]].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              style={{ padding: '10px 22px', border: 'none', borderRadius: '50px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', background: activeTab === key ? BLUE : 'transparent', color: activeTab === key ? '#fff' : TEXT_MUTED, fontWeight: activeTab === key ? '700' : '400', boxShadow: activeTab === key ? SHADOW_BLUE : 'none', transition: TRANSITION }}>
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'new' && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, overflow: 'hidden', boxShadow: SHADOW_LG }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: BORDER, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: selectedTeacher ? '#DCFCE7' : GRADIENT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: selectedTeacher ? '#166534' : '#fff', flexShrink: 0, transition: TRANSITION }}>
                    {selectedTeacher ? '✓' : '1'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: TEXT, margin: 0, letterSpacing: '-0.01em' }}>Choose a teacher</h3>
                    <p style={{ fontSize: '13px', color: TEXT_MUTED, margin: 0 }}>Search by name, subject, or location</p>
                  </div>
                  {selectedTeacher && <span style={{ fontSize: '12px', color: '#166534', background: '#DCFCE7', padding: '4px 12px', borderRadius: '50px', fontWeight: '700', flexShrink: 0 }}>Selected ✓</span>}
                </div>

                {!selectedTeacher ? (
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', border: BORDER, borderRadius: '50px', background: '#fff', padding: '0 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                        <span style={{ fontSize: '16px', marginRight: '8px' }}>🔍</span>
                        <input style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', fontFamily: 'inherit', padding: '11px 0', color: TEXT, background: 'transparent' }} placeholder="Search teachers..." value={search} onChange={e => setSearch(e.target.value)} />
                        {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', fontSize: '18px', color: TEXT_MUTED, cursor: 'pointer', padding: 0 }}>×</button>}
                      </div>
                      <select style={{ padding: '10px 14px', border: BORDER, borderRadius: '50px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', color: TEXT, cursor: 'pointer', background: '#fff' }} value={locationFilter} onChange={e => setLocationFilter(e.target.value)}>
                        <option value="">All locations</option>
                        {allLocations.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                      <select style={{ padding: '10px 14px', border: BORDER, borderRadius: '50px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', color: TEXT, cursor: 'pointer', background: '#fff' }} value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}>
                        <option value="">All subjects</option>
                        {allSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    {loading ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[1, 2, 3].map(i => <div key={i} style={{ height: '80px', background: GREY_BG, borderRadius: '14px', animation: 'pulse 1.5s infinite' }} />)}
                        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
                      </div>
                    ) : filteredTeachers.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2.5rem', color: TEXT_MUTED }}>
                        <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔍</div>
                        <p style={{ fontSize: '14px', margin: 0 }}>No teachers match your search.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                        {filteredTeachers.map(teacher => {
                          const avg = teacher.reviews?.length > 0 ? (teacher.reviews.reduce((s, r) => s + r.rating, 0) / teacher.reviews.length).toFixed(1) : null
                          const hasCerts = teacher.certificates?.some(c => c.status === 'approved')
                          return (
                            <div key={teacher.id} onClick={() => selectTeacher(teacher)}
                              style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', border: BORDER, borderRadius: '14px', cursor: 'pointer', background: '#fff', transition: TRANSITION, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.background = LIGHT_BLUE; e.currentTarget.style.boxShadow = SHADOW_BLUE }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = GREY_LIGHT; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)' }}>
                              {teacher.profiles?.avatar_url ? (
                                <img src={teacher.profiles.avatar_url} alt="" style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2px solid ${teacher.is_verified ? '#22C55E' : GREY_LIGHT}` }} />
                              ) : (
                                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: GRADIENT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800', color: '#fff', flexShrink: 0 }}>
                                  {teacher.profiles?.full_name?.charAt(0)}
                                </div>
                              )}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '3px' }}>
                                  <span style={{ fontSize: '15px', fontWeight: '700', color: TEXT }}>{teacher.profiles?.full_name}</span>
                                  {teacher.is_verified && <span style={{ fontSize: '10px', background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '50px', fontWeight: '800' }}>✓ Verified</span>}
                                  {hasCerts && <span style={{ fontSize: '10px', background: LIGHT_BLUE, color: BLUE, padding: '2px 8px', borderRadius: '50px', fontWeight: '800' }}>📋 Certified</span>}
                                </div>
                                <div style={{ fontSize: '12px', color: TEXT_MUTED, marginBottom: '6px' }}>📍 {teacher.profiles?.city}, {teacher.profiles?.country}</div>
                                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                  {teacher.subjects?.slice(0, 3).map(s => <span key={s} style={{ fontSize: '11px', background: GREY_BG, color: TEXT_MUTED, padding: '2px 8px', borderRadius: '50px', fontWeight: '500' }}>{s}</span>)}
                                </div>
                              </div>
                              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                {teacher.hourly_rate > 0 && <div style={{ fontFamily: 'Georgia, serif', fontSize: '17px', fontWeight: '700', color: BLUE }}>{`GH₵ ${teacher.hourly_rate}`}</div>}
                                {avg && <div style={{ fontSize: '12px', color: '#854D0E', fontWeight: '700', marginTop: '2px' }}>⭐ {avg}</div>}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ background: LIGHT_BLUE, borderRadius: '16px', padding: '1.25rem', border: `2px solid ${BLUE}`, marginBottom: '12px', boxShadow: SHADOW_BLUE }}>
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: availableDays.length > 0 ? '14px' : 0 }}>
                        {selectedTeacher.profiles?.avatar_url ? (
                          <img src={selectedTeacher.profiles.avatar_url} alt="" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `3px solid ${BLUE}` }} />
                        ) : (
                          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: GRADIENT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', color: '#fff', flexShrink: 0 }}>
                            {selectedTeacher.profiles?.full_name?.charAt(0)}
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                            <span style={{ fontSize: '17px', fontWeight: '800', color: BLUE }}>{selectedTeacher.profiles?.full_name}</span>
                            {selectedTeacher.is_verified && <span style={{ fontSize: '11px', background: '#DCFCE7', color: '#166534', padding: '3px 10px', borderRadius: '50px', fontWeight: '800' }}>✓ Verified</span>}
                          </div>
                          <div style={{ fontSize: '13px', color: TEXT_MUTED, marginBottom: '8px' }}>📍 {selectedTeacher.profiles?.city}, {selectedTeacher.profiles?.country}</div>
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '8px' }}>
                            {selectedTeacher.subjects?.map(s => <span key={s} style={{ fontSize: '12px', background: '#fff', color: BLUE, padding: '3px 10px', borderRadius: '50px', border: `1px solid ${BLUE}`, fontWeight: '600' }}>{s}</span>)}
                          </div>
                          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                            {selectedTeacher.hourly_rate > 0 && <span style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: '700', color: BLUE }}>GH₵ {selectedTeacher.hourly_rate}/hr</span>}
                            {(() => {
                              const avg = selectedTeacher.reviews?.length > 0 ? (selectedTeacher.reviews.reduce((s, r) => s + r.rating, 0) / selectedTeacher.reviews.length).toFixed(1) : null
                              return avg ? <span style={{ fontSize: '13px', color: '#854D0E', fontWeight: '700', background: '#FEF9C3', padding: '3px 10px', borderRadius: '50px' }}>⭐ {avg} ({selectedTeacher.reviews.length})</span> : null
                            })()}
                          </div>
                        </div>
                        <Link to={`/teachers/${selectedTeacher.id}`} style={{ fontSize: '12px', color: BLUE, fontWeight: '700', textDecoration: 'none', background: '#fff', padding: '6px 12px', borderRadius: '50px', flexShrink: 0, border: `1px solid ${BLUE}` }}>View →</Link>
                      </div>
                      {availableDays.length > 0 && (
                        <div style={{ borderTop: 'rgba(37,99,235,0.15) solid 1px', paddingTop: '12px' }}>
                          <div style={{ fontSize: '11px', fontWeight: '800', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>Available days</div>
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                            {DAYS_FULL.map((day, i) => {
                              const avail = availableDays.includes(day)
                              return (
                                <span key={day} style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '50px', fontWeight: '700', background: avail ? '#DCFCE7' : GREY_BG, color: avail ? '#166534' : '#CBD5E1', border: `1px solid ${avail ? '#BBF7D0' : GREY_LIGHT}` }}>
                                  {DAYS_SHORT[i]}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    <button onClick={() => { setSelectedTeacher(null); setTeacherAvailability([]) }} style={{ fontSize: '13px', color: TEXT_MUTED, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontWeight: '500' }}>
                      ← Choose a different teacher
                    </button>
                  </div>
                )}
              </div>

              {selectedTeacher && (
                <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, overflow: 'hidden', boxShadow: SHADOW_LG }}>
                  <div style={{ padding: '1.25rem 1.5rem', borderBottom: BORDER, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: GRADIENT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: '#fff', flexShrink: 0 }}>2</div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: TEXT, margin: 0 }}>Booking details</h3>
                      <p style={{ fontSize: '13px', color: TEXT_MUTED, margin: 0 }}>Tell the teacher what you need</p>
                    </div>
                  </div>
                  <form onSubmit={submitBooking} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={lbl}>Subject(s) needed</label>
                      {selectedTeacher?.subjects?.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '14px', border: BORDER, borderRadius: '14px', background: GREY_BG }}>
                          {selectedTeacher.subjects.map(s => {
                            const selected = form.subject.split(',').map(x => x.trim()).filter(Boolean).includes(s)
                            return (
                              <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', cursor: 'pointer', padding: '8px 16px', borderRadius: '50px', background: selected ? BLUE : '#fff', color: selected ? '#fff' : TEXT, border: `1px solid ${selected ? BLUE : GREY_LIGHT}`, fontWeight: selected ? '700' : '400', transition: TRANSITION, boxShadow: selected ? SHADOW_BLUE : 'none' }}>
                                <input type="checkbox" checked={selected} onChange={e => {
                                  const cur = form.subject.split(',').map(x => x.trim()).filter(Boolean)
                                  setForm({ ...form, subject: (e.target.checked ? [...cur, s] : cur.filter(x => x !== s)).join(', ') })
                                }} style={{ display: 'none' }} />
                                {s}
                              </label>
                            )
                          })}
                        </div>
                      ) : (
                        <input style={inp} placeholder="e.g. Mathematics, Physics" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
                      )}
                    </div>

                    <div>
                      <label style={lbl}>Number of sessions</label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {[1, 2, 4, 8, 12].map(n => (
                          <button key={n} type="button" onClick={() => setForm({ ...form, sessions: String(n) })}
                            style={{ padding: '10px 18px', border: `2px solid ${form.sessions === String(n) ? BLUE : GREY_LIGHT}`, borderRadius: '50px', background: form.sessions === String(n) ? LIGHT_BLUE : '#fff', color: form.sessions === String(n) ? BLUE : TEXT_MUTED, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: form.sessions === String(n) ? '700' : '400', transition: TRANSITION, boxShadow: form.sessions === String(n) ? SHADOW_BLUE : 'none' }}>
                            {n} {n === 1 ? 'session' : 'sessions'}
                          </button>
                        ))}
                        <input type="number" min="1" max="50" placeholder="Other" value={![1, 2, 4, 8, 12].includes(parseInt(form.sessions)) ? form.sessions : ''} onChange={e => setForm({ ...form, sessions: e.target.value })}
                          style={{ ...inp, width: '80px', textAlign: 'center' }} />
                      </div>
                    </div>

                    <div>
                      <label style={lbl}>Message to teacher</label>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        {MESSAGE_TEMPLATES.map((t, i) => (
                          <button key={i} type="button" onClick={() => { setForm({ ...form, message: t }); setTemplateUsed(i) }}
                            style={{ fontSize: '11px', padding: '5px 13px', borderRadius: '50px', border: `1px solid ${templateUsed === i ? BLUE : GREY_LIGHT}`, background: templateUsed === i ? LIGHT_BLUE : '#fff', color: templateUsed === i ? BLUE : TEXT_MUTED, cursor: 'pointer', fontFamily: 'inherit', fontWeight: templateUsed === i ? '700' : '400', transition: TRANSITION }}>
                            {t.slice(0, 26)}…
                          </button>
                        ))}
                      </div>
                      <textarea style={{ ...inp, height: '110px', resize: 'vertical' }} placeholder="Introduce yourself. What subject level? What are your goals?" value={form.message} onChange={e => { setForm({ ...form, message: e.target.value }); setTemplateUsed(null) }} required />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', background: '#FFFBEB', borderRadius: '14px', border: '1px solid #FDE68A' }}>
                      <span style={{ fontSize: '22px', flexShrink: 0 }}>⚡</span>
                      <p style={{ fontSize: '13px', color: '#854D0E', margin: 0, lineHeight: '1.6' }}>
                        Teachers typically respond within <strong>24 hours</strong>. You'll get a notification when they do.
                      </p>
                    </div>

                    <button type="submit" disabled={submitting || !form.subject || !form.sessions || !form.message}
                      style={{ padding: '15px', background: submitting || !form.subject || !form.sessions || !form.message ? GREY_BG : YELLOW, color: submitting || !form.subject || !form.sessions || !form.message ? TEXT_MUTED : BLUE, border: 'none', borderRadius: '50px', fontSize: '16px', cursor: submitting || !form.subject || !form.sessions || !form.message ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: '800', transition: TRANSITION, boxShadow: !submitting && form.subject && form.sessions && form.message ? SHADOW_YELLOW : 'none' }}>
                      {submitting ? '⏳ Sending...' : '📅 Send booking request'}
                    </button>
                  </form>
                </div>
              )}

              {!selectedTeacher && (
                <div style={{ background: '#fff', borderRadius: '20px', border: `2px dashed ${GREY_LIGHT}`, padding: '4rem 2rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '52px', marginBottom: '14px' }}>👆</div>
                  <h3 style={{ fontSize: '17px', fontWeight: '700', color: TEXT, margin: '0 0 8px' }}>Select a teacher above to continue</h3>
                  <p style={{ fontSize: '14px', color: TEXT_MUTED, margin: 0 }}>
                    Or <Link to="/teachers" style={{ color: BLUE, fontWeight: '700', textDecoration: 'none' }}>browse all teachers</Link> to find the right match
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: isMobile ? 'static' : 'sticky', top: '80px' }}>
              <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, overflow: 'hidden', boxShadow: SHADOW_XL }}>
                <div style={{ background: GRADIENT_BLUE, padding: '1.25rem' }}>
                  <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '700', margin: 0 }}>💰 Booking summary</h3>
                </div>
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {selectedTeacher ? (
                    <>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingBottom: '14px', borderBottom: BORDER }}>
                        {selectedTeacher.profiles?.avatar_url ? (
                          <img src={selectedTeacher.profiles.avatar_url} alt="" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2px solid ${BLUE}` }} />
                        ) : (
                          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: GRADIENT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', color: '#fff', flexShrink: 0 }}>{selectedTeacher.profiles?.full_name?.charAt(0)}</div>
                        )}
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: TEXT }}>{selectedTeacher.profiles?.full_name}</div>
                          <div style={{ fontSize: '12px', color: TEXT_MUTED }}>{selectedTeacher.profiles?.city}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                          ['Rate per session', selectedTeacher.hourly_rate > 0 ? `GH₵ ${selectedTeacher.hourly_rate}` : 'TBC'],
                          ['Sessions', form.sessions || '—'],
                          ...(form.subject ? [['Subject', form.subject]] : []),
                        ].map(([label, value]) => (
                          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                            <span style={{ fontSize: '13px', color: TEXT_MUTED }}>{label}</span>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: TEXT, textAlign: 'right', maxWidth: '140px' }}>{value}</span>
                          </div>
                        ))}
                      </div>
                      {estimatedTotal && (
                        <div style={{ background: GRADIENT_BLUE, borderRadius: '14px', padding: '1.25rem', textAlign: 'center', boxShadow: SHADOW_BLUE }}>
                          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: '600' }}>Estimated total</div>
                          <div style={{ fontFamily: 'Georgia, serif', fontSize: '36px', fontWeight: '700', color: YELLOW, letterSpacing: '-0.02em', lineHeight: 1 }}>GH₵ {estimatedTotal}</div>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '6px' }}>Only paid after teacher confirms</div>
                        </div>
                      )}
                      <div style={{ fontSize: '12px', color: TEXT_MUTED, textAlign: 'center', lineHeight: '1.7', background: GREY_BG, borderRadius: '10px', padding: '10px' }}>
                        🔒 No payment until the teacher accepts. Cancel anytime before payment.
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: TEXT_MUTED }}>
                      <div style={{ fontSize: '36px', marginBottom: '10px' }}>📋</div>
                      <p style={{ fontSize: '13px', margin: 0, lineHeight: '1.6' }}>Select a teacher to see your booking summary</p>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, padding: '1.25rem', boxShadow: SHADOW_LG }}>
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: TEXT, marginBottom: '14px', marginTop: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Why book through TeachMe?</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    ['🏅', 'All teachers verified', 'Certificates manually checked'],
                    ['🔒', 'Your details are safe', 'Never shared without consent'],
                    ['💳', 'Pay only when confirmed', 'No upfront payment required'],
                    ['⭐', 'Rated by real parents', 'Read reviews before booking'],
                  ].map(([icon, title, desc]) => (
                    <div key={title} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: LIGHT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{icon}</div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: TEXT }}>{title}</div>
                        <div style={{ fontSize: '12px', color: TEXT_MUTED, marginTop: '2px' }}>{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {bookings.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, padding: '5rem 2rem', textAlign: 'center', boxShadow: SHADOW_LG }}>
                <div style={{ fontSize: '52px', marginBottom: '1rem' }}>📭</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: TEXT, marginBottom: '8px' }}>No bookings yet</h3>
                <p style={{ fontSize: '14px', color: TEXT_MUTED, marginBottom: '1.5rem', lineHeight: '1.6' }}>Send your first booking request to a verified teacher</p>
                <button onClick={() => setActiveTab('new')}
                  style={{ padding: '12px 28px', background: YELLOW, color: BLUE, border: 'none', borderRadius: '50px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '800', boxShadow: SHADOW_YELLOW }}>
                  Make your first booking
                </button>
              </div>
            ) : (
              Object.values(bookingsByTeacher).map(({ teacher, bookings: tBookings }) => (
                <div key={teacher?.id} style={{ background: '#fff', borderRadius: '20px', border: BORDER, overflow: 'hidden', boxShadow: SHADOW_LG }}>
                  <div style={{ padding: '1rem 1.5rem', background: GREY_BG, borderBottom: BORDER, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {teacher?.profiles?.avatar_url ? (
                      <img src={teacher.profiles.avatar_url} alt="" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2px solid ${BLUE}` }} />
                    ) : (
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: GRADIENT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', fontWeight: '800', color: '#fff', flexShrink: 0 }}>{teacher?.profiles?.full_name?.charAt(0)}</div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: TEXT }}>{teacher?.profiles?.full_name}</div>
                      <div style={{ fontSize: '12px', color: TEXT_MUTED }}>{tBookings.length} booking{tBookings.length !== 1 ? 's' : ''}</div>
                    </div>
                    <button onClick={() => quickRebook(tBookings[0])}
                      style={{ padding: '8px 18px', background: YELLOW, color: BLUE, border: 'none', borderRadius: '50px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '800', boxShadow: SHADOW_YELLOW, transition: TRANSITION }}>
                      ↩ Book again
                    </button>
                  </div>
                  {tBookings.map((booking, idx) => {
                    const sc = statusStyle(booking.status)
                    return (
                      <div key={booking.id} style={{ padding: '1.25rem 1.5rem', borderBottom: idx < tBookings.length - 1 ? BORDER : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '12px' }}>
                          <div>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: TEXT }}>{booking.subject}</div>
                            <div style={{ fontSize: '12px', color: TEXT_MUTED, marginTop: '3px' }}>{new Date(booking.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                          </div>
                          <span style={{ fontSize: '12px', background: sc.bg, color: sc.color, padding: '4px 14px', borderRadius: '50px', textTransform: 'capitalize', fontWeight: '800', flexShrink: 0 }}>{booking.status}</span>
                        </div>
                        {booking.message && (
                          <p style={{ fontSize: '13px', color: TEXT_MUTED, margin: '0 0 12px', lineHeight: '1.6', background: GREY_BG, borderRadius: '10px', padding: '10px 14px' }}>
                            {booking.message.slice(0, 140)}{booking.message.length > 140 ? '…' : ''}
                          </p>
                        )}
                        {booking.amount > 0 && (
                          <div style={{ fontSize: '15px', fontWeight: '700', color: BLUE, marginBottom: '12px', fontFamily: 'Georgia, serif' }}>
                            GH₵ {booking.amount}
                            {booking.payment_status === 'paid' && <span style={{ fontSize: '13px', color: '#166534', marginLeft: '8px', fontFamily: 'DM Sans, sans-serif', fontWeight: '700' }}>✅ Paid</span>}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {booking.status === 'confirmed' && booking.payment_status !== 'paid' && booking.amount > 0 && (
                            <PayButton booking={booking} userEmail={user.email} onSuccess={fetchMyBookings} />
                          )}
                          {booking.status === 'confirmed' && booking.room_id && (
                            <Link to={`/call/${booking.room_id}`} style={{ fontSize: '13px', fontWeight: '700', color: '#fff', background: '#16A34A', padding: '9px 18px', borderRadius: '50px', textDecoration: 'none' }}>🎥 Join call</Link>
                          )}
                          {booking.status === 'confirmed' && (
                            <Link to={`/messages?booking=${booking.id}`} style={{ fontSize: '13px', color: BLUE, fontWeight: '700', padding: '9px 18px', border: BORDER, borderRadius: '50px', textDecoration: 'none', background: '#fff' }}>💬 Message</Link>
                          )}
                          {booking.status === 'pending' && (
                            <button onClick={() => cancelBooking(booking.id)} disabled={cancellingId === booking.id}
                              style={{ fontSize: '13px', color: '#991B1B', background: '#FEE2E2', border: '1px solid #FECACA', padding: '9px 18px', borderRadius: '50px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700' }}>
                              {cancellingId === booking.id ? 'Cancelling...' : 'Cancel request'}
                            </button>
                          )}
                        </div>
                        {booking.status === 'confirmed' && booking.payment_status === 'paid' && (
                          <ReviewSection booking={booking} userId={user.id} onSuccess={fetchMyBookings} />
                        )}
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

const lbl = { fontSize: '11px', fontWeight: '800', color: TEXT_MUTED, display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.07em' }
const inp = { width: '100%', padding: '12px 16px', border: BORDER, borderRadius: '12px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', background: '#fff', color: TEXT, boxSizing: 'border-box', transition: TRANSITION }

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
      callback: (response) => confirmPayment(response.reference),
      onClose: () => setLoading(false),
    })
    handler.openIframe()
  }
  const confirmPayment = async (reference) => {
    try {
      const commissionRate = 0.125
      const commissionAmount = Math.round(booking.amount * commissionRate * 100) / 100
      const teacherPayout = Math.round(booking.amount * (1 - commissionRate) * 100) / 100
      await supabase.from('payments').insert({ booking_id: booking.id, payer_id: booking.client_id, amount: booking.amount, commission_amount: commissionAmount, teacher_payout: teacherPayout, reference, status: 'success' })
      await supabase.from('bookings').update({ payment_status: 'paid', commission_rate: commissionRate, commission_amount: commissionAmount, teacher_payout: teacherPayout, payout_status: 'pending' }).eq('id', booking.id)
      onSuccess()
    } catch (err) { console.log(err) }
    finally { setLoading(false) }
  }
  return (
    <button onClick={handlePay} disabled={loading}
      style={{ fontSize: '13px', fontWeight: '800', color: '#fff', background: '#16A34A', border: 'none', padding: '9px 18px', borderRadius: '50px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(22,163,74,0.3)', transition: TRANSITION }}>
      {loading ? '⏳ Processing...' : '💳 Pay Now'}
    </button>
  )
}

function ReviewSection({ booking, userId, onSuccess }) {
  const [existingReview, setExistingReview] = useState(null)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    supabase.from('reviews').select('*').eq('booking_id', booking.id).maybeSingle()
      .then(({ data }) => { setExistingReview(data); setLoading(false) })
  }, [booking.id])

  const submitReview = async () => {
    if (rating === 0) return
    setSubmitting(true)
    try {
      await supabase.from('reviews').insert({ booking_id: booking.id, teacher_id: booking.teacher_id, reviewer_id: userId, rating, comment })
      setExistingReview({ rating, comment }); onSuccess()
    } catch (err) { console.log(err) }
    finally { setSubmitting(false) }
  }

  if (loading) return null
  if (existingReview) return (
    <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: BORDER }}>
      <div style={{ fontSize: '12px', color: TEXT_MUTED, marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your review</div>
      <div style={{ display: 'flex', gap: '2px', marginBottom: '4px' }}>
        {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: '18px', color: s <= existingReview.rating ? '#F59E0B' : GREY_LIGHT }}>★</span>)}
      </div>
      {existingReview.comment && <p style={{ fontSize: '13px', color: TEXT_MUTED, margin: 0, lineHeight: '1.6' }}>{existingReview.comment}</p>}
    </div>
  )

  return (
    <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: BORDER }}>
      <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: TEXT }}>Rate your experience</div>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
        {[1, 2, 3, 4, 5].map(n => (
          <span key={n} onClick={() => setRating(n)} onMouseEnter={() => setHoverRating(n)} onMouseLeave={() => setHoverRating(0)}
            style={{ fontSize: '32px', cursor: 'pointer', color: n <= (hoverRating || rating) ? '#F59E0B' : GREY_LIGHT, transition: 'color 0.1s' }}>★</span>
        ))}
      </div>
      <textarea style={{ ...inp, height: '75px', resize: 'vertical', marginBottom: '10px' }} placeholder="Leave a comment (optional)..." value={comment} onChange={e => setComment(e.target.value)} />
      <button onClick={submitReview} disabled={rating === 0 || submitting}
        style={{ width: '100%', padding: '11px', background: rating === 0 ? GREY_BG : GRADIENT_BLUE, color: rating === 0 ? TEXT_MUTED : '#fff', border: 'none', borderRadius: '50px', fontSize: '14px', cursor: rating === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: '700', boxShadow: rating > 0 ? SHADOW_BLUE : 'none', transition: TRANSITION }}>
        {submitting ? 'Submitting...' : 'Submit review'}
      </button>
    </div>
  )
}