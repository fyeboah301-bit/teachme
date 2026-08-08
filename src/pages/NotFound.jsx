import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  BLUE, YELLOW, DARK_BLUE, LIGHT_BLUE, GREY_BG,
  TEXT, TEXT_MUTED, GRADIENT_BLUE, GRADIENT_HERO,
  SHADOW_LG, SHADOW_BLUE, SHADOW_YELLOW, TRANSITION, BORDER,
} from '../styles/colors'

export default function NotFound() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: GREY_BG, fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* NAV */}
      <nav style={{ background: GRADIENT_HERO, padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link to="/" style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '700', color: '#fff', textDecoration: 'none', letterSpacing: '-0.02em' }}>
          Teach<span style={{ color: YELLOW }}>Me</span>
        </Link>
        {user ? (
          <Link to="/dashboard" style={{ padding: '7px 16px', background: YELLOW, color: BLUE, borderRadius: '50px', fontSize: '13px', textDecoration: 'none', fontWeight: '700', boxShadow: SHADOW_YELLOW }}>
            Dashboard
          </Link>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/login" style={{ padding: '7px 16px', background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '50px', fontSize: '13px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Log in</Link>
            <Link to="/register" style={{ padding: '7px 16px', background: YELLOW, color: BLUE, borderRadius: '50px', fontSize: '13px', textDecoration: 'none', fontWeight: '700', boxShadow: SHADOW_YELLOW }}>Sign up</Link>
          </div>
        )}
      </nav>

      {/* CONTENT */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.25rem' }}>
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>

          {/* 404 DISPLAY */}
          <div style={{ position: 'relative', marginBottom: '2rem' }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '120px', fontWeight: '700', color: LIGHT_BLUE, lineHeight: 1, letterSpacing: '-0.04em', userSelect: 'none' }}>
              404
            </div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80px', height: '80px', borderRadius: '50%', background: GRADIENT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', boxShadow: SHADOW_BLUE }}>
              🔍
            </div>
          </div>

          {/* MESSAGE */}
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: '700', color: TEXT, marginBottom: '12px', letterSpacing: '-0.02em' }}>
            Page not found
          </h1>
          <p style={{ fontSize: '15px', color: TEXT_MUTED, lineHeight: '1.7', marginBottom: '2rem', maxWidth: '360px', margin: '0 auto 2rem' }}>
            The page you're looking for doesn't exist or may have been moved. Let's get you back on track.
          </p>

          {/* ACTIONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '2.5rem' }}>
            <button onClick={() => navigate(-1)}
              style={{ padding: '14px', background: GRADIENT_BLUE, color: '#fff', border: 'none', borderRadius: '50px', fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700', boxShadow: SHADOW_BLUE, transition: TRANSITION, letterSpacing: '0.01em' }}>
              ← Go back
            </button>
            <Link to="/"
              style={{ padding: '13px', background: '#fff', color: TEXT, border: BORDER, borderRadius: '50px', fontSize: '14px', textDecoration: 'none', fontWeight: '600', transition: TRANSITION, display: 'block' }}>
              🏠 Return to home
            </Link>
          </div>

          {/* QUICK LINKS */}
          <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, padding: '1.5rem', boxShadow: SHADOW_LG }}>
            <p style={{ fontSize: '12px', fontWeight: '800', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem' }}>
              Or go somewhere useful
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { to: '/teachers', icon: '👩‍🏫', label: 'Find teachers' },
                { to: '/sessions', icon: '🎥', label: 'Live sessions' },
                { to: '/register', icon: '✏️', label: 'Sign up' },
                { to: '/login',    icon: '🔑', label: 'Log in' },
              ].map(({ to, icon, label }) => (
                <Link key={to} to={to}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: GREY_BG, borderRadius: '12px', border: BORDER, textDecoration: 'none', transition: TRANSITION, color: TEXT }}
                  onMouseEnter={e => { e.currentTarget.style.background = LIGHT_BLUE; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.2)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = GREY_BG; e.currentTarget.style.borderColor = GREY_BG }}>
                  <span style={{ fontSize: '20px' }}>{icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: BLUE }}>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}