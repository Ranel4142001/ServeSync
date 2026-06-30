import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import { PageHeader, Card, Avatar } from '@/shared/components/ui/DashboardComponents';
import { getUsers, UserItem } from '@/features/users/api/users.api';
import { timeAgo } from '@/shared/lib/formatters';

// Role badge colors
const roleStyles: Record<string, string> = {
  ADMIN:  'bg-red-50 text-red-800',
  AGENT:  'bg-blue-50 text-blue-800',
  CLIENT: 'bg-gray-100 text-gray-600',
};

export function AdminUsersPage() {
  const [users, setUsers]       = useState<UserItem[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]       = useState<string | null>(null);

  // Fetch users on mount
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

  return (
    <DashboardLayout title="Users">
      <div className="flex flex-col gap-3">

        <PageHeader
          title="Users"
          count={users.length}
          description="Manage team members in your organization"
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-xs text-red-700">{error}</div>
        )}

        <Card>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2.5">User</th>
                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2.5">Email</th>
                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2.5">Role</th>
                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2.5">Status</th>
                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2.5">Joined</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={5} className="px-3.5 py-12 text-center text-[11px] text-gray-400">Loading users…</td></tr>
              )}
              {!isLoading && users.length === 0 && (
                <tr><td colSpan={5} className="px-3.5 py-12 text-center text-[11px] text-gray-400">No users found</td></tr>
              )}
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-100 last:border-none hover:bg-gray-50 transition-colors">
                  <td className="px-3.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <Avatar name={u.fullName} size="md" />
                      <span className="text-[11px] font-medium text-gray-900">{u.fullName}</span>
                    </div>
                  </td>
                  <td className="px-3.5 py-2.5 text-[11px] text-gray-600">{u.email}</td>
                  <td className="px-3.5 py-2.5">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${roleStyles[u.role] ?? roleStyles.CLIENT}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${u.isActive ? 'bg-green-50 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 text-[10px] text-gray-400">{timeAgo(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </DashboardLayout>
  );
}
