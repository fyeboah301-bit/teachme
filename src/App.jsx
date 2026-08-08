import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { lazy, Suspense, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BLUE } from './styles/colors'
import NotFound from './pages/NotFound'

// ─── LAZY LOADED PAGES ───────────────────────────────────────────
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Teachers = lazy(() => import('./pages/Teachers'))
const TeacherProfile = lazy(() => import('./pages/TeacherProfile'))
const LiveSessions = lazy(() => import('./pages/LiveSessions'))
const Booking = lazy(() => import('./pages/Booking'))
const BookingRequests = lazy(() => import('./pages/BookingRequests'))
const Messages = lazy(() => import('./pages/Messages'))
const Assignments = lazy(() => import('./pages/Assignments'))
const Certificates = lazy(() => import('./pages/Certificates'))
const VerifyCertificate = lazy(() => import('./pages/VerifyCertificate'))
const Referrals = lazy(() => import('./pages/Referrals'))
const Progress = lazy(() => import('./pages/Progress'))
const VideoCall = lazy(() => import('./pages/VideoCall'))
const TeacherApplication = lazy(() => import('./pages/TeacherApplication'))

// ─── LOADING FALLBACK ─────────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif', gap: '16px' }}>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: '700', color: BLUE }}>
        Teach<span style={{ color: '#FFD700' }}>Me</span>
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: BLUE, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ─── PROTECTED ROUTE ──────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

// ─── REFERRAL CAPTURE ─────────────────────────────────────────────
function ReferralCapture() {
  const [searchParams] = useSearchParams()
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) localStorage.setItem('teachme_referral', ref)
  }, [searchParams])
  return null
}

// ─── ROUTES ───────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <>
      <ReferralCapture />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/teachers/:id" element={<TeacherProfile />} />
          <Route path="/sessions" element={<LiveSessions />} />
          <Route path="/verify/:code" element={<VerifyCertificate />} />
          <Route path="/call/:roomId" element={<VideoCall />} />
          <Route path="/apply" element={<TeacherApplication />} />

          {/* PROTECTED */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/booking" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
          <Route path="/booking-requests" element={<ProtectedRoute><BookingRequests /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/assignments" element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
          <Route path="/certificates" element={<ProtectedRoute><Certificates /></ProtectedRoute>} />
          <Route path="/referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  )
}

// ─── APP ──────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}