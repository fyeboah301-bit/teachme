import { Link } from 'react-router-dom'
import {
  BLUE, YELLOW, DARK_BLUE, LIGHT_BLUE, GREY_BG, GREY_LIGHT,
  TEXT_MUTED, GRADIENT_BLUE, GRADIENT_HERO, SHADOW_YELLOW, TRANSITION, BORDER,
} from '../styles/colors'

export default function Footer({ variant = 'light' }) {
  const isDark = variant === 'blue' || variant === 'dark'
  const year = new Date().getFullYear()

  if (isDark) {
    return (
      <footer style={{ background: GRADIENT_HERO, borderTop: '1px solid rgba(255,255,255,0.08)', fontFamily: 'DM Sans, sans-serif' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem 2rem' }}>

          {/* TOP ROW */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>

            {/* BRAND */}
            <div style={{ maxWidth: '280px' }}>
              <Link to="/" style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '700', color: '#fff', textDecoration: 'none', letterSpacing: '-0.02em', display: 'block', marginBottom: '10px' }}>
                Teach<span style={{ color: YELLOW }}>Me</span>
              </Link>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: '1.7', margin: '0 0 16px' }}>
                Ghana's trusted platform for verified home tutors and live online education.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { icon: '🛡️', label: 'Verified teachers' },
                  { icon: '🔒', label: 'Safe & secure' },
                ].map(({ icon, label }) => (
                  <div key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '50px', padding: '4px 10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ fontSize: '12px' }}>{icon}</span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* LINKS */}
            <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
              {[
                {
                  heading: 'Platform',
                  links: [
                    { label: 'Find teachers', to: '/teachers' },
                    { label: 'Live sessions', to: '/sessions' },
                    { label: 'Book tuition', to: '/booking' },
                    { label: 'Verify certificate', to: '/verify' },
                  ]
                },
                {
                  heading: 'Join us',
                  links: [
                    { label: 'Teach on TeachMe', to: '/register?role=teacher' },
                    { label: 'Sign up as parent', to: '/register?role=parent' },
                    { label: 'Sign up as learner', to: '/register?role=learner' },
                    { label: 'Log in', to: '/login' },
                  ]
                },
              ].map(({ heading, links }) => (
                <div key={heading}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>{heading}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {links.map(({ label, to }) => (
                      <Link key={label} to={to} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontWeight: '500', transition: TRANSITION }}
                        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}>
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DIVIDER */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', marginBottom: '1.5rem' }} />

          {/* BOTTOM ROW */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0, fontWeight: '500' }}>
              © {year} TeachMe Ghana. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: '20px' }}>
              {['Privacy', 'Terms', 'Contact'].map(label => (
                <span key={label} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', fontWeight: '500', transition: TRANSITION }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    )
  }

  // LIGHT VARIANT (default)
  return (
    <footer style={{ background: '#fff', borderTop: BORDER, fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem 2rem' }}>

        {/* TOP ROW */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>

          {/* BRAND */}
          <div style={{ maxWidth: '280px' }}>
            <Link to="/" style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '700', color: BLUE, textDecoration: 'none', letterSpacing: '-0.02em', display: 'block', marginBottom: '10px' }}>
              Teach<span style={{ color: YELLOW }}>Me</span>
            </Link>
            <p style={{ fontSize: '13px', color: TEXT_MUTED, lineHeight: '1.7', margin: '0 0 16px' }}>
              Ghana's trusted platform for verified home tutors and live online education.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { icon: '🛡️', label: 'Verified teachers' },
                { icon: '🔒', label: 'Safe & secure' },
              ].map(({ icon, label }) => (
                <div key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: LIGHT_BLUE, borderRadius: '50px', padding: '4px 10px', border: '1px solid rgba(37,99,235,0.12)' }}>
                  <span style={{ fontSize: '12px' }}>{icon}</span>
                  <span style={{ fontSize: '11px', color: BLUE, fontWeight: '700' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* LINKS */}
          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
            {[
              {
                heading: 'Platform',
                links: [
                  { label: 'Find teachers', to: '/teachers' },
                  { label: 'Live sessions', to: '/sessions' },
                  { label: 'Book tuition', to: '/booking' },
                  { label: 'Verify certificate', to: '/verify' },
                ]
              },
              {
                heading: 'Join us',
                links: [
                  { label: 'Teach on TeachMe', to: '/register?role=teacher' },
                  { label: 'Sign up as parent', to: '/register?role=parent' },
                  { label: 'Sign up as learner', to: '/register?role=learner' },
                  { label: 'Log in', to: '/login' },
                ]
              },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>{heading}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {links.map(({ label, to }) => (
                    <Link key={label} to={to} style={{ fontSize: '13px', color: TEXT_MUTED, textDecoration: 'none', fontWeight: '500', transition: TRANSITION }}
                      onMouseEnter={e => e.currentTarget.style.color = BLUE}
                      onMouseLeave={e => e.currentTarget.style.color = TEXT_MUTED}>
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TRUST STRIP */}
        <div style={{ background: GREY_BG, borderRadius: '14px', padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center', border: BORDER }}>
          {[
            ['🏅', 'Certificate verified'],
            ['⭐', 'Rated by parents'],
            ['⚡', 'Fast response'],
            ['🇬🇭', 'Ghana focused'],
          ].map(([icon, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span style={{ fontSize: '16px' }}>{icon}</span>
              <span style={{ fontSize: '12px', color: TEXT_MUTED, fontWeight: '600' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* DIVIDER */}
        <div style={{ height: '1px', background: GREY_LIGHT, marginBottom: '1.25rem' }} />

        {/* BOTTOM ROW */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontSize: '12px', color: TEXT_MUTED, margin: 0, fontWeight: '500' }}>
            © {year} TeachMe Ghana. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            {['Privacy', 'Terms', 'Contact'].map(label => (
              <span key={label} style={{ fontSize: '12px', color: TEXT_MUTED, cursor: 'pointer', fontWeight: '500', transition: TRANSITION }}
                onMouseEnter={e => e.currentTarget.style.color = BLUE}
                onMouseLeave={e => e.currentTarget.style.color = TEXT_MUTED}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}