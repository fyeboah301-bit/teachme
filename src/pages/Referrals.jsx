import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BLUE, YELLOW, LIGHT_BLUE, GREY_BG, GREY_LIGHT, TEXT_MUTED, DARK_BLUE } from '../styles/colors'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import referralsImg from '../assets/images/referrals.png'
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

export default function Referrals() {
  usePageMeta('Refer & Earn', 'Invite friends to TeachMe and earn rewards when they complete their first booking.')

  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [rewards, setRewards] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [referralCode, setReferralCode] = useState(profile?.referral_code || '')

  useEffect(() => {
    if (!user) navigate('/login')
    else { fetchRewards(); ensureReferralCode() }
  }, [user?.id])

  const ensureReferralCode = async () => {
    if (profile?.referral_code) { setReferralCode(profile.referral_code); return }
    const code = 'TM' + user.id.replace(/-/g, '').slice(0, 6).toUpperCase()
    await supabase.from('profiles').update({ referral_code: code }).eq('id', user.id)
    setReferralCode(code)
  }

  const fetchRewards = async () => {
    const { data } = await supabase
      .from('referral_rewards')
      .select('*, referred:referred_id (full_name, role)')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false })
    setRewards(data || [])
    setLoading(false)
  }

  const referralLink = `${window.location.origin}/register?ref=${referralCode}`

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const shareWhatsApp = () => {
    const text = `Join me on TeachMe — Ghana's trusted platform for verified home tutors! Sign up with my link: ${referralLink}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const shareTwitter = () => {
    const text = `Find amazing tutors on TeachMe! Sign up with my referral link: ${referralLink} #TeachMe #Education #Ghana`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
  }

  const shareEmail = () => {
    const subject = 'Join me on TeachMe!'
    const body = `Hi!\n\nI've been using TeachMe to find great tutors and thought you'd love it.\n\nSign up with my link:\n${referralLink}\n\nSee you there!`
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
  }

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank')
  }

  const earnedCount = rewards.filter(r => r.reward_status !== 'pending').length
  const pendingCount = rewards.filter(r => r.reward_status === 'pending').length

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <NavBar />

      <div style={{ background: `linear-gradient(rgba(37,99,235,0.85), rgba(26,63,160,0.93)), url(${referralsImg})`, backgroundSize: 'cover', backgroundPosition: 'center', padding: isMobile ? '2rem 1rem' : '3rem 2rem' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', color: YELLOW, fontSize: '11px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', padding: '4px 12px', borderRadius: '20px', marginBottom: '10px' }}>
                🎁 Refer & Earn
              </div>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? '26px' : '34px', color: '#fff', marginBottom: '8px', fontWeight: '700', lineHeight: '1.2' }}>
                Invite friends,<br />earn rewards together
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', margin: 0, maxWidth: '480px', lineHeight: '1.6' }}>
                {profile?.role === 'teacher'
                  ? 'Invite other teachers and learners to TeachMe. When they complete their first booking, you both get rewarded.'
                  : 'Invite friends to TeachMe. When they book a teacher for the first time, you both earn rewards.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(3, 200px)', gap: '10px' }}>
            {[
              ['🤝', rewards.length, 'Total referrals'],
              ['⏳', pendingCount, 'Pending rewards'],
              ['✅', earnedCount, 'Rewards earned'],
            ].map(([icon, value, label]) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '12px', padding: isMobile ? '1rem' : '1.25rem', textAlign: 'center', backdropFilter: 'blur(4px)' }}>
                <div style={{ fontSize: isMobile ? '20px' : '24px', marginBottom: '6px' }}>{icon}</div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? '24px' : '32px', fontWeight: '700', color: YELLOW, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '5px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: isMobile ? '1.25rem 1rem' : '2rem', flex: 1, width: '100%', boxSizing: 'border-box' }}>

        <div style={{ background: '#fff', borderRadius: '16px', border: `2px solid ${YELLOW}`, padding: isMobile ? '1.25rem' : '2rem', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(255,215,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '22px' }}>🔗</span>
            <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#111', margin: 0 }}>Your referral link</h3>
          </div>
          <p style={{ fontSize: '13px', color: TEXT_MUTED, marginBottom: '16px', marginTop: '4px' }}>
            Share this link. Anyone who signs up through it will be linked to your account automatically.
          </p>

          <div style={{ background: GREY_BG, borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, padding: '4px 4px 4px 16px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <input readOnly value={referralLink}
              style={{ flex: 1, border: 'none', background: 'transparent', fontSize: isMobile ? '12px' : '14px', color: '#444', outline: 'none', minWidth: 0 }}
              onFocus={e => e.target.select()}
            />
            <button onClick={copyLink}
              style={{ padding: '10px 20px', background: copied ? '#166534' : BLUE, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700', whiteSpace: 'nowrap', flexShrink: 0, transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {copied ? '✓ Copied!' : '📋 Copy link'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: LIGHT_BLUE, borderRadius: '10px', padding: '10px 16px', border: `1px solid #BFDBFE` }}>
              <span style={{ fontSize: '12px', color: TEXT_MUTED, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your code</span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: BLUE, letterSpacing: '3px', fontFamily: 'monospace' }}>{referralCode}</span>
            </div>
            <p style={{ fontSize: '12px', color: TEXT_MUTED, margin: 0 }}>Friends can also type this code manually at signup</p>
          </div>

          <div>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#111', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Share via</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[
                { label: 'WhatsApp', icon: '💬', bg: '#25D366', fn: shareWhatsApp },
                { label: 'Facebook', icon: '📘', bg: '#1877F2', fn: shareFacebook },
                { label: 'Twitter', icon: '🐦', bg: '#1DA1F2', fn: shareTwitter },
                { label: 'Email', icon: '✉️', bg: '#EA4335', fn: shareEmail },
              ].map(({ label, icon, bg, fn }) => (
                <button key={label} onClick={fn}
                  style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: isMobile ? '10px 14px' : '11px 20px', background: bg, color: '#fff', border: 'none', borderRadius: '10px', fontSize: isMobile ? '13px' : '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700', boxShadow: `0 2px 8px ${bg}40`, transition: 'transform 0.1s, box-shadow 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  <span style={{ fontSize: '17px' }}>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '16px', border: `1px solid ${GREY_LIGHT}`, padding: isMobile ? '1.25rem' : '1.75rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            💡 How it works
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '0' : '1rem', position: 'relative' }}>
            {[
              { icon: '🔗', step: '1', title: 'Share your link', desc: 'Send your unique link to friends via WhatsApp, Facebook, or email — any channel works.' },
              { icon: '📝', step: '2', title: 'They sign up', desc: 'Your friend registers on TeachMe using your link. Your code is automatically applied.' },
              { icon: '🎁', step: '3', title: 'You both earn', desc: 'Once they complete their first booking, you earn a reward automatically.' },
            ].map(({ icon, step, title, desc }, i) => (
              <div key={title} style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? '14px' : '10px', alignItems: isMobile ? 'flex-start' : 'center', textAlign: isMobile ? 'left' : 'center', padding: isMobile ? '1rem 0' : '1.25rem', borderBottom: isMobile && i < 2 ? `1px solid ${GREY_LIGHT}` : 'none', position: 'relative' }}>
                {!isMobile && i < 2 && (
                  <div style={{ position: 'absolute', right: '-0.5rem', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', color: GREY_LIGHT, zIndex: 1 }}>→</div>
                )}
                <div style={{ width: isMobile ? '48px' : '60px', height: isMobile ? '48px' : '60px', borderRadius: '50%', background: LIGHT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? '22px' : '28px', flexShrink: 0, position: 'relative' }}>
                  {icon}
                  <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '20px', height: '20px', borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: '#fff', border: '2px solid #fff' }}>{step}</div>
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#111', marginBottom: '4px' }}>{title}</h4>
                  <p style={{ fontSize: '13px', color: TEXT_MUTED, lineHeight: '1.6', margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '16px', border: `1px solid ${GREY_LIGHT}`, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '1.5rem' }}>
          <div style={{ background: `linear-gradient(135deg, ${BLUE} 0%, ${DARK_BLUE} 100%)`, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>👥</span>
              <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '700', margin: 0 }}>Your referrals</h3>
            </div>
            {rewards.length > 0 && (
              <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '3px 10px', borderRadius: '20px', fontWeight: '700' }}>{rewards.length} total</span>
            )}
          </div>

          {loading ? (
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[1, 2].map(i => (
                <div key={i} style={{ height: '60px', background: '#E2E8F0', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
              ))}
              <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
            </div>
          ) : rewards.length === 0 ? (
            <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '52px', marginBottom: '1rem' }}>📨</div>
              <h4 style={{ fontSize: '17px', fontWeight: '700', color: '#111', marginBottom: '8px' }}>No referrals yet</h4>
              <p style={{ fontSize: '14px', color: TEXT_MUTED, marginBottom: '1.5rem', maxWidth: '320px', margin: '0 auto 1.5rem' }}>
                Share your referral link to start earning rewards when friends join TeachMe.
              </p>
              <button onClick={shareWhatsApp}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700' }}>
                <span style={{ fontSize: '18px' }}>💬</span> Share on WhatsApp
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {!isMobile && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 100px', gap: '1rem', padding: '10px 1.5rem', background: GREY_BG, borderBottom: `1px solid ${GREY_LIGHT}` }}>
                  {['Person', 'Role', 'Joined', 'Status'].map(h => (
                    <span key={h} style={{ fontSize: '11px', fontWeight: '700', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</span>
                  ))}
                </div>
              )}
              {rewards.map((r, i) => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 1.5rem', borderBottom: i < rewards.length - 1 ? `1px solid ${GREY_LIGHT}` : 'none', flexWrap: 'wrap' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `linear-gradient(135deg, ${BLUE}, ${DARK_BLUE})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>
                    {r.referred?.full_name?.charAt(0) || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#111' }}>{r.referred?.full_name || 'Anonymous'}</div>
                    <div style={{ fontSize: '12px', color: TEXT_MUTED, display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                      <span style={{ textTransform: 'capitalize', background: LIGHT_BLUE, color: BLUE, padding: '1px 8px', borderRadius: '20px', fontWeight: '600' }}>{r.referred?.role || '—'}</span>
                      <span>Joined {new Date(r.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', padding: '5px 14px', borderRadius: '20px', fontWeight: '700', flexShrink: 0, background: r.reward_status === 'pending' ? '#FEF9C3' : '#DCFCE7', color: r.reward_status === 'pending' ? '#854D0E' : '#166534', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {r.reward_status === 'pending' ? '⏳ Pending' : '✅ Earned'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: '#fff', borderRadius: '16px', border: `1px solid ${GREY_LIGHT}`, padding: isMobile ? '1.25rem' : '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>🏆 Reward statuses explained</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { bg: '#FEF9C3', color: '#854D0E', icon: '⏳', label: 'Pending', desc: "Your friend signed up but hasn't completed their first booking yet." },
              { bg: '#DCFCE7', color: '#166534', icon: '✅', label: 'Earned', desc: 'Your friend completed their first booking. Your reward has been credited.' },
            ].map(({ bg, color, icon, label, desc }) => (
              <div key={label} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 14px', background: bg + '40', borderRadius: '10px', border: `1px solid ${bg}` }}>
                <span style={{ fontSize: '20px', flexShrink: 0 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color, marginBottom: '2px' }}>{label}</div>
                  <div style={{ fontSize: '13px', color: TEXT_MUTED, lineHeight: '1.5' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: LIGHT_BLUE, borderRadius: '12px', padding: '1rem 1.25rem', border: `1px solid #BFDBFE`, display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '18px', flexShrink: 0 }}>💡</span>
          <p style={{ fontSize: '13px', color: '#1E40AF', lineHeight: '1.7', margin: 0 }}>
            Rewards are only granted for sign-ups through your unique referral link or code. Off-platform referrals don't qualify and may violate our Terms of Service.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}