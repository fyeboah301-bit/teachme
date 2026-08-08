import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BLUE, YELLOW, LIGHT_BLUE, GREY_BG, GREY_LIGHT, TEXT_MUTED, DARK_BLUE } from '../styles/colors'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import assignmentsImg from '../assets/images/assignments.png'
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

const STATUS_CONFIG = {
  graded:    { bg: '#DCFCE7', color: '#166534', icon: '✅', label: 'Graded' },
  submitted: { bg: '#FEF9C3', color: '#854D0E', icon: '📨', label: 'Submitted' },
  pending:   { bg: '#DBEAFE', color: '#1E40AF', icon: '⏳', label: 'Pending' },
  overdue:   { bg: '#FEE2E2', color: '#991B1B', icon: '🔴', label: 'Overdue' },
}

export default function Assignments() {
  usePageMeta('Assignments')

  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [assignments, setAssignments] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [submissions, setSubmissions] = useState({})
  const [gradingId, setGradingId] = useState(null)
  const [gradeForm, setGradeForm] = useState({ score: '', feedback: '' })
  const [submitForm, setSubmitForm] = useState({})
  const [submittingId, setSubmittingId] = useState(null)
  const [tab, setTab] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', subject: '', due_date: '', max_score: 100, learner_id: '' })

  useEffect(() => {
    if (!user) navigate('/login')
    else { fetchAssignments(); if (profile?.role === 'teacher') fetchStudents() }
  }, [user, profile])

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('client_id, profiles:client_id (full_name)')
      .eq('teacher_id', user.id)
      .eq('status', 'confirmed')
    const unique = {}
    data?.forEach(b => { if (b.profiles) unique[b.client_id] = b.profiles.full_name })
    setStudents(Object.entries(unique).map(([id, name]) => ({ id, name })))
  }

  const fetchAssignments = async () => {
    let query = supabase.from('assignments').select('*, profiles:learner_id (full_name)')
    if (profile?.role === 'teacher') query = query.eq('teacher_id', user.id)
    else query = query.eq('learner_id', user.id)
    const { data } = await query.order('created_at', { ascending: false })
    setAssignments(data || [])
    if (data?.length > 0) {
      const { data: subs } = await supabase.from('submissions').select('*').in('assignment_id', data.map(a => a.id))
      const map = {}
      subs?.forEach(s => { map[s.assignment_id] = s })
      setSubmissions(map)
    }
    setLoading(false)
  }

  const createAssignment = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from('assignments').insert({
        teacher_id: user.id, learner_id: form.learner_id, title: form.title,
        description: form.description, subject: form.subject,
        due_date: form.due_date || null, max_score: form.max_score
      })
      if (error) throw error
      setMessage('✅ Assignment created successfully!')
      setShowForm(false)
      setForm({ title: '', description: '', subject: '', due_date: '', max_score: 100, learner_id: '' })
      fetchAssignments()
    } catch (err) { setMessage('Error: ' + err.message) }
  }

  const submitAssignment = async (assignmentId) => {
    const content = submitForm[assignmentId]?.content || ''
    const file = submitForm[assignmentId]?.file
    setSubmittingId(assignmentId)
    try {
      let fileUrl = null
      if (file) {
        const fileName = `${user.id}/${Date.now()}.${file.name.split('.').pop()}`
        const { error: upErr } = await supabase.storage.from('assignments').upload(fileName, file)
        if (upErr) throw upErr
        const { data: urlData } = supabase.storage.from('assignments').getPublicUrl(fileName)
        fileUrl = urlData.publicUrl
      }
      const { error } = await supabase.from('submissions').insert({ assignment_id: assignmentId, learner_id: user.id, content, file_url: fileUrl })
      if (error) throw error
      setMessage('✅ Assignment submitted successfully!')
      fetchAssignments()
    } catch (err) { setMessage('Error: ' + err.message) }
    finally { setSubmittingId(null) }
  }

  const submitGrade = async (submissionId) => {
    try {
      const { error } = await supabase.from('submissions').update({
        score: parseFloat(gradeForm.score), feedback: gradeForm.feedback, graded_at: new Date().toISOString()
      }).eq('id', submissionId)
      if (error) throw error
      setMessage('✅ Grade submitted!')
      setGradingId(null)
      setGradeForm({ score: '', feedback: '' })
      fetchAssignments()
    } catch (err) { setMessage('Error: ' + err.message) }
  }

  const getStatus = (a) => {
    const sub = submissions[a.id]
    if (sub?.score != null) return 'graded'
    if (sub) return 'submitted'
    if (a.due_date && new Date(a.due_date) < new Date()) return 'overdue'
    return 'pending'
  }

  const isTeacher = profile?.role === 'teacher'

  const counts = {
    all: assignments.length,
    pending: assignments.filter(a => getStatus(a) === 'pending').length,
    submitted: assignments.filter(a => getStatus(a) === 'submitted').length,
    graded: assignments.filter(a => getStatus(a) === 'graded').length,
    overdue: assignments.filter(a => getStatus(a) === 'overdue').length,
  }

  const displayed = tab === 'all' ? assignments : assignments.filter(a => getStatus(a) === tab)

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <NavBar />

      <div style={{ background: `linear-gradient(rgba(37,99,235,0.82), rgba(26,63,160,0.92)), url(${assignmentsImg})`, backgroundSize: 'cover', backgroundPosition: 'center', padding: isMobile ? '2rem 1rem' : '2.5rem 2rem' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: YELLOW, fontSize: '11px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', padding: '4px 12px', borderRadius: '20px', marginBottom: '10px' }}>
                📝 {isTeacher ? 'Teacher view' : 'My assignments'}
              </div>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? '24px' : '32px', color: '#fff', marginBottom: '6px', fontWeight: '700' }}>Assignments</h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', margin: 0 }}>
                {isTeacher ? 'Create, assign, and grade work for your students' : 'View and submit your assigned work'}
              </p>
            </div>
            {isTeacher && (
              <button onClick={() => setShowForm(!showForm)} style={{ padding: '12px 22px', background: showForm ? 'rgba(255,255,255,0.2)' : YELLOW, color: showForm ? '#fff' : BLUE, border: showForm ? '1px solid rgba(255,255,255,0.4)' : 'none', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700', flexShrink: 0 }}>
                {showForm ? '✕ Cancel' : '+ New assignment'}
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '10px' }}>
            {[
              ['Total', counts.all, '📋', 'all'],
              ['Pending', counts.pending, '⏳', 'pending'],
              ['Submitted', counts.submitted, '📨', 'submitted'],
              ['Graded', counts.graded, '✅', 'graded'],
            ].map(([label, value, icon, key]) => (
              <button key={label} onClick={() => setTab(key)}
                style={{ background: tab === key ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)', border: tab === key ? '2px solid rgba(255,255,255,0.6)' : '2px solid transparent', borderRadius: '12px', padding: '1rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' }}>
                <div style={{ fontSize: '22px', marginBottom: '4px' }}>{icon}</div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? '22px' : '28px', fontWeight: '700', color: YELLOW, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>{label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: isMobile ? '1rem' : '1.5rem 2rem', flex: 1, width: '100%', boxSizing: 'border-box' }}>

        {message && (
          <div style={{ background: message.startsWith('✅') ? '#DCFCE7' : '#FEE2E2', color: message.startsWith('✅') ? '#166534' : '#991B1B', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ flex: 1 }}>{message}</span>
            <button onClick={() => setMessage('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'inherit', opacity: 0.6, padding: 0 }}>×</button>
          </div>
        )}

        {showForm && (
          <div style={{ background: '#fff', borderRadius: '14px', border: `1px solid ${GREY_LIGHT}`, overflow: 'hidden', marginBottom: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
            <div style={{ background: `linear-gradient(135deg, ${BLUE} 0%, ${DARK_BLUE} 100%)`, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>📝</span>
              <div>
                <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '700', margin: 0 }}>Create new assignment</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: 0 }}>Fill in the details and assign to a student</p>
              </div>
            </div>
            <form onSubmit={createAssignment} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={lbl}>Assign to student</label>
                <select style={inp} value={form.learner_id} onChange={e => setForm({ ...form, learner_id: e.target.value })} required>
                  <option value="">Select a student...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {students.length === 0 && <p style={{ fontSize: '12px', color: TEXT_MUTED, marginTop: '6px' }}>No confirmed bookings yet. Students appear here once a booking is confirmed and paid.</p>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={lbl}>Assignment title</label>
                  <input style={inp} placeholder="e.g. Algebra Worksheet 1" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div>
                  <label style={lbl}>Subject</label>
                  <input style={inp} placeholder="e.g. Mathematics" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
                </div>
              </div>
              <div>
                <label style={lbl}>Instructions</label>
                <textarea style={{ ...inp, height: '90px', resize: 'vertical' }} placeholder="Describe what the student needs to do..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={lbl}>Due date (optional)</label>
                  <input style={inp} type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
                </div>
                <div>
                  <label style={lbl}>Max score</label>
                  <input style={inp} type="number" min="1" value={form.max_score} onChange={e => setForm({ ...form, max_score: e.target.value })} required />
                </div>
              </div>
              <button type="submit" style={{ padding: '13px', background: YELLOW, color: BLUE, border: 'none', borderRadius: '10px', fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700' }}>
                Create assignment
              </button>
            </form>
          </div>
        )}

        <div style={{ display: 'flex', gap: '4px', marginBottom: '1.25rem', background: '#fff', padding: '4px', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, width: 'fit-content', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', flexWrap: 'wrap' }}>
          {[
            ['all', 'All', counts.all],
            ['pending', 'Pending', counts.pending],
            ['submitted', 'Submitted', counts.submitted],
            ['graded', 'Graded', counts.graded],
            ...(counts.overdue > 0 ? [['overdue', 'Overdue', counts.overdue]] : []),
          ].map(([key, label, count]) => (
            <button key={key} onClick={() => setTab(key)} style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', background: tab === key ? BLUE : 'transparent', color: tab === key ? '#fff' : TEXT_MUTED, fontWeight: tab === key ? '700' : '400', display: 'flex', alignItems: 'center', gap: '5px' }}>
              {label}
              <span style={{ background: tab === key ? 'rgba(255,255,255,0.25)' : GREY_LIGHT, color: tab === key ? '#fff' : TEXT_MUTED, borderRadius: '20px', padding: '1px 7px', fontSize: '11px', fontWeight: '700' }}>{count}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: '#fff', borderRadius: '14px', border: `1px solid ${GREY_LIGHT}`, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px', animation: 'pulse 1.5s infinite' }}>
                <div style={{ height: '18px', background: '#E2E8F0', borderRadius: '4px', width: '50%' }} />
                <div style={{ height: '13px', background: '#E2E8F0', borderRadius: '4px', width: '30%' }} />
                <div style={{ height: '13px', background: '#E2E8F0', borderRadius: '4px', width: '80%' }} />
                <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '14px', border: `1px solid ${GREY_LIGHT}` }}>
            <div style={{ fontSize: '52px', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111', marginBottom: '8px' }}>
              {tab === 'all' ? 'No assignments yet' : `No ${tab} assignments`}
            </h3>
            <p style={{ fontSize: '14px', color: TEXT_MUTED, marginBottom: '1.5rem' }}>
              {isTeacher ? 'Create your first assignment for a student.' : "Your teacher hasn't assigned anything yet."}
            </p>
            {isTeacher && tab === 'all' && (
              <button onClick={() => setShowForm(true)} style={{ padding: '12px 28px', background: YELLOW, color: BLUE, border: 'none', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700' }}>
                + Create first assignment
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {displayed.map(a => {
              const sub = submissions[a.id]
              const status = getStatus(a)
              const sc = STATUS_CONFIG[status]
              const isExpanded = expandedId === a.id
              const isOverdue = status === 'overdue'
              const daysUntilDue = a.due_date ? Math.ceil((new Date(a.due_date) - new Date()) / (1000 * 60 * 60 * 24)) : null
              const scorePercent = sub?.score != null ? Math.round((sub.score / a.max_score) * 100) : null
              const scoreColor = scorePercent >= 70 ? '#166534' : scorePercent >= 50 ? '#854D0E' : '#991B1B'

              return (
                <div key={a.id} style={{ background: '#fff', borderRadius: '14px', border: `1px solid ${isOverdue ? '#FECACA' : GREY_LIGHT}`, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'}
                >
                  {(isOverdue || status === 'graded') && (
                    <div style={{ background: isOverdue ? '#FEE2E2' : '#DCFCE7', padding: '5px 16px', fontSize: '12px', fontWeight: '700', color: isOverdue ? '#991B1B' : '#166534' }}>
                      {isOverdue ? '🔴 This assignment is overdue' : `✅ Graded — ${sub?.score} / ${a.max_score} (${scorePercent}%)`}
                    </div>
                  )}

                  <div style={{ padding: '1.25rem 1.5rem', cursor: 'pointer' }} onClick={() => setExpandedId(isExpanded ? null : a.id)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 6px 0', lineHeight: '1.3' }}>{a.title}</h4>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                          {a.subject && <span style={{ fontSize: '12px', background: LIGHT_BLUE, color: BLUE, padding: '3px 10px', borderRadius: '20px', fontWeight: '600' }}>{a.subject}</span>}
                          {isTeacher && a.profiles?.full_name && <span style={{ fontSize: '12px', color: TEXT_MUTED }}>👤 {a.profiles.full_name}</span>}
                          {a.due_date && (
                            <span style={{ fontSize: '12px', color: isOverdue ? '#991B1B' : daysUntilDue <= 2 ? '#854D0E' : TEXT_MUTED, fontWeight: isOverdue || daysUntilDue <= 2 ? '600' : '400' }}>
                              📅 {isOverdue ? 'Was due' : daysUntilDue === 0 ? 'Due today' : daysUntilDue === 1 ? 'Due tomorrow' : 'Due'} {new Date(a.due_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                          <span style={{ fontSize: '12px', color: TEXT_MUTED }}>Max score: {a.max_score}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                        {status === 'graded' && scorePercent != null && (
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '700', color: scoreColor }}>{sub.score}</div>
                            <div style={{ fontSize: '10px', color: TEXT_MUTED, textTransform: 'uppercase' }}>/{a.max_score}</div>
                          </div>
                        )}
                        <span style={{ fontSize: '12px', fontWeight: '700', color: sc.color, background: sc.bg, padding: '5px 12px', borderRadius: '20px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {sc.icon} {sc.label}
                        </span>
                        <span style={{ fontSize: '14px', color: TEXT_MUTED, transition: 'transform 0.2s', display: 'inline-block', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>▾</span>
                      </div>
                    </div>
                    {status === 'graded' && scorePercent != null && (
                      <div style={{ marginTop: '10px' }}>
                        <div style={{ height: '5px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${scorePercent}%`, background: scoreColor, borderRadius: '3px', transition: 'width 0.5s ease' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {isExpanded && (
                    <div style={{ borderTop: `1px solid ${GREY_LIGHT}` }}>
                      <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${GREY_LIGHT}` }}>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Instructions</div>
                        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.7', margin: 0 }}>{a.description}</p>
                      </div>

                      {!isTeacher && !sub && (
                        <div style={{ padding: '1.25rem 1.5rem', background: GREY_BG }}>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#111', marginBottom: '12px' }}>📤 Submit your work</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                              <label style={lbl}>Your answer</label>
                              <textarea style={{ ...inp, height: '90px', resize: 'vertical' }} placeholder="Type your response here..." onChange={e => setSubmitForm({ ...submitForm, [a.id]: { ...submitForm[a.id], content: e.target.value } })} />
                            </div>
                            <div>
                              <label style={lbl}>Or attach a file</label>
                              <div style={{ border: `2px dashed ${GREY_LIGHT}`, borderRadius: '10px', padding: '1rem', textAlign: 'center', background: '#fff' }}>
                                <input type="file" style={{ fontSize: '13px', cursor: 'pointer' }} onChange={e => setSubmitForm({ ...submitForm, [a.id]: { ...submitForm[a.id], file: e.target.files[0] } })} />
                                {submitForm[a.id]?.file && <p style={{ fontSize: '12px', color: '#166534', marginTop: '6px', fontWeight: '600' }}>📎 {submitForm[a.id].file.name}</p>}
                              </div>
                            </div>
                            <button onClick={() => submitAssignment(a.id)} disabled={submittingId === a.id}
                              style={{ padding: '12px', background: YELLOW, color: BLUE, border: 'none', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700' }}>
                              {submittingId === a.id ? '⏳ Submitting...' : '📤 Submit assignment'}
                            </button>
                          </div>
                        </div>
                      )}

                      {sub && (
                        <div style={{ padding: '1.25rem 1.5rem', background: GREY_BG }}>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#111', marginBottom: '12px' }}>
                            📨 Submission
                            <span style={{ fontSize: '12px', color: TEXT_MUTED, fontWeight: '400', marginLeft: '4px' }}>
                              — {new Date(sub.submitted_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {sub.content && (
                            <div style={{ background: '#fff', borderRadius: '10px', padding: '1rem', border: `1px solid ${GREY_LIGHT}`, marginBottom: '10px' }}>
                              <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: 0 }}>{sub.content}</p>
                            </div>
                          )}
                          {sub.file_url && (
                            <a href={sub.file_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: BLUE, fontWeight: '600', textDecoration: 'none', background: LIGHT_BLUE, padding: '7px 14px', borderRadius: '8px', marginBottom: '10px' }}>
                              📎 View attached file ↗
                            </a>
                          )}
                          {sub.feedback && (
                            <div style={{ background: '#fff', borderRadius: '10px', padding: '1rem', border: `1px solid ${GREY_LIGHT}`, marginTop: '8px' }}>
                              <div style={{ fontSize: '12px', fontWeight: '700', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Teacher feedback</div>
                              <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: 0 }}>{sub.feedback}</p>
                            </div>
                          )}

                          {isTeacher && sub.score == null && (
                            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${GREY_LIGHT}` }}>
                              {gradingId === sub.id ? (
                                <div>
                                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#111', marginBottom: '10px' }}>✏️ Grade this submission</div>
                                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '10px', marginBottom: '10px' }}>
                                    <div>
                                      <label style={lbl}>Score (max {a.max_score})</label>
                                      <input style={inp} type="number" min="0" max={a.max_score} placeholder={`0 – ${a.max_score}`} value={gradeForm.score} onChange={e => setGradeForm({ ...gradeForm, score: e.target.value })} />
                                    </div>
                                    <div>
                                      <label style={lbl}>Feedback</label>
                                      <input style={inp} placeholder="Write feedback for the student..." value={gradeForm.feedback} onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })} />
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => submitGrade(sub.id)} style={{ padding: '10px 22px', background: '#166534', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700' }}>
                                      ✅ Submit grade
                                    </button>
                                    <button onClick={() => setGradingId(null)} style={{ padding: '10px 18px', background: '#fff', color: TEXT_MUTED, border: `1px solid ${GREY_LIGHT}`, borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button onClick={() => setGradingId(sub.id)} style={{ padding: '10px 22px', background: BLUE, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700' }}>
                                  ✏️ Grade this submission
                                </button>
                              )}
                            </div>
                          )}

                          {sub.score != null && (
                            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${GREY_LIGHT}`, display: 'flex', alignItems: 'center', gap: '14px' }}>
                              <div style={{ textAlign: 'center', background: '#fff', borderRadius: '12px', padding: '12px 20px', border: `1px solid ${GREY_LIGHT}` }}>
                                <div style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: '700', color: scoreColor }}>{sub.score}</div>
                                <div style={{ fontSize: '11px', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.5px' }}>out of {a.max_score}</div>
                              </div>
                              <div>
                                <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '700', color: scoreColor }}>{scorePercent}%</div>
                                <div style={{ fontSize: '12px', color: TEXT_MUTED }}>Graded {new Date(sub.graded_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

const lbl = { fontSize: '11px', fontWeight: '700', color: TEXT_MUTED, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }
const inp = { width: '100%', padding: '11px 14px', border: `1px solid #E2E8F0`, borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', background: '#fff', color: '#111', boxSizing: 'border-box' }