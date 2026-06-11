import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BLUE, YELLOW, LIGHT_BLUE, GREY_BG, GREY_LIGHT, TEXT_MUTED } from '../styles/colors'

export default function TeacherProfile() {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const [teacher, setTeacher] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchTeacher() }, [id])

  const fetchTeacher = async () => {
  const { data } = await supabase
    .from('teachers')
    .select(`*, profiles (full_name, city, country), certificates (certificate_name, status), pitch_videos (title, video_url), reviews (rating, comment, created_at, profiles:reviewer_id (full_name))`)
    .eq('id', id)
    .single()
  setTeacher(data)
  setLoading(false)
}

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: TEXT_MUTED }}>Loading...</div>
  if (!teacher) return <div style={{ padding: '3rem', textAlign: 'center', color: TEXT_MUTED }}>Teacher not found.</div>

  return (
    <div style={{ minHeight: '100vh', background: GREY_BG, fontFamily: 'DM Sans, sans-serif' }}>

      {/* NAV */}
      <nav style={{ background: BLUE, padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '700', color: '#fff', textDecoration: 'none' }}>
          Teach<span style={{ color: YELLOW }}>Me</span>
        </Link>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/teachers" style={{ padding: '8px 18px', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', borderRadius: '5px', fontSize: '13px', textDecoration: 'none' }}>← Back to teachers</Link>
          {user ? (
            <Link to="/dashboard" style={{ padding: '8px 18px', background: YELLOW, color: BLUE, borderRadius: '5px', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>Dashboard</Link>
          ) : (
            <Link to="/login" style={{ padding: '8px 18px', background: YELLOW, color: BLUE, borderRadius: '5px', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>Log in</Link>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem' }}>

        {/* PROFILE HEADER */}
        <div style={{ background: BLUE, borderRadius: '10px', padding: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ width: '76px', height: '76px', borderRadius: '50%', background: YELLOW, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700', color: BLUE, flexShrink: 0 }}>
            {teacher.profiles?.full_name?.charAt(0)}
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '600', color: '#fff' }}>{teacher.profiles?.full_name}</h1>
              {teacher.is_verified && <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '3px 10px', borderRadius: '20px' }}>✓ Verified</span>}
            </div>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>📍 {teacher.profiles?.city}, {teacher.profiles?.country}</p>
            {teacher.subjects && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                {teacher.subjects.map(s => (
                  <span key={s} style={{ fontSize: '12px', background: YELLOW, color: BLUE, padding: '3px 12px', borderRadius: '20px', fontWeight: '600' }}>{s}</span>
                ))}
              </div>
            )}
            {teacher.reviews && teacher.reviews.length > 0 && (
  <p style={{ fontSize: '13px', color: YELLOW, marginTop: '8px', fontWeight: '600' }}>
    ⭐ {(teacher.reviews.reduce((sum, r) => sum + r.rating, 0) / teacher.reviews.length).toFixed(1)} average · {teacher.reviews.length} review{teacher.reviews.length !== 1 ? 's' : ''}
  </p>
)}
          </div>
          {teacher.hourly_rate > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: '700', color: YELLOW }}>GH₵ {teacher.hourly_rate}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>per hour</div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Pitch Videos */}
            {teacher.pitch_videos && teacher.pitch_videos.length > 0 && (
              <div style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, overflow: 'hidden' }}>
                <div style={{ background: BLUE, padding: '1rem 1.5rem' }}>
                  <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '500' }}>🎬 Teaching pitch videos</h3>
                </div>
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {teacher.pitch_videos.map((vid, i) => (
                    <div key={i} style={{ background: GREY_BG, borderRadius: '8px', overflow: 'hidden' }}>
                      <video controls style={{ width: '100%', display: 'block', maxHeight: '160px', background: '#000' }} src={vid.video_url} />
                      <div style={{ padding: '8px 12px', fontSize: '13px', fontWeight: '500' }}>{vid.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verified Certificates */}
            {teacher.certificates && teacher.certificates.filter(c => c.status === 'approved').length > 0 && (
              <div style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, overflow: 'hidden' }}>
                <div style={{ background: BLUE, padding: '1rem 1.5rem' }}>
                  <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '500' }}>📋 Verified certificates</h3>
                </div>
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {teacher.certificates.filter(c => c.status === 'approved').map((cert, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: GREY_BG, borderRadius: '7px' }}>
                      <span style={{ fontSize: '20px' }}>📄</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: '500' }}>{cert.certificate_name}</div>
                      </div>
                      <span style={{ fontSize: '11px', background: '#E8F5E9', color: '#2E7D32', padding: '2px 8px', borderRadius: '20px' }}>✓ Verified</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!teacher.pitch_videos || teacher.pitch_videos.length === 0) && (!teacher.certificates || teacher.certificates.filter(c => c.status === 'approved').length === 0) && (
              <div style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, padding: '2rem', textAlign: 'center', color: TEXT_MUTED, fontSize: '13px' }}>
                This teacher hasn't uploaded any pitch videos or verified certificates yet.
              </div>
            )}
            {teacher.reviews && teacher.reviews.length > 0 && (
  <div style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, overflow: 'hidden' }}>
    <div style={{ background: BLUE, padding: '1rem 1.5rem' }}>
      <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '500' }}>⭐ Reviews</h3>
    </div>
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {teacher.reviews.map((r, i) => (
        <div key={i} style={{ paddingBottom: '12px', borderBottom: i < teacher.reviews.length - 1 ? `1px solid ${GREY_LIGHT}` : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '13px', fontWeight: '500' }}>{r.profiles?.full_name}</span>
            <span style={{ fontSize: '13px', color: '#FFD700' }}>{'⭐'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
          </div>
          {r.comment && <p style={{ fontSize: '12px', color: TEXT_MUTED }}>{r.comment}</p>}
          <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>{new Date(r.created_at).toLocaleDateString()}</div>
        </div>
      ))}
    </div>
  </div>
)}
          </div>

          {/* RIGHT COLUMN — BOOKING */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, overflow: 'hidden' }}>
              <div style={{ background: YELLOW, padding: '1rem 1.5rem' }}>
                <h3 style={{ color: BLUE, fontSize: '15px', fontWeight: '700' }}>📅 Book home tuition</h3>
                <p style={{ color: BLUE, fontSize: '12px', marginTop: '3px', opacity: 0.8 }}>All communication happens inside TeachMe</p>
              </div>
              <div style={{ padding: '1.25rem' }}>
                {user ? (
                  profile?.role !== 'teacher' ? (
                    <div>
                      <p style={{ fontSize: '13px', color: TEXT_MUTED, marginBottom: '1rem', lineHeight: '1.6' }}>
                        Send a booking request to <strong>{teacher.profiles?.full_name}</strong>. Your contact details stay private until the booking is confirmed.
                      </p>
                      <Link to="/booking" style={{ display: 'block', padding: '12px', background: BLUE, color: '#fff', borderRadius: '6px', fontSize: '14px', textDecoration: 'none', textAlign: 'center', fontWeight: '500' }}>
                        Send booking request
                      </Link>
                    </div>
                  ) : (
                    <p style={{ fontSize: '13px', color: TEXT_MUTED }}>Teachers cannot book other teachers.</p>
                  )
                ) : (
                  <div>
                    <p style={{ fontSize: '13px', color: TEXT_MUTED, marginBottom: '1rem' }}>Log in to book this teacher.</p>
                    <Link to="/login" style={{ display: 'block', padding: '12px', background: BLUE, color: '#fff', borderRadius: '6px', fontSize: '14px', textDecoration: 'none', textAlign: 'center', fontWeight: '500' }}>
                      Log in to book
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Live Sessions Link */}
            <div style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, padding: '1.25rem' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '500', color: BLUE, marginBottom: '8px' }}>🎥 Live sessions</h4>
              <p style={{ fontSize: '12px', color: TEXT_MUTED, marginBottom: '10px' }}>Check if this teacher has upcoming live sessions you can enroll in.</p>
              <Link to="/sessions" style={{ display: 'block', padding: '10px', border: `1px solid ${GREY_LIGHT}`, borderRadius: '6px', fontSize: '13px', textDecoration: 'none', textAlign: 'center', color: BLUE, fontWeight: '500' }}>
                View live sessions
              </Link>
            </div>

            {/* Privacy notice */}
            <div style={{ background: LIGHT_BLUE, borderRadius: '10px', padding: '1.25rem', border: `1px solid ${GREY_LIGHT}` }}>
              <h4 style={{ fontSize: '14px', fontWeight: '500', color: BLUE, marginBottom: '8px' }}>🔒 Your privacy is protected</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  'Personal contact details are never shared',
                  'All communication stays on TeachMe',
                  'Payments are processed securely',
                  'Dispute resolution available on-platform'
                ].map((item, i) => (
                  <li key={i} style={{ fontSize: '12px', color: BLUE, display: 'flex', gap: '6px' }}>
                    <span>✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}