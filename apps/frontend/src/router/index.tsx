import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { LoginPage }    from '@features/auth/components/LoginPage';
import { RegisterPage } from '@features/auth/components/RegisterPage';
import { AdminDashboard }  from '@features/dashboard/pages/AdminDashboard';
import { AgentDashboard }  from '@features/dashboard/pages/AgentDashboard';
import { ClientDashboard } from '@features/dashboard/pages/ClientDashboard';
import { AdminTicketsPage }       from '@features/tickets/pages/AdminTicketsPage';
import { AdminUsersPage }         from '@features/users/pages/AdminUsersPage';
import { AdminOrganizationsPage } from '@features/organizations/pages/AdminOrganizationsPage';
import { AdminInvoicesPage }      from '@features/billing/pages/AdminInvoicesPage';
import { AdminAiSettingsPage }    from '@features/ai/pages/AdminAiSettingsPage';
import { AdminSettingsPage }      from '@features/settings/pages/AdminSettingsPage';

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

        {/* Protected routes — role-specific dashboards */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }/>

        <Route path="/admin/tickets" element={
          <ProtectedRoute>
            <AdminTicketsPage />
          </ProtectedRoute>
        }/>

        {/* Admin management pages */}
        <Route path="/admin/users" element={
          <ProtectedRoute>
            <AdminUsersPage />
          </ProtectedRoute>
        }/>

        <Route path="/admin/organizations" element={
          <ProtectedRoute>
            <AdminOrganizationsPage />
          </ProtectedRoute>
        }/>

        <Route path="/admin/billing" element={
          <ProtectedRoute>
            <AdminInvoicesPage />
          </ProtectedRoute>
        }/>

        <Route path="/admin/ai-settings" element={
          <ProtectedRoute>
            <AdminAiSettingsPage />
          </ProtectedRoute>
        }/>

        <Route path="/admin/settings" element={
          <ProtectedRoute>
            <AdminSettingsPage />
          </ProtectedRoute>
        }/>

        <Route path="/agent/dashboard" element={
          <ProtectedRoute>
            <AgentDashboard />
          </ProtectedRoute>
        }/>

        <Route path="/client/dashboard" element={
          <ProtectedRoute>
            <ClientDashboard />
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