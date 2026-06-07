import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import { BLUE, YELLOW, LIGHT_BLUE, GREY_BG, GREY_LIGHT, TEXT_MUTED } from '../styles/colors'

export default function Admin() {
  const [certificates, setCertificates] = useState([])
  const [teachers, setTeachers] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState('certificates')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    const { data: certs } = await supabase.from('certificates').select('*, teachers (id, profiles (full_name, email))').order('uploaded_at', { ascending: false })
    const { data: teacherData } = await supabase.from('teachers').select('*, profiles (full_name, email, city, country)')
    const { data: bookingData } = await supabase.from('bookings').select('*, profiles:client_id (full_name), teachers (id, profiles (full_name))').order('created_at', { ascending: false })
    setCertificates(certs || [])
    setTeachers(teacherData || [])
    setBookings(bookingData || [])
    setLoading(false)
  }

  const updateCertificate = async (id, status, teacherId) => {
    try {
      await supabase.from('certificates').update({ status }).eq('id', id)
      if (status === 'approved') {
        const { data: allCerts } = await supabase.from('certificates').select('status').eq('teacher_id', teacherId)
        const allApproved = allCerts.every(c => c.status === 'approved')
        if (allApproved) await supabase.from('teachers').update({ is_verified: true }).eq('id', teacherId)
      }
      if (status === 'declined') await supabase.from('teachers').update({ is_verified: false }).eq('id', teacherId)
      setMessage(`✅ Certificate ${status} successfully.`)
      fetchAll()
    } catch (err) {
      setMessage('Error: ' + err.message)
    }
  }

  const updateBooking = async (id, status) => {
    try {
      await supabase.from('bookings').update({ status }).eq('id', id)
      setMessage(`✅ Booking ${status} successfully.`)
      fetchAll()
    } catch (err) {
      setMessage('Error: ' + err.message)
    }
  }

  const pendingCerts = certificates.filter(c => c.status === 'pending')
  const pendingBookings = bookings.filter(b => b.status === 'pending')

  return (
    <div style={{ minHeight: '100vh', background: GREY_BG, fontFamily: 'DM Sans, sans-serif' }}>

      {/* NAV */}
      <nav style={{ background: BLUE, padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '700', color: '#fff', textDecoration: 'none' }}>
          Teach<span style={{ color: YELLOW }}>Me</span>
          <span style={{ fontSize: '12px', fontWeight: '400', color: 'rgba(255,255,255,0.5)', marginLeft: '8px' }}>Admin</span>
        </Link>
        <Link to="/dashboard" style={{ padding: '8px 18px', background: YELLOW, color: BLUE, borderRadius: '5px', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>Dashboard</Link>
      </nav>

      {/* STATS */}
      <div style={{ background: BLUE, padding: '1.5rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {[
            ['Total teachers', teachers.length, '🎓'],
            ['Verified teachers', teachers.filter(t => t.is_verified).length, '✅'],
            ['Pending certificates', pendingCerts.length, '📋'],
            ['Pending bookings', pendingBookings.length, '📅']
          ].map(([label, value, icon]) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>{icon}</div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: '700', color: YELLOW }}>{value}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        {message && (
          <div style={{ background: message.startsWith('✅') ? '#E8F5E9' : LIGHT_BLUE, color: message.startsWith('✅') ? '#2E7D32' : BLUE, padding: '12px 16px', borderRadius: '8px', fontSize: '13px', marginBottom: '1.5rem' }}>
            {message}
          </div>
        )}

        {/* TABS */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', border: `1px solid ${GREY_LIGHT}`, borderRadius: '6px', overflow: 'hidden', maxWidth: '600px' }}>
          {[
            ['certificates', `Certificates (${pendingCerts.length} pending)`],
            ['teachers', 'All teachers'],
            ['bookings', `Bookings (${pendingBookings.length} pending)`]
          ].map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '10px', border: 'none', borderRight: `1px solid ${GREY_LIGHT}`, background: activeTab === tab ? BLUE : '#fff', color: activeTab === tab ? '#fff' : TEXT_MUTED, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: TEXT_MUTED, padding: '3rem' }}>Loading...</div>
        ) : (
          <>
            {/* CERTIFICATES TAB */}
            {activeTab === 'certificates' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {certificates.length === 0 ? (
                  <div style={{ textAlign: 'center', color: TEXT_MUTED, padding: '3rem' }}>No certificates uploaded yet.</div>
                ) : certificates.map(cert => (
                  <div key={cert.id} style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '20px' }}>📄</span>
                        <div style={{ fontSize: '15px', fontWeight: '500' }}>{cert.certificate_name}</div>
                        <span style={{ fontSize: '11px', padding: '2px 10px', borderRadius: '20px', background: cert.status === 'approved' ? '#E8F5E9' : cert.status === 'declined' ? LIGHT_BLUE : '#FFF8E1', color: cert.status === 'approved' ? '#2E7D32' : cert.status === 'declined' ? BLUE : '#795500' }}>
                          {cert.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: TEXT_MUTED }}>Teacher: {cert.teachers?.profiles?.full_name} · {cert.teachers?.profiles?.email}</div>
                      <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>Uploaded: {new Date(cert.uploaded_at).toLocaleDateString()}</div>
                      <a href={cert.file_url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: BLUE, marginTop: '4px', display: 'inline-block' }}>View certificate ↗</a>
                    </div>
                    {cert.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => updateCertificate(cert.id, 'approved', cert.teacher_id)} style={{ padding: '8px 16px', background: '#2E7D32', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Approve</button>
                        <button onClick={() => updateCertificate(cert.id, 'declined', cert.teacher_id)} style={{ padding: '8px 16px', background: BLUE, color: '#fff', border: 'none', borderRadius: '5px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Decline</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TEACHERS TAB */}
            {activeTab === 'teachers' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {teachers.length === 0 ? (
                  <div style={{ textAlign: 'center', color: TEXT_MUTED, padding: '3rem' }}>No teachers yet.</div>
                ) : teachers.map(teacher => (
                  <div key={teacher.id} style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '600', color: '#fff', flexShrink: 0 }}>
                      {teacher.profiles?.full_name?.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ fontSize: '15px', fontWeight: '500' }}>{teacher.profiles?.full_name}</div>
                        {teacher.is_verified && <span style={{ fontSize: '11px', background: '#E8F5E9', color: '#2E7D32', padding: '2px 8px', borderRadius: '20px' }}>✓ Verified</span>}
                      </div>
                      <div style={{ fontSize: '13px', color: TEXT_MUTED }}>{teacher.profiles?.email} · {teacher.profiles?.city}, {teacher.profiles?.country}</div>
                      {teacher.subjects && <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>{teacher.subjects.join(', ')}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* BOOKINGS TAB */}
            {activeTab === 'bookings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {bookings.length === 0 ? (
                  <div style={{ textAlign: 'center', color: TEXT_MUTED, padding: '3rem' }}>No bookings yet.</div>
                ) : bookings.map(booking => (
                  <div key={booking.id} style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <div style={{ fontSize: '15px', fontWeight: '500' }}>{booking.subject}</div>
                        <span style={{ fontSize: '11px', padding: '2px 10px', borderRadius: '20px', background: booking.status === 'confirmed' ? '#E8F5E9' : booking.status === 'declined' ? LIGHT_BLUE : '#FFF8E1', color: booking.status === 'confirmed' ? '#2E7D32' : booking.status === 'declined' ? BLUE : '#795500', textTransform: 'capitalize' }}>
                          {booking.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: TEXT_MUTED }}>From: {booking.profiles?.full_name} → To: {booking.teachers?.profiles?.full_name}</div>
                      <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>{booking.message?.slice(0, 100)}...</div>
                    </div>
                    {booking.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => updateBooking(booking.id, 'confirmed')} style={{ padding: '8px 16px', background: '#2E7D32', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Confirm</button>
                        <button onClick={() => updateBooking(booking.id, 'declined')} style={{ padding: '8px 16px', background: BLUE, color: '#fff', border: 'none', borderRadius: '5px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Decline</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}