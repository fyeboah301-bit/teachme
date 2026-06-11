import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BLUE, YELLOW, LIGHT_BLUE, GREY_BG, GREY_LIGHT, TEXT_MUTED } from '../styles/colors'

export default function Referrals() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [rewards, setRewards] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!user) navigate('/login')
    else fetchRewards()
  }, [user])

  const fetchRewards = async () => {
    const { data } = await supabase
      .from('referral_rewards')
      .select('*, referred:referred_id (full_name, role)')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false })
    setRewards(data || [])
    setLoading(false)
  }

  const referralLink = `${window.location.origin}/register?ref=${profile?.referral_code}`

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const earnedCount = rewards.filter(r => r.reward_status !== 'pending').length

  return (
    <div style={{ minHeight: '100vh', background: GREY_BG, fontFamily: 'DM Sans, sans-serif' }}>

      {/* NAV */}
      <nav style={{ background: BLUE, padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '700', color: '#fff', textDecoration: 'none' }}>
          Teach<span style={{ color: YELLOW }}>Me</span>
        </Link>
        <Link to="/dashboard" style={{ padding: '8px 18px', background: YELLOW, color: BLUE, borderRadius: '5px', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>Dashboard</Link>
      </nav>

      <div style={{ background: BLUE, padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '0.5rem' }}>🎁</div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: '#fff', marginBottom: '6px' }}>Refer & Earn</h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', maxWidth: '500px', margin: '0 auto' }}>
          Invite friends to TeachMe. When they sign up and {profile?.role === 'teacher' ? 'complete their first booking' : 'book a teacher'}, you both earn rewards.
        </p>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>

        {/* REFERRAL LINK */}
        <div style={{ background: '#fff', borderRadius: '10px', border: `2px solid ${YELLOW}`, padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '500', color: BLUE, marginBottom: '12px' }}>Your referral link</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: GREY_BG, borderRadius: '6px', padding: '10px 14px' }}>
            <input readOnly value={referralLink} style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '13px', color: '#444', outline: 'none' }} />
            <button onClick={copyLink} style={{ padding: '8px 18px', background: BLUE, color: '#fff', border: 'none', borderRadius: '5px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <p style={{ fontSize: '12px', color: TEXT_MUTED, marginTop: '10px' }}>Your referral code: <strong>{profile?.referral_code}</strong></p>
        </div>

        {/* REWARD RULES */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🎓</div>
            <h4 style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>You refer a learner/parent</h4>
            <p style={{ fontSize: '12px', color: TEXT_MUTED }}>Get <strong style={{ color: BLUE }}>10% off</strong> your next booking when they complete their first booking</p>
          </div>
          <div style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>👩‍🏫</div>
            <h4 style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>You refer a teacher</h4>
            <p style={{ fontSize: '12px', color: TEXT_MUTED }}>Earn a <strong style={{ color: BLUE }}>Referral Star</strong> badge for every 5 verified teacher referrals</p>
          </div>
        </div>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: BLUE, borderRadius: '10px', padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '700', color: YELLOW }}>{rewards.length}</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Total referrals</div>
          </div>
          <div style={{ background: '#2E7D32', borderRadius: '10px', padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '700', color: '#fff' }}>{earnedCount}</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>Rewards earned</div>
          </div>
        </div>

        {/* REFERRAL HISTORY */}
        <h2 style={{ fontSize: '16px', fontWeight: '500', color: BLUE, marginBottom: '0.75rem' }}>Your referrals</h2>
        {loading ? (
          <p style={{ fontSize: '13px', color: TEXT_MUTED }}>Loading...</p>
        ) : rewards.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '10px', border: `1px solid ${GREY_LIGHT}`, padding: '2rem', textAlign: 'center', color: TEXT_MUTED }}>
            <div style={{ fontSize: '40px', marginBottom: '1rem' }}>📨</div>
            <p style={{ fontSize: '13px' }}>You haven't referred anyone yet. Share your link to get started!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rewards.map(r => (
              <div key={r.id} style={{ background: '#fff', borderRadius: '8px', border: `1px solid ${GREY_LIGHT}`, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '500' }}>{r.referred?.full_name}</div>
                  <div style={{ fontSize: '11px', color: TEXT_MUTED, textTransform: 'capitalize' }}>{r.referred?.role} · {new Date(r.created_at).toLocaleDateString()}</div>
                </div>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: r.reward_status === 'pending' ? '#FFF8E1' : '#E8F5E9', color: r.reward_status === 'pending' ? '#795500' : '#2E7D32', textTransform: 'capitalize' }}>
                  {r.reward_status}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* PRIVACY NOTICE */}
        <div style={{ background: LIGHT_BLUE, borderRadius: '10px', padding: '1rem 1.25rem', marginTop: '1.5rem', border: `1px solid ${GREY_LIGHT}` }}>
          <p style={{ fontSize: '12px', color: BLUE }}>
            💡 Sharing your TeachMe referral link is the only way to earn rewards. Off-platform referrals (e.g. sharing teacher contacts directly) don't qualify and may violate our Terms of Service.
          </p>
        </div>
      </div>
    </div>
  )
}