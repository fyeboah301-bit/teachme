import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import Teachers from './pages/Teachers'
import TeacherProfile from './pages/TeacherProfile'
import LiveSessions from './pages/LiveSessions'
import Booking from './pages/Booking'
import Admin from './pages/Admin'
import Messages from './pages/Messages'
import Assignments from './pages/Assignments'
import Certificates from './pages/Certificates'
import VerifyCertificate from './pages/VerifyCertificate'
import Referrals from './pages/Referrals'
import Progress from './pages/Progress'

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

function ReferralCapture() {
  const [searchParams] = useSearchParams()
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) localStorage.setItem('teachme_referral', ref)
  }, [searchParams])
  return null
}

function AppRoutes() {
  return (
    <>
    <ReferralCapture />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/teachers" element={<Teachers />} />
      <Route path="/teachers/:id" element={<TeacherProfile />} />
      <Route path="/sessions" element={<LiveSessions />} />
      <Route path="/booking" element={
        <ProtectedRoute>
          <Booking />
        </ProtectedRoute>
      } />
      <Route path="/messages" element={
        <ProtectedRoute>
          <Messages />
        </ProtectedRoute>
      } />
      <Route path="/assignments" element={
  <ProtectedRoute>
    <Assignments />
  </ProtectedRoute>
} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute>
          <Admin />
        </ProtectedRoute>
      } />
      <Route path="/referrals" element={
  <ProtectedRoute>
    <Referrals />
  </ProtectedRoute>
} />

<Route path="/progress" element={
  <ProtectedRoute>
    <Progress />
  </ProtectedRoute>
} />

      <Route path="/certificates" element={
  <ProtectedRoute>
    <Certificates />
  </ProtectedRoute>
} />
<Route path="/verify/:code" element={<VerifyCertificate />} />
    </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}