// src/App.js
import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import './styles/global.css'

// Lazy loading — tezlik uchun
const Login       = lazy(() => import('./pages/Login'))
const Register    = lazy(() => import('./pages/Register'))
const Dashboard   = lazy(() => import('./pages/Dashboard'))
const Gap         = lazy(() => import('./pages/Gap'))
const GapDetail   = lazy(() => import('./pages/GapDetail'))
const Toyona      = lazy(() => import('./pages/Toyona'))
const ToyonaDaftar = lazy(() => import('./pages/ToyonaDaftar'))
const Transfer    = lazy(() => import('./pages/Transfer'))
const Finance     = lazy(() => import('./pages/Finance'))
const Profile     = lazy(() => import('./pages/Profile'))
const Settings    = lazy(() => import('./pages/Settings'))
const PublicToyona = lazy(() => import('./pages/PublicToyona'))

// Loading spinner
const Spinner = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100vh', background: '#0A0F1E', flexDirection: 'column', gap: 16
  }}>
    <div style={{
      width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)',
      borderTop: '3px solid #0055FF', borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Yuklanmoqda...</div>
    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
  </div>
)

// Himoyalangan route
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  return children
}

// Faqat mehmonlar uchun route
function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        {/* Ommaviy sahifalar */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/toyona/:shareLink" element={<PublicToyona />} />

        {/* Mehmon sahifalar */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        {/* Himoyalangan sahifalar */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/gap" element={<PrivateRoute><Gap /></PrivateRoute>} />
        <Route path="/gap/:id" element={<PrivateRoute><GapDetail /></PrivateRoute>} />
        <Route path="/toyona" element={<PrivateRoute><Toyona /></PrivateRoute>} />
        <Route path="/toyona/:id/daftar" element={<PrivateRoute><ToyonaDaftar /></PrivateRoute>} />
        <Route path="/transfer" element={<PrivateRoute><Transfer /></PrivateRoute>} />
        <Route path="/finance" element={<PrivateRoute><Finance /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}
