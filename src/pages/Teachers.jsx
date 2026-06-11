import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import { BLUE, YELLOW, LIGHT_BLUE, GREY_BG, GREY_LIGHT, TEXT_MUTED } from '../styles/colors'

const subjects = ['All', 'Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'ICT', 'French', 'Economics', 'History', 'Geography']

export default function Teachers() {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => { fetchTeachers() }, [])

  const fetchTeachers = async () => {
  const { data, error } = await supabase
    .from('teachers')
    .select(`*, profiles (full_name, city, country, email), certificates (certificate_name, status), pitch_videos (title, video_url), reviews (rating)`)
  if (error) console.log(error)
  else setTeachers(data || [])
  setLoading(false)
}

  const filtered = teachers.filter(t => {
    const matchesSubject = selectedSubject === 'All' || (t.subjects && t.subjects.includes(selectedSubject))
    const matchesSearch = search === '' || t.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
    return matchesSubject && matchesSearch
  })

  return (
    <div style={{ minHeight: '100vh', background: GREY_BG, fontFamily: 'DM Sans, sans-serif' }}>

      {/* NAV */}
      <nav style={{ background: BLUE, padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '700', color: '#fff', textDecoration: 'none' }}>
          Teach<span style={{ color: YELLOW }}>Me</span>
        </Link>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/sessions" style={{ padding: '8px 18px', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', borderRadius: '5px', fontSize: '13px', textDecoration: 'none' }}>Live sessions</Link>
          <Link to="/login" style={{ padding: '8px 18px', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', borderRadius: '5px', fontSize: '13px', textDecoration: 'none' }}>Log in</Link>
          <Link to="/register" style={{ padding: '8px 18px', background: YELLOW, color: BLUE, borderRadius: '5px', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>Get started</Link>
        </div>
      </nav>

      {/* SEARCH HEADER */}
      <div style={{ background: BLUE, padding: '2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: '#fff', marginBottom: '1rem' }}>Find a teacher</h1>
          <input
            style={{ width: '100%', padding: '12px 16px', borderRadius: '6px', border: 'none', fontSize: '15px', fontFamily: 'inherit', outline: 'none', marginBottom: '1rem' }}
            placeholder="Search by teacher name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {subjects.map(s => (
              <button key={s} onClick={() => setSelectedSubject(s)} style={{ padding: '6px 16px', borderRadius: '20px', border: 'none', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', background: selectedSubject === s ? YELLOW : 'rgba(255,255,255,0.15)', color: selectedSubject === s ? BLUE : '#fff', fontWeight: selectedSubject === s ? '600' : '400' }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TEACHERS LIST */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: TEXT_MUTED, padding: '3rem' }}>Loading teachers...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: TEXT_MUTED, padding: '3rem' }}>
            <div style={{ fontSize: '40px', marginBottom: '1rem' }}>🔍</div>
            <p>No teachers found. Try a different subject or search term.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map(teacher => (
              <div key={teacher.id} style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '1.25rem', alignItems: 'start' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '600', color: '#fff', flexShrink: 0 }}>
                    {teacher.profiles?.full_name?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '500' }}>{teacher.profiles?.full_name}</h3>
                      {teacher.is_verified && (
                        <span style={{ fontSize: '11px', background: '#E8F5E9', color: '#2E7D32', padding: '2px 8px', borderRadius: '20px' }}>✓ Verified</span>
                      )}
                    </div>
                    <p style={{ fontSize: '13px', color: TEXT_MUTED, marginBottom: '8px' }}>
                      📍 {teacher.profiles?.city}, {teacher.profiles?.country}
                    </p>
                    {teacher.subjects && teacher.subjects.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        {teacher.subjects.map(s => (
                          <span key={s} style={{ fontSize: '11px', background: LIGHT_BLUE, color: BLUE, padding: '3px 10px', borderRadius: '20px' }}>{s}</span>
                        ))}
                      </div>
                    )}
                    {teacher.certificates && teacher.certificates.filter(c => c.status === 'approved').length > 0 && (
                      <p style={{ fontSize: '12px', color: TEXT_MUTED }}>
                        📋 {teacher.certificates.filter(c => c.status === 'approved').length} verified certificate(s)
                      </p>
                    )}

                    {teacher.reviews && teacher.reviews.length > 0 && (
                    <p style={{ fontSize: '12px', color: '#795500', marginTop: '4px' }}>
                      ⭐ {(teacher.reviews.reduce((sum, r) => sum + r.rating, 0) / teacher.reviews.length).toFixed(1)} ({teacher.reviews.length} review{teacher.reviews.length !== 1 ? 's' : ''})
                     </p>
                        )}

                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    {teacher.hourly_rate > 0 && (
                      <div style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '600', color: BLUE }}>
                        GH₵ {teacher.hourly_rate}<small style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', fontWeight: '400', color: TEXT_MUTED }}>/hr</small>
                      </div>
                    )}
                    <Link to={`/teachers/${teacher.id}`} style={{ padding: '8px 18px', background: BLUE, color: '#fff', borderRadius: '5px', fontSize: '13px', textDecoration: 'none' }}>
                      View profile
                    </Link>
                  </div>
                </div>
                {teacher.pitch_videos && teacher.pitch_videos.length > 0 && (
                  <div style={{ borderTop: `1px solid ${GREY_LIGHT}`, padding: '0.75rem 1.5rem', background: GREY_BG, display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: TEXT_MUTED }}>🎬 Pitch videos:</span>
                    {teacher.pitch_videos.map(v => (
                      <a key={v.video_url} href={v.video_url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: BLUE, textDecoration: 'none' }}>
                        {v.title} ↗
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}