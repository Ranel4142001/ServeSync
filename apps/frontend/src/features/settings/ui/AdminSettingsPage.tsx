import { DashboardLayout } from '@/shared/ui/layout/DashboardLayout';
import { PageHeader, Card } from '@/shared/ui/DashboardComponents';
import { useAuthStore } from '@/features/auth';

// General settings page — profile and preferences
// No backend settings API yet — shows profile info from auth store
export function AdminSettingsPage() {
  const { user } = useAuthStore();

  return (
    <DashboardLayout title="Settings">
      <div className="flex flex-col gap-3">

        <PageHeader
          title="Settings"
          description="Manage your account and preferences"
        />

        {/* Profile section */}
        <Card title="Profile">
          <div className="px-3.5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Full name</label>
                <p className="text-sm text-gray-900 mt-0.5">{user?.fullName ?? '—'}</p>
              </div>
              <div>
                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Email</label>
                <p className="text-sm text-gray-900 mt-0.5">{user?.email ?? '—'}</p>
              </div>
              <div>
                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Role</label>
                <p className="text-sm text-gray-900 mt-0.5">{user?.role ?? '—'}</p>
              </div>
              <div>
                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Organization ID</label>
                <p className="text-sm text-gray-900 mt-0.5">{user?.organizationId?.slice(0, 16) ?? '—'}…</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Preferences */}
        <Card title="Preferences">
          <div className="px-3.5 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-900">Email notifications</p>
                <p className="text-[10px] text-gray-500">Receive email alerts for ticket updates</p>
              </div>
              <div className="w-8 h-4 bg-blue-600 rounded-full relative cursor-pointer">
                <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
            <div className="border-t border-gray-100" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-900">AI auto-triage</p>
                <p className="text-[10px] text-gray-500">Automatically categorize new tickets with AI</p>
              </div>
              <div className="w-8 h-4 bg-blue-600 rounded-full relative cursor-pointer">
                <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </Card>

      </div>
    </DashboardLayout>
  );
}
