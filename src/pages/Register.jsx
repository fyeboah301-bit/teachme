import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import {
  BLUE, YELLOW, DARK_BLUE, LIGHT_BLUE, GREY_BG, GREY_LIGHT,
  TEXT, TEXT_MUTED, GRADIENT_BLUE, GRADIENT_HERO,
  SHADOW_XL, SHADOW_BLUE, SHADOW_YELLOW, TRANSITION, BORDER,
} from '../styles/colors'
import Footer from '../components/Footer'
import heroImg from '../assets/images/hero.png'
import { Country, City } from 'country-state-city'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import usePageMeta from '../hooks/usePageMeta'

const SUBJECTS = ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'ICT', 'French', 'Economics', 'History', 'Geography']

const ROLES = [
  { id: 'teacher', icon: '🎓', label: 'Teacher', desc: 'Create a profile, teach students and earn' },
  { id: 'parent', icon: '👨‍👩‍👧', label: 'Parent', desc: 'Find verified teachers for your children' },
  { id: 'learner', icon: '📚', label: 'Learner', desc: 'Find teachers and join live online sessions' },
]

function SuccessScreen({ role, navigate }) {
  const config = {
    teacher: {
      icon: '🎓', title: 'Welcome to TeachMe!', subtitle: 'Your teacher account is ready.',
      message: 'Complete your application to get verified and go live. It takes less than 5 minutes.',
      steps: [
        { icon: '✏️', label: 'Fill in your bio and teaching levels' },
        { icon: '🪪', label: 'Upload your ID for background verification' },
        { icon: '📋', label: 'Upload your teaching certificate' },
        { icon: '🚀', label: 'Submit — reviewed within 24–48 hours' },
      ],
      primary: { label: 'Complete my application', path: '/apply' },
      secondary: { label: 'Go to dashboard', path: '/dashboard' },
    },
    learner: {
      icon: '📚', title: 'Welcome to TeachMe!', subtitle: 'Your learner account is ready.',
      message: "You're all set. Find a verified teacher or join a live session now.",
      steps: [
        { icon: '🔍', label: 'Search teachers by subject or location' },
        { icon: '👤', label: 'View profiles, certificates and pitch videos' },
        { icon: '📅', label: 'Send a booking request in seconds' },
        { icon: '🎥', label: 'Or enroll directly in a live session' },
      ],
      primary: { label: 'Find a teacher', path: '/teachers' },
      secondary: { label: 'Browse live sessions', path: '/sessions' },
    },
    parent: {
      icon: '👨‍👩‍👧', title: 'Welcome to TeachMe!', subtitle: 'Your parent account is ready.',
      message: 'Find a trusted, verified teacher for your child today.',
      steps: [
        { icon: '🔍', label: 'Browse verified teachers by subject' },
        { icon: '🎬', label: 'Watch teaching pitch videos first' },
        { icon: '📋', label: 'Check certificates and background checks' },
        { icon: '📅', label: 'Send a booking request — free and secure' },
      ],
      primary: { label: 'Find a teacher for my child', path: '/teachers' },
      secondary: { label: 'Go to dashboard', path: '/dashboard' },
    },
  }

  const c = config[role] || config.learner

  return (
    <div style={{ width: '100%', maxWidth: '520px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '30px', fontWeight: '700', color: '#fff', letterSpacing: '-0.02em' }}>
          Teach<span style={{ color: YELLOW }}>Me</span>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
        <div style={{ background: GRADIENT_BLUE, padding: '2.5rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '140px', height: '140px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px', margin: '0 auto 1rem', border: '2px solid rgba(255,255,255,0.2)' }}>{c.icon}</div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '700', color: '#fff', marginBottom: '6px', letterSpacing: '-0.02em' }}>{c.title}</h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: '1.6' }}>{c.subtitle}</p>
        </div>

        <div style={{ padding: '1.75rem' }}>
          <div style={{ background: LIGHT_BLUE, borderRadius: '14px', padding: '14px 16px', marginBottom: '1.5rem', fontSize: '14px', color: BLUE, fontWeight: '600', textAlign: 'center', border: '1px solid rgba(37,99,235,0.15)', lineHeight: '1.6' }}>
            {c.message}
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <p style={{ fontSize: '11px', fontWeight: '800', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px' }}>What to do next</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {c.steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px', background: GREY_BG, borderRadius: '14px', border: BORDER }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: LIGHT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{step.icon}</div>
                  <span style={{ fontSize: '14px', color: TEXT, fontWeight: '500', flex: 1 }}>{step.label}</span>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: GRADIENT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fff', fontWeight: '800', flexShrink: 0 }}>{i + 1}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={() => navigate(c.primary.path)}
              style={{ padding: '14px', background: YELLOW, color: BLUE, border: 'none', borderRadius: '50px', fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '800', boxShadow: SHADOW_YELLOW, transition: TRANSITION }}>
              {c.primary.label} →
            </button>
            <button onClick={() => navigate(c.secondary.path)}
              style={{ padding: '12px', background: '#fff', color: TEXT_MUTED, border: BORDER, borderRadius: '50px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600', transition: TRANSITION }}>
              {c.secondary.label}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Register() {
  usePageMeta('Sign up — Join TeachMe')

  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const presetRole = searchParams.get('role')
  const [step, setStep] = useState(presetRole ? 2 : 1)
  const [role, setRole] = useState(presetRole || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [selectedSubjects, setSelectedSubjects] = useState([])
  const [phone, setPhone] = useState('')
  const [countrySearch, setCountrySearch] = useState('')
  const [showCountryList, setShowCountryList] = useState(false)
  const [cities, setCities] = useState([])
  const [citySearch, setCitySearch] = useState('')
  const [showCityList, setShowCityList] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', country: '', country_code: '', city: '' })

  const allCountries = Country.getAllCountries()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSelectCountry = (country) => {
    setForm({ ...form, country: country.name, country_code: country.isoCode, city: '' })
    setCountrySearch(country.name)
    setCitySearch('')
    setShowCountryList(false)
    setCities(City.getCitiesOfCountry(country.isoCode) || [])
  }

  const handleSelectCity = (cityName) => {
    setForm({ ...form, city: cityName })
    setCitySearch(cityName)
    setShowCityList(false)
  }

  const filteredCountries = allCountries.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase())).slice(0, 50)
  const filteredCities = cities.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase())).slice(0, 50)

  const toggleSubject = (s) => setSelectedSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signUp(form.email, form.password, {
        ...form, full_name: `${form.first_name} ${form.last_name}`.trim(), phone, role, subjects: selectedSubjects
      })
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const totalSteps = role === 'teacher' ? 3 : 2
  const selectedRole = ROLES.find(r => r.id === role)
  const progressPct = step === 1 ? 33 : step === 2 ? (role === 'teacher' ? 66 : 100) : 100

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column', fontFamily: 'DM Sans, sans-serif' }}>

      <img src={heroImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(15,43,107,0.97) 0%, rgba(26,63,160,0.9) 50%, rgba(37,99,235,0.6) 100%)', zIndex: 1 }} />
      <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', zIndex: 1, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '240px', height: '240px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', zIndex: 1, pointerEvents: 'none' }} />

      <style>{`
        .PhoneInput { display: flex; align-items: center; gap: 8px; }
        .PhoneInputInput { flex: 1; padding: 12px 16px; border: 1px solid #E2E8F0; border-radius: 12px; font-size: 14px; font-family: inherit; outline: none; background: #fff !important; color: #0F172A !important; box-sizing: border-box; }
        .PhoneInputInput:focus { border-color: #2563EB; }
        .PhoneInputCountry { display: flex; align-items: center; }
        .PhoneInputCountrySelect { padding: 10px 8px; border: 1px solid #E2E8F0; border-radius: 12px; font-size: 13px; font-family: inherit; outline: none; background: #fff !important; color: #0F172A !important; cursor: pointer; }
        .PhoneInputCountrySelectArrow { color: #64748B !important; }
        .PhoneInputCountryIcon { background: transparent !important; }
      `}</style>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative', zIndex: 2 }}>

        {success ? (
          <SuccessScreen role={role} navigate={navigate} />
        ) : (
          <div style={{ width: '100%', maxWidth: '520px' }}>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <Link to="/" style={{ textDecoration: 'none' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '30px', fontWeight: '700', color: '#fff', letterSpacing: '-0.02em' }}>
                  Teach<span style={{ color: YELLOW }}>Me</span>
                </div>
              </Link>
              <p style={{ color: 'rgba(255,255,255,0.65)', marginTop: '6px', fontSize: '14px' }}>
                {step === 1 ? 'Join thousands learning across Ghana' : `Creating your ${selectedRole?.label || ''} account`}
              </p>
            </div>

            <div style={{ background: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>

              <div style={{ background: GRADIENT_HERO, padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      {step === 1 ? 'Get started' : `Step ${presetRole ? 1 : step - 1} of ${presetRole ? totalSteps - 1 : totalSteps}`}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#fff', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {step === 1 ? '👋 Choose your role' : step === 2 ? `${selectedRole?.icon} Personal details` : '📚 Teaching details'}
                    </div>
                  </div>
                  {step > 1 && !presetRole && (
                    <button onClick={() => setStep(step - 1)}
                      style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '50px', padding: '7px 14px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600' }}>
                      ← Back
                    </button>
                  )}
                </div>

                {!presetRole && step > 1 && (
                  <div style={{ marginTop: '14px' }}>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '50px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${progressPct}%`, background: YELLOW, borderRadius: '50px', transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ padding: '1.75rem' }}>

                {error && (
                  <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px 14px', borderRadius: '12px', fontSize: '13px', marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '8px', fontWeight: '500', border: '1px solid #FECACA' }}>
                    <span style={{ flexShrink: 0 }}>⚠️</span> {error}
                  </div>
                )}

                {/* STEP 1 */}
                {step === 1 && (
                  <div>
                    <p style={{ fontSize: '14px', color: TEXT_MUTED, marginBottom: '1.25rem', lineHeight: '1.6' }}>Who are you signing up as? Pick the option that describes you.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.75rem' }}>
                      {ROLES.map(r => (
                        <div key={r.id} onClick={() => setRole(r.id)}
                          style={{ border: `2px solid ${role === r.id ? BLUE : GREY_LIGHT}`, borderRadius: '16px', padding: '1rem 1.25rem', cursor: 'pointer', background: role === r.id ? LIGHT_BLUE : '#fff', display: 'flex', alignItems: 'center', gap: '14px', transition: TRANSITION, boxShadow: role === r.id ? SHADOW_BLUE : '0 1px 4px rgba(0,0,0,0.04)' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: role === r.id ? BLUE : GREY_BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0, transition: TRANSITION }}>
                            {r.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '800', fontSize: '15px', color: role === r.id ? BLUE : TEXT, marginBottom: '3px' }}>{r.label}</div>
                            <div style={{ fontSize: '13px', color: TEXT_MUTED, lineHeight: '1.5' }}>{r.desc}</div>
                          </div>
                          {role === r.id && (
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#fff', fontWeight: '800', flexShrink: 0 }}>✓</div>
                          )}
                        </div>
                      ))}
                    </div>
                    <button onClick={() => role && setStep(2)} disabled={!role}
                      style={{ width: '100%', padding: '14px', background: role ? YELLOW : GREY_BG, color: role ? BLUE : TEXT_MUTED, border: 'none', borderRadius: '50px', fontSize: '15px', cursor: role ? 'pointer' : 'not-allowed', fontFamily: 'inherit', fontWeight: '800', boxShadow: role ? SHADOW_YELLOW : 'none', transition: TRANSITION }}>
                      Continue as {selectedRole?.label || '...'} →
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '14px', color: TEXT_MUTED, marginTop: '1.25rem', margin: '1.25rem 0 0' }}>
                      Already have an account?{' '}
                      <Link to="/login" style={{ color: BLUE, fontWeight: '700', textDecoration: 'none' }}>Log in →</Link>
                    </p>
                  </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <form onSubmit={role === 'teacher' ? (e) => { e.preventDefault(); setStep(3) } : handleSubmit}>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                      <div>
                        <label style={lbl}>First name</label>
                        <input style={inp} name="first_name" placeholder="First name" value={form.first_name} onChange={handleChange} required
                          onFocus={e => e.target.style.borderColor = BLUE} onBlur={e => e.target.style.borderColor = GREY_LIGHT} />
                      </div>
                      <div>
                        <label style={lbl}>Last name</label>
                        <input style={inp} name="last_name" placeholder="Last name" value={form.last_name} onChange={handleChange} required
                          onFocus={e => e.target.style.borderColor = BLUE} onBlur={e => e.target.style.borderColor = GREY_LIGHT} />
                      </div>
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <label style={lbl}>Email address</label>
                      <input style={inp} name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange} required
                        onFocus={e => e.target.style.borderColor = BLUE} onBlur={e => e.target.style.borderColor = GREY_LIGHT} />
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <label style={lbl}>Password</label>
                      <div style={{ position: 'relative' }}>
                        <input style={{ ...inp, paddingRight: '44px' }} name="password" type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={handleChange} required
                          onFocus={e => e.target.style.borderColor = BLUE} onBlur={e => e.target.style.borderColor = GREY_LIGHT} />
                        <button type="button" onClick={() => setShowPassword(v => !v)}
                          style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: TEXT_MUTED, padding: 0, lineHeight: 1 }}>
                          {showPassword ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <label style={lbl}>Phone number</label>
                      <div style={{ border: `1px solid ${GREY_LIGHT}`, borderRadius: '12px', padding: '2px 12px', background: '#fff', transition: TRANSITION }}>
                        <PhoneInput international defaultCountry="GH" value={phone} onChange={setPhone} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                      <div style={{ position: 'relative' }}>
                        <label style={lbl}>Country</label>
                        <div style={{ position: 'relative' }}>
                          <input style={{ ...inp, paddingRight: '32px' }} placeholder="Type or select..." value={countrySearch}
                            onChange={e => { setCountrySearch(e.target.value); setShowCountryList(true) }}
                            onFocus={() => setShowCountryList(true)} autoComplete="off" required
                            onBlur={() => setTimeout(() => setShowCountryList(false), 150)} />
                          <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: TEXT_MUTED, pointerEvents: 'none' }}>▾</span>
                        </div>
                        {showCountryList && (
                          <div style={dropdown}>
                            {(countrySearch ? filteredCountries : allCountries.slice(0, 50)).map(c => (
                              <div key={c.isoCode} onMouseDown={() => handleSelectCountry(c)} style={dropdownItem}>
                                {c.flag} {c.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={{ position: 'relative' }}>
                        <label style={lbl}>City</label>
                        <div style={{ position: 'relative' }}>
                          <input style={{ ...inp, paddingRight: '32px', opacity: !form.country ? 0.5 : 1 }}
                            placeholder={form.country ? 'Type or select...' : 'Select country first'}
                            value={citySearch}
                            onChange={e => { setCitySearch(e.target.value); setShowCityList(true) }}
                            onFocus={() => setShowCityList(true)}
                            onBlur={() => setTimeout(() => setShowCityList(false), 150)}
                            disabled={!form.country} autoComplete="off" required />
                          <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: TEXT_MUTED, pointerEvents: 'none' }}>▾</span>
                        </div>
                        {showCityList && form.country && (
                          <div style={dropdown}>
                            {(citySearch ? filteredCities : cities.slice(0, 50)).map(c => (
                              <div key={c.name + c.latitude} onMouseDown={() => handleSelectCity(c.name)} style={dropdownItem}>{c.name}</div>
                            ))}
                            {cities.length === 0 && (
                              <div style={{ padding: '12px 14px', fontSize: '13px', color: TEXT_MUTED, fontStyle: 'italic' }}>No cities found — type your city name</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <button type="submit" disabled={loading}
                      style={{ width: '100%', padding: '14px', background: loading ? GREY_BG : YELLOW, color: loading ? TEXT_MUTED : BLUE, border: 'none', borderRadius: '50px', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: '800', boxShadow: loading ? 'none' : SHADOW_YELLOW, transition: TRANSITION, marginTop: '4px' }}>
                      {loading ? '⏳ Creating...' : role === 'teacher' ? 'Continue — teaching details →' : 'Create my account →'}
                    </button>

                    <p style={{ textAlign: 'center', fontSize: '14px', color: TEXT_MUTED, marginTop: '1.25rem', margin: '1.25rem 0 0' }}>
                      Already have an account?{' '}
                      <Link to={`/login?role=${role}`} style={{ color: BLUE, fontWeight: '700', textDecoration: 'none' }}>Log in →</Link>
                    </p>
                  </form>
                )}

                {/* STEP 3 */}
                {step === 3 && role === 'teacher' && (
                  <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={lbl}>Subjects you teach</label>
                      <p style={{ fontSize: '13px', color: TEXT_MUTED, margin: '0 0 12px', lineHeight: '1.6' }}>
                        Select all that apply — you can update this from your dashboard.
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {SUBJECTS.map(s => (
                          <button key={s} type="button" onClick={() => toggleSubject(s)}
                            style={{ padding: '8px 16px', borderRadius: '50px', border: `2px solid ${selectedSubjects.includes(s) ? BLUE : GREY_LIGHT}`, background: selectedSubjects.includes(s) ? BLUE : '#fff', color: selectedSubjects.includes(s) ? '#fff' : TEXT_MUTED, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: selectedSubjects.includes(s) ? '700' : '400', transition: TRANSITION, boxShadow: selectedSubjects.includes(s) ? SHADOW_BLUE : 'none' }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: LIGHT_BLUE, borderRadius: '14px', padding: '14px 16px', marginBottom: '1.5rem', fontSize: '13px', color: BLUE, display: 'flex', gap: '10px', alignItems: 'flex-start', border: '1px solid rgba(37,99,235,0.15)', lineHeight: '1.6', fontWeight: '500' }}>
                      <span style={{ fontSize: '18px', flexShrink: 0 }}>📋</span>
                      After signing up, you'll upload your certificates and ID for verification before your profile goes live.
                    </div>

                    <button type="submit" disabled={loading}
                      style={{ width: '100%', padding: '14px', background: loading ? GREY_BG : YELLOW, color: loading ? TEXT_MUTED : BLUE, border: 'none', borderRadius: '50px', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: '800', boxShadow: loading ? 'none' : SHADOW_YELLOW, transition: TRANSITION }}>
                      {loading ? '⏳ Creating account...' : '🎓 Create my teacher account →'}
                    </button>

                    <p style={{ textAlign: 'center', fontSize: '14px', color: TEXT_MUTED, marginTop: '1.25rem', margin: '1.25rem 0 0' }}>
                      Already have an account?{' '}
                      <Link to="/login?role=teacher" style={{ color: BLUE, fontWeight: '700', textDecoration: 'none' }}>Log in →</Link>
                    </p>
                  </form>
                )}
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <Link to="/" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontWeight: '500' }}>
                ← Back to home
              </Link>
            </div>
          </div>
        )}
      </div>

      <div style={{ position: 'relative', zIndex: 2 }}>
        <Footer variant="dark" />
      </div>
    </div>
  )
}

const lbl = { fontSize: '11px', fontWeight: '800', color: TEXT_MUTED, display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.07em' }
const inp = { width: '100%', padding: '12px 16px', border: `1px solid ${GREY_LIGHT}`, borderRadius: '12px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', background: '#fff', color: TEXT, boxSizing: 'border-box', transition: TRANSITION }
const dropdown = { position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#fff', border: `1px solid ${GREY_LIGHT}`, borderRadius: '14px', maxHeight: '200px', overflowY: 'auto', zIndex: 50, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }
const dropdownItem = { padding: '10px 14px', fontSize: '13px', cursor: 'pointer', color: TEXT, borderBottom: `1px solid ${GREY_BG}`, background: '#fff', transition: TRANSITION }