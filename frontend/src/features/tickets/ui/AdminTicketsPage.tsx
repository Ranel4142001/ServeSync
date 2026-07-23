import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/shared/ui/layout/DashboardLayout';
import {
  Card, Avatar, StatusModal,
} from '@/shared/ui/DashboardComponents';
import { useTicketsStore } from '../application/tickets.store';
import { useAuthStore } from '@/features/auth';
import { formatTicketId, timeAgo, formatOrgId } from '@/shared/utils/formatters';
import { getTicketDetails, generateAiDraft, TicketDetailsResponse } from '../infrastructure/tickets.api';

// Filter tabs definition
const TABS = [
  { id: 'all', label: 'All Tickets' },
  { id: 'open', label: 'Open' },
  { id: 'pending', label: 'Pending' },
  { id: 'closed', label: 'Closed' },
  { id: 'urgent', label: 'Urgent' }
] as const;

export function AdminTicketsPage() {
  const { tickets, isLoading, error, fetchTickets, closeTicket, updateTicketLocal } = useTicketsStore();
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // ── UI States ──────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  // Sorting State
  const [sortField, setSortField] = useState<'title' | 'status' | 'priority' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Drawer / Slide-Over State
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [ticketDetails, setTicketDetails] = useState<TicketDetailsResponse | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [aiDraftText, setAiDraftText] = useState<string | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);

  // Fetch tickets on mount
  useEffect(() => {
    fetchTickets();
  }, []);

  // Fetch ticket details when drawer opens
  useEffect(() => {
    if (!selectedTicketId) {
      setTicketDetails(null);
      setAiDraftText(null);
      return;
    }
    setIsLoadingDetails(true);
    setAiDraftText(null);
    getTicketDetails(selectedTicketId)
      .then(res => setTicketDetails(res))
      .catch(err => console.error('Failed to load ticket details:', err))
      .finally(() => setIsLoadingDetails(false));
  }, [selectedTicketId]);

  // Handle Status Modal Notifications (Standardized trigger)
  const triggerToast = (action: string, message: string) => {
    const orgId = user?.organizationId || '019f65df-cff7-70b7-965b-06bcc4072296';
    
    let title = "Operation Successful";
    if (action.includes("create") || action.includes("new")) {
      title = "Created Successfully";
    } else if (action.includes("update") || action.includes("close") || action.includes("assign") || action.includes("status") || action.includes("priority") || action.includes("generate")) {
      title = "Updated Successfully";
    } else if (action.includes("delete") || action.includes("remove")) {
      title = "Deleted Successfully";
    }
    
    setModalTitle(title);
    setModalMessage(`Account ID ${formatOrgId(orgId)} ${action} ${message}`);
    setModalOpen(true);
    setTimeout(() => setModalOpen(false), 3000);
  };

  // Handle individual close action
  const handleCloseTicket = async (id: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation(); // Avoid triggering row click / opening drawer
    try {
      await closeTicket(id);
      triggerToast('closed ticket', `#${formatTicketId(id)} successfully`);
      // Update details drawer state if open
      if (selectedTicketId === id && ticketDetails) {
        setTicketDetails(prev => prev ? { ...prev, ticket: { ...prev.ticket, status: 'CLOSED' } } : null);
      }
    } catch (err: any) {
      console.error(err);
      triggerToast('failed to close ticket', `#${formatTicketId(id)}`);
    }
  };

  // Handle custom status/priority/agent local updates
  const handleUpdateField = (field: 'status' | 'priority' | 'agent', value: string) => {
    if (!selectedTicketId) return;

    if (field === 'status') {
      if (value === 'CLOSED') {
        handleCloseTicket(selectedTicketId);
      } else {
        updateTicketLocal(selectedTicketId, { status: value });
        triggerToast('updated status of ticket', `#${formatTicketId(selectedTicketId)} to ${value} successfully`);
      }
    } else if (field === 'priority') {
      updateTicketLocal(selectedTicketId, { priority: value });
      triggerToast('updated priority of ticket', `#${formatTicketId(selectedTicketId)} to ${value} successfully`);
    } else if (field === 'agent') {
      const name = value === 'admin' ? 'System Admin' : 'Support Agent';
      updateTicketLocal(selectedTicketId, { agentId: value, agentName: name });
      triggerToast('reassigned ticket', `#${formatTicketId(selectedTicketId)} to ${name} successfully`);
    }

    // Refresh details modal local state
    setTicketDetails(prev => {
      if (!prev) return null;
      const updatedTicket = { ...prev.ticket };
      if (field === 'status') updatedTicket.status = value;
      if (field === 'priority') updatedTicket.priority = value;
      if (field === 'agent') {
        updatedTicket.agentId = value;
        updatedTicket.agentName = value === 'admin' ? 'System Admin' : 'Support Agent';
      }
      return { ...prev, ticket: updatedTicket };
    });
  };

  // Generate AI reply draft
  const handleGenerateAiReply = async () => {
    if (!selectedTicketId) return;
    setIsDrafting(true);
    setAiDraftText(null);
    try {
      const data = await generateAiDraft(selectedTicketId);
      setAiDraftText(data.draft);
      triggerToast('generated AI draft', `for ticket #${formatTicketId(selectedTicketId)} successfully`);
    } catch (err) {
      console.error(err);
      setAiDraftText("Hello! This is an automated draft response. Our support team is currently investigating your concern and will get back to you shortly.");
      triggerToast('generated fallback AI draft', `for ticket #${formatTicketId(selectedTicketId)} successfully`);
    } finally {
      setIsDrafting(false);
    }
  };

  // ── Filtering logic ──
  const filteredTickets = tickets.filter(t => {
    // Role-specific path filters
    if (location.pathname === '/agent/tickets') {
      if (user && t.agentId !== user.id) return false;
    } else if (location.pathname === '/agent/unassigned') {
      if (t.agentId !== null) return false;
    } else if (location.pathname === '/client/tickets') {
      if (user && t.clientId !== user.id) return false;
    }

    // Quick filter tab mapping
    if (activeTab === 'open') {
      if (t.status !== 'OPEN' && t.status !== 'IN_PROGRESS') return false;
    } else if (activeTab === 'pending') {
      if (t.status !== 'PENDING') return false;
    } else if (activeTab === 'closed') {
      if (t.status !== 'CLOSED' && t.status !== 'RESOLVED') return false;
    } else if (activeTab === 'urgent') {
      if (t.priority !== 'URGENT') return false;
    }

    // Search query mapping
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = t.title.toLowerCase().includes(query);
      const matchesId = formatTicketId(t.id).toLowerCase().includes(query);
      if (!matchesTitle && !matchesId) return false;
    }

    return true;
  });

  // ── Sorting logic ──
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === 'createdAt') {
      valA = new Date(a.createdAt).getTime().toString();
      valB = new Date(b.createdAt).getTime().toString();
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Handle Sort Click
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // ── Bulk Actions Handlers ──
  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(sortedTickets.map(t => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleBulkClose = async () => {
    try {
      await Promise.all(selectedIds.map(id => closeTicket(id)));
      triggerToast('bulk closed', `${selectedIds.length} tickets successfully`);
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
      triggerToast('failed bulk operation', 'to close tickets');
    }
  };

  const handleBulkAssignMe = () => {
    selectedIds.forEach(id => {
      updateTicketLocal(id, { agentId: user?.id || 'admin', agentName: user?.fullName || 'System Admin' });
    });
    triggerToast('bulk assigned', `${selectedIds.length} tickets to yourself successfully`);
    setSelectedIds([]);
  };

  // Dynamic AI Sentiment detection based on priority/category (USP feature mapping)
  const getSentiment = (ticket: typeof tickets[number]) => {
    if (ticket.priority === 'URGENT') return { text: 'Frustrated', color: 'text-red-600 bg-red-50 border-red-100', dot: '🔴' };
    if (ticket.priority === 'HIGH') return { text: 'Agitated', color: 'text-amber-600 bg-amber-50 border-amber-100', dot: '🟡' };
    if (ticket.category === 'Billing') return { text: 'Inquiring', color: 'text-blue-600 bg-blue-50 border-blue-100', dot: '🔵' };
    return { text: 'Satisfied', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', dot: '🟢' };
  };

  let pageTitle = 'All tickets';
  let pageDesc = 'Manage and resolve customer support tickets';

  if (location.pathname === '/agent/tickets') {
    pageTitle = 'My tickets';
    pageDesc = 'Track and resolve your assigned support requests';
  } else if (location.pathname === '/agent/unassigned') {
    pageTitle = 'Unassigned tickets';
    pageDesc = 'View tickets awaiting agent assignment';
  } else if (location.pathname === '/agent/all') {
    pageTitle = 'All tickets';
    pageDesc = 'Complete catalog of organization tickets';
  } else if (location.pathname === '/client/tickets') {
    pageTitle = 'My tickets';
    pageDesc = 'View and track your submitted support requests';
  }

  return (
    <DashboardLayout title={pageTitle} description={pageDesc}>
      <div className="flex flex-col gap-4 p-6 bg-gray-50 min-h-screen relative">

        {/* ── Reusable Status Modal for Action Success ──────────────────────────── */}
        <StatusModal
          isOpen={modalOpen}
          type="success"
          title={modalTitle}
          message={modalMessage}
          onClose={() => setModalOpen(false)}
        />

        {/* ── Filter Controls Header ────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          {/* Quick Filter Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200/50 w-max">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSelectedIds([]); }}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-500 w-full md:w-64">
              <i className="ti ti-search text-sm" />
              <input
                type="text"
                placeholder="Search ticket title or ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-xs text-gray-700 w-full placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* ── Tickets Main List Card ────────────────────────────────────────── */}
        <Card className="shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-24 text-[11px] text-gray-400">
              <span className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
              Loading tickets database...
            </div>
          ) : sortedTickets.length === 0 ? (
            /* Actionable empty state */
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <svg className="w-16 h-16 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.375M9 18h3.375m-6-6h.008v.008H3.75V12zm0 3h.008v.008H3.75V15zm0 3h.008v.008H3.75V18zm-.375-9.75h16.5c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125H3.375c-.621 0-1.125-.504-1.125-1.125v-9.75c0-.621.504-1.125 1.125-1.125zM6.75 3v1.5M17.25 3v1.5M3 5.25h18" />
              </svg>
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">No Tickets Match</h3>
              <p className="text-[10px] text-gray-400 max-w-[280px] mt-1 mb-4 leading-normal">
                There are no tickets matching the selected filters. Change tabs or create a new ticket to get started.
              </p>
              <button
                onClick={() => navigate('/client/new-ticket')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                Create New Ticket
              </button>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === sortedTickets.length}
                      onChange={e => handleSelectAll(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th
                    onClick={() => handleSort('title')}
                    className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3 cursor-pointer select-none hover:text-gray-700 transition-colors"
                  >
                    Ticket {sortField === 'title' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th
                    onClick={() => handleSort('status')}
                    className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3 cursor-pointer select-none hover:text-gray-700 transition-colors"
                  >
                    Status {sortField === 'status' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th
                    onClick={() => handleSort('priority')}
                    className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3 cursor-pointer select-none hover:text-gray-700 transition-colors"
                  >
                    Priority {sortField === 'priority' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">
                    AI Sentiment
                  </th>
                  <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Category</th>
                  <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">Agent</th>
                  <th
                    onClick={() => handleSort('createdAt')}
                    className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3 cursor-pointer select-none hover:text-gray-700 transition-colors"
                  >
                    Created {sortField === 'createdAt' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  {/* Action Column Placeholder */}
                  <th className="w-36"></th>
                </tr>
              </thead>
              <tbody>
                {sortedTickets.map(t => {
                  const sentiment = getSentiment(t);
                  return (
                    <tr
                      key={t.id}
                      onClick={() => { setSelectedTicketId(t.id); setIsDrawerOpen(true); }}
                      className="group border-b border-gray-100 last:border-none hover:bg-slate-50/80 transition-all cursor-pointer"
                    >
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(t.id)}
                          onChange={e => handleSelectRow(t.id, e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[11px] font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{t.title}</p>
                        <p className="text-[9px] text-gray-400 font-mono mt-0.5">{formatTicketId(t.id)}</p>
                      </td>
                      <td className="px-4 py-3">
                        {/* Status pill badge */}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${
                          t.status === 'OPEN' ? 'bg-violet-50 text-violet-700 border-violet-100' :
                          t.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          t.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {/* Priority pill badge */}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${
                          t.priority === 'URGENT' ? 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse' :
                          t.priority === 'HIGH' ? 'bg-red-50 text-red-700 border-red-100' :
                          t.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                          {t.priority}
                        </span>
                      </td>
                      {/* AI Sentiment analysis output */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold border ${sentiment.color}`}>
                          <span>{sentiment.dot}</span>
                          <span>{sentiment.text}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-600">{t.category}</td>
                      <td className="px-4 py-3">
                        {t.agentName ? (
                          <div className="flex items-center gap-1.5">
                            <Avatar name={t.agentName} />
                            <span className="text-[10px] text-gray-700 font-medium">{t.agentName}</span>
                          </div>
                        ) : (
                          <span className="text-[9px] font-bold text-gray-400 uppercase bg-gray-100 px-1.5 py-0.5 rounded">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[10px] text-gray-400">{timeAgo(t.createdAt)}</td>
                      {/* Inline Hover Action Panel */}
                      <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                        <div className="opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto flex items-center justify-end gap-1.5 transition-all">
                          {t.status !== 'CLOSED' && t.status !== 'RESOLVED' && (
                            <button
                              onClick={(e) => handleCloseTicket(t.id, e)}
                              className="px-2 py-1 bg-gray-100 hover:bg-red-50 hover:text-red-700 text-[10px] font-bold text-gray-600 rounded border border-gray-200 hover:border-red-200 transition-colors cursor-pointer"
                            >
                              Close
                            </button>
                          )}
                          <button
                            onClick={() => { setSelectedTicketId(t.id); setIsDrawerOpen(true); }}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-[10px] font-bold text-white rounded transition-colors cursor-pointer"
                          >
                            Preview
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>

        {/* Ticket list footer */}
        {!isLoading && tickets.length > 0 && (
          <div className="flex items-center justify-between px-1 text-[10px] text-gray-400 font-medium">
            <span>Showing {sortedTickets.length} of {tickets.length} tickets</span>
          </div>
        )}

        {/* ── Bulk Actions Floating Command Bar ─────────────────────────────── */}
        {selectedIds.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-slate-900 text-white rounded-xl px-5 py-3.5 flex items-center gap-5 shadow-2xl border border-slate-800 animate-slide-in">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {selectedIds.length} Selected
            </span>
            <div className="w-px h-4 bg-slate-800" />
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkAssignMe}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Assign to Me
              </button>
              <button
                onClick={handleBulkClose}
                className="bg-red-600 hover:bg-red-700 text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg shadow transition-colors cursor-pointer"
              >
                Bulk Close
              </button>
            </div>
            <button
              onClick={() => setSelectedIds([])}
              className="text-slate-400 hover:text-white text-[10px] font-bold ml-2 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

        {/* ── Slide-Over Preview Panel (Interactive Drawer) ─────────────────── */}
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop overlay */}
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsDrawerOpen(false)}
            />

            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-gray-200 animate-slide-left">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      Preview ID #{selectedTicketId ? formatTicketId(selectedTicketId) : ''}
                    </span>
                    <h2 className="text-xs font-bold text-gray-900 mt-1 uppercase tracking-wide">
                      Ticket Operations
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="text-gray-400 hover:text-gray-700 font-bold text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
                  {isLoadingDetails ? (
                    <div className="flex flex-col items-center justify-center py-20 text-[11px] text-gray-400">
                      <span className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
                      Fetching full message thread...
                    </div>
                  ) : ticketDetails ? (
                    <>
                      {/* Ticket title and description (first message body) */}
                      <div>
                        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                          {ticketDetails.ticket.title}
                        </h3>
                        <div className="mt-2 bg-slate-50 border border-slate-100 p-3 rounded-lg text-[11px] text-gray-600 leading-relaxed max-h-40 overflow-y-auto font-medium">
                          {ticketDetails.messages[0]?.body || 'No description provided.'}
                        </div>
                      </div>

                      {/* Quick-Update State Fields */}
                      <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          State Configuration
                        </h4>
                        
                        {/* Status Select */}
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-semibold text-gray-500 uppercase">Status</label>
                          <select
                            value={ticketDetails.ticket.status}
                            onChange={e => handleUpdateField('status', e.target.value)}
                            className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-[10px] text-gray-700 font-bold outline-none cursor-pointer focus:border-blue-500"
                          >
                            <option value="OPEN">OPEN</option>
                            <option value="IN_PROGRESS">IN PROGRESS</option>
                            <option value="PENDING">PENDING</option>
                            <option value="CLOSED">CLOSED</option>
                          </select>
                        </div>

                        {/* Priority Select */}
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-semibold text-gray-500 uppercase">Priority</label>
                          <select
                            value={ticketDetails.ticket.priority}
                            onChange={e => handleUpdateField('priority', e.target.value)}
                            className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-[10px] text-gray-700 font-bold outline-none cursor-pointer focus:border-blue-500"
                          >
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                            <option value="URGENT">URGENT</option>
                          </select>
                        </div>

                        {/* Assign Agent Select */}
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-semibold text-gray-500 uppercase">Assignee</label>
                          <select
                            value={ticketDetails.ticket.agentId || 'unassigned'}
                            onChange={e => handleUpdateField('agent', e.target.value)}
                            className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-[10px] text-gray-700 font-bold outline-none cursor-pointer focus:border-blue-500"
                          >
                            <option value="unassigned">Unassigned</option>
                            <option value="admin">System Admin</option>
                            <option value="agent">Support Agent</option>
                          </select>
                        </div>
                      </div>

                      {/* AI Copilot Panel */}
                      <div className="border border-violet-100 bg-violet-50/50 p-4 rounded-xl flex flex-col gap-3 relative">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-violet-700 flex items-center gap-1">
                            🤖 AI Copilot Draft
                          </h4>
                          <button
                            onClick={handleGenerateAiReply}
                            disabled={isDrafting}
                            className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-[9px] uppercase px-2.5 py-1 rounded shadow transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {isDrafting ? 'Drafting...' : 'Generate AI Reply'}
                          </button>
                        </div>

                        {aiDraftText ? (
                          <div className="flex flex-col gap-2">
                            <textarea
                              readOnly
                              value={aiDraftText}
                              className="bg-white border border-violet-100 p-2.5 rounded-lg text-[10px] text-gray-700 leading-normal h-24 outline-none resize-none font-medium"
                            />
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(aiDraftText);
                                triggerToast('copied to clipboard', 'AI reply draft successfully');
                              }}
                              className="self-end border border-violet-200 hover:border-violet-400 bg-white text-violet-700 font-bold text-[9px] uppercase px-2 py-1 rounded transition-colors cursor-pointer"
                            >
                              Copy Draft
                            </button>
                          </div>
                        ) : (
                          <p className="text-[10px] text-violet-400 italic">
                            Click Generate to draft a response context-aware of ticket messages.
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-10 text-[11px] text-gray-400">
                      Failed to load details.
                    </div>
                  )}
                </div>

                {/* Footer Operations */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-2">
                  {ticketDetails && ticketDetails.ticket.status !== 'CLOSED' && (
                    <button
                      onClick={() => handleCloseTicket(ticketDetails.ticket.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      Close Ticket
                    </button>
                  )}
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex-1 border border-gray-300 hover:bg-gray-100 text-gray-700 text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
