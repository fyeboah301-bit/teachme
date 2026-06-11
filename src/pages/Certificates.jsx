import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BLUE, YELLOW, LIGHT_BLUE, GREY_BG, GREY_LIGHT, TEXT_MUTED } from '../styles/colors'

const gradeLabel = (avg) => {
  if (avg >= 80) return 'Distinction'
  if (avg >= 70) return 'Merit'
  if (avg >= 60) return 'Pass'
  return 'Not eligible'
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return 'TM-' + code
}

export default function Certificates() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
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
      // find learners with assignments, group by subject, calculate average
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

          // check if already issued
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

  return (
    <div style={{ minHeight: '100vh', background: GREY_BG, fontFamily: 'DM Sans, sans-serif' }}>

      {/* NAV */}
      <nav style={{ background: BLUE, padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '700', color: '#fff', textDecoration: 'none' }}>
          Teach<span style={{ color: YELLOW }}>Me</span>
        </Link>
        <Link to="/dashboard" style={{ padding: '8px 18px', background: YELLOW, color: BLUE, borderRadius: '5px', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>Dashboard</Link>
      </nav>

      <div style={{ background: BLUE, padding: '2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: '#fff', marginBottom: '6px' }}>Certificates of Completion</h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
            {profile?.role === 'teacher' ? 'Issue verified certificates to your students' : 'Your earned certificates'}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        {message && (
          <div style={{ background: message.startsWith('✅') ? '#E8F5E9' : LIGHT_BLUE, color: message.startsWith('✅') ? '#2E7D32' : BLUE, padding: '12px 16px', borderRadius: '8px', fontSize: '13px', marginBottom: '1.5rem' }}>
            {message}
          </div>
        )}

        {/* ELIGIBLE TO ISSUE (TEACHER ONLY) */}
        {profile?.role === 'teacher' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '500', color: BLUE, marginBottom: '0.75rem' }}>Eligible for certificate</h2>
            {loading ? (
              <p style={{ fontSize: '13px', color: TEXT_MUTED }}>Loading...</p>
            ) : eligible.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, padding: '1.5rem', textAlign: 'center', color: TEXT_MUTED, fontSize: '13px' }}>
                No students currently eligible. A certificate becomes available once a student averages 60% or higher across graded assignments in a subject.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {eligible.map(item => (
                  <div key={`${item.learner_id}|${item.subject}`} style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.learner_name} — {item.subject}</div>
                      <div style={{ fontSize: '12px', color: TEXT_MUTED }}>Average: {item.average}% ({gradeLabel(item.average)}) · {item.gradesCount} graded assignment(s)</div>
                    </div>
                    <button onClick={() => issueCertificate(item)} disabled={issuing === `${item.learner_id}|${item.subject}`} style={{ padding: '8px 18px', background: BLUE, color: '#fff', border: 'none', borderRadius: '5px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>
                      {issuing === `${item.learner_id}|${item.subject}` ? 'Issuing...' : '🏆 Issue certificate'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ISSUED CERTIFICATES */}
        <h2 style={{ fontSize: '16px', fontWeight: '500', color: BLUE, marginBottom: '0.75rem' }}>
          {profile?.role === 'teacher' ? 'Issued certificates' : 'Your certificates'}
        </h2>
        {certificates.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, padding: '2rem', textAlign: 'center', color: TEXT_MUTED }}>
            <div style={{ fontSize: '40px', marginBottom: '1rem' }}>🏆</div>
            <p style={{ fontSize: '13px' }}>No certificates yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {certificates.map(cert => (
              <div key={cert.id} style={{ background: '#fff', borderRadius: '10px', border: `2px solid ${YELLOW}`, overflow: 'hidden' }}>
                <div style={{ background: BLUE, padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '700', color: '#fff' }}>Certificate of Completion</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>TeachMe — Verified. Trusted. Effective.</div>
                  </div>
                  <div style={{ fontSize: '32px' }}>🏆</div>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: TEXT_MUTED, textTransform: 'uppercase', marginBottom: '2px' }}>Awarded to</div>
                      <div style={{ fontSize: '15px', fontWeight: '600' }}>{cert.learner?.full_name}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: TEXT_MUTED, textTransform: 'uppercase', marginBottom: '2px' }}>Subject</div>
                      <div style={{ fontSize: '15px', fontWeight: '600' }}>{cert.subject}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: TEXT_MUTED, textTransform: 'uppercase', marginBottom: '2px' }}>Grade</div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: BLUE }}>{cert.grade_label} ({cert.average_score}%)</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: TEXT_MUTED, textTransform: 'uppercase', marginBottom: '2px' }}>Issued by</div>
                      <div style={{ fontSize: '15px', fontWeight: '600' }}>{cert.teacher?.profiles?.full_name}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: `1px solid ${GREY_LIGHT}` }}>
                    <div style={{ fontSize: '12px', color: TEXT_MUTED }}>
                      Issued: {new Date(cert.issued_at).toLocaleDateString()} · Code: <strong>{cert.certificate_code}</strong>
                    </div>
                    <Link to={`/verify/${cert.certificate_code}`} style={{ fontSize: '12px', color: BLUE, fontWeight: '500' }}>
                      Verify online ↗
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}