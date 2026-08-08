import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link, useParams } from 'react-router-dom'
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

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 769)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState(null)
  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate) - new Date()
      if (diff <= 0) { setTimeLeft(null); return }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / (1000 * 60)) % 60)
      setTimeLeft({ days, hours, minutes })
    }
    calc()
    const interval = setInterval(calc, 60000)
    return () => clearInterval(interval)
  }, [targetDate])
  return timeLeft
}

function SessionCountdown({ session }) {
  const t = useCountdown(`${session.session_date}T${session.start_time}`)
  if (!t) return <span style={{ fontSize: '11px', color: '#166534', fontWeight: '700', background: '#DCFCE7', padding: '2px 8px', borderRadius: '20px' }}>Starting soon</span>
  if (t.days > 0) return <span style={{ fontSize: '11px', color: TEXT_MUTED }}>in {t.days}d {t.hours}h</span>
  return <span style={{ fontSize: '11px', color: BLUE, fontWeight: '700', background: LIGHT_BLUE, padding: '2px 8px', borderRadius: '20px' }}>in {t.hours}h {t.minutes}m</span>
}

function Section({ title, icon, gradient, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, overflow: 'hidden', boxShadow: SHADOW_LG }}>
      <div style={{ background: gradient || GRADIENT_BLUE, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '18px' }}>{icon}</span>
        <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '700', margin: 0, letterSpacing: '-0.01em' }}>{title}</h3>
      </div>
      <div style={{ padding: '1.5rem' }}>{children}</div>
    </div>
  )
}

export default function TeacherProfile() {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const isMobile = useIsMobile()
  const [teacher, setTeacher] = useState(null)
  const [availability, setAvailability] = useState([])
  const [portfolio, setPortfolio] = useState([])
  const [documents, setDocuments] = useState([])
  const [upcomingSessions, setUpcomingSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  usePageMeta(teacher ? `${teacher.profiles?.full_name} — Teacher Profile` : 'Teacher Profile')

  useEffect(() => { fetchTeacher() }, [id])

  const fetchTeacher = async () => {
    const { data } = await supabase
      .from('teachers')
      .select(`*, profiles (full_name, city, country, avatar_url, created_at), certificates (certificate_name, status, certificate_type), pitch_videos (title, video_url), reviews (rating, comment, created_at, deleted_at, profiles:reviewer_id (full_name))`)
      .eq('id', id).single()
    setTeacher(data)

    const [{ data: avail }, { data: port }, { data: docs }, { data: sessions }] = await Promise.all([
      supabase.from('teacher_availability').select('*').eq('teacher_id', id).order('day_of_week').order('start_time'),
      supabase.from('teacher_portfolio').select('*').eq('teacher_id', id).order('uploaded_at', { ascending: false }),
      supabase.from('teacher_documents').select('*').eq('teacher_id', id).eq('status', 'approved'),
      supabase.from('live_sessions').select('*').eq('teacher_id', id).gte('session_date', new Date().toISOString().split('T')[0]).is('deleted_at', null).order('session_date', { ascending: true }).limit(3),
    ])
    setAvailability(avail || [])
    setPortfolio(port || [])
    setDocuments(docs || [])
    setUpcomingSessions(sessions || [])
    setLoading(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: GREY_BG, fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column' }}>
      {user ? <NavBar /> : <PublicNav />}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: `3px solid ${LIGHT_BLUE}`, borderTop: `3px solid ${BLUE}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ fontSize: '14px', color: TEXT_MUTED }}>Loading profile...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    </div>
  )

  if (!teacher) return (
    <div style={{ minHeight: '100vh', background: GREY_BG, fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column' }}>
      {user ? <NavBar /> : <PublicNav />}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: '52px', marginBottom: '1rem' }}>😕</div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: TEXT, marginBottom: '8px' }}>Teacher not found</h2>
          <p style={{ fontSize: '14px', color: TEXT_MUTED, marginBottom: '1.5rem' }}>This profile may have been removed or the link is incorrect.</p>
          <Link to="/teachers" style={{ padding: '12px 28px', background: GRADIENT_BLUE, color: '#fff', borderRadius: '50px', fontSize: '14px', textDecoration: 'none', fontWeight: '700', boxShadow: SHADOW_BLUE }}>Browse teachers</Link>
        </div>
      </div>
    </div>
  )

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const slotsByDay = days.reduce((acc, day) => { acc[day] = availability.filter(s => s.day_of_week === day); return acc }, {})
  const hasAvailability = availability.length > 0
  const isBackgroundChecked = documents.length > 0
  const visibleReviews = (teacher.reviews || []).filter(r => !r.deleted_at)
  const avgRating = visibleReviews.length > 0 ? (visibleReviews.reduce((sum, r) => sum + r.rating, 0) / visibleReviews.length).toFixed(1) : null
  const teachingCerts = (teacher.certificates || []).filter(c => c.status === 'approved' && c.certificate_type !== 'academic')
  const academicCerts = (teacher.certificates || []).filter(c => c.status === 'approved' && c.certificate_type === 'academic')
  const memberSince = teacher.profiles?.created_at ? new Date(teacher.profiles.created_at) : null
  const isNewTeacher = memberSince && (new Date() - memberSince) < 60 * 24 * 60 * 60 * 1000
  const isTopRated = avgRating && parseFloat(avgRating) >= 4.5 && visibleReviews.length >= 3
  const isVerifiedPro = teacher.is_verified && teachingCerts.length > 0
  const canBook = user && profile?.role !== 'teacher'

  const starBreakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: visibleReviews.filter(r => r.rating === star).length,
    pct: visibleReviews.length > 0 ? Math.round((visibleReviews.filter(r => r.rating === star).length / visibleReviews.length) * 100) : 0
  }))

  const featuredReview = [...visibleReviews].sort((a, b) => b.rating - a.rating)[0]

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareWhatsApp = () => {
    const text = `Check out ${teacher.profiles?.full_name} on TeachMe — a verified teacher offering ${teacher.subjects?.slice(0, 2).join(' and ')} in ${teacher.profiles?.city}. ${window.location.href}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div style={{ minHeight: '100vh', background: GREY_BG, fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column', paddingBottom: isMobile && canBook ? '88px' : 0 }}>
      {user ? <NavBar /> : <PublicNav />}

      <div style={{ background: GRADIENT_HERO, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '240px', height: '240px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '180px', height: '180px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: isMobile ? '2rem 1.25rem' : '2.5rem 2rem', position: 'relative', zIndex: 1 }}>
          <Link to="/teachers" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', marginBottom: '1.5rem', fontWeight: '500', transition: TRANSITION }}>
            ← Back to teachers
          </Link>

          {(isVerifiedPro || isTopRated || isBackgroundChecked || isNewTeacher) && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {isVerifiedPro && <Badge label="Verified Pro" icon="🏅" bg="#DBEAFE" color="#1E40AF" />}
              {isTopRated && <Badge label="Top Rated" icon="⭐" bg="#FEF9C3" color="#854D0E" />}
              {isBackgroundChecked && <Badge label="Background Checked" icon="🛡️" bg="#DCFCE7" color="#166534" />}
              {isNewTeacher && <Badge label="New Teacher" icon="✨" bg="#F3E8FF" color="#6B21A8" />}
            </div>
          )}

          <div style={{ display: 'flex', gap: isMobile ? '1rem' : '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {teacher.profiles?.avatar_url ? (
                <img src={teacher.profiles.avatar_url} alt="" style={{ width: isMobile ? '88px' : '110px', height: isMobile ? '88px' : '110px', borderRadius: '50%', objectFit: 'cover', border: `4px solid ${teacher.is_verified ? '#22C55E' : 'rgba(255,255,255,0.3)'}`, display: 'block' }} />
              ) : (
                <div style={{ width: isMobile ? '88px' : '110px', height: isMobile ? '88px' : '110px', borderRadius: '50%', background: YELLOW, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? '34px' : '44px', fontWeight: '800', color: BLUE, border: `4px solid ${teacher.is_verified ? '#22C55E' : 'rgba(255,255,255,0.3)'}` }}>
                  {teacher.profiles?.full_name?.charAt(0)}
                </div>
              )}
              {teacher.is_verified && (
                <div style={{ position: 'absolute', bottom: '4px', right: '4px', background: '#22C55E', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', border: '3px solid #fff', color: '#fff', fontWeight: '800' }}>✓</div>
              )}
              {teacher.years_experience > 0 && (
                <div style={{ position: 'absolute', top: '-4px', right: '-8px', background: YELLOW, borderRadius: '50px', padding: '3px 8px', fontSize: '10px', fontWeight: '800', color: BLUE, border: '2px solid #fff', whiteSpace: 'nowrap' }}>
                  {teacher.years_experience}yr{teacher.years_experience !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? '24px' : '32px', fontWeight: '700', color: '#fff', margin: '0 0 6px', letterSpacing: '-0.02em', lineHeight: '1.15' }}>
                {teacher.profiles?.full_name}
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: '0 0 10px' }}>
                📍 {teacher.profiles?.city}, {teacher.profiles?.country}
              </p>
              {avgRating && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: '50px', padding: '4px 14px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '15px' }}>⭐</span>
                  <span style={{ fontSize: '15px', fontWeight: '800', color: YELLOW }}>{avgRating}</span>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>({visibleReviews.length} review{visibleReviews.length !== 1 ? 's' : ''})</span>
                </div>
              )}
              {teacher.subjects?.length > 0 && (
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {teacher.subjects.map(s => (
                    <span key={s} style={{ fontSize: '12px', background: YELLOW, color: BLUE, padding: '3px 12px', borderRadius: '50px', fontWeight: '700' }}>{s}</span>
                  ))}
                </div>
              )}
              {teacher.teaching_levels?.length > 0 && (
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  {teacher.teaching_levels.map(level => (
                    <span key={level} style={{ fontSize: '12px', background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', padding: '3px 12px', borderRadius: '50px', fontWeight: '500' }}>{level}</span>
                  ))}
                </div>
              )}
            </div>

            {!isMobile && teacher.hourly_rate > 0 && (
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '700', color: YELLOW, letterSpacing: '-0.02em', lineHeight: 1 }}>GH₵ {teacher.hourly_rate}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px', fontWeight: '500' }}>per hour</div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            {teacher.is_verified && <TrustPill label="Verified teacher" icon="✓" bg="rgba(34,197,94,0.15)" />}
            {isBackgroundChecked && <TrustPill label="Background checked" icon="🛡️" />}
            {teacher.years_experience > 0 && <TrustPill label={`${teacher.years_experience} yrs experience`} icon="🏆" />}
            {teacher.languages?.length > 0 && <TrustPill label={teacher.languages.join(', ')} icon="🗣️" />}
            {memberSince && <TrustPill label={`Member since ${memberSince.getFullYear()}`} icon="📅" />}
            <TrustPill label="Responds within 24hrs" icon="⚡" />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: isMobile ? '1.25rem' : '1.75rem 2rem', flex: 1, width: '100%', boxSizing: 'border-box', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 280px', gap: '1.5rem', alignItems: 'start' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {upcomingSessions.length > 0 && (
            <Section title="Upcoming live sessions" icon="🎥" gradient="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {upcomingSessions.map(session => (
                  <div key={session.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: GREY_BG, borderRadius: '12px', border: BORDER }}>
                    <div style={{ background: GRADIENT_BLUE, borderRadius: '10px', padding: '8px 6px', textAlign: 'center', color: '#fff', minWidth: '44px', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '700', lineHeight: 1 }}>{new Date(session.session_date).getDate()}</div>
                      <div style={{ fontSize: '9px', textTransform: 'uppercase', opacity: 0.8, marginTop: '2px' }}>{new Date(session.session_date).toLocaleString('default', { month: 'short' })}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>{session.title}</div>
                      <div style={{ fontSize: '12px', color: TEXT_MUTED }}>🕐 {session.start_time} – {session.end_time} · {session.max_spots} spots</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                      <SessionCountdown session={session} />
                      {!session.price || session.price <= 0
                        ? <span style={{ fontSize: '11px', fontWeight: '700', color: '#166634' }}>Free</span>
                        : <span style={{ fontSize: '12px', fontWeight: '700', color: BLUE }}>GH₵ {session.price}</span>}
                    </div>
                    <Link to="/sessions" style={{ fontSize: '13px', color: '#fff', fontWeight: '700', background: GRADIENT_BLUE, padding: '8px 14px', borderRadius: '50px', textDecoration: 'none', flexShrink: 0, boxShadow: SHADOW_BLUE }}>
                      Enroll
                    </Link>
                  </div>
                ))}
                <Link to="/sessions" style={{ fontSize: '13px', color: BLUE, fontWeight: '700', textDecoration: 'none', textAlign: 'center', padding: '8px', borderRadius: '8px', background: LIGHT_BLUE, display: 'block' }}>
                  View all sessions →
                </Link>
              </div>
            </Section>
          )}

          {(teacher.bio || teacher.years_experience || teacher.languages?.length > 0) && (
            <Section title="About" icon="✏️">
              {teacher.bio && <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.8', margin: '0 0 16px', letterSpacing: '0.01em' }}>{teacher.bio}</p>}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {teacher.years_experience > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: GREY_BG, borderRadius: '10px', padding: '10px 14px', border: BORDER }}>
                    <span style={{ fontSize: '20px' }}>🏆</span>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: TEXT, letterSpacing: '-0.01em' }}>{teacher.years_experience} yr{teacher.years_experience !== 1 ? 's' : ''}</div>
                      <div style={{ fontSize: '11px', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600' }}>Experience</div>
                    </div>
                  </div>
                )}
                {teacher.languages?.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: GREY_BG, borderRadius: '10px', padding: '10px 14px', border: BORDER }}>
                    <span style={{ fontSize: '20px' }}>🗣️</span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: TEXT }}>{teacher.languages.join(', ')}</div>
                      <div style={{ fontSize: '11px', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600' }}>Languages</div>
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {visibleReviews.length > 0 && (
            <Section title={`Reviews (${visibleReviews.length})`} icon="⭐" gradient="linear-gradient(135deg, #D97706 0%, #B45309 100%)">
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: BORDER, flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '56px', fontWeight: '700', color: TEXT, lineHeight: 1, letterSpacing: '-0.03em' }}>{avgRating}</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', margin: '6px 0 4px' }}>
                    {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: '14px', color: parseFloat(avgRating) >= s ? '#F59E0B' : GREY_LIGHT }}>★</span>)}
                  </div>
                  <div style={{ fontSize: '12px', color: TEXT_MUTED, fontWeight: '500' }}>{visibleReviews.length} review{visibleReviews.length !== 1 ? 's' : ''}</div>
                </div>
                <div style={{ flex: 1, minWidth: '160px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {starBreakdown.map(({ star, count, pct }) => (
                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: TEXT_MUTED, width: '20px', textAlign: 'right', flexShrink: 0, fontWeight: '500' }}>{star}★</span>
                      <div style={{ flex: 1, height: '8px', background: GREY_BG, borderRadius: '50px', overflow: 'hidden', border: BORDER }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct > 50 ? '#F59E0B' : pct > 20 ? '#FCD34D' : '#FEF9C3', borderRadius: '50px', transition: 'width 0.5s ease' }} />
                      </div>
                      <span style={{ fontSize: '12px', color: TEXT_MUTED, width: '24px', flexShrink: 0, fontWeight: '500' }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {featuredReview && (
                <div style={{ background: '#FFFBEB', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem', border: '1px solid #FDE68A' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#854D0E', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>⭐ Featured review</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: TEXT }}>{featuredReview.profiles?.full_name}</span>
                    <div style={{ display: 'flex', gap: '1px' }}>
                      {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: '13px', color: s <= featuredReview.rating ? '#F59E0B' : GREY_LIGHT }}>★</span>)}
                    </div>
                  </div>
                  {featuredReview.comment && <p style={{ fontSize: '14px', color: '#374151', margin: 0, lineHeight: '1.7', fontStyle: 'italic' }}>"{featuredReview.comment}"</p>}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {visibleReviews.filter(r => r.id !== featuredReview?.id).slice(0, 5).map((r, i) => (
                  <div key={i} style={{ padding: '14px', background: GREY_BG, borderRadius: '12px', border: BORDER }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: GRADIENT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>
                          {r.profiles?.full_name?.charAt(0)}
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: TEXT }}>{r.profiles?.full_name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '1px' }}>
                        {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: '12px', color: s <= r.rating ? '#F59E0B' : GREY_LIGHT }}>★</span>)}
                      </div>
                    </div>
                    {r.comment && <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 6px', lineHeight: '1.6' }}>{r.comment}</p>}
                    <div style={{ fontSize: '12px', color: TEXT_MUTED }}>{new Date(r.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {hasAvailability && (
            <Section title="Weekly availability" icon="📅" gradient="linear-gradient(135deg, #0891B2 0%, #0E7490 100%)">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {days.map(day => (
                  <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: slotsByDay[day].length > 0 ? LIGHT_BLUE : GREY_BG, borderRadius: '10px', border: `1px solid ${slotsByDay[day].length > 0 ? 'rgba(37,99,235,0.15)' : GREY_LIGHT}` }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: slotsByDay[day].length > 0 ? BLUE : TEXT_MUTED, width: '72px', flexShrink: 0 }}>{day.slice(0, 3)}</span>
                    {slotsByDay[day].length > 0 ? (
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {slotsByDay[day].map(slot => (
                          <span key={slot.id} style={{ fontSize: '12px', fontWeight: '600', background: '#fff', color: BLUE, padding: '3px 10px', borderRadius: '50px', border: `1px solid ${BLUE}` }}>
                            {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '13px', color: TEXT_MUTED }}>Not available</span>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {teacher.pitch_videos?.length > 0 && (
            <Section title="Teaching pitch videos" icon="🎬">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {teacher.pitch_videos.map((vid, i) => (
                  <div key={i} style={{ borderRadius: '12px', overflow: 'hidden', border: BORDER }}>
                    <video controls style={{ width: '100%', display: 'block', background: '#000', maxHeight: '240px' }} src={vid.video_url} />
                    <div style={{ padding: '10px 14px', fontSize: '14px', fontWeight: '600', color: TEXT, background: GREY_BG }}>{vid.title}</div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {teachingCerts.length > 0 && (
            <Section title="Teaching certificates" icon="📋">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {teachingCerts.map((cert, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: GREY_BG, borderRadius: '12px', border: BORDER }}>
                    <span style={{ fontSize: '22px', flexShrink: 0 }}>📄</span>
                    <div style={{ flex: 1, fontSize: '14px', fontWeight: '600', color: TEXT }}>{cert.certificate_name}</div>
                    <span style={{ fontSize: '11px', background: '#DCFCE7', color: '#166534', padding: '3px 10px', borderRadius: '50px', fontWeight: '700', flexShrink: 0 }}>✓ Verified</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {academicCerts.length > 0 && (
            <Section title="Academic degrees" icon="🎓" gradient="linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {academicCerts.map((cert, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: GREY_BG, borderRadius: '12px', border: BORDER }}>
                    <span style={{ fontSize: '22px', flexShrink: 0 }}>🎓</span>
                    <div style={{ flex: 1, fontSize: '14px', fontWeight: '600', color: TEXT }}>{cert.certificate_name}</div>
                    <span style={{ fontSize: '11px', background: '#F3E8FF', color: '#6B21A8', padding: '3px 10px', borderRadius: '50px', fontWeight: '700', flexShrink: 0 }}>✓ Verified</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {portfolio.length > 0 && (
            <Section title="Teaching portfolio" icon="📁" gradient="linear-gradient(135deg, #EA580C 0%, #C2410C 100%)">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {portfolio.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: GREY_BG, borderRadius: '12px', border: BORDER }}>
                    <span style={{ fontSize: '22px', flexShrink: 0 }}>📄</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                      {item.subject && <div style={{ fontSize: '12px', color: TEXT_MUTED, marginTop: '2px' }}>{item.subject}</div>}
                    </div>
                    <a href={item.file_url} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: BLUE, fontWeight: '700', textDecoration: 'none', flexShrink: 0, background: LIGHT_BLUE, padding: '6px 12px', borderRadius: '50px' }}>View →</a>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {user && <ReportButton reporterId={user.id} targetType="teacher" targetId={teacher.id} />}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: isMobile ? 'static' : 'sticky', top: '80px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, overflow: 'hidden', boxShadow: SHADOW_XL }}>
            <div style={{ background: GRADIENT_BLUE, padding: '1.25rem' }}>
              {teacher.hourly_rate > 0 ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '36px', fontWeight: '700', color: YELLOW, letterSpacing: '-0.02em', lineHeight: 1 }}>GH₵ {teacher.hourly_rate}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', marginTop: '4px', fontWeight: '500' }}>per hour · prices negotiable</div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', fontSize: '15px', fontWeight: '700', color: YELLOW }}>Contact for pricing</div>
              )}
            </div>
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {canBook ? (
                <Link to={`/booking?teacher=${teacher.id}`}
                  style={{ display: 'block', padding: '14px', background: YELLOW, color: BLUE, borderRadius: '50px', fontSize: '15px', textDecoration: 'none', textAlign: 'center', fontWeight: '800', boxShadow: SHADOW_YELLOW, transition: TRANSITION }}>
                  📅 Send booking request
                </Link>
              ) : !user ? (
                <Link to="/login"
                  style={{ display: 'block', padding: '14px', background: GRADIENT_BLUE, color: '#fff', borderRadius: '50px', fontSize: '15px', textDecoration: 'none', textAlign: 'center', fontWeight: '700', boxShadow: SHADOW_BLUE }}>
                  Log in to book
                </Link>
              ) : null}
              <Link to="/sessions"
                style={{ display: 'block', padding: '12px', background: GREY_BG, color: BLUE, borderRadius: '50px', fontSize: '14px', textDecoration: 'none', textAlign: 'center', fontWeight: '700', border: BORDER, transition: TRANSITION }}>
                🎥 View live sessions
              </Link>
            </div>
          </div>

          {upcomingSessions.length === 0 && (
            <div style={{ background: '#fff', borderRadius: '16px', border: BORDER, padding: '1.25rem', textAlign: 'center', boxShadow: SHADOW_LG }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎥</div>
              <p style={{ fontSize: '13px', color: TEXT_MUTED, marginBottom: '10px', lineHeight: '1.6' }}>No upcoming sessions right now — check back soon.</p>
              <Link to="/sessions" style={{ fontSize: '13px', color: BLUE, fontWeight: '700', textDecoration: 'none', background: LIGHT_BLUE, padding: '8px 16px', borderRadius: '50px', display: 'inline-block' }}>Browse all sessions →</Link>
            </div>
          )}

          <div style={{ background: LIGHT_BLUE, borderRadius: '16px', padding: '1.25rem', border: '1px solid rgba(37,99,235,0.12)' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '800', color: BLUE, marginBottom: '10px', marginTop: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>🔒 Privacy guaranteed</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {['Personal contact details never shared', 'All communication stays on TeachMe', 'Payments processed securely'].map((item, i) => (
                <div key={i} style={{ fontSize: '13px', color: BLUE, display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: '700', flexShrink: 0 }}>✓</span> {item}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', border: BORDER, padding: '1.25rem', boxShadow: SHADOW_LG }}>
            <h4 style={{ fontSize: '13px', fontWeight: '800', color: TEXT, marginBottom: '12px', marginTop: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>📤 Share this teacher</h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={shareWhatsApp}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700' }}>
                💬 WhatsApp
              </button>
              <button onClick={copyLink}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: copied ? '#DCFCE7' : GREY_BG, color: copied ? '#166534' : TEXT, border: BORDER, borderRadius: '10px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700', transition: TRANSITION }}>
                {copied ? '✓ Copied' : '🔗 Copy link'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMobile && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: BORDER, padding: '12px 1.25rem', zIndex: 100, boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}>
          {canBook ? (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {teacher.hourly_rate > 0 && (
                <div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '700', color: BLUE, lineHeight: 1 }}>GH₵ {teacher.hourly_rate}</div>
                  <div style={{ fontSize: '10px', color: TEXT_MUTED, fontWeight: '500' }}>per hour</div>
                </div>
              )}
              <Link to={`/booking?teacher=${teacher.id}`} style={{ flex: 1, padding: '14px', background: YELLOW, color: BLUE, borderRadius: '50px', fontSize: '15px', textDecoration: 'none', textAlign: 'center', fontWeight: '800', boxShadow: SHADOW_YELLOW }}>
                📅 Book now
              </Link>
            </div>
          ) : !user ? (
            <Link to="/login" style={{ display: 'block', padding: '14px', background: GRADIENT_BLUE, color: '#fff', borderRadius: '50px', fontSize: '15px', textDecoration: 'none', textAlign: 'center', fontWeight: '700', boxShadow: SHADOW_BLUE }}>
              Log in to book this teacher
            </Link>
          ) : null}
        </div>
      )}

      <Footer />
    </div>
  )
}

function PublicNav() {
  return (
    <nav style={{ background: GRADIENT_HERO, padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
      <Link to="/" style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '700', color: '#fff', textDecoration: 'none', letterSpacing: '-0.02em' }}>
        Teach<span style={{ color: YELLOW }}>Me</span>
      </Link>
      <div style={{ display: 'flex', gap: '8px' }}>
        <Link to="/teachers" style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '50px', fontSize: '13px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>← Teachers</Link>
        <Link to="/login" style={{ padding: '7px 14px', background: YELLOW, color: BLUE, borderRadius: '50px', fontSize: '13px', textDecoration: 'none', fontWeight: '700', boxShadow: SHADOW_YELLOW }}>Log in</Link>
      </div>
    </nav>
  )
}

function Badge({ label, icon, bg, color }) {
  return <span style={{ fontSize: '12px', background: bg, color, padding: '4px 12px', borderRadius: '50px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px', letterSpacing: '0.02em' }}>{icon} {label}</span>
}

function TrustPill({ label, icon, bg }) {
  return (
    <span style={{ fontSize: '12px', background: bg || 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)', padding: '4px 12px', borderRadius: '50px', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
      {icon} {label}
    </span>
  )
}

function ReportButton({ reporterId, targetType, targetId }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const submit = async () => {
    if (!reason.trim() || !reporterId) return
    setSubmitting(true)
    await supabase.from('flags').insert({ reporter_id: reporterId, target_type: targetType, target_id: targetId, reason })
    setDone(true); setSubmitting(false); setOpen(false)
  }
  if (done) return <div style={{ textAlign: 'center', fontSize: '12px', color: TEXT_MUTED, padding: '1rem' }}>✅ Report submitted. Our team will review it.</div>
  return (
    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
      {!open ? (
        <button onClick={() => setOpen(true)} style={{ fontSize: '12px', color: TEXT_MUTED, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Report this profile</button>
      ) : (
        <div style={{ background: '#FFF5F5', border: '1px solid #FECACA', borderRadius: '16px', padding: '1.25rem', textAlign: 'left' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#991B1B', marginBottom: '10px' }}>🚩 Report this profile</div>
          <textarea style={{ width: '100%', padding: '10px 14px', border: BORDER, borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', height: '80px', resize: 'vertical', boxSizing: 'border-box', background: '#fff', color: TEXT }} placeholder="Describe the issue..." value={reason} onChange={e => setReason(e.target.value)} />
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button onClick={submit} disabled={submitting || !reason.trim()} style={{ flex: 1, padding: '10px', background: reason.trim() ? '#EF4444' : GREY_BG, color: reason.trim() ? '#fff' : TEXT_MUTED, border: 'none', borderRadius: '50px', fontSize: '14px', cursor: reason.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit', fontWeight: '700' }}>
              {submitting ? 'Submitting...' : 'Submit report'}
            </button>
            <button onClick={() => setOpen(false)} style={{ padding: '10px 18px', background: '#fff', border: BORDER, borderRadius: '50px', fontSize: '14px', cursor: 'pointer', color: TEXT_MUTED, fontFamily: 'inherit' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}