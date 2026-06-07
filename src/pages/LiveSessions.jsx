import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BLUE, YELLOW, LIGHT_BLUE, GREY_BG, GREY_LIGHT, TEXT_MUTED } from '../styles/colors'

export default function LiveSessions() {
  const { user, profile } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [enrolling, setEnrolling] = useState(null)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    title: '', subject: '', session_date: '', start_time: '', end_time: '', max_spots: 20
  })

  useEffect(() => { fetchSessions() }, [])

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from('live_sessions')
      .select(`*`)
      .order('session_date', { ascending: true })
    if (error) console.log(error)
    else setSessions(data || [])
    setLoading(false)
  }

  const createSession = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from('live_sessions').insert({
        ...form, teacher_id: user.id, max_spots: parseInt(form.max_spots)
      })
      if (error) throw error
      setMessage('✅ Session created successfully!')
      setShowForm(false)
      setForm({ title: '', subject: '', session_date: '', start_time: '', end_time: '', max_spots: 20 })
      fetchSessions()
    } catch (err) {
      setMessage('Error: ' + err.message)
    }
  }

  const enroll = async (session) => {
    if (!user) return setMessage('Please log in to enroll.')
    setEnrolling(session.id)
    try {
      const { data: existing } = await supabase.from('enrollments').select('id').eq('session_id', session.id).eq('user_id', user.id).single()
      if (existing) return setMessage('You are already enrolled in this session.')
      const { error } = await supabase.from('enrollments').insert({ session_id: session.id, user_id: user.id })
      if (error) throw error
      await supabase.from('live_sessions').update({ enrolled_count: session.enrolled_count + 1 }).eq('id', session.id)
      setMessage('✅ Successfully enrolled!')
      fetchSessions()
    } catch (err) {
      setMessage('Error: ' + err.message)
    } finally {
      setEnrolling(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: GREY_BG, fontFamily: 'DM Sans, sans-serif' }}>

      {/* NAV */}
      <nav style={{ background: BLUE, padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '700', color: '#fff', textDecoration: 'none' }}>
          Teach<span style={{ color: YELLOW }}>Me</span>
        </Link>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/teachers" style={{ padding: '8px 18px', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', borderRadius: '5px', fontSize: '13px', textDecoration: 'none' }}>Find teachers</Link>
          {user ? (
            <Link to="/dashboard" style={{ padding: '8px 18px', background: YELLOW, color: BLUE, borderRadius: '5px', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>Dashboard</Link>
          ) : (
            <Link to="/login" style={{ padding: '8px 18px', background: YELLOW, color: BLUE, borderRadius: '5px', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>Log in</Link>
          )}
        </div>
      </nav>

      {/* HEADER */}
      <div style={{ background: BLUE, padding: '2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: '#fff', marginBottom: '6px' }}>Live Sessions</h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>Browse and enroll in upcoming online classes</p>
          </div>
          {profile?.role === 'teacher' && (
            <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 22px', background: YELLOW, color: BLUE, border: 'none', borderRadius: '5px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600' }}>
              {showForm ? 'Cancel' : '+ Create session'}
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        {message && (
          <div style={{ background: message.startsWith('✅') ? '#E8F5E9' : LIGHT_BLUE, color: message.startsWith('✅') ? '#2E7D32' : BLUE, padding: '12px 16px', borderRadius: '8px', fontSize: '13px', marginBottom: '1.5rem' }}>
            {message}
          </div>
        )}

        {showForm && (
          <div style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ background: BLUE, padding: '1rem 1.5rem' }}>
              <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '500' }}>Create a new live session</h3>
            </div>
            <form onSubmit={createSession} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={lbl}>Session title</label>
                <input style={inp} placeholder="e.g. Advanced Mathematics — Calculus" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label style={lbl}>Subject</label>
                <input style={inp} placeholder="e.g. Mathematics" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={lbl}>Date</label>
                  <input style={inp} type="date" value={form.session_date} onChange={e => setForm({ ...form, session_date: e.target.value })} required />
                </div>
                <div>
                  <label style={lbl}>Start time</label>
                  <input style={inp} type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} required />
                </div>
                <div>
                  <label style={lbl}>End time</label>
                  <input style={inp} type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} required />
                </div>
              </div>
              <div>
                <label style={lbl}>Maximum spots</label>
                <input style={inp} type="number" min="1" max="100" value={form.max_spots} onChange={e => setForm({ ...form, max_spots: e.target.value })} required />
              </div>
              <button type="submit" style={{ padding: '11px', background: BLUE, color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>
                Create session
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', color: TEXT_MUTED, padding: '3rem' }}>Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div style={{ textAlign: 'center', color: TEXT_MUTED, padding: '3rem' }}>
            <div style={{ fontSize: '40px', marginBottom: '1rem' }}>📅</div>
            <p>No sessions scheduled yet. Check back soon!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sessions.map(session => {
              const spotsLeft = session.max_spots - session.enrolled_count
              const isFull = spotsLeft <= 0
              return (
                <div key={session.id} style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: '1.25rem', alignItems: 'center' }}>
                  <div style={{ background: BLUE, borderRadius: '7px', padding: '8px 4px', textAlign: 'center', color: '#fff' }}>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '700', lineHeight: 1 }}>
                      {new Date(session.session_date).getDate()}
                    </div>
                    <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>
                      {new Date(session.session_date).toLocaleString('default', { month: 'short' })}
                    </div>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '500', marginBottom: '4px' }}>{session.title}</h4>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', color: TEXT_MUTED }}>🕐 {session.start_time} – {session.end_time}</span>
                      <span style={{ fontSize: '12px', background: isFull ? GREY_BG : LIGHT_BLUE, color: isFull ? TEXT_MUTED : BLUE, padding: '2px 10px', borderRadius: '20px' }}>
                        {isFull ? 'Full' : `${spotsLeft} spots left`}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {profile?.role !== 'teacher' && (
                      <button onClick={() => enroll(session)} disabled={isFull || enrolling === session.id} style={{ padding: '8px 20px', background: isFull ? GREY_LIGHT : BLUE, color: isFull ? TEXT_MUTED : '#fff', border: 'none', borderRadius: '5px', fontSize: '13px', cursor: isFull ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                        {enrolling === session.id ? 'Enrolling...' : isFull ? 'Full' : 'Enroll'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const lbl = { fontSize: '11px', fontWeight: '500', color: TEXT_MUTED, display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }
const inp = { width: '100%', padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit', outline: 'none' }