import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import heroVideo from '../assets/images/hero-video.mp4'
import Footer from '../components/Footer'
import heroImg from '../assets/images/hero.png'
import teacherImg from '../assets/images/teacher.png'
import parentImg from '../assets/images/parent.png'
import learnerImg from '../assets/images/learner.png'
import usePageMeta from '../hooks/usePageMeta'
import {
  BLUE, YELLOW, DARK_BLUE, LIGHT_YELLOW, LIGHT_BLUE,
  GRADIENT_BLUE, GRADIENT_HERO, GRADIENT_YELLOW,
  SHADOW_LG, SHADOW_XL, SHADOW_BLUE, SHADOW_YELLOW,
  TRANSITION, TEXT, TEXT_MUTED,
  GREY_BG, GREY_LIGHT,
} from '../styles/colors'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 769)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0)
  const started = useRef(false)
  useEffect(() => {
    if (!target || started.current) return
    started.current = true
    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target])
  return value
}

export default function Home() {
  usePageMeta('Find Verified Home Tutors', 'Connect with verified, certificate-checked teachers across Ghana for home tuition and live online sessions.')

  const [sessionCount, setSessionCount] = useState(0)
  const [teacherCount, setTeacherCount] = useState(0)
  const isMobile = useIsMobile()
  const animatedTeachers = useCountUp(teacherCount)
  const animatedSessions = useCountUp(sessionCount)

  useEffect(() => {
    const fetchCounts = async () => {
      const today = new Date().toISOString().split('T')[0]
      const [{ count: sessions }, { count: teachers }] = await Promise.all([
        supabase.from('live_sessions').select('*', { count: 'exact', head: true }).gte('session_date', today),
        supabase.from('teachers').select('*', { count: 'exact', head: true }).eq('is_verified', true),
      ])
      setSessionCount(sessions || 0)
      setTeacherCount(teachers || 0)
    }
    fetchCounts()
  }, [])

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', background: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* NAV */}
      <nav style={{
        background: GRADIENT_HERO,
        padding: isMobile ? '0.875rem 1.25rem' : '1rem 2.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? '20px' : '22px', fontWeight: '700', color: '#fff', letterSpacing: '-0.02em' }}>
          Teach<span style={{ color: YELLOW }}>Me</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link to="/login" style={{ padding: isMobile ? '8px 14px' : '9px 20px', background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '50px', fontSize: '13px', textDecoration: 'none', fontWeight: '600', border: '1px solid rgba(255,255,255,0.2)', transition: TRANSITION }}>
            Log in
          </Link>
          <Link to="/register" style={{ padding: isMobile ? '8px 14px' : '9px 20px', background: YELLOW, color: BLUE, borderRadius: '50px', fontSize: '13px', textDecoration: 'none', fontWeight: '700', boxShadow: SHADOW_YELLOW, transition: TRANSITION }}>
            Sign up free
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', minHeight: isMobile ? '100svh' : '680px', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', overflow: 'hidden' }}>
        <video
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: isMobile ? 'linear-gradient(180deg, rgba(26,63,160,0.7) 0%, rgba(15,43,107,0.96) 100%)' : 'linear-gradient(100deg, rgba(15,43,107,0.97) 0%, rgba(26,63,160,0.93) 40%, rgba(37,99,235,0.5) 70%, rgba(37,99,235,0.15) 100%)', zIndex: 1 }} />

        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: isMobile ? '100%' : '700px', padding: isMobile ? '3rem 1.5rem 3.5rem' : '5rem 5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '50px', padding: '5px 14px', marginBottom: '1.5rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: YELLOW, flexShrink: 0, animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '12px', fontWeight: '700', color: YELLOW, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Verified. Trusted. Effective.</span>
          </div>

          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? '36px' : '58px', fontWeight: '700', color: '#fff', lineHeight: '1.1', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
            Find the{' '}
            <span style={{ color: YELLOW, fontStyle: 'italic' }}>right teacher</span>
            {' '}for every learner
          </h1>

          <p style={{ fontSize: isMobile ? '15px' : '17px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.75', marginBottom: '2rem', maxWidth: '520px' }}>
            TeachMe connects verified, certificate-checked teachers with parents and learners across Ghana — for home tuition or live online sessions.
          </p>

          <div style={{ display: 'flex', gap: '10px', flexDirection: isMobile ? 'column' : 'row', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            {[
              { to: '/register?role=teacher', label: 'Join as a teacher', bg: YELLOW, color: BLUE, shadow: SHADOW_YELLOW },
              { to: '/register?role=learner', label: 'Join as a learner', bg: '#fff', color: BLUE, shadow: '0 4px 16px rgba(0,0,0,0.15)' },
              { to: '/register?role=parent', label: 'Join as a parent', bg: 'rgba(255,255,255,0.1)', color: '#fff', shadow: 'none', border: '1px solid rgba(255,255,255,0.3)' },
            ].map(({ to, label, bg, color, shadow, border }) => (
              <Link key={to} to={to} style={{ padding: isMobile ? '13px 20px' : '14px 28px', background: bg, color, borderRadius: '50px', fontSize: isMobile ? '14px' : '15px', textDecoration: 'none', fontWeight: '700', textAlign: 'center', boxShadow: shadow, border: border || 'none', transition: TRANSITION, letterSpacing: '0.01em' }}>
                {label}
              </Link>
            ))}
          </div>

          <div style={{ display: 'flex', gap: isMobile ? '1.5rem' : '3rem', paddingTop: '1.75rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            {[
              [animatedTeachers > 0 ? `${animatedTeachers}+` : '—', 'Verified teachers', null],
              [animatedSessions > 0 ? String(animatedSessions) : '—', 'Upcoming sessions', '/sessions'],
              ['24h', 'Avg. verification', null],
            ].map(([val, label, link]) => {
              const content = (
                <div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? '24px' : '32px', fontWeight: '700', color: YELLOW, lineHeight: 1, letterSpacing: '-0.02em' }}>{val}</div>
                  <div style={{ fontSize: isMobile ? '11px' : '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                </div>
              )
              return link ? <Link key={label} to={link} style={{ textDecoration: 'none' }}>{content}</Link> : <div key={label}>{content}</div>
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: isMobile ? '4rem 1.25rem' : '6rem 2.5rem', background: GREY_BG, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '80px', height: '3px', background: GRADIENT_YELLOW, borderRadius: '0 0 4px 4px' }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '2.5rem' : '4rem' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: BLUE, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>Simple process</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? '28px' : '40px', fontWeight: '700', color: TEXT, marginBottom: '12px', letterSpacing: '-0.02em' }}>How TeachMe works</h2>
            <p style={{ fontSize: isMobile ? '14px' : '16px', color: TEXT_MUTED, maxWidth: '480px', margin: '0 auto', lineHeight: '1.7' }}>From sign-up to first lesson in three simple steps</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '1rem' : '1.5rem' }}>
            {[
              { num: '1', title: 'Create your profile', desc: 'Teachers upload certificates and pitch videos. Parents and learners just need basic details to get started.', icon: '✏️' },
              { num: '2', title: 'We verify teachers', desc: 'Our team checks every certificate within 24–48 hours. Only approved teachers appear in search results.', icon: '🛡️' },
              { num: '3', title: 'Book or enroll', desc: 'Book a teacher for home tuition, or enroll in a live online class — all managed on the platform.', icon: '🎓' },
            ].map(({ num, title, desc, icon }) => (
              <div key={num}
                style={{ background: '#fff', borderRadius: '20px', padding: isMobile ? '1.5rem' : '2rem', border: `1px solid ${GREY_LIGHT}`, boxShadow: SHADOW_LG, display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? '1rem' : '0', alignItems: isMobile ? 'flex-start' : 'flex-start', position: 'relative', overflow: 'hidden', transition: TRANSITION }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = SHADOW_BLUE; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = SHADOW_LG; e.currentTarget.style.borderColor = GREY_LIGHT; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: GRADIENT_BLUE, borderRadius: '20px 20px 0 0' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: isMobile ? 0 : '1.25rem', flexShrink: 0 }}>
                  <div style={{ width: isMobile ? '44px' : '52px', height: isMobile ? '44px' : '52px', borderRadius: '14px', background: LIGHT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? '20px' : '24px', flexShrink: 0 }}>{icon}</div>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: '13px', fontWeight: '700', color: BLUE, background: LIGHT_BLUE, padding: '3px 10px', borderRadius: '20px' }}>Step {num}</span>
                </div>
                <div>
                  <h3 style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: '700', color: TEXT, marginBottom: '8px', letterSpacing: '-0.01em' }}>{title}</h3>
                  <p style={{ fontSize: isMobile ? '13px' : '15px', color: TEXT_MUTED, lineHeight: '1.7', margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: isMobile ? '2rem' : '3rem' }}>
            <Link to="/teachers"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: isMobile ? '13px 28px' : '14px 36px', background: GRADIENT_BLUE, color: '#fff', borderRadius: '50px', fontSize: isMobile ? '14px' : '15px', textDecoration: 'none', fontWeight: '700', boxShadow: SHADOW_BLUE, transition: TRANSITION, letterSpacing: '0.01em' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(37,99,235,0.35)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = SHADOW_BLUE }}
            >
              Browse verified teachers →
            </Link>
          </div>
        </div>
      </section>

      {/* USER TYPES */}
      <section style={{ padding: isMobile ? '4rem 1.25rem' : '6rem 2.5rem', background: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '2.5rem' : '4rem' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: BLUE, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>Who it's for</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? '28px' : '40px', fontWeight: '700', color: TEXT, marginBottom: '12px', letterSpacing: '-0.02em' }}>Built for everyone</h2>
            <p style={{ fontSize: isMobile ? '14px' : '16px', color: TEXT_MUTED, maxWidth: '400px', margin: '0 auto', lineHeight: '1.7' }}>Three distinct experiences, one trusted platform</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '1.25rem' : '1.5rem' }}>
            {[
              { role: 'Teachers', headerBg: GRADIENT_BLUE, headerColor: '#fff', img: teacherImg, desc: 'Build your profile and grow your student base', features: ['Upload certificates for verification', 'Two 30-second pitch videos', 'Schedule live online sessions', 'Receive home tuition bookings'], ctaBg: GRADIENT_BLUE, ctaColor: '#fff' },
              { role: 'Parents', headerBg: `linear-gradient(135deg, #0F172A 0%, #1E293B 100%)`, headerColor: '#fff', img: parentImg, desc: 'Find trusted, verified teachers for your children', features: ['Browse verified profiles', 'Watch teaching preview videos', 'Book home tuition for your ward', 'View teacher credentials and reviews'], ctaBg: `linear-gradient(135deg, #0F172A 0%, #1E293B 100%)`, ctaColor: '#fff' },
              { role: 'Learners', headerBg: GRADIENT_YELLOW, headerColor: BLUE, img: learnerImg, desc: 'Take charge of your own education journey', features: ['Search teachers by subject or level', 'Enroll in live online classes', 'Book private home tuition', 'Watch teacher pitch videos before booking'], ctaBg: GRADIENT_YELLOW, ctaColor: BLUE },
            ].map(({ role, headerBg, headerColor, img, desc, features, ctaBg, ctaColor }) => (
              <div key={role}
                style={{ borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: `1px solid ${GREY_LIGHT}`, boxShadow: SHADOW_LG, transition: TRANSITION }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = SHADOW_XL }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = SHADOW_LG }}
              >
                <div style={{ width: '100%', height: isMobile ? '200px' : '260px', overflow: 'hidden' }}>
                  <img src={img} alt={role} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', display: 'block', transition: 'transform 0.5s ease' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </div>
                <div style={{ background: headerBg, padding: '1.25rem 1.5rem' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: headerColor, margin: 0, letterSpacing: '-0.01em' }}>{role}</h3>
                  <p style={{ fontSize: '13px', color: headerColor, opacity: 0.8, marginTop: '4px', marginBottom: 0, lineHeight: '1.5' }}>{desc}</p>
                </div>
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, margin: 0, padding: 0 }}>
                    {features.map(f => (
                      <li key={f} style={{ fontSize: '14px', color: TEXT_MUTED, display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: LIGHT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: BLUE, fontWeight: '800', flexShrink: 0, marginTop: '1px' }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to={`/register?role=${role.toLowerCase().slice(0, -1)}`}
                    style={{ display: 'block', marginTop: '1.5rem', padding: '12px 20px', background: ctaBg, color: ctaColor, borderRadius: '50px', fontSize: '14px', textDecoration: 'none', fontWeight: '700', textAlign: 'center', transition: TRANSITION, letterSpacing: '0.01em' }}>
                    Sign up as a {role.toLowerCase().slice(0, -1)} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section style={{ background: GREY_BG, padding: isMobile ? '3rem 1.25rem' : '4rem 2.5rem', borderTop: `1px solid ${GREY_LIGHT}`, borderBottom: `1px solid ${GREY_LIGHT}` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {[
              { icon: '🛡️', title: 'Certificate verified', desc: 'Every teacher certificate is manually checked by our team' },
              { icon: '⭐', title: 'Rated by parents', desc: 'Read real reviews before you book any teacher' },
              { icon: '🔒', title: 'Safe & secure', desc: 'Your contact details stay private until you choose to share' },
              { icon: '⚡', title: 'Fast response', desc: 'Teachers typically respond within 24 hours of a request' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'flex-start' : 'center', textAlign: isMobile ? 'left' : 'center', gap: '10px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: LIGHT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: TEXT, marginBottom: '4px', letterSpacing: '-0.01em' }}>{title}</div>
                  <div style={{ fontSize: '13px', color: TEXT_MUTED, lineHeight: '1.6' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ background: GRADIENT_BLUE, padding: isMobile ? '4rem 1.25rem' : '6rem 2.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '280px', height: '280px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: YELLOW, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>Get started today</p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? '28px' : '44px', fontWeight: '700', color: '#fff', marginBottom: '16px', lineHeight: '1.2', letterSpacing: '-0.02em' }}>
            The right teacher is waiting for you
          </h2>
          <p style={{ fontSize: isMobile ? '14px' : '16px', color: 'rgba(255,255,255,0.75)', marginBottom: '2.5rem', lineHeight: '1.7' }}>
            Join thousands of learners across Ghana finding verified, trusted teachers on TeachMe.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register"
              style={{ padding: isMobile ? '13px 28px' : '15px 40px', background: YELLOW, color: BLUE, borderRadius: '50px', fontSize: isMobile ? '14px' : '16px', textDecoration: 'none', fontWeight: '800', boxShadow: SHADOW_YELLOW, transition: TRANSITION, letterSpacing: '0.01em' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(255,215,0,0.45)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = SHADOW_YELLOW }}
            >
              Create a free account →
            </Link>
            <Link to="/teachers"
              style={{ padding: isMobile ? '13px 28px' : '15px 40px', background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '50px', fontSize: isMobile ? '14px' : '16px', textDecoration: 'none', fontWeight: '700', border: '1px solid rgba(255,255,255,0.2)', transition: TRANSITION }}>
              Browse teachers
            </Link>
          </div>
        </div>
      </section>

      <Footer variant="blue" />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }
      `}</style>
    </div>
  )
}