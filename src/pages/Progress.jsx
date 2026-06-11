import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BLUE, YELLOW, LIGHT_BLUE, GREY_BG, GREY_LIGHT, TEXT_MUTED } from '../styles/colors'

export default function Progress() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [data, setData] = useState({ assignments: [], certificates: [], bookings: [] })
  const [loading, setLoading] = useState(true)
  const [linkEmail, setLinkEmail] = useState('')
  const [linkMessage, setLinkMessage] = useState('')

  useEffect(() => {
    if (!user) navigate('/login')
    else fetchChildren()
  }, [user])

  useEffect(() => {
    if (selectedChild) fetchChildData(selectedChild.id)
  }, [selectedChild])

  const fetchChildren = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('parent_id', user.id)
    setChildren(data || [])
    if (data && data.length > 0) setSelectedChild(data[0])
    else setLoading(false)
  }

  const fetchChildData = async (childId) => {
    setLoading(true)
    const { data: assignments } = await supabase
      .from('assignments')
      .select('*, submissions (score, feedback, graded_at)')
      .eq('learner_id', childId)
      .order('created_at', { ascending: false })

    const { data: certificates } = await supabase
      .from('course_certificates')
      .select('*, teacher:teacher_id (id, profiles (full_name))')
      .eq('learner_id', childId)
      .order('issued_at', { ascending: false })

    const { data: bookings } = await supabase
      .from('bookings')
      .select('*, teachers (id, profiles (full_name))')
      .eq('client_id', childId)
      .order('created_at', { ascending: false })

    setData({ assignments: assignments || [], certificates: certificates || [], bookings: bookings || [] })
    setLoading(false)
  }

  const linkChild = async (e) => {
    e.preventDefault()
    setLinkMessage('')
    try {
      const { data: child, error } = await supabase.from('profiles').select('id, full_name, parent_id').eq('email', linkEmail.trim().toLowerCase()).single()
      if (error || !child) {
        setLinkMessage('No account found with that email.')
        return
      }
      if (child.parent_id) {
        setLinkMessage('This account is already linked to a parent.')
        return
      }
      const { error: updateError } = await supabase.from('profiles').update({ parent_id: user.id }).eq('id', child.id)
      if (updateError) throw updateError
      setLinkMessage(`✅ Linked to ${child.full_name}'s account!`)
      setLinkEmail('')
      fetchChildren()
    } catch (err) {
      setLinkMessage('Error: ' + err.message)
    }
  }

  const statusColor = (status) => {
    if (status === 'confirmed') return { bg: '#E8F5E9', color: '#2E7D32' }
    if (status === 'pending') return { bg: '#FFF8E1', color: '#795500' }
    return { bg: '#FDECEA', color: '#C62828' }
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
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: '#fff', marginBottom: '6px' }}>Progress Dashboard</h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>Monitor your child's bookings, assignments, and certificates</p>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>

        {/* LINK CHILD ACCOUNT */}
        <div style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '500', color: BLUE, marginBottom: '10px' }}>🔗 Link a child's account</h3>
          <p style={{ fontSize: '12px', color: TEXT_MUTED, marginBottom: '12px' }}>Enter the email address your child used to sign up on TeachMe.</p>
          <form onSubmit={linkChild} style={{ display: 'flex', gap: '8px' }}>
            <input
              style={{ flex: 1, padding: '9px 12px', border: `1px solid ${GREY_LIGHT}`, borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }}
              type="email"
              placeholder="child@email.com"
              value={linkEmail}
              onChange={e => setLinkEmail(e.target.value)}
              required
            />
            <button type="submit" style={{ padding: '9px 20px', background: BLUE, color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>
              Link account
            </button>
          </form>
          {linkMessage && <p style={{ fontSize: '12px', marginTop: '8px', color: linkMessage.startsWith('✅') ? '#2E7D32' : '#C62828' }}>{linkMessage}</p>}
        </div>

        {children.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, padding: '2.5rem', textAlign: 'center', color: TEXT_MUTED }}>
            <div style={{ fontSize: '40px', marginBottom: '1rem' }}>👨‍👩‍👧</div>
            <p style={{ fontSize: '13px' }}>No linked accounts yet. Link your child's account above to start monitoring their progress.</p>
          </div>
        ) : (
          <>
            {/* CHILD SELECTOR */}
            {children.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {children.map(child => (
                  <button key={child.id} onClick={() => setSelectedChild(child)} style={{ padding: '8px 18px', borderRadius: '20px', border: `1px solid ${selectedChild?.id === child.id ? BLUE : GREY_LIGHT}`, background: selectedChild?.id === child.id ? BLUE : '#fff', color: selectedChild?.id === child.id ? '#fff' : '#444', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>
                    {child.full_name}
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <p style={{ textAlign: 'center', color: TEXT_MUTED }}>Loading...</p>
            ) : (
              <>
                {/* SUMMARY STATS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: BLUE, borderRadius: '10px', padding: '1.25rem', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: '700', color: YELLOW }}>{data.bookings.filter(b => b.status === 'confirmed').length}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>Active bookings</div>
                  </div>
                  <div style={{ background: '#2E7D32', borderRadius: '10px', padding: '1.25rem', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: '700', color: '#fff' }}>{data.assignments.filter(a => a.submissions?.[0]?.score != null).length}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)' }}>Graded assignments</div>
                  </div>
                  <div style={{ background: YELLOW, borderRadius: '10px', padding: '1.25rem', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: '700', color: BLUE }}>{data.certificates.length}</div>
                    <div style={{ fontSize: '11px', color: BLUE }}>Certificates earned</div>
                  </div>
                </div>

                {/* BOOKINGS */}
                <h2 style={{ fontSize: '16px', fontWeight: '500', color: BLUE, marginBottom: '0.75rem' }}>Bookings</h2>
                {data.bookings.length === 0 ? (
                  <div style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, padding: '1.5rem', textAlign: 'center', color: TEXT_MUTED, fontSize: '13px', marginBottom: '1.5rem' }}>No bookings yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
                    {data.bookings.map(b => {
                      const sc = statusColor(b.status)
                      return (
                        <div key={b.id} style={{ background: '#fff', borderRadius: '8px', border: `1px solid ${GREY_LIGHT}`, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '500' }}>{b.subject} — {b.teachers?.profiles?.full_name}</div>
                            <div style={{ fontSize: '11px', color: TEXT_MUTED }}>{new Date(b.created_at).toLocaleDateString()}</div>
                          </div>
                          <span style={{ fontSize: '11px', background: sc.bg, color: sc.color, padding: '3px 10px', borderRadius: '20px', textTransform: 'capitalize' }}>{b.status}</span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* ASSIGNMENTS */}
                <h2 style={{ fontSize: '16px', fontWeight: '500', color: BLUE, marginBottom: '0.75rem' }}>Assignments & Grades</h2>
                {data.assignments.length === 0 ? (
                  <div style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, padding: '1.5rem', textAlign: 'center', color: TEXT_MUTED, fontSize: '13px', marginBottom: '1.5rem' }}>No assignments yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
                    {data.assignments.map(a => {
                      const sub = a.submissions?.[0]
                      return (
                        <div key={a.id} style={{ background: '#fff', borderRadius: '8px', border: `1px solid ${GREY_LIGHT}`, padding: '12px 16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: '500' }}>{a.title}</div>
                              <div style={{ fontSize: '11px', color: TEXT_MUTED }}>{a.subject} {a.due_date && `· Due: ${new Date(a.due_date).toLocaleDateString()}`}</div>
                            </div>
                            {sub?.score != null ? (
                              <span style={{ fontSize: '13px', fontWeight: '700', color: '#2E7D32', background: '#E8F5E9', padding: '4px 12px', borderRadius: '20px' }}>{sub.score} / {a.max_score}</span>
                            ) : sub ? (
                              <span style={{ fontSize: '11px', background: '#FFF8E1', color: '#795500', padding: '3px 10px', borderRadius: '20px' }}>Awaiting grade</span>
                            ) : (
                              <span style={{ fontSize: '11px', background: LIGHT_BLUE, color: BLUE, padding: '3px 10px', borderRadius: '20px' }}>Pending</span>
                            )}
                          </div>
                          {sub?.feedback && (
                            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${GREY_LIGHT}` }}>
                              <div style={{ fontSize: '11px', color: TEXT_MUTED, marginBottom: '2px' }}>Teacher feedback</div>
                              <p style={{ fontSize: '12px' }}>{sub.feedback}</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* CERTIFICATES */}
                <h2 style={{ fontSize: '16px', fontWeight: '500', color: BLUE, marginBottom: '0.75rem' }}>Certificates</h2>
                {data.certificates.length === 0 ? (
                  <div style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, padding: '1.5rem', textAlign: 'center', color: TEXT_MUTED, fontSize: '13px' }}>No certificates earned yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {data.certificates.map(c => (
                      <div key={c.id} style={{ background: '#fff', borderRadius: '8px', border: `2px solid ${YELLOW}`, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '500' }}>🏆 {c.subject} — {c.grade_label} ({c.average_score}%)</div>
                          <div style={{ fontSize: '11px', color: TEXT_MUTED }}>Issued by {c.teacher?.profiles?.full_name} · {new Date(c.issued_at).toLocaleDateString()}</div>
                        </div>
                        <Link to={`/verify/${c.certificate_code}`} style={{ fontSize: '12px', color: BLUE, fontWeight: '500' }}>Verify ↗</Link>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}