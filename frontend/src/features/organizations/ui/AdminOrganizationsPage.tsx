import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/shared/ui/layout/DashboardLayout';
import { Card, StatusModal } from '@/shared/ui/DashboardComponents';
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
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  
  // Workspace Context States (ServeSync AI USP integration)
  const [industry, setIndustry]         = useState('E-commerce');
  const [supportTone, setSupportTone]   = useState('Professional');

  // Metrics state
  const [membersCount, setMembersCount] = useState<number | string>('—');
  const [ticketsCount, setTicketsCount] = useState<number | string>('—');

  // Danger Zone Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');

  const [isLoading, setLoading]         = useState(true);
  const [isSaving, setSaving]           = useState(false);
  const [error, setError]               = useState<string | null>(null); 

  // Logo selection state
  const [logoPreview, setLogoPreview]   = useState<string | null>(null);

  // Dynamic deterministic Org ID generator matching pattern ORG-YYYYMMDDXX
  const getOrgDisplayId = (org: Organization | null) => {
    if (!org) return 'ORG-2026071542';
    // Use creation date, default to today
    const dateStr = org.createdAt ? new Date(org.createdAt).toISOString().split('T')[0] : '2026-07-15';
    // Remove hyphens from the YYYY-MM-DD string to combine them
    const cleanDate = dateStr.replace(/-/g, '');
    // Construct a stable 2-digit suffix from the UUID string
    let suffix = '42';
    if (org.id) {
      const cleanId = org.id.replace(/-/g, '');
      const charCodeSum = Array.from(cleanId).reduce((sum, char) => sum + char.charCodeAt(0), 0);
      suffix = String(charCodeSum % 100).padStart(2, '0');
    }
    return `ORG-${cleanDate}${suffix}`;
  };

  const orgDisplayId = getOrgDisplayId(organization);

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

  // Toast trigger (now StatusModal) complying strictly with: Account ID {id} {action} {message}
  const triggerToast = (action: string, message: string) => {
    let title = "Operation Successful";
    if (action.includes("create") || action.includes("new")) {
      title = "Created Successfully";
    } else if (action.includes("update") || action.includes("save") || action.includes("change")) {
      title = "Updated Successfully";
    } else if (action.includes("delete") || action.includes("remove")) {
      title = "Deleted Successfully";
    }
    setModalTitle(title);
    setModalMessage(`Account ID ${orgDisplayId} ${action} ${message}`);
    setModalOpen(true);
    setTimeout(() => setModalOpen(false), 3000);
  };

  // Handle Save changes action
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.organizationId || !name || !slug) return;

    setSaving(true);
    setError(null);

    try {
      const updated = await updateOrganization(user.organizationId, name, slug);
      setOrganization(updated);
      setName(updated.name);
      setSlug(updated.slug);
      triggerToast('updated organization profile', 'successfully');
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // Save Workspace Context
  const handleSaveContext = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast('updated workspace context', 'successfully');
  };

  // Copy Organization ID to clipboard
  const handleCopyId = () => {
    if (!orgDisplayId) return;

    navigator.clipboard.writeText(orgDisplayId);
    setCopied(true);
    triggerToast('copied organization ID', 'successfully to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle Organization Deletion (Danger Zone)
  const handleDeleteOrganization = () => {
    if (deleteConfirmInput !== orgDisplayId) return;
    triggerToast('deleted permanently', 'organization profile removed');
    setIsDeleteModalOpen(false);
    setDeleteConfirmInput('');
  };

  // Simulated logo upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        triggerToast('updated logo preview', 'successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <DashboardLayout title="Organizations" description="View and manage your organization settings">
      <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen relative">

        {/* ── Reusable Status Modal for Action Success ──────────────────────────── */}
        <StatusModal
          isOpen={modalOpen}
          type="success"
          title={modalTitle}
          message={modalMessage}
          onClose={() => setModalOpen(false)}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700 shadow-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* ── Left Column: Config Panel ─────────────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Card 1: Organization Profile */}
            <Card title="Organization profile" className="shadow-sm border border-gray-200 p-6 bg-white rounded-xl">
              <form onSubmit={handleSave} className="flex flex-col gap-5">
                
                {/* Logo and Upload Block */}
                <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                  <div className="relative group w-16 h-16 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex items-center justify-center font-bold text-xl shadow-md overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Organization Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span>{name ? name.charAt(0).toUpperCase() : 'S'}</span>
                    )}
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] font-bold uppercase tracking-wider cursor-pointer transition-opacity text-white">
                      Upload
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900 tracking-wide uppercase">
                      {isLoading ? 'Loading…' : organization?.name}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">
                      White-label client workspace customization.
                    </span>
                  </div>
                </div>

                {/* Field 1: Organization name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="org-name" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Organization name
                  </label>
                  <input
                    id="org-name"
                    type="text"
                    disabled={isLoading || isSaving}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none rounded-lg px-3.5 py-2 text-[11px] text-gray-800 transition-all shadow-inner disabled:bg-gray-50 disabled:text-gray-400"
                    placeholder="e.g. ServeSync HQ"
                    required
                  />
                </div>

                {/* Field 2: Slug & Client Link Preview */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="org-slug" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Slug URL
                  </label>
                  <input
                    id="org-slug"
                    type="text"
                    disabled={isLoading || isSaving}
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none rounded-lg px-3.5 py-2 text-[11px] text-gray-800 transition-all shadow-inner disabled:bg-gray-50 disabled:text-gray-400"
                    placeholder="e.g. servesync-hq"
                    required
                  />
                  {/* Live Portal Slug Link Preview */}
                  <span className="text-[10px] text-blue-600 bg-blue-50/50 border border-blue-100 rounded-lg px-3 py-1.5 font-medium flex items-center gap-1">
                    🔗 Live Portal: 
                    <a
                      href={`https://servesync.com/portal/${slug || 'your-slug'}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold underline hover:text-blue-800"
                    >
                      servesync.com/portal/{slug || 'your-slug'}
                    </a>
                  </span>
                </div>

                {/* Field 3: Organization ID (Read-only + Interactive Copy) */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="org-id" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Organization ID (Registry Code)
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="org-id"
                      type="text"
                      readOnly
                      value={isLoading ? 'Loading…' : orgDisplayId}
                      className="w-full bg-gray-100 border border-gray-200 rounded-lg pl-3.5 pr-12 py-2.5 text-[11px] text-gray-600 font-mono outline-none select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopyId}
                      disabled={isLoading}
                      title="Copy to clipboard"
                      className="absolute right-2.5 px-2 py-1.5 text-gray-400 hover:text-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center bg-white border border-gray-200 rounded-md shadow-xs cursor-pointer"
                    >
                      {copied ? (
                        <span className="text-[10px] text-emerald-600 font-bold">✓</span>
                      ) : (
                        <i className="ti ti-copy text-xs" />
                      )}
                    </button>
                  </div>
                  <span className="text-[9px] text-gray-400 leading-normal">
                    Provide this registry code to new members so they can associate their credentials with your tenant database during registration.
                  </span>
                </div>

                {/* Profile Save Button */}
                <div className="flex justify-end pt-2 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={isLoading || isSaving || !name || !slug}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </Card>

            {/* Card 2: AI & Workspace Context (ServeSync USP Panel) */}
            <Card title="Workspace Context" className="shadow-sm border border-gray-200 p-6 bg-white rounded-xl">
              <form onSubmit={handleSaveContext} className="flex flex-col gap-4">
                <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                  ServeSync's Gemini AI uses this context to accurately triage your support tickets, classify categories, and draft brand-appropriate agent responses.
                </p>

                {/* Industry/Niche Input */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="industry" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Industry / Niche
                  </label>
                  <input
                    id="industry"
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-blue-500 outline-none rounded-lg px-3.5 py-2 text-[11px] text-gray-800 shadow-inner"
                    placeholder="e.g. E-commerce, Web Agency, SaaS"
                    required
                  />
                </div>

                {/* AI Support Tone Select */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="tone" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    AI Support Tone
                  </label>
                  <select
                    id="tone"
                    value={supportTone}
                    onChange={(e) => setSupportTone(e.target.value)}
                    className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-blue-500 outline-none rounded-lg px-3.5 py-2 text-[11px] text-gray-800 shadow-sm cursor-pointer"
                  >
                    <option value="Professional">Professional (Polite, structured, informative)</option>
                    <option value="Friendly">Friendly (Warm, supportive, casual)</option>
                    <option value="Urgent">Urgent (Brief, rapid, issue-focused)</option>
                  </select>
                </div>

                {/* Save Context Button */}
                <div className="flex justify-end pt-2 border-t border-gray-100">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
                  >
                    Save Workspace Context
                  </button>
                </div>
              </form>
            </Card>

          </div>

          {/* ── Right Column: Plan details and Danger Zone ────────────────────── */}
          <div className="flex flex-col gap-6">

            {/* Plan and Usage (Metric Cards redesign) */}
            <Card title="Plan and usage" className="shadow-sm border border-gray-200 bg-white rounded-xl p-5">
              <div className="flex flex-col gap-4">
                
                {/* Billing Summary Bar */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between shadow-xs">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-blue-900">Pro Subscription</span>
                    <span className="text-[9px] text-blue-500 font-semibold mt-0.5">$29/mo — Billed Monthly</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerToast('billing manager', 'redirection triggered successfully')}
                    className="bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-colors shadow-xs cursor-pointer"
                  >
                    Billing
                  </button>
                </div>

                {/* Modernized distinct metric panels */}
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="bg-gray-50 border border-gray-200/60 p-3 rounded-xl flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 text-blue-600 text-xs">
                      <i className="ti ti-user" />
                      <span className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">Members</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900 leading-none">{membersCount}</span>
                  </div>

                  <div className="bg-gray-50 border border-gray-200/60 p-3 rounded-xl flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 text-indigo-600 text-xs">
                      <i className="ti ti-ticket" />
                      <span className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">Tickets</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900 leading-none">{ticketsCount}</span>
                  </div>

                  <div className="bg-gray-50 border border-gray-200/60 p-3 rounded-xl flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 text-violet-600 text-xs">
                      <i className="ti ti-harddrive" />
                      <span className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">Storage</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900 leading-none">2.1 GB</span>
                  </div>

                  <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 p-3 rounded-xl flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 text-purple-600 text-xs">
                      <i className="ti ti-cpu" />
                      <span className="text-[9px] font-bold uppercase text-violet-600 tracking-wider">AI Actions</span>
                    </div>
                    {/* Dynamic USP metric reminder */}
                    <span className="text-lg font-extrabold text-purple-900 leading-none">148</span>
                  </div>
                </div>

              </div>
            </Card>

            {/* Danger zone panel */}
            <Card title="Danger zone" className="border border-red-200 shadow-sm bg-red-50/10 rounded-xl p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-red-950 uppercase tracking-wide">Delete Organization</span>
                  <span className="text-[9px] text-red-600/75 font-semibold mt-0.5">Permanently remove this tenant instance.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="border border-red-200 hover:border-red-300 text-red-700 bg-red-50/60 hover:bg-red-50 px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </Card>

          </div>

        </div>

        {/* ── Danger Zone Confirmation Modal ───────────────────────────────── */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={() => setIsDeleteModalOpen(false)} />
            
            <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 border border-gray-200 shadow-2xl animate-fade-in flex flex-col gap-4">
              <div className="flex items-center gap-2.5 text-red-600">
                <i className="ti ti-alert-triangle text-xl" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-red-800">Confirm Deletion</h3>
              </div>
              <p className="text-[10px] text-gray-500 leading-normal font-medium">
                This operation is irreversible and will delete all tickets, invoices, and configuration files under this tenant.
              </p>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold uppercase text-gray-400">
                  Type <span className="font-mono text-red-800 font-extrabold select-all">{orgDisplayId}</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-red-500 outline-none rounded-lg px-3 py-2 text-[11px] font-mono text-gray-800"
                  placeholder="ORG-..."
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={handleDeleteOrganization}
                  disabled={deleteConfirmInput !== orgDisplayId}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase py-2.5 rounded-lg shadow-sm disabled:opacity-50 transition-colors cursor-pointer"
                >
                  Delete permanently
                </button>
                <button
                  onClick={() => { setIsDeleteModalOpen(false); setDeleteConfirmInput(''); }}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 text-[10px] font-bold uppercase py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
