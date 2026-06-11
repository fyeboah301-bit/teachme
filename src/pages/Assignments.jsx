import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BLUE, YELLOW, LIGHT_BLUE, GREY_BG, GREY_LIGHT, TEXT_MUTED } from '../styles/colors'

export default function Assignments() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [submissions, setSubmissions] = useState({})
  const [gradingId, setGradingId] = useState(null)
  const [gradeForm, setGradeForm] = useState({ score: '', feedback: '' })
  const [submitForm, setSubmitForm] = useState({})
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

    // fetch submissions for each assignment
    if (data && data.length > 0) {
      const ids = data.map(a => a.id)
      const { data: subs } = await supabase.from('submissions').select('*').in('assignment_id', ids)
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
        teacher_id: user.id,
        learner_id: form.learner_id,
        title: form.title,
        description: form.description,
        subject: form.subject,
        due_date: form.due_date || null,
        max_score: form.max_score
      })
      if (error) throw error
      setMessage('✅ Assignment created successfully!')
      setShowForm(false)
      setForm({ title: '', description: '', subject: '', due_date: '', max_score: 100, learner_id: '' })
      fetchAssignments()
    } catch (err) {
      setMessage('Error: ' + err.message)
    }
  }

  const submitAssignment = async (assignmentId) => {
    const content = submitForm[assignmentId]?.content || ''
    const file = submitForm[assignmentId]?.file
    try {
      let fileUrl = null
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        const { error: upErr } = await supabase.storage.from('assignments').upload(fileName, file)
        if (upErr) throw upErr
        const { data: urlData } = supabase.storage.from('assignments').getPublicUrl(fileName)
        fileUrl = urlData.publicUrl
      }
      const { error } = await supabase.from('submissions').insert({
        assignment_id: assignmentId, learner_id: user.id, content, file_url: fileUrl
      })
      if (error) throw error
      setMessage('✅ Assignment submitted successfully!')
      fetchAssignments()
    } catch (err) {
      setMessage('Error: ' + err.message)
    }
  }

  const submitGrade = async (submissionId) => {
    try {
      const { error } = await supabase.from('submissions').update({
        score: parseFloat(gradeForm.score), feedback: gradeForm.feedback, graded_at: new Date().toISOString()
      }).eq('id', submissionId)
      if (error) throw error
      setMessage('✅ Grade submitted successfully!')
      setGradingId(null)
      setGradeForm({ score: '', feedback: '' })
      fetchAssignments()
    } catch (err) {
      setMessage('Error: ' + err.message)
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

      {/* HEADER */}
      <div style={{ background: BLUE, padding: '2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: '#fff', marginBottom: '6px' }}>Assignments</h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
              {profile?.role === 'teacher' ? 'Create and grade assignments for your students' : 'View and submit your assignments'}
            </p>
          </div>
          {profile?.role === 'teacher' && (
            <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 22px', background: YELLOW, color: BLUE, border: 'none', borderRadius: '5px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600' }}>
              {showForm ? 'Cancel' : '+ New assignment'}
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

        {/* CREATE FORM */}
        {showForm && (
          <div style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ background: BLUE, padding: '1rem 1.5rem' }}>
              <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '500' }}>Create new assignment</h3>
            </div>
            <form onSubmit={createAssignment} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={lbl}>Assign to student</label>
                <select style={inp} value={form.learner_id} onChange={e => setForm({ ...form, learner_id: e.target.value })} required>
                  <option value="">Select a student...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Title</label>
                <input style={inp} placeholder="e.g. Algebra Worksheet 1" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label style={lbl}>Subject</label>
                <input style={inp} placeholder="e.g. Mathematics" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
              </div>
              <div>
                <label style={lbl}>Description / Instructions</label>
                <textarea style={{ ...inp, height: '90px', resize: 'vertical' }} placeholder="Describe the assignment..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={lbl}>Due date</label>
                  <input style={inp} type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
                </div>
                <div>
                  <label style={lbl}>Max score</label>
                  <input style={inp} type="number" value={form.max_score} onChange={e => setForm({ ...form, max_score: e.target.value })} required />
                </div>
              </div>
              <button type="submit" style={{ padding: '11px', background: BLUE, color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>
                Create assignment
              </button>
            </form>
          </div>
        )}

        {/* ASSIGNMENTS LIST */}
        {loading ? (
          <div style={{ textAlign: 'center', color: TEXT_MUTED, padding: '3rem' }}>Loading...</div>
        ) : assignments.length === 0 ? (
          <div style={{ textAlign: 'center', color: TEXT_MUTED, padding: '3rem' }}>
            <div style={{ fontSize: '40px', marginBottom: '1rem' }}>📝</div>
            <p>No assignments yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {assignments.map(a => {
              const sub = submissions[a.id]
              return (
                <div key={a.id} style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, overflow: 'hidden' }}>
                  <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: '500' }}>{a.title}</h4>
                        <p style={{ fontSize: '12px', color: TEXT_MUTED, marginTop: '2px' }}>
                          {a.subject} {profile?.role === 'teacher' && a.profiles?.full_name && `· For: ${a.profiles.full_name}`}
                          {a.due_date && ` · Due: ${new Date(a.due_date).toLocaleDateString()}`}
                        </p>
                      </div>
                      {sub?.score != null ? (
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#2E7D32', background: '#E8F5E9', padding: '4px 12px', borderRadius: '20px' }}>
                          {sub.score} / {a.max_score}
                        </span>
                      ) : sub ? (
                        <span style={{ fontSize: '11px', background: '#FFF8E1', color: '#795500', padding: '3px 10px', borderRadius: '20px' }}>Submitted — awaiting grade</span>
                      ) : (
                        <span style={{ fontSize: '11px', background: LIGHT_BLUE, color: BLUE, padding: '3px 10px', borderRadius: '20px' }}>Pending</span>
                      )}
                    </div>
                    <p style={{ fontSize: '13px', color: '#444', lineHeight: '1.6', marginBottom: '10px' }}>{a.description}</p>

                    {/* LEARNER VIEW */}
                    {profile?.role !== 'teacher' && !sub && (
                      <div style={{ background: GREY_BG, borderRadius: '8px', padding: '1rem' }}>
                        <label style={lbl}>Your answer</label>
                        <textarea style={{ ...inp, height: '70px', resize: 'vertical', marginBottom: '8px' }} placeholder="Type your response..." onChange={e => setSubmitForm({ ...submitForm, [a.id]: { ...submitForm[a.id], content: e.target.value } })} />
                        <label style={lbl}>Or upload a file</label>
                        <input type="file" style={{ fontSize: '13px', marginBottom: '10px', display: 'block' }} onChange={e => setSubmitForm({ ...submitForm, [a.id]: { ...submitForm[a.id], file: e.target.files[0] } })} />
                        <button onClick={() => submitAssignment(a.id)} style={{ padding: '8px 18px', background: BLUE, color: '#fff', border: 'none', borderRadius: '5px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>
                          Submit assignment
                        </button>
                      </div>
                    )}

                    {/* SUBMITTED VIEW */}
                    {sub && (
                      <div style={{ background: GREY_BG, borderRadius: '8px', padding: '1rem' }}>
                        <div style={{ fontSize: '11px', fontWeight: '500', color: TEXT_MUTED, textTransform: 'uppercase', marginBottom: '6px' }}>Submission</div>
                        {sub.content && <p style={{ fontSize: '13px', marginBottom: '6px' }}>{sub.content}</p>}
                        {sub.file_url && <a href={sub.file_url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: BLUE }}>📎 View attached file</a>}
                        <div style={{ fontSize: '11px', color: '#aaa', marginTop: '6px' }}>Submitted: {new Date(sub.submitted_at).toLocaleString()}</div>

                        {sub.feedback && (
                          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${GREY_LIGHT}` }}>
                            <div style={{ fontSize: '11px', fontWeight: '500', color: TEXT_MUTED, textTransform: 'uppercase', marginBottom: '4px' }}>Teacher feedback</div>
                            <p style={{ fontSize: '13px' }}>{sub.feedback}</p>
                          </div>
                        )}

                        {/* TEACHER GRADING */}
                        {profile?.role === 'teacher' && sub.score == null && (
                          gradingId === sub.id ? (
                            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: `1px solid ${GREY_LIGHT}` }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', marginBottom: '8px' }}>
                                <input style={inp} type="number" placeholder={`Score / ${a.max_score}`} value={gradeForm.score} onChange={e => setGradeForm({ ...gradeForm, score: e.target.value })} />
                                <input style={inp} placeholder="Feedback" value={gradeForm.feedback} onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })} />
                              </div>
                              <button onClick={() => submitGrade(sub.id)} style={{ padding: '8px 18px', background: '#2E7D32', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>
                                Submit grade
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setGradingId(sub.id)} style={{ marginTop: '10px', padding: '8px 18px', background: BLUE, color: '#fff', border: 'none', borderRadius: '5px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>
                              Grade submission
                            </button>
                          )
                        )}
                      </div>
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