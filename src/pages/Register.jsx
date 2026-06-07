import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { BLUE, YELLOW, LIGHT_BLUE, GREY_BG, GREY_LIGHT, TEXT_MUTED, DARK_BLUE } from '../styles/colors'

const subjects = ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'ICT', 'French', 'Economics', 'History', 'Geography']

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedSubjects, setSelectedSubjects] = useState([])
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', phone: '', country: '', city: ''
  })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const toggleSubject = (subject) => {
    setSelectedSubjects(prev =>
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signUp(form.email, form.password, {
        ...form, role, subjects: selectedSubjects
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: GREY_BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: '700', color: BLUE }}>
            Teach<span style={{ color: YELLOW }}>Me</span>
          </div>
          <p style={{ color: TEXT_MUTED, marginTop: '6px', fontSize: '14px' }}>Create your account</p>
        </div>

        <div style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, overflow: 'hidden' }}>
          <div style={{ background: BLUE, padding: '1.25rem 1.5rem' }}>
            <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '500' }}>
              {step === 1 ? 'Choose your role' : step === 2 ? 'Personal information' : role === 'teacher' ? 'Teaching details' : `${role.charAt(0).toUpperCase() + role.slice(1)} account`}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '3px' }}>
              Step {step} of {role === 'teacher' ? 3 : 2}
            </p>
          </div>

          <div style={{ padding: '1.5rem' }}>
            {error && (
              <div style={{ background: LIGHT_BLUE, color: BLUE, padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            {step === 1 && (
              <div>
                <p style={{ fontSize: '14px', color: '#444', marginBottom: '1rem' }}>Who are you signing up as?</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {['teacher', 'parent', 'learner'].map(r => (
                    <div key={r} onClick={() => setRole(r)} style={{ border: `2px solid ${role === r ? BLUE : GREY_LIGHT}`, borderRadius: '8px', padding: '1rem', cursor: 'pointer', background: role === r ? LIGHT_BLUE : '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '24px' }}>{r === 'teacher' ? '🎓' : r === 'parent' ? '👨‍👩‍👧' : '📚'}</span>
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '15px', textTransform: 'capitalize', color: role === r ? BLUE : '#111' }}>{r}</div>
                        <div style={{ fontSize: '12px', color: TEXT_MUTED }}>
                          {r === 'teacher' ? 'Create a profile and teach students' : r === 'parent' ? 'Find teachers for your children' : 'Find teachers and join live sessions'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => role && setStep(2)} style={{ width: '100%', marginTop: '1.5rem', padding: '12px', background: role ? BLUE : '#ccc', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '15px', cursor: role ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
                  Continue
                </button>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={role === 'teacher' ? (e) => { e.preventDefault(); setStep(3) } : handleSubmit}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={labelStyle}>Full name</label>
                  <input style={inputStyle} name="full_name" placeholder="Your full name" value={form.full_name} onChange={handleChange} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input style={inputStyle} name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Password</label>
                    <input style={inputStyle} name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={labelStyle}>Phone number</label>
                  <input style={inputStyle} name="phone" placeholder="+233 xx xxx xxxx" value={form.phone} onChange={handleChange} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <label style={labelStyle}>Country</label>
                    <input style={inputStyle} name="country" placeholder="Ghana" value={form.country} onChange={handleChange} required />
                  </div>
                  <div>
                    <label style={labelStyle}>City</label>
                    <input style={inputStyle} name="city" placeholder="Accra" value={form.city} onChange={handleChange} required />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setStep(1)} style={{ ...btnStyle, background: '#fff', color: '#111', border: `1px solid ${GREY_LIGHT}` }}>Back</button>
                  <button type="submit" style={{ ...btnStyle, flex: 1 }} disabled={loading}>
                    {loading ? 'Creating...' : role === 'teacher' ? 'Continue' : 'Create account'}
                  </button>
                </div>
              </form>
            )}

            {step === 3 && role === 'teacher' && (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Subjects you teach</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginTop: '6px' }}>
                    {subjects.map(s => (
                      <button key={s} type="button" onClick={() => toggleSubject(s)} style={{ padding: '5px 14px', borderRadius: '20px', border: `1px solid ${selectedSubjects.includes(s) ? BLUE : GREY_LIGHT}`, background: selectedSubjects.includes(s) ? BLUE : '#fff', color: selectedSubjects.includes(s) ? '#fff' : TEXT_MUTED, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ background: LIGHT_BLUE, borderRadius: '6px', padding: '12px', marginBottom: '1rem', fontSize: '13px', color: DARK_BLUE }}>
                  📋 After signing up, upload your certificates for verification before your profile goes live.
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setStep(2)} style={{ ...btnStyle, background: '#fff', color: '#111', border: `1px solid ${GREY_LIGHT}` }}>Back</button>
                  <button type="submit" style={{ ...btnStyle, flex: 1 }} disabled={loading}>
                    {loading ? 'Creating...' : 'Create account'}
                  </button>
                </div>
              </form>
            )}

            <p style={{ textAlign: 'center', fontSize: '13px', color: TEXT_MUTED, marginTop: '1rem' }}>
              Already have an account? <Link to="/login" style={{ color: BLUE }}>Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const labelStyle = { fontSize: '11px', fontWeight: '500', color: TEXT_MUTED, display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }
const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit', outline: 'none' }
const btnStyle = { padding: '12px', background: BLUE, color: '#fff', border: 'none', borderRadius: '6px', fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }