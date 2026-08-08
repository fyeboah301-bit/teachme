import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { BLUE, YELLOW, DARK_BLUE, SHADOW_BLUE_LG, TRANSITION } from '../styles/colors'
import NotificationBell from './NotificationBell'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

export default function NavBar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const isMobile = useIsMobile()
  const drawerRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    setMenuOpen(false)
  }

  const isActive = (path) => location.pathname === path

  const linkStyle = (path) => ({
    fontSize: '13.5px',
    color: isActive(path) ? YELLOW : 'rgba(255,255,255,0.75)',
    textDecoration: 'none',
    fontWeight: isActive(path) ? '700' : '400',
    letterSpacing: '0.01em',
    padding: '5px 0',
    borderBottom: isActive(path) ? `2px solid ${YELLOW}` : '2px solid transparent',
    transition: TRANSITION,
    whiteSpace: 'nowrap',
  })

  const mobileLinkStyle = (path) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 16px',
    fontSize: '15px',
    color: isActive(path) ? YELLOW : '#fff',
    textDecoration: 'none',
    fontWeight: isActive(path) ? '700' : '400',
    borderRadius: '10px',
    background: isActive(path) ? 'rgba(255,215,0,0.08)' : 'transparent',
    transition: TRANSITION,
    margin: '1px 0',
  })

  const teacherLinks = [
    { to: '/sessions', label: 'Live sessions', icon: '🎥' },
    { to: '/booking-requests', label: 'Booking Requests', icon: '📋' },
    { to: '/messages', label: 'Messages', icon: '💬' },
    { to: '/assignments', label: 'Assignments', icon: '📝' },
    { to: '/certificates', label: 'Certificates', icon: '📄' },
    { to: '/referrals', label: 'Refer & Earn', icon: '🎁' },
    { to: '/dashboard', label: 'Dashboard', icon: '👤' },
  ]

  const learnerLinks = [
    { to: '/teachers', label: 'Find teachers', icon: '🔍' },
    { to: '/sessions', label: 'Live sessions', icon: '🎥' },
    { to: '/booking', label: 'Book tuition', icon: '📅' },
    { to: '/messages', label: 'Messages', icon: '💬' },
    { to: '/assignments', label: 'Assignments', icon: '📝' },
    { to: '/certificates', label: 'Certificates', icon: '📄' },
    { to: '/referrals', label: 'Refer & Earn', icon: '🎁' },
    ...(profile?.role === 'parent' ? [{ to: '/progress', label: 'Progress', icon: '📈' }] : []),
    { to: '/dashboard', label: 'Dashboard', icon: '👤' },
  ]

  const mobileLinks = profile?.role === 'teacher' ? teacherLinks : learnerLinks
  const isTeacher = profile?.role === 'teacher'

  return (
    <>
      {/* NAV */}
      <nav style={{
        background: scrolled
          ? 'rgba(37,99,235,0.97)'
          : `linear-gradient(135deg, ${BLUE} 0%, ${DARK_BLUE} 100%)`,
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        padding: isMobile ? '0.75rem 1rem' : '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 200,
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.15)' : 'none',
        transition: 'box-shadow 0.3s ease, background 0.3s ease',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
        paddingLeft: isMobile ? '1rem' : '0',
        paddingRight: isMobile ? '1rem' : '0',
      }}>

        {/* LOGO */}
        <Link to="/dashboard" style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? '20px' : '22px', fontWeight: '700', color: '#fff', textDecoration: 'none', padding: isMobile ? '0' : '1rem 2rem', flexShrink: 0, letterSpacing: '-0.01em' }}>
          Teach<span style={{ color: YELLOW }}>Me</span>
        </Link>

        {/* DESKTOP NAV */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, paddingRight: '2rem' }}>
            {/* LINKS */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1, justifyContent: 'center' }}>
              {isTeacher ? (
                <>
                  <NavLink to="/sessions" label="Live sessions" isActive={isActive('/sessions')} />
                  <NavLink to="/booking-requests" label="Bookings" isActive={isActive('/booking-requests')} />
                  <NavLink to="/messages" label="Messages" isActive={isActive('/messages')} />
                  <NavLink to="/assignments" label="Assignments" isActive={isActive('/assignments')} />
                  <NavLink to="/certificates" label="Certificates" isActive={isActive('/certificates')} />
                  <NavLink to="/referrals" label="Refer & Earn" isActive={isActive('/referrals')} />
                </>
              ) : (
                <>
                  <NavLink to="/teachers" label="Find teachers" isActive={isActive('/teachers')} />
                  <NavLink to="/sessions" label="Live sessions" isActive={isActive('/sessions')} />
                  <NavLink to="/booking" label="Book tuition" isActive={isActive('/booking')} />
                  <NavLink to="/messages" label="Messages" isActive={isActive('/messages')} />
                  <NavLink to="/assignments" label="Assignments" isActive={isActive('/assignments')} />
                  <NavLink to="/referrals" label="Refer & Earn" isActive={isActive('/referrals')} />
                  {profile?.role === 'parent' && <NavLink to="/progress" label="Progress" isActive={isActive('/progress')} />}
                </>
              )}
            </div>

            {/* RIGHT SIDE */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <NotificationBell />

              {/* AVATAR + NAME */}
              <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '6px 10px', borderRadius: '50px', background: isActive('/dashboard') ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', transition: TRANSITION }}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${YELLOW}`, flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: YELLOW, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', color: BLUE, flexShrink: 0 }}>
                    {profile?.full_name?.charAt(0)}
                  </div>
                )}
                <span style={{ fontSize: '13px', color: '#fff', fontWeight: '600', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile?.full_name?.split(' ')[0]}
                </span>
              </Link>

              {/* LOGOUT */}
              <button
                onClick={handleSignOut}
                style={{ padding: '7px 16px', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)', background: 'transparent', borderRadius: '50px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500', transition: TRANSITION }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
              >
                Log out
              </button>
            </div>
          </div>
        )}

        {/* MOBILE RIGHT */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <NotificationBell />
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${YELLOW}` }} />
            ) : (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: YELLOW, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '800', color: BLUE }}>
                {profile?.full_name?.charAt(0)}
              </div>
            )}
            <button
              onClick={() => setMenuOpen(o => !o)}
              style={{ background: menuOpen ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', cursor: 'pointer', padding: '7px 9px', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', justifyContent: 'center', transition: TRANSITION }}
              aria-label="Menu"
            >
              <div style={{ width: '18px', height: '2px', background: '#fff', borderRadius: '2px', transform: menuOpen ? 'rotate(45deg) translate(0px, 6px)' : 'none', transition: 'all 0.2s ease' }} />
              <div style={{ width: '18px', height: '2px', background: '#fff', borderRadius: '2px', opacity: menuOpen ? 0 : 1, transition: 'all 0.2s ease' }} />
              <div style={{ width: '18px', height: '2px', background: '#fff', borderRadius: '2px', transform: menuOpen ? 'rotate(-45deg) translate(0px, -6px)' : 'none', transition: 'all 0.2s ease' }} />
            </button>
          </div>
        )}
      </nav>

      {/* MOBILE DRAWER */}
      {isMobile && (
        <div
          ref={drawerRef}
          style={{
            position: 'fixed',
            top: '60px',
            left: 0,
            right: 0,
            bottom: menuOpen ? 0 : '100vh',
            zIndex: 199,
            pointerEvents: menuOpen ? 'all' : 'none',
          }}
        >
          {/* BACKDROP */}
          <div
            onClick={() => setMenuOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', opacity: menuOpen ? 1 : 0, transition: 'opacity 0.25s ease' }}
          />

          {/* PANEL */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            background: `linear-gradient(160deg, ${BLUE} 0%, ${DARK_BLUE} 100%)`,
            borderRadius: '0 0 20px 20px',
            padding: '1rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            transform: menuOpen ? 'translateY(0)' : 'translateY(-20px)',
            opacity: menuOpen ? 1 : 0,
            transition: 'transform 0.25s ease, opacity 0.25s ease',
            maxHeight: '85vh',
            overflowY: 'auto',
          }}>

            {/* USER INFO */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.08)', borderRadius: '12px', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${YELLOW}`, flexShrink: 0 }} />
              ) : (
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: YELLOW, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', color: BLUE, flexShrink: 0 }}>
                  {profile?.full_name?.charAt(0)}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.full_name}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', textTransform: 'capitalize', marginTop: '2px' }}>{profile?.role}</div>
              </div>
            </div>

            {/* LINKS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '12px' }}>
              {mobileLinks.map(({ to, label, icon }) => (
                <Link
                  key={to}
                  to={to}
                  style={mobileLinkStyle(to)}
                  onClick={() => setMenuOpen(false)}
                >
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>{icon}</span>
                  <span>{label}</span>
                  {isActive(to) && <span style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: YELLOW, flexShrink: 0 }} />}
                </Link>
              ))}
            </div>

            {/* LOGOUT */}
            <button
              onClick={handleSignOut}
              style={{ width: '100%', padding: '13px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600', transition: TRANSITION }}
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// ─── NAV LINK COMPONENT ──────────────────────────────────────────────────────
function NavLink({ to, label, isActive }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      to={to}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontSize: '13.5px',
        color: isActive ? '#fff' : hovered ? '#fff' : 'rgba(255,255,255,0.7)',
        textDecoration: 'none',
        fontWeight: isActive ? '700' : '400',
        padding: '1.1rem 14px',
        borderBottom: isActive ? `3px solid ${YELLOW}` : hovered ? '3px solid rgba(255,255,255,0.2)' : '3px solid transparent',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
        letterSpacing: '0.01em',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {label}
    </Link>
  )
}