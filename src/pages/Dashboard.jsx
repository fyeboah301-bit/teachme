import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { BLUE, YELLOW, LIGHT_BLUE, GREY_BG, GREY_LIGHT, TEXT_MUTED, DARK_BLUE } from '../styles/colors'

export default function Dashboard() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div style={{ minHeight: '100vh', background: GREY_BG, fontFamily: 'DM Sans, sans-serif' }}>

      {/* NAV */}
      <nav style={{ background: BLUE, padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '700', color: '#fff' }}>
          Teach<span style={{ color: YELLOW }}>Me</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/teachers" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Find teachers</Link>
          <Link to="/sessions" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Live sessions</Link>
          <Link to="/booking" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Book tuition</Link>
          {profile?.role === 'teacher' && (
            <Link to="/admin" style={{ fontSize: '13px', color: YELLOW, textDecoration: 'none' }}>Admin</Link>
          )}
          <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>{profile?.full_name}</span>
          <button onClick={handleSignOut} style={{ padding: '7px 16px', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', background: 'transparent', borderRadius: '5px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
            Log out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem' }}>

        {/* Welcome */}
        <div style={{ background: BLUE, borderRadius: '10px', padding: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: '600', color: '#fff', marginBottom: '6px' }}>
              Welcome, {profile?.full_name?.split(' ')[0]} 👋
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
              You are logged in as a <span style={{ color: YELLOW, textTransform: 'capitalize', fontWeight: '500' }}>{profile?.role}</span>
            </p>
          </div>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: YELLOW, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '700', color: BLUE }}>
            {profile?.full_name?.charAt(0)}
          </div>
        </div>

        {/* Profile card */}
        <div style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: `1px solid ${GREY_LIGHT}`, color: BLUE }}>Your profile</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              ['Full name', profile?.full_name],
              ['Email', profile?.email],
              ['Phone', profile?.phone],
              ['Location', `${profile?.city}, ${profile?.country}`]
            ].map(([label, value]) => (
              <div key={label} style={{ background: GREY_BG, borderRadius: '7px', padding: '10px 14px' }}>
                <div style={{ fontSize: '11px', fontWeight: '500', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>{value || '—'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Find Teachers', icon: '🎓', link: '/teachers' },
            { label: 'Live Sessions', icon: '🎥', link: '/sessions' },
            { label: 'Book Tuition', icon: '📅', link: '/booking' }
          ].map(({ label, icon, link }) => (
            <Link key={label} to={link} style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, padding: '1.25rem', textAlign: 'center', textDecoration: 'none', display: 'block' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: BLUE }}>{label}</div>
            </Link>
          ))}
        </div>

        {profile?.role === 'teacher' && (
          <TeacherUploads userId={profile.id} />
        )}

        {profile?.role === 'parent' && (
          <div style={{ background: '#fff', border: `1px solid ${GREY_LIGHT}`, borderRadius: '10px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '500', marginBottom: '8px', color: BLUE }}>👨‍👩‍👧 What you can do</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Browse verified teacher profiles', 'Watch teaching preview videos', 'Book home tuition for your ward'].map((item, i) => (
                <li key={i} style={{ fontSize: '13px', color: TEXT_MUTED, display: 'flex', gap: '8px' }}>
                  <span style={{ color: BLUE, fontWeight: '600' }}>✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {profile?.role === 'learner' && (
          <div style={{ background: '#fff', border: `1px solid ${GREY_LIGHT}`, borderRadius: '10px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '500', marginBottom: '8px', color: BLUE }}>📚 What you can do</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Browse verified teacher profiles', 'Enroll in live online sessions', 'Book private home tuition'].map((item, i) => (
                <li key={i} style={{ fontSize: '13px', color: TEXT_MUTED, display: 'flex', gap: '8px' }}>
                  <span style={{ color: BLUE, fontWeight: '600' }}>✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

function TeacherUploads({ userId }) {
  const [certFile, setCertFile] = useState(null)
  const [certName, setCertName] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [videoTitle, setVideoTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [certificates, setCertificates] = useState([])
  const [videos, setVideos] = useState([])

  const fetchUploads = async () => {
    const { data: certs } = await supabase.from('certificates').select('*').eq('teacher_id', userId)
    const { data: vids } = await supabase.from('pitch_videos').select('*').eq('teacher_id', userId)
    if (certs) setCertificates(certs)
    if (vids) setVideos(vids)
  }

  useState(() => { fetchUploads() }, [])

  const uploadCertificate = async () => {
    if (!certFile || !certName) return setMessage('Please select a file and enter a certificate name.')
    setUploading(true)
    setMessage('')
    try {
      const fileExt = certFile.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('certificates').upload(fileName, certFile)
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('certificates').getPublicUrl(fileName)
      await supabase.from('certificates').insert({ teacher_id: userId, file_url: urlData.publicUrl, certificate_name: certName, status: 'pending' })
      setMessage('✅ Certificate uploaded! Our team will verify it within 24–48 hours.')
      setCertFile(null)
      setCertName('')
      fetchUploads()
    } catch (err) {
      setMessage('Error: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const uploadVideo = async () => {
    if (!videoFile || !videoTitle) return setMessage('Please select a video and enter a title.')
    if (videos.length >= 2) return setMessage('You can only upload 2 pitch videos.')
    setUploading(true)
    setMessage('')
    try {
      const fileExt = videoFile.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('pitch-videos').upload(fileName, videoFile)
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('pitch-videos').getPublicUrl(fileName)
      await supabase.from('pitch_videos').insert({ teacher_id: userId, video_url: urlData.publicUrl, title: videoTitle })
      setMessage('✅ Video uploaded successfully!')
      setVideoFile(null)
      setVideoTitle('')
      fetchUploads()
    } catch (err) {
      setMessage('Error: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {message && (
        <div style={{ background: message.startsWith('✅') ? '#E8F5E9' : LIGHT_BLUE, color: message.startsWith('✅') ? '#2E7D32' : BLUE, padding: '12px 16px', borderRadius: '8px', fontSize: '13px' }}>
          {message}
        </div>
      )}
      <div style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, overflow: 'hidden' }}>
        <div style={{ background: BLUE, padding: '1rem 1.5rem' }}>
          <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '500' }}>📋 Upload Certificates</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '3px' }}>Verified within 24–48 hours</p>
        </div>
        <div style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ marginBottom: '10px' }}>
            <label style={lbl}>Certificate name</label>
            <input style={inp} placeholder="e.g. BSc Mathematics — University of Ghana" value={certName} onChange={e => setCertName(e.target.value)} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={lbl}>Upload file (PDF, JPG, PNG)</label>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setCertFile(e.target.files[0])} style={{ fontSize: '13px', color: '#444' }} />
          </div>
          <button onClick={uploadCertificate} disabled={uploading} style={btnBlue}>
            {uploading ? 'Uploading...' : 'Upload certificate'}
          </button>
          {certificates.length > 0 && (
            <div style={{ marginTop: '1.25rem', borderTop: `1px solid ${GREY_LIGHT}`, paddingTop: '1rem' }}>
              <div style={lbl}>Uploaded certificates</div>
              {certificates.map(cert => (
                <div key={cert.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: GREY_BG, borderRadius: '6px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '18px' }}>📄</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '500' }}>{cert.certificate_name}</div>
                    <div style={{ fontSize: '11px', color: TEXT_MUTED }}>{new Date(cert.uploaded_at).toLocaleDateString()}</div>
                  </div>
                  <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: cert.status === 'approved' ? '#E8F5E9' : cert.status === 'declined' ? LIGHT_BLUE : '#FFF8E1', color: cert.status === 'approved' ? '#2E7D32' : cert.status === 'declined' ? BLUE : '#795500' }}>
                    {cert.status === 'approved' ? '✓ Approved' : cert.status === 'declined' ? '✗ Declined' : '⏳ Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, overflow: 'hidden' }}>
        <div style={{ background: BLUE, padding: '1rem 1.5rem' }}>
          <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '500' }}>🎥 Upload Pitch Videos</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '3px' }}>Max 2 videos, 30 seconds each</p>
        </div>
        <div style={{ padding: '1.25rem 1.5rem' }}>
          {videos.length < 2 ? (
            <>
              <div style={{ marginBottom: '10px' }}>
                <label style={lbl}>Video title</label>
                <input style={inp} placeholder="e.g. My Mathematics teaching style" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={lbl}>Upload video (MP4, MOV — max 30 seconds)</label>
                <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files[0])} style={{ fontSize: '13px', color: '#444' }} />
              </div>
              <button onClick={uploadVideo} disabled={uploading} style={btnBlue}>
                {uploading ? 'Uploading...' : 'Upload video'}
              </button>
            </>
          ) : (
            <div style={{ fontSize: '13px', color: TEXT_MUTED }}>Maximum of 2 pitch videos uploaded.</div>
          )}
          {videos.length > 0 && (
            <div style={{ marginTop: '1.25rem', borderTop: `1px solid ${GREY_LIGHT}`, paddingTop: '1rem' }}>
              <div style={lbl}>Uploaded videos</div>
              {videos.map(vid => (
                <div key={vid.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: GREY_BG, borderRadius: '6px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '18px' }}>🎬</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '500' }}>{vid.title}</div>
                    <div style={{ fontSize: '11px', color: TEXT_MUTED }}>{new Date(vid.uploaded_at).toLocaleDateString()}</div>
                  </div>
                  <a href={vid.video_url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: BLUE }}>View</a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const lbl = { fontSize: '11px', fontWeight: '500', color: TEXT_MUTED, display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }
const inp = { width: '100%', padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', marginBottom: '4px' }
const btnBlue = { padding: '10px 22px', background: BLUE, color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }