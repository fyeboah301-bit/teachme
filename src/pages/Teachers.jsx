import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import usePageMeta from '../hooks/usePageMeta'
import {
  BLUE, YELLOW, DARK_BLUE, LIGHT_BLUE, GREY_BG, GREY_LIGHT,
  TEXT, TEXT_MUTED, GRADIENT_BLUE, SHADOW_LG, SHADOW_XL,
  SHADOW_BLUE, SHADOW_YELLOW, TRANSITION, BORDER,
} from '../styles/colors'
import teacherImg from '../assets/images/teacher.png'

const SUBJECTS = ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'ICT', 'French', 'Economics', 'History', 'Geography']
const LEVELS = ['Primary', 'JHS', 'SHS', 'University', 'Adult Learning']

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

export default function Teachers() {
  usePageMeta('Find Teachers', 'Browse verified, certificate-checked teachers across Ghana. Filter by subject, level, location and rating.')

  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [searchParams, setSearchParams] = useSearchParams()
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Read initial state from URL
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || 'All')
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState({
    verifiedOnly: searchParams.get('verified') === '1',
    hasVideos: searchParams.get('videos') === '1',
    hasCerts: searchParams.get('certs') === '1',
    minRating: searchParams.get('minRating') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minPrice: searchParams.get('minPrice') || '',
    city: searchParams.get('city') || '',
    country: searchParams.get('country') || '',
    teachingLevel: searchParams.get('level') || '',
    sortBy: searchParams.get('sort') || 'default',
  })

  // Sync state to URL whenever filters/search/subject change
  useEffect(() => {
    const params = {}
    if (search) params.q = search
    if (selectedSubject !== 'All') params.subject = selectedSubject
    if (filters.verifiedOnly) params.verified = '1'
    if (filters.hasVideos) params.videos = '1'
    if (filters.hasCerts) params.certs = '1'
    if (filters.minRating) params.minRating = filters.minRating
    if (filters.minPrice) params.minPrice = filters.minPrice
    if (filters.maxPrice) params.maxPrice = filters.maxPrice
    if (filters.city) params.city = filters.city
    if (filters.country) params.country = filters.country
    if (filters.teachingLevel) params.level = filters.teachingLevel
    if (filters.sortBy !== 'default') params.sort = filters.sortBy
    setSearchParams(params, { replace: true })
  }, [search, selectedSubject, filters])

  useEffect(() => {
    if (profile?.role === 'teacher') navigate('/dashboard')
  }, [profile])

  useEffect(() => { fetchTeachers() }, [])

  const fetchTeachers = async () => {
    const { data } = await supabase
      .from('teachers')
      .select(`*, profiles (full_name, city, country, avatar_url, status, created_at), certificates (certificate_name, status, certificate_type), pitch_videos (title, video_url), reviews (rating), teaching_levels`)
    setTeachers(data || [])
    setLoading(false)
  }

  const setFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val }))

  const clearFilters = () => {
    setFilters({
      verifiedOnly: false, hasVideos: false, hasCerts: false,
      minRating: '', maxPrice: '', minPrice: '',
      city: '', country: '', teachingLevel: '', sortBy: 'default'
    })
    setSearch('')
    setSelectedSubject('All')
  }

  const cities = [...new Set(teachers.map(t => t.profiles?.city).filter(Boolean))].sort()
  const countries = [...new Set(teachers.map(t => t.profiles?.country).filter(Boolean))].sort()

  const activeFilterCount = [
    filters.verifiedOnly, filters.hasVideos, filters.hasCerts,
    filters.minRating, filters.maxPrice, filters.minPrice,
    filters.city, filters.country, filters.teachingLevel,
    filters.sortBy !== 'default'
  ].filter(Boolean).length

  const filtered = teachers
    .filter(t => {
      if (t.profiles?.status === 'suspended') return false
      const avg = t.reviews?.length > 0 ? t.reviews.reduce((s, r) => s + r.rating, 0) / t.reviews.length : 0
      if (selectedSubject !== 'All' && !(t.subjects?.includes(selectedSubject))) return false
      if (search) {
        const q = search.toLowerCase()
        if (!t.profiles?.full_name?.toLowerCase().includes(q) &&
          !t.subjects?.join(' ').toLowerCase().includes(q) &&
          !t.profiles?.city?.toLowerCase().includes(q)) return false
      }
      if (filters.verifiedOnly && !t.is_verified) return false
      if (filters.hasVideos && !(t.pitch_videos?.length > 0)) return false
      if (filters.hasCerts && !(t.certificates?.some(c => c.status === 'approved'))) return false
      if (filters.minRating && avg < parseFloat(filters.minRating)) return false
      if (filters.minPrice && (t.hourly_rate || 0) < parseFloat(filters.minPrice)) return false
      if (filters.maxPrice && (t.hourly_rate || 0) > parseFloat(filters.maxPrice)) return false
      if (filters.city && t.profiles?.city !== filters.city) return false
      if (filters.country && t.profiles?.country !== filters.country) return false
      if (filters.teachingLevel && !(t.teaching_levels || []).includes(filters.teachingLevel)) return false
      return true
    })
    .sort((a, b) => {
      const avgA = a.reviews?.length > 0 ? a.reviews.reduce((s, r) => s + r.rating, 0) / a.reviews.length : 0
      const avgB = b.reviews?.length > 0 ? b.reviews.reduce((s, r) => s + r.rating, 0) / b.reviews.length : 0
      if (filters.sortBy === 'rating') return avgB - avgA
      if (filters.sortBy === 'price_asc') return (a.hourly_rate || 0) - (b.hourly_rate || 0)
      if (filters.sortBy === 'price_desc') return (b.hourly_rate || 0) - (a.hourly_rate || 0)
      if (filters.sortBy === 'reviews') return (b.reviews?.length || 0) - (a.reviews?.length || 0)
      if (b.is_verified !== a.is_verified) return b.is_verified ? 1 : -1
      return (b.reviews?.length || 0) - (a.reviews?.length || 0)
    })

  const FilterPanel = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={sectionLabel}>Sort by</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[['default', 'Recommended'], ['rating', 'Highest rated'], ['reviews', 'Most reviewed'], ['price_asc', 'Price: low → high'], ['price_desc', 'Price: high → low']].map(([val, label]) => (
            <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '8px 10px', borderRadius: '8px', background: filters.sortBy === val ? LIGHT_BLUE : 'transparent', transition: TRANSITION }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${filters.sortBy === val ? BLUE : GREY_LIGHT}`, background: filters.sortBy === val ? BLUE : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: TRANSITION }}>
                {filters.sortBy === val && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
              </div>
              <span style={{ fontSize: '14px', color: filters.sortBy === val ? BLUE : TEXT_MUTED, fontWeight: filters.sortBy === val ? '600' : '400' }}>{label}</span>
              <input type="radio" name="sort" checked={filters.sortBy === val} onChange={() => setFilter('sortBy', val)} style={{ display: 'none' }} />
            </label>
          ))}
        </div>
      </div>

      <div style={{ height: '1px', background: GREY_LIGHT }} />

      <div>
        <div style={sectionLabel}>Minimum rating</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[['', 'Any rating'], ['4.5', '⭐ 4.5 and above'], ['4', '⭐ 4.0 and above'], ['3', '⭐ 3.0 and above']].map(([val, label]) => (
            <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '8px 10px', borderRadius: '8px', background: filters.minRating === val ? LIGHT_BLUE : 'transparent', transition: TRANSITION }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${filters.minRating === val ? BLUE : GREY_LIGHT}`, background: filters.minRating === val ? BLUE : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: TRANSITION }}>
                {filters.minRating === val && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
              </div>
              <span style={{ fontSize: '14px', color: filters.minRating === val ? BLUE : TEXT_MUTED, fontWeight: filters.minRating === val ? '600' : '400' }}>{label}</span>
              <input type="radio" name="rating" checked={filters.minRating === val} onChange={() => setFilter('minRating', val)} style={{ display: 'none' }} />
            </label>
          ))}
        </div>
      </div>

      <div style={{ height: '1px', background: GREY_LIGHT }} />

      <div>
        <div style={sectionLabel}>Price (GH₵/hr)</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input type="number" placeholder="Min" value={filters.minPrice} onChange={e => setFilter('minPrice', e.target.value)} style={filterInput} />
          <span style={{ color: TEXT_MUTED, fontSize: '14px', flexShrink: 0 }}>–</span>
          <input type="number" placeholder="Max" value={filters.maxPrice} onChange={e => setFilter('maxPrice', e.target.value)} style={filterInput} />
        </div>
      </div>

      <div style={{ height: '1px', background: GREY_LIGHT }} />

      <div>
        <div style={sectionLabel}>Teaching level</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[['', 'All levels'], ...LEVELS.map(l => [l, l])].map(([val, label]) => (
            <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '8px 10px', borderRadius: '8px', background: filters.teachingLevel === val ? LIGHT_BLUE : 'transparent', transition: TRANSITION }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${filters.teachingLevel === val ? BLUE : GREY_LIGHT}`, background: filters.teachingLevel === val ? BLUE : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: TRANSITION }}>
                {filters.teachingLevel === val && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
              </div>
              <span style={{ fontSize: '14px', color: filters.teachingLevel === val ? BLUE : TEXT_MUTED, fontWeight: filters.teachingLevel === val ? '600' : '400' }}>{label}</span>
              <input type="radio" name="level" checked={filters.teachingLevel === val} onChange={() => setFilter('teachingLevel', val)} style={{ display: 'none' }} />
            </label>
          ))}
        </div>
      </div>

      <div style={{ height: '1px', background: GREY_LIGHT }} />

      <div>
        <div style={sectionLabel}>Location</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <select value={filters.country} onChange={e => setFilter('country', e.target.value)} style={{ ...filterInput, cursor: 'pointer' }}>
            <option value="">All countries</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.city} onChange={e => setFilter('city', e.target.value)} style={{ ...filterInput, cursor: 'pointer' }}>
            <option value="">All cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div style={{ height: '1px', background: GREY_LIGHT }} />

      <div>
        <div style={sectionLabel}>Teacher type</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[['verifiedOnly', 'Verified teachers only'], ['hasCerts', 'Has teaching certificate'], ['hasVideos', 'Has pitch video']].map(([key, label]) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '8px 10px', borderRadius: '8px', background: filters[key] ? LIGHT_BLUE : 'transparent', transition: TRANSITION }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '5px', border: `2px solid ${filters[key] ? BLUE : GREY_LIGHT}`, background: filters[key] ? BLUE : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: TRANSITION }}>
                {filters[key] && <span style={{ color: '#fff', fontSize: '11px', fontWeight: '800', lineHeight: 1 }}>✓</span>}
              </div>
              <span style={{ fontSize: '14px', color: filters[key] ? BLUE : TEXT_MUTED, fontWeight: filters[key] ? '600' : '400' }}>{label}</span>
              <input type="checkbox" checked={filters[key]} onChange={e => setFilter(key, e.target.checked)} style={{ display: 'none' }} />
            </label>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <>
          <div style={{ height: '1px', background: GREY_LIGHT }} />
          <button onClick={clearFilters} style={{ padding: '10px', background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700' }}>
            Clear all filters
          </button>
        </>
      )}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: GREY_BG, fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {user ? <NavBar /> : (
        <nav style={{ background: GRADIENT_BLUE, padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
          <Link to="/" style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '700', color: '#fff', textDecoration: 'none', letterSpacing: '-0.02em' }}>
            Teach<span style={{ color: YELLOW }}>Me</span>
          </Link>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/login" style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '50px', fontSize: '13px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', fontWeight: '600' }}>Log in</Link>
            <Link to="/register" style={{ padding: '8px 16px', background: YELLOW, color: BLUE, borderRadius: '50px', fontSize: '13px', textDecoration: 'none', fontWeight: '700', boxShadow: SHADOW_YELLOW }}>Sign up</Link>
          </div>
        </nav>
      )}

      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img src={teacherImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', zIndex: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(15,43,107,0.97) 0%, rgba(26,63,160,0.92) 50%, rgba(37,99,235,0.5) 100%)', zIndex: 1 }} />
        <div style={{ position: 'relative', zIndex: 2, padding: isMobile ? '2.5rem 1.25rem' : '3.5rem 2.5rem', maxWidth: '960px', margin: '0 auto' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: YELLOW, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Verified teachers</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? '28px' : '44px', fontWeight: '700', color: '#fff', marginBottom: '8px', letterSpacing: '-0.02em', lineHeight: '1.15' }}>
            Find your perfect teacher
          </h1>
          <p style={{ fontSize: isMobile ? '14px' : '16px', color: 'rgba(255,255,255,0.75)', marginBottom: '1.75rem', maxWidth: '480px', lineHeight: '1.6' }}>
            Search from verified, certificate-checked teachers across Ghana
          </p>
          <div style={{ background: '#fff', borderRadius: '16px', display: 'flex', alignItems: 'center', boxShadow: SHADOW_XL, overflow: 'hidden', maxWidth: '600px' }}>
            <div style={{ padding: '0 16px', fontSize: '18px', color: TEXT_MUTED, flexShrink: 0 }}>🔍</div>
            <input
              style={{ flex: 1, padding: '16px 0', border: 'none', fontSize: '15px', fontFamily: 'inherit', outline: 'none', color: TEXT, background: 'transparent' }}
              placeholder="Search by name, subject or city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ padding: '0 16px', background: 'none', border: 'none', fontSize: '18px', color: TEXT_MUTED, cursor: 'pointer', flexShrink: 0 }}>×</button>
            )}
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', borderBottom: `1px solid ${GREY_LIGHT}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.25rem' }}>
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none', padding: '12px 0' }}>
            {['All', ...SUBJECTS].map(s => (
              <button key={s} onClick={() => setSelectedSubject(s)}
                style={{ padding: '7px 18px', borderRadius: '50px', border: 'none', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', background: selectedSubject === s ? BLUE : GREY_BG, color: selectedSubject === s ? '#fff' : TEXT_MUTED, fontWeight: selectedSubject === s ? '700' : '400', whiteSpace: 'nowrap', flexShrink: 0, boxShadow: selectedSubject === s ? SHADOW_BLUE : 'none', transition: TRANSITION }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '1.25rem' : '1.75rem 2rem', flex: 1, width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '260px 1fr', gap: '1.75rem', alignItems: 'start' }}>

          {!isMobile && (
            <div style={{ background: '#fff', borderRadius: '16px', border: BORDER, padding: '1.5rem', position: 'sticky', top: '80px', boxShadow: SHADOW_LG }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: `1px solid ${GREY_LIGHT}` }}>
                <span style={{ fontSize: '15px', fontWeight: '700', color: TEXT }}>Filters</span>
                {activeFilterCount > 0 && (
                  <span style={{ fontSize: '11px', background: BLUE, color: '#fff', padding: '2px 8px', borderRadius: '50px', fontWeight: '700' }}>{activeFilterCount}</span>
                )}
              </div>
              <FilterPanel />
            </div>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ fontSize: '14px', color: TEXT_MUTED }}>
                <strong style={{ color: TEXT, fontWeight: '700' }}>{loading ? '...' : filtered.length}</strong> teacher{filtered.length !== 1 ? 's' : ''} found
                {selectedSubject !== 'All' && <span style={{ color: BLUE, fontWeight: '600' }}> · {selectedSubject}</span>}
              </div>
              {isMobile && (
                <button onClick={() => setShowMobileFilters(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: '#fff', border: BORDER, borderRadius: '50px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600', color: TEXT, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  ⚙ Filters {activeFilterCount > 0 && <span style={{ background: BLUE, color: '#fff', borderRadius: '50%', width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800' }}>{activeFilterCount}</span>}
                </button>
              )}
            </div>

            {activeFilterCount > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {filters.verifiedOnly && <FilterChip label="Verified only" onRemove={() => setFilter('verifiedOnly', false)} />}
                {filters.hasCerts && <FilterChip label="Has certificate" onRemove={() => setFilter('hasCerts', false)} />}
                {filters.hasVideos && <FilterChip label="Has video" onRemove={() => setFilter('hasVideos', false)} />}
                {filters.minRating && <FilterChip label={`⭐ ${filters.minRating}+`} onRemove={() => setFilter('minRating', '')} />}
                {filters.country && <FilterChip label={filters.country} onRemove={() => setFilter('country', '')} />}
                {filters.city && <FilterChip label={filters.city} onRemove={() => setFilter('city', '')} />}
                {filters.teachingLevel && <FilterChip label={filters.teachingLevel} onRemove={() => setFilter('teachingLevel', '')} />}
                {(filters.minPrice || filters.maxPrice) && <FilterChip label={`GH₵ ${filters.minPrice || '0'}–${filters.maxPrice || '∞'}`} onRemove={() => { setFilter('minPrice', ''); setFilter('maxPrice', '') }} />}
                {filters.sortBy !== 'default' && <FilterChip label={`Sort: ${filters.sortBy.replace('_', ' ')}`} onRemove={() => setFilter('sortBy', 'default')} />}
                <button onClick={clearFilters} style={{ fontSize: '12px', color: BLUE, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700', padding: '4px 8px' }}>Clear all</button>
              </div>
            )}

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#fff', borderRadius: '20px', border: BORDER, boxShadow: SHADOW_LG }}>
                <div style={{ fontSize: '52px', marginBottom: '1rem' }}>🔍</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: TEXT, marginBottom: '8px', letterSpacing: '-0.01em' }}>No teachers found</h3>
                <p style={{ fontSize: '14px', color: TEXT_MUTED, marginBottom: '1.5rem' }}>Try adjusting your search or filters</p>
                <button onClick={clearFilters}
                  style={{ padding: '11px 28px', background: GRADIENT_BLUE, color: '#fff', border: 'none', borderRadius: '50px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700', boxShadow: SHADOW_BLUE }}>
                  Reset filters
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {filtered.map(teacher => <TeacherCard key={teacher.id} teacher={teacher} selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {isMobile && showMobileFilters && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex' }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowMobileFilters(false)} />
          <div style={{ width: '85%', maxWidth: '360px', background: '#fff', height: '100%', overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '-8px 0 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: TEXT, letterSpacing: '-0.01em' }}>Filters</h3>
              <button onClick={() => setShowMobileFilters(false)} style={{ background: GREY_BG, border: 'none', fontSize: '18px', cursor: 'pointer', color: TEXT_MUTED, width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
            <FilterPanel />
            <button onClick={() => setShowMobileFilters(false)}
              style={{ padding: '14px', background: GRADIENT_BLUE, color: '#fff', border: 'none', borderRadius: '50px', fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700', marginTop: '1rem', boxShadow: SHADOW_BLUE }}>
              Show {filtered.length} teacher{filtered.length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

function FilterChip({ label, onRemove }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', background: LIGHT_BLUE, color: BLUE, padding: '4px 12px', borderRadius: '50px', fontWeight: '700', border: '1px solid rgba(37,99,235,0.15)' }}>
      {label}
      <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: BLUE, fontSize: '14px', lineHeight: 1, padding: 0, display: 'flex', alignItems: 'center', marginLeft: '2px', opacity: 0.7 }}>×</button>
    </span>
  )
}

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: '20px', border: `1px solid ${GREY_LIGHT}`, padding: '1.5rem', display: 'flex', gap: '1.25rem', animation: 'pulse 1.5s ease-in-out infinite' }}>
      <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: GREY_BG, flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ height: '18px', background: GREY_BG, borderRadius: '6px', width: '55%' }} />
        <div style={{ height: '13px', background: GREY_BG, borderRadius: '6px', width: '35%' }} />
        <div style={{ height: '13px', background: GREY_BG, borderRadius: '6px', width: '75%' }} />
        <div style={{ height: '13px', background: GREY_BG, borderRadius: '6px', width: '50%' }} />
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  )
}

function TeacherCard({ teacher, selectedSubject, setSelectedSubject }) {
  const [hovered, setHovered] = useState(false)
  const avgRating = teacher.reviews?.length > 0
    ? (teacher.reviews.reduce((sum, r) => sum + r.rating, 0) / teacher.reviews.length).toFixed(1)
    : null
  const approvedCerts = teacher.certificates?.filter(c => c.status === 'approved') || []
  const isVerifiedPro = teacher.is_verified && approvedCerts.length > 0
  const isTopRated = avgRating && parseFloat(avgRating) >= 4.5 && teacher.reviews?.length >= 3
  const memberSince = teacher.profiles?.created_at ? new Date(teacher.profiles.created_at) : null
  const isNew = memberSince && (new Date() - memberSince) < 60 * 24 * 60 * 60 * 1000

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: '#fff', borderRadius: '20px', border: `1px solid ${hovered ? 'rgba(37,99,235,0.25)' : GREY_LIGHT}`, overflow: 'hidden', boxShadow: hovered ? SHADOW_BLUE : SHADOW_LG, transform: hovered ? 'translateY(-3px)' : 'translateY(0)', transition: TRANSITION }}
    >
      {(isVerifiedPro || isTopRated) && (
        <div style={{ height: '3px', background: isTopRated ? 'linear-gradient(90deg, #FFD700, #F59E0B)' : GRADIENT_BLUE }} />
      )}
      <div style={{ padding: '1.5rem' }}>
        {(isVerifiedPro || isTopRated || isNew) && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {isVerifiedPro && <span style={{ fontSize: '11px', background: '#DBEAFE', color: '#1E40AF', padding: '3px 10px', borderRadius: '50px', fontWeight: '800' }}>🏅 Verified Pro</span>}
            {isTopRated && <span style={{ fontSize: '11px', background: '#FEF9C3', color: '#854D0E', padding: '3px 10px', borderRadius: '50px', fontWeight: '800' }}>⭐ Top Rated</span>}
            {isNew && <span style={{ fontSize: '11px', background: '#F3E8FF', color: '#6B21A8', padding: '3px 10px', borderRadius: '50px', fontWeight: '800' }}>✨ New</span>}
          </div>
        )}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {teacher.profiles?.avatar_url ? (
              <img src={teacher.profiles.avatar_url} alt="" style={{ width: '88px', height: '88px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${teacher.is_verified ? '#22C55E' : GREY_LIGHT}`, display: 'block' }} />
            ) : (
              <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: GRADIENT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '800', color: '#fff', border: `3px solid ${teacher.is_verified ? '#22C55E' : GREY_LIGHT}` }}>
                {teacher.profiles?.full_name?.charAt(0)}
              </div>
            )}
            {teacher.is_verified && (
              <div style={{ position: 'absolute', bottom: '2px', right: '2px', background: '#22C55E', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', border: '2px solid #fff', color: '#fff', fontWeight: '800' }}>✓</div>
            )}
            {teacher.years_experience > 0 && (
              <div style={{ position: 'absolute', top: '-4px', right: '-4px', background: YELLOW, borderRadius: '50px', padding: '2px 7px', fontSize: '10px', fontWeight: '800', color: BLUE, border: '2px solid #fff', whiteSpace: 'nowrap' }}>
                {teacher.years_experience}yr
              </div>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: TEXT, margin: 0, letterSpacing: '-0.01em' }}>{teacher.profiles?.full_name}</h3>
              {teacher.hourly_rate > 0 ? (
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '700', color: BLUE, letterSpacing: '-0.02em' }}>GH₵ {teacher.hourly_rate}</div>
                  <div style={{ fontSize: '11px', color: TEXT_MUTED, fontWeight: '500' }}>per hour</div>
                </div>
              ) : (
                <span style={{ fontSize: '12px', color: '#166534', background: '#DCFCE7', padding: '3px 10px', borderRadius: '50px', fontWeight: '700', flexShrink: 0 }}>Free first lesson</span>
              )}
            </div>
            <div style={{ fontSize: '13px', color: TEXT_MUTED, marginBottom: '8px' }}>📍 {teacher.profiles?.city}, {teacher.profiles?.country}</div>
            {avgRating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FEF9C3', padding: '3px 10px', borderRadius: '50px', border: '1px solid #FDE68A' }}>
                  <span style={{ fontSize: '13px' }}>⭐</span>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#854D0E' }}>{avgRating}</span>
                  <span style={{ fontSize: '12px', color: '#A16207' }}>({teacher.reviews.length})</span>
                </div>
                {approvedCerts.length > 0 && <span style={{ fontSize: '12px', color: TEXT_MUTED }}>📋 {approvedCerts.length} cert{approvedCerts.length !== 1 ? 's' : ''}</span>}
                {teacher.pitch_videos?.length > 0 && <span style={{ fontSize: '12px', color: TEXT_MUTED }}>🎬 Video</span>}
                {teacher.languages?.length > 0 && <span style={{ fontSize: '12px', color: TEXT_MUTED }}>🗣 {teacher.languages.slice(0, 2).join(', ')}</span>}
              </div>
            )}
          </div>
        </div>
        {teacher.bio && (
          <p style={{ fontSize: '13px', color: TEXT_MUTED, lineHeight: '1.6', margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {teacher.bio}
          </p>
        )}
        {teacher.subjects?.length > 0 && (
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '8px' }}>
            {teacher.subjects.slice(0, 5).map(s => (
              <span key={s} onClick={() => setSelectedSubject(s)}
                style={{ fontSize: '12px', background: selectedSubject === s ? BLUE : GREY_BG, color: selectedSubject === s ? '#fff' : TEXT_MUTED, padding: '4px 11px', borderRadius: '50px', cursor: 'pointer', fontWeight: selectedSubject === s ? '700' : '500', border: `1px solid ${selectedSubject === s ? BLUE : GREY_LIGHT}`, transition: TRANSITION }}>
                {s}
              </span>
            ))}
            {teacher.subjects.length > 5 && <span style={{ fontSize: '12px', color: TEXT_MUTED, padding: '4px 6px' }}>+{teacher.subjects.length - 5}</span>}
          </div>
        )}
        {teacher.teaching_levels?.length > 0 && (
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '14px' }}>
            {teacher.teaching_levels.map(level => (
              <span key={level} style={{ fontSize: '11px', background: LIGHT_BLUE, color: BLUE, padding: '3px 9px', borderRadius: '50px', fontWeight: '700' }}>{level}</span>
            ))}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
          <Link to={`/teachers/${teacher.id}`}
            style={{ padding: '11px', background: GREY_BG, color: BLUE, border: `1px solid ${GREY_LIGHT}`, borderRadius: '50px', fontSize: '13px', textDecoration: 'none', fontWeight: '700', textAlign: 'center', transition: TRANSITION }}
            onMouseEnter={e => { e.currentTarget.style.background = LIGHT_BLUE; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.background = GREY_BG; e.currentTarget.style.borderColor = GREY_LIGHT }}>
            View profile
          </Link>
          <Link to={`/booking?teacher=${teacher.id}`}
            style={{ padding: '11px', background: YELLOW, color: BLUE, borderRadius: '50px', fontSize: '13px', textDecoration: 'none', fontWeight: '800', textAlign: 'center', boxShadow: hovered ? SHADOW_YELLOW : 'none', transition: TRANSITION }}>
            Book now →
          </Link>
        </div>
      </div>
    </div>
  )
}

const sectionLabel = { fontSize: '11px', fontWeight: '800', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }
const filterInput = { width: '100%', padding: '9px 12px', border: `1px solid ${GREY_LIGHT}`, borderRadius: '10px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', color: TEXT, background: '#fff', transition: TRANSITION }