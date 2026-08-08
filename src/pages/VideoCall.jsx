import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { YELLOW, GRADIENT_BLUE, TRANSITION } from '../styles/colors'

export default function VideoCall() {
  const { roomId } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user])

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!user) return null

  const displayName = profile?.full_name || 'Guest'
  const domain = 'meet.jit.si'
  const src = `https://${domain}/${roomId}#userInfo.displayName="${encodeURIComponent(displayName)}"&config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.SHOW_WATERMARK_FOR_GUESTS=false`

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  return (
    <div style={{ height: '100vh', background: '#0F172A', fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* HEADER */}
      <div style={{ background: '#1E293B', borderBottom: '1px solid #334155', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px', flexShrink: 0, zIndex: 10 }}>

        {/* LEFT — LOGO + STATUS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/dashboard" style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '700', color: '#fff', textDecoration: 'none', letterSpacing: '-0.02em', flexShrink: 0 }}>
            Teach<span style={{ color: YELLOW }}>Me</span>
          </Link>

          {/* LIVE INDICATOR */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '50px', padding: '4px 12px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#EF4444', animation: 'blink 1s ease-in-out infinite', flexShrink: 0 }} />
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#EF4444', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Live</span>
          </div>

          {/* TIMER */}
          {iframeLoaded && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50px', padding: '4px 12px' }}>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>⏱</span>
              <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#94A3B8', fontWeight: '600', letterSpacing: '0.05em' }}>{formatTime(elapsed)}</span>
            </div>
          )}
        </div>

        {/* CENTER — ROOM INFO */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#475569', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1px' }}>Video Session</div>
          <div style={{ fontSize: '11px', color: '#334155', fontFamily: 'monospace', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
            {roomId}
          </div>
        </div>

        {/* RIGHT — USER + LEAVE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #334155' }} />
            ) : (
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #1A3FA0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', color: '#fff' }}>
                {profile?.full_name?.charAt(0)}
              </div>
            )}
            <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '500', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.full_name?.split(' ')[0]}
            </span>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Leave this session? The call will continue for other participants.')) {
                navigate(-1)
              }
            }}
            style={{ padding: '8px 18px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700', transition: TRANSITION, boxShadow: '0 2px 8px rgba(239,68,68,0.35)' }}
            onMouseEnter={e => e.currentTarget.style.background = '#DC2626'}
            onMouseLeave={e => e.currentTarget.style.background = '#EF4444'}
          >
            Leave call
          </button>
        </div>
      </div>

      {/* LOADING STATE */}
      {!iframeLoaded && (
        <div style={{ position: 'absolute', inset: 0, top: '56px', background: '#0F172A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 5, gap: '1.5rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(37,99,235,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', border: '1px solid rgba(37,99,235,0.2)' }}>
            🎥
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '6px', letterSpacing: '-0.01em' }}>Connecting to session...</div>
            <div style={{ fontSize: '13px', color: '#475569' }}>Please allow camera and microphone access when prompted</div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563EB', animation: `dot 1.4s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
        </div>
      )}

      {/* IFRAME */}
      <div style={{ flex: 1, position: 'relative', background: '#0F172A' }}>
        <iframe
          src={src}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          style={{ width: '100%', height: '100%', border: 'none', position: 'absolute', inset: 0, opacity: iframeLoaded ? 1 : 0, transition: 'opacity 0.5s ease' }}
          title="TeachMe Video Call"
          onLoad={() => setIframeLoaded(true)}
        />
      </div>

      {/* PRIVACY BAR */}
      <div style={{ background: '#1E293B', borderTop: '1px solid #334155', padding: '6px 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexShrink: 0 }}>
        <span style={{ fontSize: '12px' }}>🔒</span>
        <span style={{ fontSize: '11px', color: '#475569', fontWeight: '500' }}>
          End-to-end encrypted · Never share personal contact details · Keep all communication on TeachMe
        </span>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes dot   { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
      `}</style>
    </div>
  )
}