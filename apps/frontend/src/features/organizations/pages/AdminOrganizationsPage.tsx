import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import { PageHeader, Card } from '@/shared/components/ui/DashboardComponents';
import { useAuthStore } from '@/features/auth/stores/auth.store';

// Organizations page — shows the current user's organization info
// The backend only has GET /organizations/:id (no list endpoint)
// So we show the user's own organization details
export function AdminOrganizationsPage() {
  const { user } = useAuthStore();

  return (
    <DashboardLayout title="Organizations">
      <div className="flex flex-col gap-3">

        <PageHeader
          title="Organizations"
          description="View and manage your organization"
        />

        <Card title="Your organization">
          <div className="px-3.5 py-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                <i className="ti ti-building text-lg" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">ServeSync Organization</p>
                <p className="text-[11px] text-gray-500">ID: {user?.organizationId?.slice(0, 12) ?? '—'}…</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-2">
              <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Your role</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{user?.role ?? '—'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Status</p>
                <p className="text-sm font-semibold text-emerald-700 mt-0.5">Active</p>
              </div>
              <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Plan</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">Pro</p>
              </div>
            </div>
          </div>
        </Card>

      </div>
    </DashboardLayout>
  );
}
