import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleBasedRoute from './components/common/RoleBasedRoute';
import { authService } from './services/authService';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import PalmReadingPage from './pages/PalmReadingPage';
import TarotReadingPage from './pages/TarotReadingPage';

const AdminDashboard = () => (
  <div className="min-h-screen bg-dark-900 py-8">
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="font-mystical text-3xl gradient-text font-bold mb-4">Admin Dashboard 🛡️</h1>
      <p className="text-gray-400">User management and platform analytics coming in Milestone 4.</p>
    </div>
  </div>
);

const OAuthCallback = () => {
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const provider = window.location.pathname.includes('google') ? 'google' : 'github';

    if (code) {
      authService
        .oauthLogin(provider, code, window.location.origin + `/auth/callback/${provider}`)
        .then(() => {
          window.location.href = '/dashboard';
        })
        .catch(() => {
          window.location.href = '/login';
        });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900">
      <div className="text-center">
        <div className="text-4xl animate-float mb-4">🔮</div>
        <p className="text-gray-400">Authenticating...</p>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-dark-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/auth/callback/:provider" element={<OAuthCallback />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/palm-reading"
                element={
                  <ProtectedRoute>
                    <PalmReadingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tarot-reading"
                element={
                  <ProtectedRoute>
                    <TarotReadingPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <RoleBasedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <RoleBasedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <RoleBasedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </RoleBasedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#e0e0e0',
            border: '1px solid rgba(139, 61, 255, 0.3)',
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;