import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  BLUE, YELLOW, DARK_BLUE, LIGHT_BLUE, GREY_BG, GREY_LIGHT,
  TEXT, TEXT_MUTED, GRADIENT_BLUE, GRADIENT_HERO,
  SHADOW_LG, SHADOW_XL, SHADOW_BLUE, SHADOW_YELLOW,
  TRANSITION, BORDER,
} from '../styles/colors'
import usePageMeta from '../hooks/usePageMeta'

const SUBJECTS = [
  'Mathematics', 'English', 'Physics', 'Chemistry', 'Biology',
  'ICT', 'French', 'Economics', 'History', 'Geography',
  'Science', 'Social Studies', 'Religious Studies', 'Music',
  'Physical Education', 'Art', 'Business Studies', 'Accounting'
]

const LEVELS = ['Primary', 'JHS', 'SHS', 'University', 'Adult Learning']

const STEPS = [
  { number: 1, title: 'About you',   icon: '👤' },
  { number: 2, title: 'Teaching',    icon: '📚' },
  { number: 3, title: 'Identity',    icon: '🪪' },
  { number: 4, title: 'Credentials', icon: '📋' },
  { number: 5, title: 'Submit',      icon: '🚀' },
]

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 769)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

export default function TeacherApplication() {
  usePageMeta('Teacher Application')

  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const [bio, setBio] = useState('')
  const [yearsExperience, setYearsExperience] = useState('')
  const [languages, setLanguages] = useState('')
  const [teachingLevels, setTeachingLevels] = useState([])
  const [subjects, setSubjects] = useState([])
  const [hourlyRate, setHourlyRate] = useState('')
  const [idFile, setIdFile] = useState(null)
  const [idType, setIdType] = useState('National ID')
  const [idUploaded, setIdUploaded] = useState(false)
  const [certFile, setCertFile] = useState(null)
  const [certName, setCertName] = useState('')
  const [certUploaded, setCertUploaded] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (profile && profile.role !== 'teacher') { navigate('/dashboard'); return }
    if (profile) fetchExisting()
  }, [user, profile])

  const fetchExisting = async () => {
    const { data } = await supabase.from('teachers').select('*').eq('id', user.id).single()
    if (data) {
      if (data.application_status === 'approved' || data.application_status === 'pending') {
        navigate('/dashboard'); return
      }
      setBio(data.bio || '')
      setYearsExperience(data.years_experience?.toString() || '')
      setLanguages((data.languages || []).join(', '))
      setSubjects(data.subjects || [])
      setTeachingLevels(data.teaching_levels || [])
      setHourlyRate(data.hourly_rate?.toString() || '')
    }
    const { data: docs } = await supabase.from('teacher_documents').select('id').eq('teacher_id', user.id).limit(1)
    if (docs?.length > 0) setIdUploaded(true)
    const { data: certs } = await supabase.from('certificates').select('id').eq('teacher_id', user.id).limit(1)
    if (certs?.length > 0) setCertUploaded(true)
  }

  const saveStep1 = async () => {
    if (!bio.trim()) return setMessage('Please enter a bio.')
    setSaving(true); setMessage('')
    try {
      const { error } = await supabase.from('teachers').update({
        bio, years_experience: yearsExperience ? parseInt(yearsExperience) : null,
        languages: languages ? languages.split(',').map(l => l.trim()).filter(Boolean) : [],
        teaching_levels: teachingLevels,
      }).eq('id', user.id)
      if (error) throw error
      setStep(2)
    } catch (err) { setMessage('Error: ' + err.message) }
    finally { setSaving(false) }
  }

  const saveStep2 = async () => {
    if (subjects.length === 0) return setMessage('Please select at least one subject.')
    setSaving(true); setMessage('')
    try {
      const { error } = await supabase.from('teachers').update({
        subjects, hourly_rate: hourlyRate ? parseFloat(hourlyRate) : 0,
      }).eq('id', user.id)
      if (error) throw error
      setStep(3)
    } catch (err) { setMessage('Error: ' + err.message) }
    finally { setSaving(false) }
  }

  const uploadId = async () => {
    if (idUploaded) { setStep(4); return }
    if (!idFile) return setMessage('Please select a file.')
    setUploading(true); setMessage('')
    try {
      const fileName = `${user.id}/${Date.now()}.${idFile.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, idFile)
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName)
      await supabase.from('teacher_documents').insert({ teacher_id: user.id, document_type: idType, file_url: urlData.publicUrl, status: 'pending' })
      setIdUploaded(true); setStep(4)
    } catch (err) { setMessage('Error: ' + err.message) }
    finally { setUploading(false) }
  }

  const uploadCert = async () => {
    if (certUploaded) { setStep(5); return }
    if (!certFile || !certName) return setMessage('Please select a file and enter the certificate name.')
    setUploading(true); setMessage('')
    try {
      const fileName = `${user.id}/${Date.now()}.${certFile.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage.from('certificates').upload(fileName, certFile)
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('certificates').getPublicUrl(fileName)
      await supabase.from('certificates').insert({ teacher_id: user.id, certificate_name: certName, file_url: urlData.publicUrl, status: 'pending', certificate_type: 'teaching' })
      setCertUploaded(true); setStep(5)
    } catch (err) { setMessage('Error: ' + err.message) }
    finally { setUploading(false) }
  }

  const submitApplication = async () => {
    setSaving(true); setMessage('')
    try {
      const { error } = await supabase.from('teachers').update({
        application_status: 'pending',
        application_submitted_at: new Date().toISOString()
      }).eq('id', user.id)
      if (error) throw error
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: '🎉 Application submitted!',
        message: "Your teacher application is under review. We'll notify you within 24–48 hours.",
        type: 'application', link: '/dashboard'
      })
      navigate('/dashboard')
    } catch (err) { setMessage('Error: ' + err.message) }
    finally { setSaving(false) }
  }

  const toggleSubject = (s) => setSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  const toggleLevel  = (l) => setTeachingLevels(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l])

  const progressPct = ((step - 1) / (STEPS.length - 1)) * 100

  return (
    <div style={{ minHeight: '100vh', background: GREY_BG, fontFamily: 'DM Sans, sans-serif' }}>

      <nav style={{ background: GRADIENT_HERO, padding: isMobile ? '0.875rem 1.25rem' : '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link to="/dashboard" style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '700', color: '#fff', textDecoration: 'none', letterSpacing: '-0.02em', padding: isMobile ? '0' : '1rem 0' }}>
          Teach<span style={{ color: YELLOW }}>Me</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.3)', color: YELLOW, padding: '4px 12px', borderRadius: '50px', fontWeight: '700', letterSpacing: '0.05em' }}>
            Teacher Application
          </span>
          <Link to="/dashboard" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontWeight: '500' }}>
            Save & exit
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: isMobile ? '1.25rem' : '2rem' }}>

        {/* PROGRESS */}
        <div style={{ background: '#fff', borderRadius: '20px', padding: isMobile ? '1.25rem' : '1.5rem', border: BORDER, boxShadow: SHADOW_LG, marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            {STEPS.map((s, i) => (
              <div key={s.number} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: isMobile ? '32px' : '40px', height: isMobile ? '32px' : '40px', borderRadius: '50%', background: step > s.number ? '#22C55E' : step === s.number ? GRADIENT_BLUE : GREY_BG, color: step >= s.number ? '#fff' : TEXT_MUTED, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: step > s.number ? '14px' : isMobile ? '13px' : '16px', fontWeight: '800', transition: TRANSITION, boxShadow: step === s.number ? SHADOW_BLUE : 'none', cursor: step > s.number ? 'pointer' : 'default' }}
                    onClick={() => step > s.number && setStep(s.number)}>
                    {step > s.number ? '✓' : s.icon}
                  </div>
                  {!isMobile && <div style={{ fontSize: '10px', color: step === s.number ? BLUE : TEXT_MUTED, fontWeight: step === s.number ? '800' : '400', whiteSpace: 'nowrap', letterSpacing: '0.03em' }}>{s.title}</div>}
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: '3px', background: step > s.number ? '#22C55E' : GREY_LIGHT, margin: isMobile ? '0 4px 0' : '0 6px 16px', borderRadius: '2px', transition: TRANSITION }} />
                )}
              </div>
            ))}
          </div>
          <div style={{ height: '5px', background: GREY_BG, borderRadius: '50px', overflow: 'hidden', border: BORDER }}>
            <div style={{ height: '100%', width: `${progressPct}%`, background: GRADIENT_BLUE, borderRadius: '50px', transition: 'width 0.4s ease', boxShadow: SHADOW_BLUE }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ fontSize: '12px', color: TEXT_MUTED, fontWeight: '600' }}>Step {step} of {STEPS.length}</span>
            <span style={{ fontSize: '12px', color: BLUE, fontWeight: '700' }}>{Math.round(progressPct)}% complete</span>
          </div>
        </div>

        {/* MESSAGE */}
        {message && (
          <div style={{ background: message.startsWith('Error') ? '#FEE2E2' : '#DCFCE7', color: message.startsWith('Error') ? '#991B1B' : '#166534', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', marginBottom: '1.25rem', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: '600', border: `1px solid ${message.startsWith('Error') ? '#FECACA' : '#BBF7D0'}` }}>
            <span style={{ flexShrink: 0 }}>{message.startsWith('Error') ? '⚠️' : '✅'}</span>
            <span style={{ flex: 1 }}>{message}</span>
            <button onClick={() => setMessage('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'inherit', opacity: 0.6, padding: 0 }}>×</button>
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, overflow: 'hidden', boxShadow: SHADOW_LG }}>
            <div style={{ background: GRADIENT_HERO, padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.3)', color: YELLOW, fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 12px', borderRadius: '50px', marginBottom: '10px' }}>
                Step 1 of 5
              </div>
              <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', marginBottom: '4px', letterSpacing: '-0.01em' }}>👤 About you</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: 0 }}>Tell parents and learners who you are</p>
            </div>
            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={lbl}>Your name</label>
                <div style={{ padding: '12px 16px', background: GREY_BG, borderRadius: '12px', fontSize: '14px', color: TEXT, border: BORDER, fontWeight: '600' }}>
                  {profile?.full_name}
                </div>
              </div>
              <div>
                <label style={lbl}>Bio <span style={{ color: '#EF4444' }}>*</span></label>
                <textarea style={{ ...inp, height: '130px', resize: 'vertical' }} placeholder="Tell parents and learners about yourself, your teaching style, and what makes you a great tutor..." value={bio} onChange={e => setBio(e.target.value)}
                  onFocus={e => e.target.style.borderColor = BLUE} onBlur={e => e.target.style.borderColor = GREY_LIGHT} />
                <p style={{ fontSize: '12px', color: TEXT_MUTED, marginTop: '5px' }}>{bio.length}/500 characters</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={lbl}>Years of experience</label>
                  <input style={inp} type="number" min="0" max="50" placeholder="e.g. 5" value={yearsExperience} onChange={e => setYearsExperience(e.target.value)}
                    onFocus={e => e.target.style.borderColor = BLUE} onBlur={e => e.target.style.borderColor = GREY_LIGHT} />
                </div>
                <div>
                  <label style={lbl}>Languages spoken</label>
                  <input style={inp} placeholder="English, Twi, French..." value={languages} onChange={e => setLanguages(e.target.value)}
                    onFocus={e => e.target.style.borderColor = BLUE} onBlur={e => e.target.style.borderColor = GREY_LIGHT} />
                </div>
              </div>
              <div>
                <label style={lbl}>Teaching levels</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '14px', border: BORDER, borderRadius: '14px', background: GREY_BG }}>
                  {LEVELS.map(level => (
                    <label key={level} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', cursor: 'pointer', padding: '8px 16px', borderRadius: '50px', background: teachingLevels.includes(level) ? BLUE : '#fff', color: teachingLevels.includes(level) ? '#fff' : TEXT_MUTED, border: `1px solid ${teachingLevels.includes(level) ? BLUE : GREY_LIGHT}`, fontWeight: teachingLevels.includes(level) ? '700' : '400', transition: TRANSITION, boxShadow: teachingLevels.includes(level) ? SHADOW_BLUE : 'none' }}>
                      <input type="checkbox" checked={teachingLevels.includes(level)} onChange={() => toggleLevel(level)} style={{ display: 'none' }} />
                      {level}
                    </label>
                  ))}
                </div>
              </div>
              <button onClick={saveStep1} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>
                {saving ? '⏳ Saving...' : 'Continue — Teaching details →'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, overflow: 'hidden', boxShadow: SHADOW_LG }}>
            <div style={{ background: GRADIENT_HERO, padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.3)', color: YELLOW, fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 12px', borderRadius: '50px', marginBottom: '10px' }}>
                Step 2 of 5
              </div>
              <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', marginBottom: '4px', letterSpacing: '-0.01em' }}>📚 What you teach</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: 0 }}>Select your subjects and set your hourly rate</p>
            </div>
            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={lbl}>Subjects <span style={{ color: '#EF4444' }}>*</span></label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '14px', border: BORDER, borderRadius: '14px', background: GREY_BG }}>
                  {SUBJECTS.map(s => (
                    <button key={s} type="button" onClick={() => toggleSubject(s)}
                      style={{ padding: '8px 16px', borderRadius: '50px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: subjects.includes(s) ? '700' : '400', background: subjects.includes(s) ? BLUE : '#fff', color: subjects.includes(s) ? '#fff' : TEXT_MUTED, border: `1px solid ${subjects.includes(s) ? BLUE : GREY_LIGHT}`, transition: TRANSITION, boxShadow: subjects.includes(s) ? SHADOW_BLUE : 'none' }}>
                      {s}
                    </button>
                  ))}
                </div>
                {subjects.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <span style={{ fontSize: '12px', background: LIGHT_BLUE, color: BLUE, padding: '3px 10px', borderRadius: '50px', fontWeight: '800' }}>
                      {subjects.length} subject{subjects.length !== 1 ? 's' : ''} selected
                    </span>
                    <button onClick={() => setSubjects([])} style={{ fontSize: '12px', color: TEXT_MUTED, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                      Clear all
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label style={lbl}>Hourly rate (GH₵)</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: TEXT_MUTED, fontWeight: '600', pointerEvents: 'none' }}>GH₵</div>
                  <input style={{ ...inp, paddingLeft: '52px' }} type="number" min="0" placeholder="80" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)}
                    onFocus={e => e.target.style.borderColor = BLUE} onBlur={e => e.target.style.borderColor = GREY_LIGHT} />
                </div>
                <p style={{ fontSize: '12px', color: TEXT_MUTED, marginTop: '5px' }}>Leave empty to discuss rates individually with each family</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(1)} style={btnGhost}>← Back</button>
                <button onClick={saveStep2} disabled={saving} style={{ ...btnPrimary, flex: 1, opacity: saving ? 0.7 : 1 }}>
                  {saving ? '⏳ Saving...' : 'Continue — Identity →'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, overflow: 'hidden', boxShadow: SHADOW_LG }}>
            <div style={{ background: 'linear-gradient(135deg, #166534 0%, #14532D 100%)', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 12px', borderRadius: '50px', marginBottom: '10px' }}>
                Step 3 of 5
              </div>
              <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', marginBottom: '4px', letterSpacing: '-0.01em' }}>🪪 Identity verification</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: 0 }}>Upload a government-issued ID to build trust with parents</p>
            </div>
            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {idUploaded ? (
                <div style={{ background: '#DCFCE7', borderRadius: '16px', padding: '2rem', border: '2px solid #BBF7D0', textAlign: 'center' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 1rem' }}>✓</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#166534', marginBottom: '4px' }}>ID document already uploaded</div>
                  <div style={{ fontSize: '13px', color: '#166534', opacity: 0.8 }}>You can proceed to the next step</div>
                </div>
              ) : (
                <>
                  <div style={{ background: LIGHT_BLUE, borderRadius: '12px', padding: '12px 16px', fontSize: '13px', color: BLUE, display: 'flex', gap: '8px', alignItems: 'flex-start', border: '1px solid rgba(37,99,235,0.15)', lineHeight: '1.6', fontWeight: '500' }}>
                    <span style={{ flexShrink: 0 }}>📋</span>
                    Accepted: National ID, Passport, Driver's License, Voter ID. All uploads are encrypted and only seen by our review team.
                  </div>
                  <div>
                    <label style={lbl}>Document type</label>
                    <select style={{ ...inp, cursor: 'pointer' }} value={idType} onChange={e => setIdType(e.target.value)}>
                      {["National ID", "Passport", "Driver's License", "Voter ID", "Police Clearance"].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Upload document</label>
                    <div style={{ border: `2px dashed ${idFile ? BLUE : GREY_LIGHT}`, borderRadius: '14px', padding: '1.5rem', textAlign: 'center', background: idFile ? LIGHT_BLUE : GREY_BG, transition: TRANSITION }}>
                      <div style={{ fontSize: '28px', marginBottom: '8px' }}>🪪</div>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setIdFile(e.target.files[0])} style={{ fontSize: '13px', color: TEXT, cursor: 'pointer' }} />
                      {idFile && <p style={{ fontSize: '12px', color: '#166534', marginTop: '8px', fontWeight: '700', marginBottom: 0 }}>📎 {idFile.name}</p>}
                      {!idFile && <p style={{ fontSize: '12px', color: TEXT_MUTED, marginTop: '6px', marginBottom: 0 }}>PDF, JPG, or PNG — max 10MB</p>}
                    </div>
                  </div>
                </>
              )}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(2)} style={btnGhost}>← Back</button>
                <button onClick={uploadId} disabled={uploading} style={{ ...btnPrimary, flex: 1, opacity: uploading ? 0.7 : 1 }}>
                  {uploading ? '⏳ Uploading...' : idUploaded ? 'Continue — Credentials →' : 'Upload & continue →'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, overflow: 'hidden', boxShadow: SHADOW_LG }}>
            <div style={{ background: GRADIENT_HERO, padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.3)', color: YELLOW, fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 12px', borderRadius: '50px', marginBottom: '10px' }}>
                Step 4 of 5
              </div>
              <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', marginBottom: '4px', letterSpacing: '-0.01em' }}>📋 Teaching credentials</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: 0 }}>Upload your teaching certificate or qualification</p>
            </div>
            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {certUploaded ? (
                <div style={{ background: '#DCFCE7', borderRadius: '16px', padding: '2rem', border: '2px solid #BBF7D0', textAlign: 'center' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 1rem' }}>✓</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#166534', marginBottom: '4px' }}>Certificate already uploaded</div>
                  <div style={{ fontSize: '13px', color: '#166534', opacity: 0.8 }}>You can proceed to the final step</div>
                </div>
              ) : (
                <>
                  <div style={{ background: LIGHT_BLUE, borderRadius: '12px', padding: '12px 16px', fontSize: '13px', color: BLUE, display: 'flex', gap: '8px', alignItems: 'flex-start', border: '1px solid rgba(37,99,235,0.15)', lineHeight: '1.6', fontWeight: '500' }}>
                    <span style={{ flexShrink: 0 }}>📋</span>
                    e.g. PGDE, B.Ed, Teaching License, WASSCE, university degree. You can add more certificates from your dashboard later.
                  </div>
                  <div>
                    <label style={lbl}>Certificate name <span style={{ color: '#EF4444' }}>*</span></label>
                    <input style={inp} placeholder="e.g. PGDE — University of Education, Winneba" value={certName} onChange={e => setCertName(e.target.value)}
                      onFocus={e => e.target.style.borderColor = BLUE} onBlur={e => e.target.style.borderColor = GREY_LIGHT} />
                  </div>
                  <div>
                    <label style={lbl}>Upload file</label>
                    <div style={{ border: `2px dashed ${certFile ? BLUE : GREY_LIGHT}`, borderRadius: '14px', padding: '1.5rem', textAlign: 'center', background: certFile ? LIGHT_BLUE : GREY_BG, transition: TRANSITION }}>
                      <div style={{ fontSize: '28px', marginBottom: '8px' }}>📄</div>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setCertFile(e.target.files[0])} style={{ fontSize: '13px', color: TEXT, cursor: 'pointer' }} />
                      {certFile && <p style={{ fontSize: '12px', color: '#166534', marginTop: '8px', fontWeight: '700', marginBottom: 0 }}>📎 {certFile.name}</p>}
                      {!certFile && <p style={{ fontSize: '12px', color: TEXT_MUTED, marginTop: '6px', marginBottom: 0 }}>PDF, JPG, or PNG — max 10MB</p>}
                    </div>
                  </div>
                </>
              )}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(3)} style={btnGhost}>← Back</button>
                <button onClick={uploadCert} disabled={uploading} style={{ ...btnPrimary, flex: 1, opacity: uploading ? 0.7 : 1 }}>
                  {uploading ? '⏳ Uploading...' : certUploaded ? 'Continue — Review →' : 'Upload & continue →'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, overflow: 'hidden', boxShadow: SHADOW_LG }}>
            <div style={{ background: 'linear-gradient(135deg, #FFD700 0%, #F59E0B 100%)', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.08)', pointerEvents: 'none' }} />
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.12)', color: DARK_BLUE, fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 12px', borderRadius: '50px', marginBottom: '10px' }}>
                Final step
              </div>
              <h2 style={{ color: DARK_BLUE, fontSize: '22px', fontWeight: '800', marginBottom: '4px', letterSpacing: '-0.01em' }}>🚀 Review & submit</h2>
              <p style={{ color: 'rgba(0,0,0,0.55)', fontSize: '13px', margin: 0 }}>Check your details before submitting for review</p>
            </div>
            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                ['👤', 'Name', profile?.full_name],
                ['✏️', 'Bio', bio || 'Not provided'],
                ['🏆', 'Experience', yearsExperience ? `${yearsExperience} years` : 'Not specified'],
                ['🗣️', 'Languages', languages || 'Not specified'],
                ['🎓', 'Teaching levels', teachingLevels.join(', ') || 'Not specified'],
                ['📚', 'Subjects', subjects.join(', ') || 'None selected'],
                ['💰', 'Hourly rate', hourlyRate ? `GH₵ ${hourlyRate}/hr` : 'Rate on request'],
                ['🪪', 'ID document', idUploaded ? '✅ Uploaded' : '❌ Missing'],
                ['📋', 'Certificate', certUploaded ? '✅ Uploaded' : '❌ Missing'],
              ].map(([icon, label, value]) => (
                <div key={label} style={{ display: 'flex', gap: '12px', padding: '12px 16px', background: GREY_BG, borderRadius: '12px', border: BORDER, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>{icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '3px' }}>{label}</div>
                    <div style={{ fontSize: '14px', color: TEXT, fontWeight: '600', wordBreak: 'break-word', lineHeight: '1.5' }}>{value}</div>
                  </div>
                </div>
              ))}

              <div style={{ background: '#FFFBEB', borderRadius: '14px', padding: '14px 16px', border: '1px solid #FDE68A', fontSize: '13px', color: '#854D0E', lineHeight: '1.7', display: 'flex', gap: '10px', alignItems: 'flex-start', marginTop: '6px' }}>
                <span style={{ flexShrink: 0, fontSize: '18px' }}>⚠️</span>
                By submitting you confirm all information is accurate and truthful. Our team will review your application within 24–48 hours and notify you by email.
              </div>

              {(!idUploaded || !certUploaded || subjects.length === 0) && (
                <div style={{ background: '#FEE2E2', borderRadius: '12px', padding: '12px 16px', border: '1px solid #FECACA', fontSize: '13px', color: '#991B1B', fontWeight: '600', display: 'flex', gap: '8px' }}>
                  <span>🚫</span>
                  <span>Please complete all required steps: {!subjects.length ? 'subjects, ' : ''}{!idUploaded ? 'ID document, ' : ''}{!certUploaded ? 'certificate' : ''}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button onClick={() => setStep(4)} style={btnGhost}>← Back</button>
                <button onClick={submitApplication} disabled={saving || !idUploaded || !certUploaded || subjects.length === 0}
                  style={{ ...btnPrimary, flex: 1, background: (!idUploaded || !certUploaded || subjects.length === 0) ? GREY_LIGHT : YELLOW, color: (!idUploaded || !certUploaded || subjects.length === 0) ? TEXT_MUTED : DARK_BLUE, boxShadow: (!idUploaded || !certUploaded || subjects.length === 0) ? 'none' : SHADOW_YELLOW, cursor: (!idUploaded || !certUploaded || subjects.length === 0) ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                  {saving ? '⏳ Submitting...' : '🚀 Submit application'}
                </button>
              </div>
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '1.5rem' }}>
          Your progress is saved automatically. You can close this page and come back anytime.
        </p>
      </div>
    </div>
  )
}

const lbl = { fontSize: '11px', fontWeight: '800', color: TEXT_MUTED, display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.07em' }
const inp = { width: '100%', padding: '12px 16px', border: `1px solid ${GREY_LIGHT}`, borderRadius: '12px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', background: '#fff', color: TEXT, boxSizing: 'border-box', transition: TRANSITION }
const btnPrimary = { padding: '14px 24px', background: GRADIENT_BLUE, color: '#fff', border: 'none', borderRadius: '50px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '800', boxShadow: SHADOW_BLUE, transition: TRANSITION, letterSpacing: '0.01em' }
const btnGhost = { padding: '14px 20px', background: '#fff', color: TEXT_MUTED, border: BORDER, borderRadius: '50px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600', transition: TRANSITION, flexShrink: 0 }