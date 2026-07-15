import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/shared/ui/layout/DashboardLayout';
import { PageHeader, Card } from '@/shared/ui/DashboardComponents';
import { useAuthStore } from '@/features/auth';
import { getOrganization, updateOrganization, Organization } from '../infrastructure/organizations.api';
import { getUsers } from '@/features/users/infrastructure/users.api';
import { getTickets } from '@/features/tickets/infrastructure/tickets.api';

export function AdminOrganizationsPage() {
  const { user } = useAuthStore();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [name, setName]                 = useState('');
  const [slug, setSlug]                 = useState('');
  const [copied, setCopied]             = useState(false);
  const [saveSuccess, setSaveSuccess]   = useState(false);
  
  // Metrics state
  const [membersCount, setMembersCount] = useState<number | string>('—');
  const [ticketsCount, setTicketsCount] = useState<number | string>('—');

  const [isLoading, setLoading]         = useState(true);
  const [isSaving, setSaving]           = useState(false);
  const [error, setError]               = useState<string | null>(null); 

  // Fetch organization details & summary metrics
  useEffect(() => {
    if (!user?.organizationId) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const orgData = await getOrganization(user.organizationId);
        setOrganization(orgData);
        setName(orgData.name);
        setSlug(orgData.slug);

        // Fetch metrics dynamically to populate the usage section
        const usersData = await getUsers();
        setMembersCount(usersData.total || usersData.users.length);

        const ticketsData = await getTickets();
        setTicketsCount(ticketsData.total || ticketsData.tickets.length);
      } catch (err: any) {
        setError(err.response?.data?.error ?? 'Failed to load organization data');
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.organizationId]);

  // Handle Save changes action
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.organizationId || !name || !slug) return;

    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const updated = await updateOrganization(user.organizationId, name, slug);
      setOrganization(updated);
      setName(updated.name);
      setSlug(updated.slug);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // Copy Organization ID to clipboard
  const handleCopyId = () => {
    const orgCode = organization?.code || (organization?.id ? `ORG-${String(organization.id).padStart(4, '0')}` : '');
    if (!orgCode) return;

    navigator.clipboard.writeText(orgCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout title="Organizations">
      <div className="flex flex-col gap-3.5 pb-6">

        <PageHeader
          title="Organizations"
          description="View and manage your organization settings"
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-xs text-red-700">{error}</div>
        )}

        {saveSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-xs text-green-700">
            Organization settings saved successfully!
          </div>
        )}

        {/* ── Card 1: Organization Profile (Matches Screenshot) ───────────────────── */}
        <Card title="Organization profile">
          <form onSubmit={handleSave} className="px-4 py-4 flex flex-col gap-4">
            
            {/* Header Avatar and Info Block */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-11 h-11 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {name ? name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900 leading-tight">
                  {isLoading ? 'Loading…' : organization?.name}
                </span>
                <span className="text-[10px] text-gray-400">Organization ID shown below</span>
              </div>
            </div>

            {/* Field 1: Organization name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="org-name" className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Organization name
              </label>
              <input
                id="org-name"
                type="text"
                disabled={isLoading || isSaving}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none rounded-md px-3 py-2 text-[11px] text-gray-800 transition-colors shadow-sm disabled:bg-gray-50 disabled:text-gray-400"
                placeholder="e.g. ServeSync HQ"
                required
              />
            </div>

            {/* Field 2: Slug */}
            <div className="flex flex-col gap-1">
              <label htmlFor="org-slug" className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Slug
              </label>
              <input
                id="org-slug"
                type="text"
                disabled={isLoading || isSaving}
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none rounded-md px-3 py-2 text-[11px] text-gray-800 transition-colors shadow-sm disabled:bg-gray-50 disabled:text-gray-400"
                placeholder="e.g. servesync-hq"
                required
              />
              <span className="text-[9px] text-gray-400">Lowercase letters, numbers, and hyphens only</span>
            </div>

            {/* Field 3: Organization ID (Read-only + Copy Action) */}
            <div className="flex flex-col gap-1">
              <label htmlFor="org-id" className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Organization ID
              </label>
              <div className="relative flex items-center">
                <input
                  id="org-id"
                  type="text"
                  readOnly
                  value={
                    isLoading
                      ? 'Loading…'
                      : organization?.code || (organization?.id ? `ORG-${String(organization.id).padStart(4, '0')}` : '')
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-md pl-3 pr-10 py-2 text-[11px] text-gray-600 outline-none select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyId}
                  disabled={isLoading}
                  title="Copy to clipboard"
                  className="absolute right-2 px-1.5 py-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  {copied ? (
                    <span className="text-[9px] text-emerald-600 font-semibold">Copied!</span>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  )}
                </button>
              </div>
              <span className="text-[9px] text-gray-400">Share with new members so they can register under your organization</span>
            </div>

            {/* Form Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isLoading || isSaving || !name || !slug}
                className="bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-3.5 py-1.5 rounded-md text-[11px] font-medium transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSaving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </Card>

        {/* ── Card 2: Plan and Usage (Matches Screenshot) ────────────────────────── */}
        <Card title="Plan and usage">
          <div className="px-4 py-4 flex flex-col gap-4">
            
            {/* Blue Banner Plan Selector */}
            <div className="bg-blue-50/40 border border-blue-100 rounded-lg p-3.5 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-blue-800">Pro plan</span>
                <span className="text-[10px] text-blue-500">$29/mo — billed monthly</span>
              </div>
              <button
                type="button"
                className="bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-3 py-1.5 rounded-md text-[10px] font-medium transition-colors shadow-sm"
              >
                Manage billing
              </button>
            </div>

            {/* Plan Usage Metrics */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100 pt-4 text-center">
              <div className="flex flex-col gap-1">
                <span className="text-xl font-bold text-gray-900">{membersCount}</span>
                <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Members</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xl font-bold text-gray-900">{ticketsCount}</span>
                <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Tickets</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xl font-bold text-gray-900">2.1 GB</span>
                <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Storage</span>
              </div>
            </div>

          </div>
        </Card>

        {/* ── Card 3: Danger Zone (Matches Screenshot) ───────────────────────────── */}
        <Card title="Danger zone">
          <div className="px-4 py-4 flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-gray-900">Delete organization</span>
              <span className="text-[9px] text-gray-400">Permanently remove all data</span>
            </div>
            <button
              type="button"
              className="border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md text-[10px] font-semibold transition-colors"
            >
              Delete
            </button>
          </div>
        </Card>

      </div>
    </DashboardLayout>
  );
}
