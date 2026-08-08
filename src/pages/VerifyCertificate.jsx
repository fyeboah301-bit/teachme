import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link, useParams } from 'react-router-dom'
import {
  BLUE, YELLOW, DARK_BLUE, LIGHT_BLUE, GREY_BG, GREY_LIGHT,
  TEXT, TEXT_MUTED, GRADIENT_BLUE, GRADIENT_HERO,
  SHADOW_LG, SHADOW_XL, SHADOW_YELLOW, TRANSITION, BORDER,
} from '../styles/colors'
usePageMeta(cert ? `Verify Certificate — ${cert.certificate_code}` : 'Verify Certificate')

const gradeColor = (label) => {
  if (label === 'Distinction') return { color: '#854D0E', bg: '#FEF9C3', accent: '#F59E0B' }
  if (label === 'Merit')       return { color: '#1E40AF', bg: '#DBEAFE', accent: BLUE }
  if (label === 'Pass')        return { color: '#166534', bg: '#DCFCE7', accent: '#22C55E' }
  return { color: TEXT_MUTED, bg: GREY_BG, accent: '#94A3B8' }
}

export default function VerifyCertificate() {
  const { code } = useParams()
  const [cert, setCert] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

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

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const gc = cert ? gradeColor(cert.grade_label) : null

  return (
    <div style={{ minHeight: '100vh', background: GREY_BG, fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* NAV */}
      <nav style={{ background: GRADIENT_HERO, padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link to="/" style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '700', color: '#fff', textDecoration: 'none', letterSpacing: '-0.02em' }}>
          Teach<span style={{ color: YELLOW }}>Me</span>
        </Link>
        <Link to="/teachers" style={{ padding: '7px 16px', background: YELLOW, color: BLUE, borderRadius: '50px', fontSize: '13px', textDecoration: 'none', fontWeight: '700', boxShadow: SHADOW_YELLOW }}>
          Browse teachers
        </Link>
      </nav>

      {/* HERO */}
      <div style={{ background: GRADIENT_HERO, padding: '3rem 1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '160px', height: '160px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', margin: '0 auto 1rem' }}>
            🔍
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '700', color: '#fff', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Certificate Verification
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: '1.6' }}>
            Verify the authenticity of a TeachMe certificate
          </p>
          {code && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50px', padding: '6px 16px', marginTop: '14px' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Code</span>
              <span style={{ fontSize: '13px', fontFamily: 'monospace', color: '#fff', fontWeight: '700', letterSpacing: '0.05em' }}>{code}</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1.25rem', flex: 1, width: '100%', boxSizing: 'border-box' }}>

        {/* LOADING */}
        {loading && (
          <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, padding: '4rem 2rem', textAlign: 'center', boxShadow: SHADOW_LG }}>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '1.25rem' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: BLUE, animation: `dot 1.4s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
            <p style={{ fontSize: '15px', fontWeight: '600', color: TEXT, marginBottom: '6px' }}>Verifying certificate...</p>
            <p style={{ fontSize: '13px', color: TEXT_MUTED, margin: 0 }}>Checking our records</p>
            <style>{`@keyframes dot{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}`}</style>
          </div>
        )}

        {/* NOT FOUND */}
        {!loading && !cert && (
          <div style={{ background: '#fff', borderRadius: '20px', border: '2px solid #FECACA', overflow: 'hidden', boxShadow: SHADOW_LG }}>
            <div style={{ background: '#FEE2E2', padding: '1.5rem', textAlign: 'center', borderBottom: '1px solid #FECACA' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 1rem' }}>❌</div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#991B1B', marginBottom: '6px', letterSpacing: '-0.01em' }}>Certificate Not Found</h3>
              <p style={{ fontSize: '14px', color: '#991B1B', opacity: 0.85, margin: 0, lineHeight: '1.6' }}>
                This certificate code does not exist in our records. It may be invalid or fraudulent.
              </p>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: GREY_BG, borderRadius: '12px', padding: '14px 16px', border: BORDER, fontSize: '13px', color: TEXT_MUTED, lineHeight: '1.7' }}>
                <strong style={{ color: TEXT }}>What to check:</strong>
                <ul style={{ margin: '6px 0 0', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li>Make sure the code is typed correctly with no extra spaces</li>
                  <li>Certificate codes begin with "TM-" followed by 8 characters</li>
                  <li>The certificate may have been revoked by the issuing teacher</li>
                </ul>
              </div>
              <Link to="/" style={{ display: 'block', padding: '12px', background: GRADIENT_BLUE, color: '#fff', borderRadius: '50px', fontSize: '14px', textDecoration: 'none', fontWeight: '700', textAlign: 'center', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}>
                Return to TeachMe
              </Link>
            </div>
          </div>
        )}

        {/* VALID CERT */}
        {!loading && cert && (
          <div>
            {/* VALID BADGE */}
            <div style={{ background: '#DCFCE7', borderRadius: '14px', padding: '14px 20px', border: '2px solid #22C55E', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 16px rgba(34,197,94,0.15)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0, boxShadow: '0 4px 12px rgba(34,197,94,0.35)' }}>✓</div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#166534', letterSpacing: '-0.01em' }}>Valid Certificate</div>
                <div style={{ fontSize: '13px', color: '#166534', opacity: 0.8, marginTop: '2px' }}>This certificate is authentic and verified by TeachMe</div>
              </div>
            </div>

            {/* CERTIFICATE CARD */}
            <div style={{ background: '#fff', borderRadius: '20px', border: `2px solid ${YELLOW}`, overflow: 'hidden', boxShadow: `0 8px 32px rgba(255,215,0,0.15)` }}>

              {/* CERT HEADER */}
              <div style={{ background: GRADIENT_BLUE, padding: '1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(255,215,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 12px', border: '1px solid rgba(255,215,0,0.3)' }}>🏆</div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '700', color: '#fff', marginBottom: '4px', letterSpacing: '-0.01em' }}>
                  Certificate of Completion
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: '500', letterSpacing: '0.04em' }}>
                  TeachMe · Verified. Trusted. Effective.
                </div>
              </div>

              {/* LEARNER NAME */}
              <div style={{ padding: '1.5rem', textAlign: 'center', borderBottom: BORDER, background: GREY_BG }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>This certifies that</div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: '700', color: TEXT, letterSpacing: '-0.02em', lineHeight: '1.2' }}>
                  {cert.learner?.full_name}
                </div>
                <div style={{ fontSize: '14px', color: TEXT_MUTED, marginTop: '6px' }}>has successfully completed</div>
              </div>

              {/* SUBJECT + GRADE */}
              <div style={{ padding: '1.5rem', textAlign: 'center', borderBottom: BORDER }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '700', color: BLUE, marginBottom: '12px', letterSpacing: '-0.01em' }}>
                  {cert.subject}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: gc.bg, color: gc.color, padding: '7px 20px', borderRadius: '50px', fontSize: '14px', fontWeight: '800', border: `1px solid ${gc.accent}40` }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: gc.accent, flexShrink: 0 }} />
                  {cert.grade_label} — {cert.average_score}%
                </div>

                {/* SCORE BAR */}
                <div style={{ marginTop: '14px', maxWidth: '300px', margin: '14px auto 0' }}>
                  <div style={{ height: '7px', background: GREY_BG, borderRadius: '50px', overflow: 'hidden', border: BORDER }}>
                    <div style={{ height: '100%', width: `${cert.average_score}%`, background: gc.accent, borderRadius: '50px' }} />
                  </div>
                </div>
              </div>

              {/* DETAILS GRID */}
              <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  ['👩‍🏫', 'Issued by', cert.teacher?.profiles?.full_name],
                  ['📝', 'Assignments', `${cert.sessions_completed} completed`],
                  ['📅', 'Date issued', new Date(cert.issued_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })],
                  ['🔑', 'Certificate code', cert.certificate_code],
                ].map(([icon, label, value]) => (
                  <div key={label} style={{ background: GREY_BG, borderRadius: '12px', padding: '12px 14px', border: BORDER }}>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '5px' }}>{icon} {label}</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: TEXT, fontFamily: label === 'Certificate code' ? 'monospace' : 'inherit', letterSpacing: label === 'Certificate code' ? '0.05em' : 'normal', wordBreak: 'break-all' }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              {/* FOOTER ACTIONS */}
              <div style={{ padding: '1rem 1.5rem', borderTop: BORDER, background: GREY_BG, display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={copyLink}
                  style={{ flex: 1, padding: '11px', background: copied ? '#DCFCE7' : '#fff', color: copied ? '#166534' : BLUE, border: BORDER, borderRadius: '50px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700', transition: TRANSITION }}>
                  {copied ? '✓ Link copied!' : '🔗 Copy verification link'}
                </button>
                <Link to="/teachers"
                  style={{ flex: 1, padding: '11px', background: GRADIENT_BLUE, color: '#fff', borderRadius: '50px', fontSize: '13px', textDecoration: 'none', fontWeight: '700', textAlign: 'center', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}>
                  Find teachers →
                </Link>
              </div>
            </div>

            {/* TRUST NOTE */}
            <div style={{ background: LIGHT_BLUE, borderRadius: '14px', padding: '1rem 1.25rem', marginTop: '1.25rem', border: '1px solid rgba(37,99,235,0.15)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>🛡️</span>
              <p style={{ fontSize: '13px', color: BLUE, margin: 0, lineHeight: '1.7', fontWeight: '500' }}>
                This certificate was issued through TeachMe's verified tutoring platform. The teacher's credentials and teaching qualification were reviewed by our team before this certificate was issued.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: BORDER, padding: '1.25rem', textAlign: 'center', background: '#fff', marginTop: '2rem' }}>
        <Link to="/" style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '700', color: BLUE, textDecoration: 'none', letterSpacing: '-0.01em' }}>
          Teach<span style={{ color: YELLOW }}>Me</span>
        </Link>
        <p style={{ fontSize: '12px', color: TEXT_MUTED, marginTop: '6px', margin: '6px 0 0' }}>
          Ghana's trusted platform for verified home tutors
        </p>
      </div>
    </div>
  )
}