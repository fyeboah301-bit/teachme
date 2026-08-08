import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import {
  BLUE, YELLOW, DARK_BLUE, LIGHT_BLUE, GREY_BG, GREY_LIGHT,
  TEXT, TEXT_MUTED, GRADIENT_BLUE, GRADIENT_HERO,
  SHADOW_XL, SHADOW_BLUE, SHADOW_YELLOW, TRANSITION, BORDER,
} from '../styles/colors'
import Footer from '../components/Footer'
import heroImg from '../assets/images/hero.png'
import usePageMeta from '../hooks/usePageMeta'

const ROLES = [
  { id: 'teacher', icon: '👩‍🏫', label: 'Teacher' },
  { id: 'parent', icon: '👨‍👩‍👧', label: 'Parent' },
  { id: 'learner', icon: '📚', label: 'Learner' },
]

export default function Login() {
  usePageMeta('Log in')

  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [role, setRole] = useState(searchParams.get('role') || 'teacher')
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signIn(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const selectedRole = ROLES.find(r => r.id === role)

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column', fontFamily: 'DM Sans, sans-serif' }}>

      <img src={heroImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(15,43,107,0.97) 0%, rgba(26,63,160,0.9) 50%, rgba(37,99,235,0.6) 100%)', zIndex: 1 }} />
      <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', zIndex: 1, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '240px', height: '240px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', zIndex: 1, pointerEvents: 'none' }} />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative', zIndex: 2 }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '30px', fontWeight: '700', color: '#fff', letterSpacing: '-0.02em' }}>
                Teach<span style={{ color: YELLOW }}>Me</span>
              </div>
            </Link>
            <p style={{ color: 'rgba(255,255,255,0.65)', marginTop: '6px', fontSize: '14px', fontWeight: '400' }}>
              Welcome back — sign in to continue
            </p>
          </div>

          <div style={{ background: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>

            <div style={{ background: GRADIENT_HERO, padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', fontWeight: '500', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Signing in as
              </div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#fff', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {selectedRole?.icon} {selectedRole?.label}
              </div>
            </div>

            <div style={{ padding: '1.5rem' }}>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={lbl}>I am a</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {ROLES.map(r => (
                    <button key={r.id} type="button" onClick={() => setRole(r.id)}
                      style={{ flex: 1, padding: '10px 6px', border: `2px solid ${role === r.id ? BLUE : GREY_LIGHT}`, borderRadius: '12px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', background: role === r.id ? LIGHT_BLUE : '#fff', color: role === r.id ? BLUE : TEXT_MUTED, fontWeight: role === r.id ? '800' : '400', transition: TRANSITION, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '20px' }}>{r.icon}</span>
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px 14px', borderRadius: '12px', fontSize: '13px', marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '8px', fontWeight: '500', border: '1px solid #FECACA' }}>
                  <span style={{ flexShrink: 0 }}>⚠️</span> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={lbl}>Email address</label>
                  <input
                    style={inp}
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    onFocus={e => e.target.style.borderColor = BLUE}
                    onBlur={e => e.target.style.borderColor = GREY_LIGHT}
                  />
                </div>

                <div>
                  <label style={lbl}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      style={{ ...inp, paddingRight: '44px' }}
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Your password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      onFocus={e => e.target.style.borderColor = BLUE}
                      onBlur={e => e.target.style.borderColor = GREY_LIGHT}
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: TEXT_MUTED, padding: 0, lineHeight: 1 }}>
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  style={{ width: '100%', padding: '14px', background: loading ? GREY_LIGHT : YELLOW, color: loading ? TEXT_MUTED : BLUE, border: 'none', borderRadius: '50px', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: '800', boxShadow: loading ? 'none' : SHADOW_YELLOW, transition: TRANSITION, letterSpacing: '0.01em' }}>
                  {loading ? '⏳ Logging in...' : `Log in as ${selectedRole?.label} ${selectedRole?.icon}`}
                </button>
              </form>

              <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: TEXT_MUTED, margin: 0 }}>
                  Don't have an account?{' '}
                  <Link to={`/register?role=${role}`} style={{ color: BLUE, fontWeight: '700', textDecoration: 'none' }}>
                    Sign up free →
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link to="/" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontWeight: '500', transition: TRANSITION }}>
              ← Back to home
            </Link>
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 2 }}>
        <Footer variant="dark" />
      </div>
    </div>
  )
}

const lbl = { fontSize: '11px', fontWeight: '800', color: TEXT_MUTED, display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.07em' }
const inp = { width: '100%', padding: '12px 16px', border: `1px solid ${GREY_LIGHT}`, borderRadius: '12px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', background: '#fff', color: TEXT, boxSizing: 'border-box', transition: TRANSITION }