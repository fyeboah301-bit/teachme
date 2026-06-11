import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link, useParams } from 'react-router-dom'
import { BLUE, YELLOW, LIGHT_BLUE, GREY_BG, GREY_LIGHT, TEXT_MUTED } from '../styles/colors'

export default function VerifyCertificate() {
  const { code } = useParams()
  const [cert, setCert] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCert = async () => {
      const { data } = await supabase
        .from('course_certificates')
        .select('*, learner:learner_id (full_name), teacher:teacher_id (id, profiles (full_name))')
        .eq('certificate_code', code)
        .single()
      setCert(data)
      setLoading(false)
    }
    fetchCert()
  }, [code])

  return (
    <div style={{ minHeight: '100vh', background: GREY_BG, fontFamily: 'DM Sans, sans-serif' }}>

      {/* NAV */}
      <nav style={{ background: BLUE, padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '700', color: '#fff', textDecoration: 'none' }}>
          Teach<span style={{ color: YELLOW }}>Me</span>
        </Link>
      </nav>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '40px', marginBottom: '1rem' }}>🔍</div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: BLUE }}>Certificate Verification</h1>
          <p style={{ fontSize: '13px', color: TEXT_MUTED, marginTop: '6px' }}>Code: {code}</p>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: TEXT_MUTED }}>Verifying...</p>
        ) : !cert ? (
          <div style={{ background: '#FDECEA', borderRadius: '10px', padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '1rem' }}>❌</div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#C62828', marginBottom: '6px' }}>Certificate Not Found</h3>
            <p style={{ fontSize: '13px', color: '#C62828' }}>This certificate code does not exist in our records. It may be invalid or fraudulent.</p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '10px', border: `2px solid ${YELLOW}`, overflow: 'hidden' }}>
            <div style={{ background: '#E8F5E9', padding: '1rem 1.5rem', textAlign: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#2E7D32' }}>✅ VALID CERTIFICATE</span>
            </div>
            <div style={{ background: BLUE, padding: '1.25rem 1.5rem', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '700', color: '#fff' }}>Certificate of Completion</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>TeachMe — Verified. Trusted. Effective.</div>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  ['Awarded to', cert.learner?.full_name],
                  ['Subject', cert.subject],
                  ['Grade', `${cert.grade_label} (${cert.average_score}%)`],
                  ['Sessions/Assignments', cert.sessions_completed],
                  ['Issued by', cert.teacher?.profiles?.full_name],
                  ['Date issued', new Date(cert.issued_at).toLocaleDateString()],
                  ['Certificate code', cert.certificate_code],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${GREY_LIGHT}` }}>
                    <span style={{ fontSize: '13px', color: TEXT_MUTED }}>{label}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}