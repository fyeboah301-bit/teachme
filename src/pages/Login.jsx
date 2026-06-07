import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { BLUE, YELLOW, LIGHT_BLUE, GREY_BG, GREY_LIGHT, TEXT_MUTED } from '../styles/colors'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  return (
    <div style={{ minHeight: '100vh', background: GREY_BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: '700', color: BLUE }}>
            Teach<span style={{ color: YELLOW }}>Me</span>
          </div>
          <p style={{ color: TEXT_MUTED, marginTop: '6px', fontSize: '14px' }}>Welcome back</p>
        </div>

        <div style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, overflow: 'hidden' }}>
          <div style={{ background: BLUE, padding: '1.25rem 1.5rem' }}>
            <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '500' }}>Log in to your account</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '3px' }}>Enter your email and password</p>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
            {error && (
              <div style={{ background: LIGHT_BLUE, color: BLUE, padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '1rem' }}>
                {error}
              </div>
            )}
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Email address</label>
              <input style={inputStyle} name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange} required />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Password</label>
              <input style={inputStyle} name="password" type="password" placeholder="Your password" value={form.password} onChange={handleChange} required />
            </div>
            <button type="submit" style={{ width: '100%', padding: '12px', background: BLUE, color: '#fff', border: 'none', borderRadius: '6px', fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }} disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '13px', color: TEXT_MUTED, marginTop: '1rem' }}>
              Don't have an account? <Link to="/register" style={{ color: BLUE }}>Sign up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

const labelStyle = { fontSize: '11px', fontWeight: '500', color: TEXT_MUTED, display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }
const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit', outline: 'none' }