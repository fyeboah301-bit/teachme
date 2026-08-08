import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { BLUE, YELLOW, LIGHT_BLUE, GREY_BG, GREY_LIGHT, TEXT_MUTED, DARK_BLUE } from '../styles/colors'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import AnnouncementBanner from '../components/AnnouncementBanner'
import usePageMeta from '../hooks/usePageMeta'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

const lbl = { fontSize: '11px', fontWeight: '700', color: TEXT_MUTED, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }
const inp = { width: '100%', padding: '11px 14px', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#fff', color: '#111' }
const btnPrimary = { padding: '12px 24px', background: BLUE, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700', width: '100%' }
const btnYellow = { padding: '12px 24px', background: YELLOW, color: BLUE, border: 'none', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700', width: '100%' }

function SectionCard({ title, icon, color, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: '1.25rem' }}>
      <div style={{ background: color || `linear-gradient(135deg, ${BLUE} 0%, ${DARK_BLUE} 100%)`, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '700', margin: 0 }}>{title}</h3>
      </div>
      <div style={{ padding: '1.5rem' }}>{children}</div>
    </div>
  )
}

function StatusMessage({ message, onClose }) {
  if (!message) return null
  const isSuccess = message.startsWith('✅')
  return (
    <div style={{ background: isSuccess ? '#DCFCE7' : '#FEE2E2', color: isSuccess ? '#166534' : '#991B1B', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'inherit', opacity: 0.6, padding: 0 }}>×</button>}
    </div>
  )
}

const TEACHER_SECTIONS = [
  { key: 'overview', icon: '📊', label: 'Overview' },
  { key: 'about', icon: '✏️', label: 'About me' },
  { key: 'availability', icon: '📅', label: 'Availability' },
  { key: 'documents', icon: '🪪', label: 'ID & Docs' },
  { key: 'degrees', icon: '🎓', label: 'Degrees' },
  { key: 'certificates', icon: '📋', label: 'Certificates' },
  { key: 'portfolio', icon: '📁', label: 'Portfolio' },
  { key: 'videos', icon: '🎥', label: 'Pitch videos' },
  { key: 'earnings', icon: '💰', label: 'Earnings' },
  { key: 'profile', icon: '👤', label: 'Profile' },
]

export default function Dashboard() {
  usePageMeta('Dashboard')

  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [appStatus, setAppStatus] = useState(null)
  const [activeSection, setActiveSection] = useState('overview')

  useEffect(() => {
    if (profile?.role === 'teacher' && user) {
      supabase.from('teachers').select('application_status, application_notes').eq('id', user.id).single()
        .then(({ data }) => {
          if (data) {
            setAppStatus(data)
            if (data.application_status === 'incomplete') navigate('/apply')
          }
        })
    }
  }, [profile, user])

  const isTeacher = profile?.role === 'teacher'

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <NavBar />

      <div style={{ background: `linear-gradient(135deg, ${BLUE} 0%, ${DARK_BLUE} 100%)`, padding: isMobile ? '1.5rem 1rem' : '2rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <AvatarUpload userId={user?.id} currentUrl={profile?.avatar_url} initial={profile?.full_name?.charAt(0)} onUpdate={refreshProfile} />
            <div>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                {isTeacher ? '🎓 Teacher' : profile?.role === 'parent' ? '👨‍👩‍👧 Parent' : '📚 Learner'}
              </p>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? '20px' : '26px', fontWeight: '700', color: '#fff', margin: 0 }}>
                Welcome back, {profile?.full_name?.split(' ')[0]} 👋
              </h1>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', margin: '4px 0 0' }}>
                {profile?.city && profile?.country ? `📍 ${profile.city}, ${profile.country}` : profile?.email}
              </p>
            </div>
          </div>
          {!isTeacher && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Link to="/teachers" style={{ padding: '9px 16px', background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: '8px', fontSize: '13px', textDecoration: 'none', fontWeight: '600', border: '1px solid rgba(255,255,255,0.3)' }}>
                🔍 Find teachers
              </Link>
              <Link to="/sessions" style={{ padding: '9px 16px', background: YELLOW, color: BLUE, borderRadius: '8px', fontSize: '13px', textDecoration: 'none', fontWeight: '700' }}>
                🎥 Live sessions
              </Link>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '1rem' : '1.5rem 2rem', flex: 1, width: '100%', boxSizing: 'border-box' }}>
        <AnnouncementBanner />

        {isTeacher && appStatus?.application_status === 'pending' && (
          <div style={{ background: '#FFFBEB', borderRadius: '14px', border: '2px solid #FDE68A', padding: '1.25rem 1.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '32px', flexShrink: 0 }}>⏳</span>
            <div>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#92400E', margin: '0 0 4px' }}>Application under review</h3>
              <p style={{ fontSize: '13px', color: '#78350F', margin: 0, lineHeight: '1.6' }}>Your teacher application has been submitted and is being reviewed. We'll notify you within 24–48 hours.</p>
            </div>
          </div>
        )}

        {isTeacher && appStatus?.application_status === 'rejected' && (
          <div style={{ background: '#FFF5F5', borderRadius: '14px', border: '2px solid #FECACA', padding: '1.25rem 1.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <span style={{ fontSize: '32px', flexShrink: 0 }}>❌</span>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#991B1B', margin: '0 0 6px' }}>Application not approved</h3>
              {appStatus.application_notes && (
                <p style={{ fontSize: '13px', color: '#7F1D1D', margin: '0 0 10px', lineHeight: '1.6', background: '#FEE2E2', borderRadius: '8px', padding: '10px 14px' }}>
                  <strong>Reason:</strong> {appStatus.application_notes}
                </p>
              )}
              <button onClick={() => navigate('/apply')} style={{ padding: '10px 22px', background: BLUE, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700' }}>
                Update & resubmit
              </button>
            </div>
          </div>
        )}

        {isTeacher ? (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '220px 1fr', gap: '1.5rem', alignItems: 'start' }}>
            {!isMobile ? (
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', position: 'sticky', top: '1rem' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #E2E8F0', background: GREY_BG }}>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Dashboard</p>
                </div>
                <div style={{ padding: '8px' }}>
                  {TEACHER_SECTIONS.map(({ key, icon, label }) => (
                    <button key={key} onClick={() => setActiveSection(key)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: 'none', borderRadius: '10px', background: activeSection === key ? LIGHT_BLUE : 'transparent', color: activeSection === key ? BLUE : '#374151', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: activeSection === key ? '700' : '400', textAlign: 'left', marginBottom: '2px', transition: 'all 0.15s' }}>
                      <span style={{ fontSize: '16px', flexShrink: 0 }}>{icon}</span>
                      {label}
                      {activeSection === key && <span style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: BLUE, flexShrink: 0 }} />}
                    </button>
                  ))}
                </div>
                <div style={{ padding: '12px', borderTop: '1px solid #E2E8F0' }}>
                  <Link to="/sessions" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: YELLOW, color: BLUE, borderRadius: '10px', fontSize: '13px', textDecoration: 'none', fontWeight: '700' }}>
                    🎥 My live sessions
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '6px', overflowX: 'auto', display: 'flex', gap: '4px', scrollbarWidth: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                {TEACHER_SECTIONS.map(({ key, icon, label }) => (
                  <button key={key} onClick={() => setActiveSection(key)}
                    style={{ padding: '8px 14px', border: 'none', borderRadius: '8px', background: activeSection === key ? BLUE : 'transparent', color: activeSection === key ? '#fff' : TEXT_MUTED, fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: activeSection === key ? '700' : '400', whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>{icon}</span>{label}
                  </button>
                ))}
              </div>
            )}

            <div>
              {activeSection === 'overview' && <TeacherOverview userId={user.id} profile={profile} navigate={navigate} />}
              {activeSection === 'about' && <TeacherBioSection userId={user.id} />}
              {activeSection === 'availability' && <AvailabilitySchedule userId={user.id} />}
              {activeSection === 'documents' && <TeacherDocuments userId={user.id} />}
              {activeSection === 'degrees' && <AcademicUploads userId={user.id} />}
              {activeSection === 'certificates' && <TeacherCertificates userId={user.id} />}
              {activeSection === 'portfolio' && <PortfolioUploads userId={user.id} />}
              {activeSection === 'videos' && <PitchVideos userId={user.id} />}
              {activeSection === 'earnings' && <TeacherEarnings userId={user.id} />}
              {activeSection === 'profile' && <ProfileCard profile={profile} />}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)', gap: '10px', marginBottom: '1.5rem' }}>
              {[
                { label: 'Find Teachers', icon: '🎓', link: '/teachers', color: BLUE },
                { label: 'Live Sessions', icon: '🎥', link: '/sessions', color: '#7C3AED' },
                { label: 'Book Tuition', icon: '📅', link: '/booking', color: '#0891B2' },
                { label: 'Messages', icon: '💬', link: '/messages', color: '#059669' },
                { label: 'Assignments', icon: '📝', link: '/assignments', color: '#D97706' },
                { label: 'Referrals', icon: '🎁', link: '/referrals', color: '#DB2777' },
              ].map(({ label, icon, link, color }) => (
                <Link key={label} to={link} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1rem 0.5rem', textAlign: 'center', textDecoration: 'none', display: 'block', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'all 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'}
                >
                  <div style={{ fontSize: '26px', marginBottom: '6px' }}>{icon}</div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color }}>{label}</div>
                </Link>
              ))}
            </div>
            <LearnerOverview userId={user.id} profile={profile} />
            <ProfileCard profile={profile} />
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

function AvatarUpload({ userId, currentUrl, initial, onUpdate }) {
  const [uploading, setUploading] = useState(false)
  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const fileName = `${userId}/${Date.now()}.${file.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
      await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', userId)
      onUpdate()
    } catch (err) { console.log(err) }
    finally { setUploading(false) }
  }
  return (
    <label style={{ position: 'relative', cursor: 'pointer', flexShrink: 0, display: 'inline-block' }}>
      <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
      {currentUrl ? (
        <img src={currentUrl} alt="Profile" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.3)', display: 'block' }} />
      ) : (
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: YELLOW, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700', color: BLUE, border: '3px solid rgba(255,255,255,0.3)' }}>
          {initial}
        </div>
      )}
      <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', background: BLUE, borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fff', border: '2px solid #fff' }}>
        {uploading ? '…' : '✎'}
      </div>
    </label>
  )
}

function TeacherOverview({ userId, profile, navigate }) {
  const [stats, setStats] = useState({ totalBookings: 0, pendingBookings: 0, totalEarned: 0, pendingPayout: 0, totalStudents: 0, avgRating: null, reviewCount: 0 })
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    const { data: bookings } = await supabase.from('bookings').select('amount, teacher_payout, payout_status, payment_status, status, client_id, subject, created_at').eq('teacher_id', userId)
    const { data: reviews } = await supabase.from('reviews').select('rating').eq('teacher_id', userId)
    const paid = (bookings || []).filter(b => b.payment_status === 'paid')
    const uniqueStudents = new Set((bookings || []).map(b => b.client_id)).size
    const totalEarned = paid.reduce((s, b) => s + (b.teacher_payout || 0), 0)
    const pendingPayout = paid.filter(b => b.payout_status === 'pending').reduce((s, b) => s + (b.teacher_payout || 0), 0)
    const avgRating = reviews?.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null
    setStats({ totalBookings: (bookings || []).length, pendingBookings: (bookings || []).filter(b => b.status === 'pending').length, totalEarned, pendingPayout, totalStudents: uniqueStudents, avgRating, reviewCount: reviews?.length || 0 })
    setRecentBookings((bookings || []).slice(0, 5))
    setLoading(false)
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: TEXT_MUTED }}>Loading...</div>

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '1.25rem' }}>
        {[
          { icon: '📅', label: 'Total bookings', value: stats.totalBookings, sub: `${stats.pendingBookings} pending`, color: BLUE, bg: LIGHT_BLUE },
          { icon: '👥', label: 'Students taught', value: stats.totalStudents, sub: 'unique learners', color: '#7C3AED', bg: '#F5F3FF' },
          { icon: '💰', label: 'Total earned', value: `GH₵ ${stats.totalEarned.toFixed(2)}`, sub: `GH₵ ${stats.pendingPayout.toFixed(2)} pending`, color: '#166534', bg: '#DCFCE7' },
          { icon: '⭐', label: 'Average rating', value: stats.avgRating || '—', sub: `${stats.reviewCount} review${stats.reviewCount !== 1 ? 's' : ''}`, color: '#854D0E', bg: '#FEF9C3' },
        ].map(({ icon, label, value, sub, color, bg }) => (
          <div key={label} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{icon}</div>
              <span style={{ fontSize: '12px', fontWeight: '600', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
            </div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: '700', color, lineHeight: 1, marginBottom: '4px' }}>{value}</div>
            <div style={{ fontSize: '12px', color: TEXT_MUTED }}>{sub}</div>
          </div>
        ))}
      </div>

      <SectionCard title="Quick actions" icon="⚡" color="linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            { label: 'Booking requests', icon: '📋', link: '/booking-requests', color: BLUE },
            { label: 'Live sessions', icon: '🎥', link: '/sessions', color: '#7C3AED' },
            { label: 'Messages', icon: '💬', link: '/messages', color: '#059669' },
            { label: 'Assignments', icon: '📝', link: '/assignments', color: '#D97706' },
          ].map(({ label, icon, link, color }) => (
            <Link key={label} to={link} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: GREY_BG, borderRadius: '10px', border: '1px solid #E2E8F0', textDecoration: 'none', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = color }}
              onMouseLeave={e => { e.currentTarget.style.background = GREY_BG; e.currentTarget.style.borderColor = '#E2E8F0' }}>
              <span style={{ fontSize: '20px' }}>{icon}</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color }}>{label}</span>
            </Link>
          ))}
        </div>
      </SectionCard>

      {recentBookings.length > 0 && (
        <SectionCard title="Recent bookings" icon="📅">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentBookings.map((b, i) => {
              const sc = b.status === 'confirmed' ? { bg: '#DCFCE7', color: '#166534' } : b.status === 'declined' ? { bg: '#FEE2E2', color: '#991B1B' } : { bg: '#FEF9C3', color: '#854D0E' }
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: GREY_BG, borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '2px' }}>{b.subject || 'Tuition session'}</div>
                    <div style={{ fontSize: '12px', color: TEXT_MUTED }}>{new Date(b.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                  {b.teacher_payout > 0 && <div style={{ fontSize: '14px', fontWeight: '700', color: '#166534' }}>GH₵ {b.teacher_payout?.toFixed(2)}</div>}
                  <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '700', background: sc.bg, color: sc.color, textTransform: 'capitalize', flexShrink: 0 }}>{b.status}</span>
                </div>
              )
            })}
          </div>
        </SectionCard>
      )}
    </div>
  )
}

function LearnerOverview({ userId, profile }) {
  const [loading, setLoading] = useState(true)
  const [nextSession, setNextSession] = useState(null)
  const [pendingAssignments, setPendingAssignments] = useState([])
  const [certCount, setCertCount] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const [bookingCount, setBookingCount] = useState(0)

  useEffect(() => { fetchOverview() }, [userId])

  const fetchOverview = async () => {
    const today = new Date().toISOString().split('T')[0]
    const [{ data: enrollments }, { data: assignments }, { count: certs }, { count: unread }, { count: bookings }] = await Promise.all([
      supabase.from('enrollments').select('session_id, live_sessions (id, title, session_date, start_time, teachers (profiles (full_name)))').eq('user_id', userId),
      supabase.from('assignments').select('id, title, subject, due_date').eq('learner_id', userId).order('due_date', { ascending: true }),
      supabase.from('course_certificates').select('*', { count: 'exact', head: true }).eq('learner_id', userId),
      supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('read', false),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('client_id', userId).eq('status', 'confirmed'),
    ])
    const upcoming = (enrollments || []).map(e => e.live_sessions).filter(s => s && s.session_date >= today).sort((a, b) => `${a.session_date}T${a.start_time}`.localeCompare(`${b.session_date}T${b.start_time}`))
    setNextSession(upcoming[0] || null)
    if (assignments?.length > 0) {
      const { data: subs } = await supabase.from('submissions').select('assignment_id').in('assignment_id', assignments.map(a => a.id))
      const submittedIds = new Set((subs || []).map(s => s.assignment_id))
      setPendingAssignments(assignments.filter(a => !submittedIds.has(a.id)).slice(0, 3))
    }
    setCertCount(certs || 0); setUnreadCount(unread || 0); setBookingCount(bookings || 0)
    setLoading(false)
  }

  if (loading) return null

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '1.25rem' }}>
        {[
          { icon: '📅', label: 'Active bookings', value: bookingCount, bg: LIGHT_BLUE, color: BLUE },
          { icon: '🏆', label: 'Certificates', value: certCount, bg: '#F3E8FF', color: '#7C3AED' },
          { icon: '🔔', label: 'Unread alerts', value: unreadCount, bg: '#FEF9C3', color: '#854D0E' },
        ].map(({ icon, label, value, bg, color }) => (
          <div key={label} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '1.25rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', margin: '0 auto 8px' }}>{icon}</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: '700', color, lineHeight: 1, marginBottom: '4px' }}>{value}</div>
            <div style={{ fontSize: '12px', color: TEXT_MUTED, fontWeight: '500' }}>{label}</div>
          </div>
        ))}
      </div>

      <SectionCard title="Next live session" icon="🎥" color="linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)">
        {nextSession ? (
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ background: BLUE, borderRadius: '10px', padding: '10px 8px', textAlign: 'center', color: '#fff', minWidth: '52px', flexShrink: 0 }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '700', lineHeight: 1 }}>{new Date(nextSession.session_date).getDate()}</div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.8, marginTop: '2px' }}>{new Date(nextSession.session_date).toLocaleString('default', { month: 'short' })}</div>
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 4px' }}>{nextSession.title}</h4>
              <div style={{ fontSize: '13px', color: TEXT_MUTED, marginBottom: '10px' }}>👩‍🏫 {nextSession.teachers?.profiles?.full_name} · 🕐 {nextSession.start_time}</div>
              <Link to="/sessions" style={{ fontSize: '13px', color: BLUE, fontWeight: '700', textDecoration: 'none', background: LIGHT_BLUE, padding: '6px 14px', borderRadius: '8px' }}>Join session →</Link>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎥</div>
            <p style={{ fontSize: '14px', color: TEXT_MUTED, marginBottom: '10px' }}>No upcoming sessions enrolled.</p>
            <Link to="/sessions" style={{ fontSize: '13px', color: '#fff', fontWeight: '700', textDecoration: 'none', background: BLUE, padding: '9px 20px', borderRadius: '8px' }}>Browse live sessions →</Link>
          </div>
        )}
      </SectionCard>

      {pendingAssignments.length > 0 && (
        <SectionCard title="Pending assignments" icon="📝" color="linear-gradient(135deg, #D97706 0%, #B45309 100%)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pendingAssignments.map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: '#FFFBEB', borderRadius: '10px', border: '1px solid #FDE68A' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#111' }}>{a.title}</div>
                  <div style={{ fontSize: '12px', color: TEXT_MUTED, marginTop: '2px' }}>{a.subject}{a.due_date ? ` · Due ${new Date(a.due_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}` : ''}</div>
                </div>
                <span style={{ fontSize: '11px', background: '#FEF9C3', color: '#854D0E', padding: '3px 10px', borderRadius: '20px', fontWeight: '700', flexShrink: 0 }}>⏳ Pending</span>
              </div>
            ))}
            <Link to="/assignments" style={{ fontSize: '13px', color: BLUE, fontWeight: '700', textDecoration: 'none' }}>View all assignments →</Link>
          </div>
        </SectionCard>
      )}
    </div>
  )
}

function ProfileCard({ profile }) {
  return (
    <SectionCard title="Your profile" icon="👤">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {[
          ['Full name', profile?.full_name, '🧑'],
          ['Email', profile?.email, '✉️'],
          ['Phone', profile?.phone, '📱'],
          ['Location', [profile?.city, profile?.country].filter(Boolean).join(', ') || '—', '📍'],
        ].map(([label, value, icon]) => (
          <div key={label} style={{ background: GREY_BG, borderRadius: '10px', padding: '12px 14px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>{icon}</span>{label}
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || '—'}</div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

function TeacherEarnings({ userId }) {
  const [earnings, setEarnings] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchEarnings() }, [])

  const fetchEarnings = async () => {
    const { data } = await supabase.from('bookings').select('amount, commission_amount, teacher_payout, payout_status, payment_status, subject, created_at').eq('teacher_id', userId).eq('payment_status', 'paid').order('created_at', { ascending: false })
    const paid = data || []
    setEarnings({
      totalGross: paid.reduce((s, b) => s + (b.amount || 0), 0),
      totalCommission: paid.reduce((s, b) => s + (b.commission_amount || 0), 0),
      totalPayout: paid.reduce((s, b) => s + (b.teacher_payout || 0), 0),
      pendingPayout: paid.filter(b => b.payout_status === 'pending').reduce((s, b) => s + (b.teacher_payout || 0), 0),
    })
    setBookings(paid); setLoading(false)
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem', color: TEXT_MUTED }}>Loading...</div>

  return (
    <div>
      <SectionCard title="Earnings overview" icon="💰" color="linear-gradient(135deg, #166534 0%, #14532D 100%)">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: earnings && bookings.length > 0 ? '1.25rem' : 0 }}>
          {[
            ['Gross earnings', `GH₵ ${(earnings?.totalGross || 0).toFixed(2)}`, '#111', GREY_BG],
            ['Platform fee (12.5%)', `GH₵ ${(earnings?.totalCommission || 0).toFixed(2)}`, '#991B1B', '#FEE2E2'],
            ['Your net payout', `GH₵ ${(earnings?.totalPayout || 0).toFixed(2)}`, '#166534', '#DCFCE7'],
            ['Pending payout', `GH₵ ${(earnings?.pendingPayout || 0).toFixed(2)}`, '#854D0E', '#FEF9C3'],
          ].map(([label, value, color, bg]) => (
            <div key={label} style={{ background: bg, borderRadius: '12px', padding: '14px 16px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{label}</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color, fontFamily: 'Georgia, serif' }}>{value}</div>
            </div>
          ))}
        </div>
        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: TEXT_MUTED, background: GREY_BG, borderRadius: '10px' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>💰</div>
            <p style={{ fontSize: '14px', margin: 0 }}>No paid bookings yet. Earnings will appear here once students pay.</p>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '12px', fontWeight: '700', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Recent transactions</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {bookings.slice(0, 6).map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: GREY_BG, borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>💳</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>{b.subject || 'Tuition'}</div>
                    <div style={{ fontSize: '12px', color: TEXT_MUTED }}>{new Date(b.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#166534' }}>GH₵ {(b.teacher_payout || 0).toFixed(2)}</div>
                    <div style={{ fontSize: '11px', color: TEXT_MUTED }}>of GH₵ {(b.amount || 0).toFixed(2)}</div>
                  </div>
                  <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '700', flexShrink: 0, background: b.payout_status === 'paid' ? '#DCFCE7' : '#FEF9C3', color: b.payout_status === 'paid' ? '#166534' : '#854D0E' }}>
                    {b.payout_status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  )
}

function TeacherBioSection({ userId }) {
  const [bio, setBio] = useState('')
  const [yearsExperience, setYearsExperience] = useState('')
  const [languages, setLanguages] = useState('')
  const [teachingLevels, setTeachingLevels] = useState([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase.from('teachers').select('bio, years_experience, languages, teaching_levels').eq('id', userId).single()
      .then(({ data }) => {
        if (data) { setBio(data.bio || ''); setYearsExperience(data.years_experience || ''); setLanguages((data.languages || []).join(', ')); setTeachingLevels(data.teaching_levels || []) }
      })
  }, [])

  const save = async () => {
    setSaving(true); setMessage('')
    try {
      const { error } = await supabase.from('teachers').update({ bio, years_experience: yearsExperience ? parseInt(yearsExperience) : null, languages: languages ? languages.split(',').map(l => l.trim()).filter(Boolean) : [], teaching_levels: teachingLevels }).eq('id', userId)
      if (error) throw error
      setMessage('✅ Profile updated!')
    } catch (err) { setMessage('Error: ' + err.message) }
    finally { setSaving(false) }
  }

  return (
    <SectionCard title="About me" icon="✏️">
      <StatusMessage message={message} onClose={() => setMessage('')} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={lbl}>Bio</label>
          <textarea style={{ ...inp, height: '110px', resize: 'vertical' }} placeholder="Tell parents and learners about yourself..." value={bio} onChange={e => setBio(e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={lbl}>Years of experience</label>
            <input style={inp} type="number" min="0" max="50" placeholder="e.g. 5" value={yearsExperience} onChange={e => setYearsExperience(e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Languages spoken</label>
            <input style={inp} placeholder="e.g. English, Twi, French" value={languages} onChange={e => setLanguages(e.target.value)} />
          </div>
        </div>
        <div>
          <label style={lbl}>Teaching levels</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', border: '1px solid #E2E8F0', borderRadius: '10px', background: GREY_BG }}>
            {['Primary', 'JHS', 'SHS', 'University', 'Adult Learning'].map(level => {
              const selected = teachingLevels.includes(level)
              return (
                <label key={level} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', cursor: 'pointer', padding: '7px 14px', borderRadius: '20px', background: selected ? BLUE : '#fff', color: selected ? '#fff' : '#374151', border: `1px solid ${selected ? BLUE : '#E2E8F0'}`, fontWeight: selected ? '700' : '400', transition: 'all 0.15s' }}>
                  <input type="checkbox" checked={selected} onChange={e => setTeachingLevels(prev => e.target.checked ? [...prev, level] : prev.filter(l => l !== level))} style={{ display: 'none' }} />
                  {level}
                </label>
              )
            })}
          </div>
        </div>
        <button onClick={save} disabled={saving} style={btnPrimary}>{saving ? 'Saving...' : 'Save changes'}</button>
      </div>
    </SectionCard>
  )
}

function TeacherDocuments({ userId }) {
  const [docs, setDocs] = useState([])
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [docType, setDocType] = useState('National ID')

  const fetchDocs = async () => {
    const { data } = await supabase.from('teacher_documents').select('*').eq('teacher_id', userId).order('uploaded_at', { ascending: false })
    setDocs(data || [])
  }

  useEffect(() => { fetchDocs() }, [])

  const uploadDoc = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true); setMessage('')
    try {
      const fileName = `${userId}/${Date.now()}.${file.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, file)
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName)
      await supabase.from('teacher_documents').insert({ teacher_id: userId, document_type: docType, file_url: urlData.publicUrl, status: 'pending' })
      setMessage('✅ Document uploaded! Our team will review within 24–48 hours.'); fetchDocs()
    } catch (err) { setMessage('Error: ' + err.message) }
    finally { setUploading(false) }
  }

  const statusStyle = (s) => ({ approved: { bg: '#DCFCE7', color: '#166534', label: '✓ Approved' }, declined: { bg: '#FEE2E2', color: '#991B1B', label: '✗ Declined' }, pending: { bg: '#FEF9C3', color: '#854D0E', label: '⏳ Pending' } }[s] || { bg: GREY_BG, color: TEXT_MUTED, label: s })

  return (
    <SectionCard title="ID & Background check" icon="🪪" color="linear-gradient(135deg, #166534 0%, #14532D 100%)">
      <StatusMessage message={message} onClose={() => setMessage('')} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={lbl}>Document type</label>
          <select style={{ ...inp, cursor: 'pointer' }} value={docType} onChange={e => setDocType(e.target.value)}>
            {['National ID', 'Passport', 'Police Clearance', 'Background Check', 'Other'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Upload file (PDF, JPG, PNG)</label>
          <div style={{ border: '2px dashed #E2E8F0', borderRadius: '10px', padding: '1.25rem', textAlign: 'center', background: GREY_BG }}>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={uploadDoc} disabled={uploading} style={{ fontSize: '13px', cursor: 'pointer', color: '#374151' }} />
            <p style={{ fontSize: '12px', color: TEXT_MUTED, marginTop: '6px', marginBottom: 0 }}>PDF, JPG, or PNG — max 10MB</p>
          </div>
        </div>
        {uploading && <div style={{ fontSize: '13px', color: BLUE }}>⏳ Uploading...</div>}
        {docs.length > 0 && (
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
            <p style={lbl}>Uploaded documents</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {docs.map(doc => {
                const sc = statusStyle(doc.status)
                return (
                  <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: GREY_BG, borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '22px' }}>🪪</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>{doc.document_type}</div>
                      <div style={{ fontSize: '11px', color: TEXT_MUTED }}>{new Date(doc.uploaded_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', background: sc.bg, color: sc.color, flexShrink: 0 }}>{sc.label}</span>
                    <a href={doc.file_url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: BLUE, fontWeight: '700', textDecoration: 'none', flexShrink: 0 }}>View →</a>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  )
}

function AcademicUploads({ userId }) {
  const [certFile, setCertFile] = useState(null)
  const [certName, setCertName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [certificates, setCertificates] = useState([])

  const fetchUploads = async () => {
    const { data } = await supabase.from('certificates').select('*').eq('teacher_id', userId).eq('certificate_type', 'academic')
    setCertificates(data || [])
  }

  useEffect(() => { fetchUploads() }, [])

  const upload = async () => {
    if (!certFile || !certName) return setMessage('Please select a file and enter a name.')
    setUploading(true); setMessage('')
    try {
      const fileName = `${userId}/${Date.now()}.${certFile.name.split('.').pop()}`
      const { error } = await supabase.storage.from('certificates').upload(fileName, certFile)
      if (error) throw error
      const { data: urlData } = supabase.storage.from('certificates').getPublicUrl(fileName)
      await supabase.from('certificates').insert({ teacher_id: userId, file_url: urlData.publicUrl, certificate_name: certName, status: 'pending', certificate_type: 'academic' })
      setMessage('✅ Degree uploaded!'); setCertFile(null); setCertName(''); fetchUploads()
    } catch (err) { setMessage('Error: ' + err.message) }
    finally { setUploading(false) }
  }

  return (
    <SectionCard title="Academic degrees" icon="🎓" color="linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)">
      <StatusMessage message={message} onClose={() => setMessage('')} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={lbl}>Degree name</label>
          <input style={inp} placeholder="e.g. BSc Mathematics — University of Ghana" value={certName} onChange={e => setCertName(e.target.value)} />
        </div>
        <div>
          <label style={lbl}>Upload file (PDF, JPG, PNG)</label>
          <div style={{ border: '2px dashed #E2E8F0', borderRadius: '10px', padding: '1.25rem', background: GREY_BG }}>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setCertFile(e.target.files[0])} style={{ fontSize: '13px', cursor: 'pointer', color: '#374151', width: '100%' }} />
            {certFile && <p style={{ fontSize: '12px', color: '#166534', marginTop: '6px', fontWeight: '600', marginBottom: 0 }}>📎 {certFile.name}</p>}
          </div>
        </div>
        <button onClick={upload} disabled={uploading} style={btnPrimary}>{uploading ? 'Uploading...' : 'Upload degree'}</button>
        {certificates.length > 0 && (
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {certificates.map(cert => (
              <div key={cert.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: GREY_BG, borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '22px' }}>🎓</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert.certificate_name}</div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', background: cert.status === 'approved' ? '#F3E8FF' : '#FEF9C3', color: cert.status === 'approved' ? '#7C3AED' : '#854D0E' }}>
                  {cert.status === 'approved' ? '✓ Approved' : '⏳ Pending'}
                </span>
                <a href={cert.file_url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: BLUE, fontWeight: '700', textDecoration: 'none', flexShrink: 0 }}>View →</a>
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  )
}

function TeacherCertificates({ userId }) {
  const [certFile, setCertFile] = useState(null)
  const [certName, setCertName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [certificates, setCertificates] = useState([])

  const fetchUploads = async () => {
    const { data } = await supabase.from('certificates').select('*').eq('teacher_id', userId).eq('certificate_type', 'teaching')
    setCertificates(data || [])
  }

  useEffect(() => { fetchUploads() }, [])

  const upload = async () => {
    if (!certFile || !certName) return setMessage('Please select a file and enter a name.')
    setUploading(true); setMessage('')
    try {
      const fileName = `${userId}/${Date.now()}.${certFile.name.split('.').pop()}`
      const { error } = await supabase.storage.from('certificates').upload(fileName, certFile)
      if (error) throw error
      const { data: urlData } = supabase.storage.from('certificates').getPublicUrl(fileName)
      await supabase.from('certificates').insert({ teacher_id: userId, file_url: urlData.publicUrl, certificate_name: certName, status: 'pending', certificate_type: 'teaching' })
      setMessage('✅ Certificate uploaded!'); setCertFile(null); setCertName(''); fetchUploads()
    } catch (err) { setMessage('Error: ' + err.message) }
    finally { setUploading(false) }
  }

  return (
    <SectionCard title="Teaching certificates" icon="📋">
      <StatusMessage message={message} onClose={() => setMessage('')} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={lbl}>Certificate name</label>
          <input style={inp} placeholder="e.g. PGDE — University of Education, Winneba" value={certName} onChange={e => setCertName(e.target.value)} />
        </div>
        <div>
          <label style={lbl}>Upload file (PDF, JPG, PNG)</label>
          <div style={{ border: '2px dashed #E2E8F0', borderRadius: '10px', padding: '1.25rem', background: GREY_BG }}>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setCertFile(e.target.files[0])} style={{ fontSize: '13px', cursor: 'pointer', color: '#374151', width: '100%' }} />
            {certFile && <p style={{ fontSize: '12px', color: '#166534', marginTop: '6px', fontWeight: '600', marginBottom: 0 }}>📎 {certFile.name}</p>}
          </div>
        </div>
        <button onClick={upload} disabled={uploading} style={btnPrimary}>{uploading ? 'Uploading...' : 'Upload certificate'}</button>
        {certificates.length > 0 && (
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {certificates.map(cert => (
              <div key={cert.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: GREY_BG, borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '22px' }}>📄</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert.certificate_name}</div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', background: cert.status === 'approved' ? '#DCFCE7' : '#FEF9C3', color: cert.status === 'approved' ? '#166534' : '#854D0E' }}>
                  {cert.status === 'approved' ? '✓ Approved' : '⏳ Pending'}
                </span>
                <a href={cert.file_url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: BLUE, fontWeight: '700', textDecoration: 'none', flexShrink: 0 }}>View →</a>
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  )
}

function PortfolioUploads({ userId }) {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [items, setItems] = useState([])

  const fetchItems = async () => {
    const { data } = await supabase.from('teacher_portfolio').select('*').eq('teacher_id', userId).order('uploaded_at', { ascending: false })
    setItems(data || [])
  }

  useEffect(() => { fetchItems() }, [])

  const upload = async () => {
    if (!file || !title) return setMessage('Please select a file and enter a title.')
    setUploading(true); setMessage('')
    try {
      const fileName = `${userId}/portfolio/${Date.now()}.${file.name.split('.').pop()}`
      const { error } = await supabase.storage.from('documents').upload(fileName, file)
      if (error) throw error
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName)
      await supabase.from('teacher_portfolio').insert({ teacher_id: userId, title, subject, file_url: urlData.publicUrl })
      setMessage('✅ Uploaded!'); setFile(null); setTitle(''); setSubject(''); fetchItems()
    } catch (err) { setMessage('Error: ' + err.message) }
    finally { setUploading(false) }
  }

  return (
    <SectionCard title="Teaching portfolio" icon="📁" color="linear-gradient(135deg, #EA580C 0%, #C2410C 100%)">
      <StatusMessage message={message} onClose={() => setMessage('')} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={lbl}>Title</label>
            <input style={inp} placeholder="e.g. Grade 8 Algebra Lesson Plan" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Subject</label>
            <input style={inp} placeholder="e.g. Mathematics" value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
        </div>
        <div>
          <label style={lbl}>Upload file</label>
          <div style={{ border: '2px dashed #E2E8F0', borderRadius: '10px', padding: '1.25rem', background: GREY_BG }}>
            <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files[0])} style={{ fontSize: '13px', cursor: 'pointer', color: '#374151', width: '100%' }} />
            {file && <p style={{ fontSize: '12px', color: '#166534', marginTop: '6px', fontWeight: '600', marginBottom: 0 }}>📎 {file.name}</p>}
          </div>
        </div>
        <button onClick={upload} disabled={uploading} style={btnPrimary}>{uploading ? 'Uploading...' : 'Upload to portfolio'}</button>
        {items.length > 0 && (
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {items.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: GREY_BG, borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '22px' }}>📄</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                  {item.subject && <div style={{ fontSize: '12px', color: TEXT_MUTED }}>{item.subject}</div>}
                </div>
                <a href={item.file_url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: BLUE, fontWeight: '700', textDecoration: 'none', flexShrink: 0 }}>View →</a>
                <button onClick={() => { supabase.from('teacher_portfolio').delete().eq('id', item.id).then(fetchItems) }} style={{ fontSize: '16px', color: '#991B1B', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, opacity: 0.7 }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  )
}

function PitchVideos({ userId }) {
  const [videoFile, setVideoFile] = useState(null)
  const [videoTitle, setVideoTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [videos, setVideos] = useState([])

  const fetchVideos = async () => {
    const { data } = await supabase.from('pitch_videos').select('*').eq('teacher_id', userId)
    setVideos(data || [])
  }

  useEffect(() => { fetchVideos() }, [])

  const upload = async () => {
    if (!videoFile || !videoTitle) return setMessage('Please select a video and enter a title.')
    if (videos.length >= 2) return setMessage('Maximum 2 pitch videos allowed.')
    setUploading(true); setMessage('')
    try {
      const fileName = `${userId}/${Date.now()}.${videoFile.name.split('.').pop()}`
      const { error } = await supabase.storage.from('pitch-videos').upload(fileName, videoFile)
      if (error) throw error
      const { data: urlData } = supabase.storage.from('pitch-videos').getPublicUrl(fileName)
      await supabase.from('pitch_videos').insert({ teacher_id: userId, video_url: urlData.publicUrl, title: videoTitle })
      setMessage('✅ Video uploaded!'); setVideoFile(null); setVideoTitle(''); fetchVideos()
    } catch (err) { setMessage('Error: ' + err.message) }
    finally { setUploading(false) }
  }

  return (
    <SectionCard title="Pitch videos" icon="🎥">
      <StatusMessage message={message} onClose={() => setMessage('')} />
      <div style={{ background: LIGHT_BLUE, borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: BLUE }}>
        💡 Upload up to 2 short videos (30–60 seconds) showing your teaching style.
      </div>
      {videos.length < 2 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={lbl}>Video title</label>
            <input style={inp} placeholder="e.g. My Mathematics teaching approach" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Upload video (MP4, MOV)</label>
            <div style={{ border: '2px dashed #E2E8F0', borderRadius: '10px', padding: '1.25rem', background: GREY_BG }}>
              <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files[0])} style={{ fontSize: '13px', cursor: 'pointer', color: '#374151', width: '100%' }} />
              {videoFile && <p style={{ fontSize: '12px', color: '#166534', marginTop: '6px', fontWeight: '600', marginBottom: 0 }}>🎬 {videoFile.name}</p>}
            </div>
          </div>
          <button onClick={upload} disabled={uploading} style={btnPrimary}>{uploading ? '⏳ Uploading...' : 'Upload video'}</button>
        </div>
      ) : (
        <div style={{ background: '#DCFCE7', borderRadius: '10px', padding: '12px 14px', fontSize: '13px', color: '#166534', fontWeight: '600', marginBottom: '14px' }}>
          ✅ Both pitch videos uploaded.
        </div>
      )}
      {videos.length > 0 && (
        <div style={{ borderTop: videos.length < 2 ? '1px solid #E2E8F0' : 'none', paddingTop: videos.length < 2 ? '14px' : 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {videos.map(vid => (
            <div key={vid.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: GREY_BG, borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '22px' }}>🎬</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vid.title}</div>
              </div>
              <a href={vid.video_url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: BLUE, fontWeight: '700', textDecoration: 'none', flexShrink: 0 }}>Play →</a>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  )
}

function AvailabilitySchedule({ userId }) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const [slots, setSlots] = useState([])
  const [form, setForm] = useState({ day_of_week: 'Monday', start_time: '09:00', end_time: '11:00' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const fetchSlots = async () => {
    const { data } = await supabase.from('teacher_availability').select('*').eq('teacher_id', userId).order('day_of_week').order('start_time')
    setSlots(data || [])
  }

  useEffect(() => { fetchSlots() }, [])

  const addSlot = async () => {
    if (form.start_time >= form.end_time) return setMessage('End time must be after start time.')
    setSaving(true); setMessage('')
    try {
      const { error } = await supabase.from('teacher_availability').insert({ teacher_id: userId, ...form })
      if (error) throw error
      setMessage('✅ Slot added!'); fetchSlots()
    } catch (err) { setMessage('Error: ' + (err.message.includes('unique') ? 'That slot already exists.' : err.message)) }
    finally { setSaving(false) }
  }

  const slotsByDay = days.reduce((acc, day) => { acc[day] = slots.filter(s => s.day_of_week === day); return acc }, {})

  return (
    <SectionCard title="Weekly availability" icon="📅" color="linear-gradient(135deg, #0891B2 0%, #0E7490 100%)">
      <StatusMessage message={message} onClose={() => setMessage('')} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '1.5rem' }}>
        <div>
          <label style={lbl}>Day</label>
          <select style={{ ...inp, cursor: 'pointer' }} value={form.day_of_week} onChange={e => setForm({ ...form, day_of_week: e.target.value })}>
            {days.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={lbl}>Start time</label>
            <input style={inp} type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
          </div>
          <div>
            <label style={lbl}>End time</label>
            <input style={inp} type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} />
          </div>
        </div>
        <button onClick={addSlot} disabled={saving} style={btnPrimary}>{saving ? 'Adding...' : '+ Add availability slot'}</button>
      </div>
      {slots.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1.5rem', background: GREY_BG, borderRadius: '12px', color: TEXT_MUTED, fontSize: '14px' }}>
          No availability set yet. Add slots above to let parents know when you're free.
        </div>
      ) : (
        <div>
          <p style={lbl}>Your schedule</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {days.map(day => (
              <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: slotsByDay[day].length > 0 ? LIGHT_BLUE : GREY_BG, borderRadius: '10px', border: `1px solid ${slotsByDay[day].length > 0 ? '#BFDBFE' : '#E2E8F0'}` }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: slotsByDay[day].length > 0 ? BLUE : TEXT_MUTED, width: '60px', flexShrink: 0 }}>{day.slice(0, 3)}</span>
                {slotsByDay[day].length > 0 ? (
                  <div style={{ display: 'flex', gap: '6px', flex: 1, flexWrap: 'wrap' }}>
                    {slotsByDay[day].map(slot => (
                      <div key={slot.id} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#fff', border: `1px solid ${BLUE}`, color: BLUE, fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px' }}>
                        {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                        <button onClick={() => { supabase.from('teacher_availability').delete().eq('id', slot.id).then(fetchSlots) }} style={{ background: 'none', border: 'none', color: BLUE, cursor: 'pointer', fontSize: '13px', lineHeight: 1, padding: 0, opacity: 0.6 }}>×</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: '13px', color: TEXT_MUTED }}>Not available</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  )
}