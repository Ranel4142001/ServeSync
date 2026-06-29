import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { LoginPage }    from '@features/auth/components/LoginPage';
import { RegisterPage } from '@features/auth/components/RegisterPage';

// ── Protected Route ──────────────────────────────────────
// Wraps any route that requires the user to be logged in
// If not logged in, redirects to /login automatically
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();

  // No token means not logged in — redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// ── Guest Route ──────────────────────────────────────────
// Wraps routes that should only be seen when NOT logged in
// e.g. if you're already logged in and visit /login
// it redirects you to dashboard instead
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuthStore();

  if (token && user) {
    // Already logged in — redirect to correct dashboard
    if (user.role === 'ADMIN')  return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'AGENT')  return <Navigate to="/agent/dashboard" replace />;
    if (user.role === 'CLIENT') return <Navigate to="/client/dashboard" replace />;
  }

  return <>{children}</>;
}

// ── Main Router ──────────────────────────────────────────
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default route — redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Guest routes — only for non-logged-in users */}
        <Route path="/login" element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }/>

        <Route path="/register" element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }/>

        {/* Protected routes — we will add dashboards here next */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <div className="p-8 text-xl font-bold">
              Admin Dashboard — Coming soon!
            </div>
          </ProtectedRoute>
        }/>

        <Route path="/agent/dashboard" element={
          <ProtectedRoute>
            <div className="p-8 text-xl font-bold">
              Agent Dashboard — Coming soon!
            </div>
          </ProtectedRoute>
        }/>

        <Route path="/client/dashboard" element={
          <ProtectedRoute>
            <div className="p-8 text-xl font-bold">
              Client Dashboard — Coming soon!
            </div>
          </ProtectedRoute>
        }/>

        {/* 404 — page not found */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-200">404</h1>
              <p className="text-gray-500 mt-2">Page not found</p>
            </div>
          </div>
        }/>

      </Routes>
    </BrowserRouter>
  );
}