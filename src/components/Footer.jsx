import { BLUE, YELLOW } from '../styles/colors'

export default function Footer({ variant = 'yellow' }) {
  const bg = variant === 'blue' ? BLUE : YELLOW
  const textColor = variant === 'blue' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'
  const linkColor = variant === 'blue' ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.6)'
  const logoColor = variant === 'blue' ? '#fff' : BLUE
  const accentColor = variant === 'blue' ? YELLOW : BLUE

  return (
    <footer style={{ background: bg, padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '700', color: logoColor }}>
        Teach<span style={{ color: accentColor }}>Me</span>
      </div>
      <div style={{ fontSize: '13px', color: textColor }}>
        © {new Date().getFullYear()} TeachMe. All rights reserved.
      </div>
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <span style={{ fontSize: '13px', color: linkColor, cursor: 'pointer' }}>Privacy</span>
        <span style={{ fontSize: '13px', color: linkColor, cursor: 'pointer' }}>Terms</span>
        <span style={{ fontSize: '13px', color: linkColor, cursor: 'pointer' }}>Contact</span>
      </div>
    </footer>
  )
}