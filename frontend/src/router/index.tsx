import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, LoginPage, RegisterPage } from '@/features/auth';
import { AdminDashboard, AgentDashboard, ClientDashboard } from '@/features/dashboard';
import { AdminTicketsPage, NewTicketPage } from '@/features/tickets';
import { AdminUsersPage } from '@/features/users';
import { AdminOrganizationsPage } from '@/features/organizations';
import { AdminInvoicesPage } from '@/features/billing';
import { AdminAiSettingsPage } from '@/features/ai';
import { AdminSettingsPage } from '@/features/settings';
import { AdminAnalyticsPage } from '@/features/analytics';
import { ForbiddenPage } from '@/shared/ui/ForbiddenPage';


// ── Protected Route ──────────────────────────────────────
// Wraps any route that requires authentication and role verification
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { token, user } = useAuthStore();

  // No token means not logged in — redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Intercept unauthorized role access at route level and render ForbiddenPage
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <ForbiddenPage />;
  }

  return <>{children}</>;
}

// ── Guest Route ──────────────────────────────────────────
// Wraps routes that should only be seen when NOT logged in
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuthStore();

  if (token && user) {
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
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }/>

        <Route path="/admin/analytics" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminAnalyticsPage />
          </ProtectedRoute>
        }/>


        <Route path="/admin/tickets" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminTicketsPage />
          </ProtectedRoute>
        }/>

        {/* Admin management pages */}
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminUsersPage />
          </ProtectedRoute>
        }/>

        <Route path="/admin/organizations" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminOrganizationsPage />
          </ProtectedRoute>
        }/>

        <Route path="/admin/billing" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminInvoicesPage />
          </ProtectedRoute>
        }/>

        <Route path="/admin/ai-settings" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminAiSettingsPage />
          </ProtectedRoute>
        }/>

        <Route path="/admin/settings" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminSettingsPage />
          </ProtectedRoute>
        }/>

        <Route path="/agent/dashboard" element={
          <ProtectedRoute allowedRoles={['AGENT', 'ADMIN']}>
            <AgentDashboard />
          </ProtectedRoute>
        }/>

        <Route path="/agent/tickets" element={
          <ProtectedRoute allowedRoles={['AGENT', 'ADMIN']}>
            <AdminTicketsPage />
          </ProtectedRoute>
        }/>

        <Route path="/agent/unassigned" element={
          <ProtectedRoute allowedRoles={['AGENT', 'ADMIN']}>
            <AdminTicketsPage />
          </ProtectedRoute>
        }/>

        <Route path="/agent/all" element={
          <ProtectedRoute allowedRoles={['AGENT', 'ADMIN']}>
            <AdminTicketsPage />
          </ProtectedRoute>
        }/>

        <Route path="/agent/ai" element={
          <ProtectedRoute allowedRoles={['AGENT', 'ADMIN']}>
            <AdminAiSettingsPage />
          </ProtectedRoute>
        }/>

        <Route path="/agent/settings" element={
          <ProtectedRoute allowedRoles={['AGENT', 'ADMIN']}>
            <AdminSettingsPage />
          </ProtectedRoute>
        }/>

        <Route path="/client/dashboard" element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <ClientDashboard />
          </ProtectedRoute>
        }/>

        <Route path="/client/tickets" element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <AdminTicketsPage />
          </ProtectedRoute>
        }/>

        <Route path="/client/new-ticket" element={
          <ProtectedRoute allowedRoles={['CLIENT', 'AGENT', 'ADMIN']}>
            <NewTicketPage />
          </ProtectedRoute>
        }/>

        <Route path="/client/billing" element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <AdminInvoicesPage />
          </ProtectedRoute>
        }/>

        <Route path="/client/profile" element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <AdminSettingsPage />
          </ProtectedRoute>
        }/>

        <Route path="/client/settings" element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <AdminSettingsPage />
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