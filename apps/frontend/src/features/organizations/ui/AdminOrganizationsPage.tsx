import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/shared/ui/layout/DashboardLayout';
import { PageHeader, Card } from '@/shared/ui/DashboardComponents';
import { useAuthStore } from '@/features/auth';
import { getOrganization, Organization } from '../infrastructure/organizations.api';

// Organizations page — shows the current user's organization info
// The backend only has GET /organizations/:id (no list endpoint)
// So we fetch and show the user's own organization details
export function AdminOrganizationsPage() {
  const { user } = useAuthStore();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setLoading]         = useState(true);
  const [error, setError]               = useState<string | null>(null); 

   useEffect(() => {
    if (!user?.organizationId) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const org = await getOrganization(user.organizationId);
        setOrganization(org);
      } catch (err: any) {
        setError(err.response?.data?.error ?? 'Failed to load organization');
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.organizationId]);

  return (
    <DashboardLayout title="Organizations">
      <div className="flex flex-col gap-3">

        <PageHeader
          title="Organizations"
          description="View and manage your organization"
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-xs text-red-700">{error}</div>
        )}

        <Card title="Your organization">
          <div className="px-3.5 py-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                <i className="ti ti-building text-lg" aria-hidden="true" />
              </div>
              <div>
          <p className="text-sm font-semibold text-gray-900">
                 {isLoading ? 'Loading…' : organization?.name ?? 'ServeSync Organization'}
               </p>
                <p className="text-[11px] text-gray-500">
                  {isLoading ? '—' : `Code: ${organization?.code ?? '—'}`}
                </p>              </div>
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
