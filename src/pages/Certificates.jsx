import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  BLUE, YELLOW, DARK_BLUE, LIGHT_BLUE, GREY_BG, GREY_LIGHT,
  TEXT, TEXT_MUTED, GRADIENT_BLUE, GRADIENT_HERO,
  SHADOW_LG, SHADOW_XL, SHADOW_BLUE, SHADOW_YELLOW,
  TRANSITION, BORDER,
} from '../styles/colors'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import certificatesImg from '../assets/images/certificates.png'
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

const gradeLabel = (avg) => {
  if (avg >= 80) return 'Distinction'
  if (avg >= 70) return 'Merit'
  if (avg >= 60) return 'Pass'
  return 'Not eligible'
}

const gradeColor = (label) => {
  if (label === 'Distinction') return { bg: '#FEF9C3', color: '#854D0E', accent: '#F59E0B' }
  if (label === 'Merit') return { bg: '#DBEAFE', color: '#1E40AF', accent: BLUE }
  if (label === 'Pass') return { bg: '#DCFCE7', color: '#166534', accent: '#22C55E' }
  return { bg: GREY_BG, color: TEXT_MUTED, accent: '#94A3B8' }
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return 'TM-' + code
}

export default function Certificates() {
  usePageMeta('Certificates')

  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [certificates, setCertificates] = useState([])
  const [eligible, setEligible] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [issuing, setIssuing] = useState(null)

  useEffect(() => {
    if (!user) navigate('/login')
    else fetchData()
  }, [user])

  const fetchData = async () => {
    const { data: certs } = await supabase
      .from('course_certificates')
      .select('*, learner:learner_id (full_name), teacher:teacher_id (id, profiles (full_name))')
      .or(profile?.role === 'teacher' ? `teacher_id.eq.${user.id}` : `learner_id.eq.${user.id}`)
      .order('issued_at', { ascending: false })
    setCertificates(certs || [])

    if (profile?.role === 'teacher') {
      const { data: assignments } = await supabase
        .from('assignments')
        .select('id, learner_id, subject, max_score, profiles:learner_id (full_name)')
        .eq('teacher_id', user.id)

      const groups = {}
      for (const a of assignments || []) {
        const key = `${a.learner_id}|${a.subject}`
        if (!groups[key]) groups[key] = { learner_id: a.learner_id, learner_name: a.profiles?.full_name, subject: a.subject, assignmentIds: [], maxScores: [] }
        groups[key].assignmentIds.push(a.id)
        groups[key].maxScores.push(a.max_score)
      }

      const eligibleList = []
      for (const key in groups) {
        const g = groups[key]
        const { data: subs } = await supabase
          .from('submissions')
          .select('score, assignment_id')
          .in('assignment_id', g.assignmentIds)
          .not('score', 'is', null)

        if (subs && subs.length >= 1) {
          const percentages = subs.map(s => {
            const idx = g.assignmentIds.indexOf(s.assignment_id)
            const max = g.maxScores[idx] || 100
            return (s.score / max) * 100
          })
          const avg = percentages.reduce((a, b) => a + b, 0) / percentages.length
          const already = certs?.find(c => c.learner_id === g.learner_id && c.subject === g.subject)
          if (avg >= 60 && !already) {
            eligibleList.push({ ...g, average: avg.toFixed(1), gradesCount: subs.length })
          }
        }
      }
      setEligible(eligibleList)
    }
    setLoading(false)
  }

  const issueCertificate = async (item) => {
    setIssuing(`${item.learner_id}|${item.subject}`)
    try {
      const { error } = await supabase.from('course_certificates').insert({
        certificate_code: generateCode(),
        learner_id: item.learner_id,
        teacher_id: user.id,
        subject: item.subject,
        sessions_completed: item.gradesCount,
        average_score: parseFloat(item.average),
        grade_label: gradeLabel(item.average)
      })
      if (error) throw error
      setMessage(`✅ Certificate issued to ${item.learner_name} for ${item.subject}!`)
      fetchData()
    } catch (err) {
      setMessage('Error: ' + err.message)
    } finally {
      setIssuing(null)
    }
  }

  const isTeacher = profile?.role === 'teacher'

  return (
    <div style={{ minHeight: '100vh', background: GREY_BG, fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <NavBar />

      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img src={certificatesImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(15,43,107,0.97) 0%, rgba(26,63,160,0.92) 50%, rgba(37,99,235,0.55) 100%)', zIndex: 1 }} />
        <div style={{ position: 'relative', zIndex: 2, padding: isMobile ? '2.5rem 1.25rem' : '3.5rem 2.5rem', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.3)', color: YELLOW, fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 14px', borderRadius: '50px', marginBottom: '12px' }}>
                🏆 {isTeacher ? 'Certificate management' : 'My certificates'}
              </div>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? '28px' : '42px', color: '#fff', marginBottom: '8px', fontWeight: '700', letterSpacing: '-0.02em', lineHeight: '1.15' }}>
                Certificates of Completion
              </h1>
              <p style={{ fontSize: isMobile ? '14px' : '16px', color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: '1.6', maxWidth: '480px' }}>
                {isTeacher ? 'Issue verified certificates to students who have earned them through graded assignments' : 'Your verified certificates earned through TeachMe courses'}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isTeacher ? 'repeat(2, 1fr)' : '200px', gap: '10px' }}>
            {isTeacher && (
              <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)', borderRadius: '14px', padding: isMobile ? '1rem' : '1.25rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.15)' }}>
                <div style={{ fontSize: isMobile ? '22px' : '26px', marginBottom: '6px' }}>🎯</div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: YELLOW, lineHeight: 1 }}>{eligible.length}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', marginTop: '5px', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: '600' }}>Eligible</div>
              </div>
            )}
            <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)', borderRadius: '14px', padding: isMobile ? '1rem' : '1.25rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ fontSize: isMobile ? '22px' : '26px', marginBottom: '6px' }}>🏆</div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: YELLOW, lineHeight: 1 }}>{certificates.length}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', marginTop: '5px', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: '600' }}>
                {isTeacher ? 'Issued' : 'Earned'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '1.25rem' : '2rem', flex: 1, width: '100%', boxSizing: 'border-box' }}>

        {message && (
          <div style={{ background: message.startsWith('✅') ? '#DCFCE7' : '#FEE2E2', color: message.startsWith('✅') ? '#166534' : '#991B1B', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <span style={{ flex: 1 }}>{message}</span>
            <button onClick={() => setMessage('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'inherit', opacity: 0.6, padding: 0 }}>×</button>
          </div>
        )}

        {isTeacher && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: TEXT, margin: 0, letterSpacing: '-0.01em' }}>Eligible for certificate</h2>
              {eligible.length > 0 && (
                <span style={{ fontSize: '12px', background: GRADIENT_BLUE, color: '#fff', padding: '2px 10px', borderRadius: '50px', fontWeight: '800', boxShadow: SHADOW_BLUE }}>{eligible.length}</span>
              )}
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[1, 2].map(i => (
                  <div key={i} style={{ background: '#fff', borderRadius: '16px', border: BORDER, padding: '1.25rem', height: '80px', animation: 'pulse 1.5s infinite' }} />
                ))}
                <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
              </div>
            ) : eligible.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, padding: '3rem 2rem', textAlign: 'center', boxShadow: SHADOW_LG }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: LIGHT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', margin: '0 auto 1rem' }}>🎯</div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: TEXT, marginBottom: '8px', letterSpacing: '-0.01em' }}>No eligible students yet</h3>
                <p style={{ fontSize: '14px', color: TEXT_MUTED, maxWidth: '380px', margin: '0 auto', lineHeight: '1.7' }}>
                  A certificate becomes available once a student averages 60% or higher across graded assignments in a subject.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {eligible.map(item => {
                  const label = gradeLabel(item.average)
                  const gc = gradeColor(label)
                  const key = `${item.learner_id}|${item.subject}`
                  return (
                    <div key={key} style={{ background: '#fff', borderRadius: '16px', border: BORDER, padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: SHADOW_LG, transition: TRANSITION }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = SHADOW_BLUE; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.2)' }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = SHADOW_LG; e.currentTarget.style.borderColor = GREY_LIGHT }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: gc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>🏆</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '16px', fontWeight: '800', color: TEXT, marginBottom: '4px', letterSpacing: '-0.01em' }}>
                            {item.learner_name}
                            <span style={{ fontSize: '13px', fontWeight: '500', color: TEXT_MUTED, marginLeft: '8px' }}>in {item.subject}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', background: gc.bg, color: gc.color, padding: '3px 10px', borderRadius: '50px', fontWeight: '800' }}>
                              {label} · {item.average}%
                            </span>
                            <span style={{ fontSize: '12px', color: TEXT_MUTED }}>
                              {item.gradesCount} graded assignment{item.gradesCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => issueCertificate(item)} disabled={issuing === key}
                        style={{ padding: '11px 22px', background: issuing === key ? GREY_BG : GRADIENT_BLUE, color: issuing === key ? TEXT_MUTED : '#fff', border: 'none', borderRadius: '50px', fontSize: '13px', cursor: issuing === key ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: '800', boxShadow: issuing === key ? 'none' : SHADOW_BLUE, transition: TRANSITION, flexShrink: 0 }}>
                        {issuing === key ? '⏳ Issuing...' : '🏆 Issue certificate'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: TEXT, margin: 0, letterSpacing: '-0.01em' }}>
              {isTeacher ? 'Issued certificates' : 'Your certificates'}
            </h2>
            {certificates.length > 0 && (
              <span style={{ fontSize: '12px', background: GREY_BG, color: TEXT_MUTED, padding: '2px 10px', borderRadius: '50px', fontWeight: '700', border: BORDER }}>
                {certificates.length}
              </span>
            )}
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1.25rem' }}>
              {[1, 2].map(i => (
                <div key={i} style={{ background: '#fff', borderRadius: '20px', border: BORDER, height: '280px', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : certificates.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, padding: '5rem 2rem', textAlign: 'center', boxShadow: SHADOW_LG }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: LIGHT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '38px', margin: '0 auto 1.25rem' }}>🏆</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: TEXT, marginBottom: '8px', letterSpacing: '-0.01em' }}>No certificates yet</h3>
              <p style={{ fontSize: '14px', color: TEXT_MUTED, lineHeight: '1.7', maxWidth: '320px', margin: '0 auto' }}>
                {isTeacher ? 'Issue your first certificate to a student who has earned it.' : 'Complete assignments and earn a 60% average to unlock your first certificate.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1.25rem' }}>
              {certificates.map(cert => {
                const gc = gradeColor(cert.grade_label)
                return (
                  <div key={cert.id}
                    style={{ background: '#fff', borderRadius: '20px', border: `2px solid ${YELLOW}`, overflow: 'hidden', boxShadow: `0 4px 20px rgba(255,215,0,0.12)`, transition: TRANSITION }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 32px rgba(255,215,0,0.2)` }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 20px rgba(255,215,0,0.12)` }}
                  >
                    <div style={{ background: GRADIENT_BLUE, padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontFamily: 'Georgia, serif', fontSize: '17px', fontWeight: '700', color: '#fff', marginBottom: '4px', letterSpacing: '-0.01em' }}>
                          Certificate of Completion
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: '500', letterSpacing: '0.04em' }}>
                          TeachMe · Verified. Trusted. Effective.
                        </div>
                      </div>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,215,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', flexShrink: 0, border: '1px solid rgba(255,215,0,0.3)' }}>
                        🏆
                      </div>
                    </div>

                    <div style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: gc.bg, color: gc.color, padding: '5px 14px', borderRadius: '50px', fontSize: '13px', fontWeight: '800', marginBottom: '1.25rem', border: `1px solid ${gc.accent}40` }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: gc.accent, flexShrink: 0 }} />
                        {cert.grade_label} — {cert.average_score}%
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                        {[
                          ['Awarded to', cert.learner?.full_name],
                          ['Subject', cert.subject],
                          ['Issued by', cert.teacher?.profiles?.full_name],
                          ['Assignments', `${cert.sessions_completed} completed`],
                        ].map(([label, value]) => (
                          <div key={label}>
                            <div style={{ fontSize: '10px', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: '700', marginBottom: '4px' }}>{label}</div>
                            <div style={{ fontSize: '15px', fontWeight: '700', color: TEXT, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ fontSize: '11px', color: TEXT_MUTED, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Average score</span>
                          <span style={{ fontSize: '13px', fontWeight: '800', color: gc.color }}>{cert.average_score}%</span>
                        </div>
                        <div style={{ height: '7px', background: GREY_BG, borderRadius: '50px', overflow: 'hidden', border: BORDER }}>
                          <div style={{ height: '100%', width: `${cert.average_score}%`, background: gc.accent, borderRadius: '50px', transition: 'width 0.6s ease' }} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: BORDER, flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: TEXT_MUTED, fontWeight: '500' }}>
                            Issued {new Date(cert.issued_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                          <div style={{ fontSize: '12px', color: TEXT_MUTED, fontFamily: 'monospace', fontWeight: '600', marginTop: '2px', letterSpacing: '0.05em' }}>
                            {cert.certificate_code}
                          </div>
                        </div>
                        <Link to={`/verify/${cert.certificate_code}`}
                          style={{ fontSize: '13px', color: BLUE, fontWeight: '700', textDecoration: 'none', background: LIGHT_BLUE, padding: '7px 16px', borderRadius: '50px', border: '1px solid rgba(37,99,235,0.2)', transition: TRANSITION }}>
                          Verify online ↗
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {!isTeacher && certificates.length === 0 && !loading && (
          <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, padding: isMobile ? '1.5rem' : '2rem', marginTop: '1.5rem', boxShadow: SHADOW_LG }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: TEXT, marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>💡 How to earn a certificate</h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1rem' }}>
              {[
                { step: '1', icon: '📝', title: 'Complete assignments', desc: 'Your teacher assigns graded work across sessions' },
                { step: '2', icon: '⭐', title: 'Score 60% or above', desc: 'Average 60%+ across all graded assignments in a subject' },
                { step: '3', icon: '🏆', title: 'Receive your certificate', desc: 'Your teacher issues a verified digital certificate' },
              ].map(({ step, icon, title, desc }) => (
                <div key={step} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '1rem', background: GREY_BG, borderRadius: '14px', border: BORDER }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: LIGHT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: TEXT, marginBottom: '4px', letterSpacing: '-0.01em' }}>{title}</div>
                    <div style={{ fontSize: '13px', color: TEXT_MUTED, lineHeight: '1.6' }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}