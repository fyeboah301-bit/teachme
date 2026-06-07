import { Link } from 'react-router-dom'

const BLUE = '#2563EB'
const YELLOW = '#FFD700'
const DARK_BLUE = '#1A3FA0'
const LIGHT_YELLOW = '#FFFBEA'
const LIGHT_BLUE = '#EEF4FF'

export default function Home() {
  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', background: '#fff', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ background: BLUE, padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '700', color: '#fff' }}>
          Teach<span style={{ color: YELLOW }}>Me</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/login" style={{ padding: '8px 18px', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', borderRadius: '5px', fontSize: '13px', textDecoration: 'none' }}>Log in</Link>
          <Link to="/register" style={{ padding: '8px 18px', background: YELLOW, color: BLUE, borderRadius: '5px', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>Get started</Link>
          <Link to="/teachers" style={{ padding: '8px 18px', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', borderRadius: '5px', fontSize: '13px', textDecoration: 'none' }}>Find teachers</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: BLUE, padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '650px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '2.5px', color: YELLOW, marginBottom: '1rem' }}>Verified. Trusted. Effective.</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '46px', fontWeight: '700', color: '#fff', lineHeight: '1.12', marginBottom: '1.25rem' }}>
            Find the <em style={{ fontStyle: 'italic', color: YELLOW }}>right teacher</em> for every learner
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', lineHeight: '1.8', marginBottom: '2rem' }}>
            TeachMe connects verified, certificate-checked teachers with parents and learners — for home tuition or live online sessions.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ padding: '13px 28px', background: YELLOW, color: BLUE, borderRadius: '5px', fontSize: '15px', textDecoration: 'none', fontWeight: '700' }}>Join as a teacher</Link>
            <Link to="/register" style={{ padding: '13px 28px', border: '2px solid rgba(255,255,255,0.5)', color: '#fff', borderRadius: '5px', fontSize: '15px', textDecoration: 'none' }}>Find a teacher</Link>
          </div>
          <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            {[['2,400+', 'Verified teachers'], ['40+', 'Subjects covered'], ['24h', 'Avg verification time']].map(([val, label]) => (
              <div key={label}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: '700', color: YELLOW }}>{val}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '5rem 2rem', background: LIGHT_YELLOW }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ width: '36px', height: '3px', background: BLUE, borderRadius: '2px', margin: '0 auto 1rem' }}></div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '600', marginBottom: '8px', color: '#2563EB' }}>How TeachMe works</h2>
            <p style={{ fontSize: '15px', color: '#2563EB' }}>From sign-up to first lesson in three simple steps</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {[
              ['01', 'Create your profile', 'Teachers upload certificates and pitch videos. Parents and learners only need phone, email, country, and city.'],
              ['02', 'We verify teachers', 'Our team checks every certificate within 24–48 hours. Only approved teachers appear in search.'],
              ['03', 'Book or enroll', 'Book a teacher for home tuition, or enroll in a live online class — all on the platform.']
            ].map(([num, title, desc]) => (
              <div key={num} style={{ borderLeft: `3px solid ${BLUE}`, padding: '1.5rem', background: '#fff', borderRadius: '0 8px 8px 0' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '36px', fontWeight: '700', color: BLUE, marginBottom: '10px' }}>{num}</div>
                <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>{title}</h3>
                <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.7' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USER TYPES */}
      <section style={{ padding: '5rem 2rem', background: '#fff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ width: '36px', height: '3px', background: YELLOW, borderRadius: '2px', margin: '0 auto 1rem' }}></div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '600', marginBottom: '8px', color: '#111' }}>Built for everyone</h2>
            <p style={{ fontSize: '15px', color: '#2563EB' }}>Three distinct experiences</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {[
              { role: 'Teachers', bg: BLUE, color: '#fff', emoji: '🎓', desc: 'Build your profile and grow your students', features: ['Upload certificates for verification', 'Two 30-second pitch videos', 'Schedule live online sessions', 'Receive home tuition bookings'] },
              { role: 'Parents', bg: LIGHT_YELLOW, color: '#111', emoji: '👨‍👩‍👧', desc: 'Find trusted teachers for your children', features: ['Browse verified profiles', 'Watch teaching preview videos', 'Book home tuition for your ward', 'View teacher credentials'] },
              { role: 'Learners', bg: YELLOW, color: BLUE, emoji: '📚', desc: 'Take charge of your own education', features: ['Search teachers by subject', 'Enroll in live online classes', 'Book private home tuition', 'Watch teacher pitch videos'] }
            ].map(({ role, bg, color, emoji, desc, features }) => (
              <div key={role} style={{ border: '1px solid #E0E0E0', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ background: bg, padding: '1.5rem' }}>
                  <div style={{ fontSize: '28px', marginBottom: '10px' }}>{emoji}</div>
                  <h3 style={{ fontSize: '17px', fontWeight: '500', color }}>{role}</h3>
                  <p style={{ fontSize: '13px', color, opacity: 0.75, marginTop: '4px' }}>{desc}</p>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '9px' }}>
                    {features.map(f => (
                      <li key={f} style={{ fontSize: '13px', color: '#666', display: 'flex', gap: '8px' }}>
                        <span style={{ color: BLUE, fontWeight: '600' }}>✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #E0E0E0' }}>
                    <Link to="/register" style={{ padding: '10px 20px', background: role === 'Teachers' ? BLUE : role === 'Learners' ? YELLOW : 'transparent', color: role === 'Teachers' ? '#fff' : role === 'Learners' ? BLUE : '#111', border: `1px solid ${role === 'Parents' ? '#E0E0E0' : 'transparent'}`, borderRadius: '5px', fontSize: '13px', textDecoration: 'none', display: 'inline-block', fontWeight: '600' }}>
                      Sign up as a {role.toLowerCase().slice(0, -1)}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ background: YELLOW, padding: '4rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '700', color: BLUE, marginBottom: '12px' }}>Ready to get started?</h2>
        <p style={{ fontSize: '15px', color: DARK_BLUE, marginBottom: '2rem', opacity: 0.8 }}>Join thousands of teachers and learners on TeachMe today.</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/register" style={{ padding: '13px 28px', background: BLUE, color: '#fff', borderRadius: '5px', fontSize: '15px', textDecoration: 'none', fontWeight: '600' }}>Create an account</Link>
          <Link to="/teachers" style={{ padding: '13px 28px', border: `2px solid ${BLUE}`, color: BLUE, borderRadius: '5px', fontSize: '15px', textDecoration: 'none', fontWeight: '600' }}>Browse teachers</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: BLUE, padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '700', color: '#fff' }}>Teach<span style={{ color: YELLOW }}>Me</span></div>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>© 2025 TeachMe. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {['Privacy', 'Terms', 'Contact'].map(l => <a key={l} href="#" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>{l}</a>)}
        </div>
      </footer>

    </div>
  )
}