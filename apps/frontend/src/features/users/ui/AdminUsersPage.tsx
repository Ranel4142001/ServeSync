import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/shared/ui/layout/DashboardLayout';
import { PageHeader, Card, Avatar } from '@/shared/ui/DashboardComponents';
import { getUsers, UserItem } from '../infrastructure/users.api';

// Role badge colors matching the image
const roleStyles: Record<string, string> = {
  ADMIN:  'bg-purple-100 text-purple-800',
  AGENT:  'bg-emerald-100 text-emerald-800',
  CLIENT: 'bg-blue-100 text-blue-800',
};

export function AdminUsersPage() {
  const [users, setUsers]               = useState<UserItem[]>([]);
  const [isLoading, setLoading]         = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ADMIN' | 'AGENT' | 'CLIENT'>('ALL');

  // Fetch users on component mount
  useEffect(() => {
    (async () => {
      try {
        const data = await getUsers();
        setUsers(data.users);
      } catch (err: any) {
        setError(err.response?.data?.error ?? 'Failed to load users');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter users list based on selected role tab
  const filteredUsers = users.filter(
    (u) => activeFilter === 'ALL' || u.role === activeFilter
  );

  return (
    <DashboardLayout title="Users">
      <div className="flex flex-col gap-3">

        <PageHeader
          title="Users"
          description="Manage team members in your organization"
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-xs text-red-700">{error}</div>
        )}

        {/* ── Summary Stats Cards (Matches Picture Border Colors) ────────────────── */}
        <div className="grid grid-cols-4 gap-3 mb-1">
          <div className="bg-white p-3.5 rounded-lg border border-gray-200 border-l-4 border-blue-500 flex flex-col gap-1.5 shadow-sm">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total Users</span>
            <span className="text-xl font-bold text-gray-900">{isLoading ? '—' : users.length}</span>
          </div>
          <div className="bg-white p-3.5 rounded-lg border border-gray-200 border-l-4 border-purple-500 flex flex-col gap-1.5 shadow-sm">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Admins</span>
            <span className="text-xl font-bold text-gray-900">
              {isLoading ? '—' : users.filter((u) => u.role === 'ADMIN').length}
            </span>
          </div>
          <div className="bg-white p-3.5 rounded-lg border border-gray-200 border-l-4 border-emerald-500 flex flex-col gap-1.5 shadow-sm">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Agents</span>
            <span className="text-xl font-bold text-gray-900">
              {isLoading ? '—' : users.filter((u) => u.role === 'AGENT').length}
            </span>
          </div>
          <div className="bg-white p-3.5 rounded-lg border border-gray-200 border-l-4 border-gray-400 flex flex-col gap-1.5 shadow-sm">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Clients</span>
            <span className="text-xl font-bold text-gray-900">
              {isLoading ? '—' : users.filter((u) => u.role === 'CLIENT').length}
            </span>
          </div>
        </div>

        {/* ── Filters Bar & Invite Action Button ──────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 my-1">
          <div className="flex items-center gap-1.5">
            {(['ALL', 'ADMIN', 'AGENT', 'CLIENT'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                  activeFilter === f
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <button className="bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-3 py-1.5 rounded-md text-[11px] font-medium flex items-center gap-1.5 shadow-sm">
            <span className="text-xs">👤+</span> Invite user
          </button>
        </div>

        {/* ── Users Table Reorganized ────────────────────────────────────────────── */}
        <Card>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2.5">User</th>
                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2.5">Role</th>
                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2.5">Status</th>
                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2.5">Tickets</th>
                <th className="px-3.5 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={5} className="px-3.5 py-12 text-center text-[11px] text-gray-400">Loading users…</td></tr>
              )}
              {!isLoading && filteredUsers.length === 0 && (
                <tr><td colSpan={5} className="px-3.5 py-12 text-center text-[11px] text-gray-400">No users found</td></tr>
              )}
              {!isLoading && filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 last:border-none hover:bg-gray-50 transition-colors">
                  {/* User Stack */}
                  <td className="px-3.5 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.fullName} size="md" />
                      <div className="flex flex-col">
                        <span className="text-[11px] font-medium text-gray-900 leading-tight">{u.fullName}</span>
                        <span className="text-[9px] text-gray-400 leading-none">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  {/* Role Badge */}
                  <td className="px-3.5 py-2.5">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${roleStyles[u.role] ?? roleStyles.CLIENT}`}>
                      {u.role}
                    </span>
                  </td>
                  {/* Status Bullet */}
                  <td className="px-3.5 py-2.5 text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <span className={`text-base leading-none ${u.isActive ? 'text-emerald-500' : 'text-gray-300'}`}>●</span>
                      <span className={u.isActive ? 'text-gray-700' : 'text-gray-400'}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </span>
                  </td>
                  {/* Associated Tickets Count */}
                  <td className="px-3.5 py-2.5 text-[11px] text-gray-600">
                    {u.ticketsCount ?? 0}
                  </td>
                  {/* Options Menu Dot Button */}
                  <td className="px-3.5 py-2.5 text-right text-gray-400 text-sm font-bold">
                    <button className="hover:text-gray-600 transition-colors">•••</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </DashboardLayout>
  );
}
