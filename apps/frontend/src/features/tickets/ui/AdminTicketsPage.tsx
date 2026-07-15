import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/shared/ui/layout/DashboardLayout';
import {
  PageHeader, Card, TicketStatusBadge, TicketPriorityBadge, Avatar,
} from '@/shared/ui/DashboardComponents';
import { useTicketsStore }  from '../application/tickets.store';
import { formatTicketId, timeAgo } from '@/shared/utils/formatters';

import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth';

// Filter options — derived from backend enums
const STATUS_OPTIONS   = ['All', 'OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'] as const;
const PRIORITY_OPTIONS = ['All', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'] as const;

export function AdminTicketsPage() {
  const { tickets, isLoading, error, fetchTickets } = useTicketsStore();
  const { user } = useAuthStore();
  const location = useLocation();

  // ── Local filter state (UI concern, not in global store) ──
  const [statusFilter, setStatusFilter]     = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery]       = useState('');

  // Fetch tickets on mount — reuses the same store as dashboard (DRY)
  useEffect(() => {
    fetchTickets();
  }, []);

  // ── Apply filters to ticket list ──
  const filteredTickets = tickets.filter(t => {
    // Role-specific route filters for agents/clients
    if (location.pathname === '/agent/tickets') {
      if (t.agentId !== user?.id) return false;
    } else if (location.pathname === '/agent/unassigned') {
      if (t.agentId !== null) return false;
    } else if (location.pathname === '/client/tickets') {
      if (t.clientId !== user?.id) return false;
    }

    // Status filter
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    // Priority filter
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
    // Search — matches title or formatted ticket ID
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = t.title.toLowerCase().includes(query);
      const matchesId    = formatTicketId(t.id).toLowerCase().includes(query);
      if (!matchesTitle && !matchesId) return false;
    }
    return true;
  });

  return (
    <DashboardLayout title="All tickets">
      <div className="flex flex-col gap-3">

        {/* Page header — reusable shared component
        <PageHeader
          title="All tickets"
          count={tickets.length}
          description="Manage and track all support tickets"
        /> */}

        {/* Filter bar */}
        <Card>
          <div className="flex items-center gap-3 px-3.5 py-2.5">

            {/* Search */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5 text-xs text-gray-500 flex-1 max-w-[260px]">
              <i className="ti ti-search text-[13px]" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search tickets…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-xs text-gray-700 w-full placeholder:text-gray-400"
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5 text-xs text-gray-700 outline-none cursor-pointer"
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All statuses' : s.replace('_', ' ')}</option>
              ))}
            </select>

            {/* Priority filter */}
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5 text-xs text-gray-700 outline-none cursor-pointer"
            >
              {PRIORITY_OPTIONS.map(p => (
                <option key={p} value={p}>{p === 'All' ? 'All priorities' : p}</option>
              ))}
            </select>

            {/* Result count */}
            <span className="text-[10px] text-gray-400 ml-auto">
              {filteredTickets.length} of {tickets.length} tickets
            </span>
          </div>
        </Card>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Tickets table */}
        <Card>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2.5">Ticket</th>
                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2.5">Status</th>
                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2.5">Priority</th>
                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2.5">Category</th>
                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2.5">Agent</th>
                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2.5">Created</th>
              </tr>
            </thead>
            <tbody>
              {/* Loading state */}
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-3.5 py-12 text-center text-[11px] text-gray-400">
                    Loading tickets…
                  </td>
                </tr>
              )}

              {/* Empty state */}
              {!isLoading && filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3.5 py-12 text-center text-[11px] text-gray-400">
                    {searchQuery || statusFilter !== 'All' || priorityFilter !== 'All'
                      ? 'No tickets match your filters'
                      : 'No tickets found'
                    }
                  </td>
                </tr>
              )}

              {/* Ticket rows */}
              {filteredTickets.map(t => (
                <tr key={t.id} className="border-b border-gray-100 last:border-none hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="px-3.5 py-2.5">
                    <p className="text-[11px] font-medium text-gray-900">{t.title}</p>
                    <p className="text-[10px] text-gray-400">{formatTicketId(t.id)}</p>
                  </td>
                  <td className="px-3.5 py-2.5">
                    <TicketStatusBadge status={t.status} />
                  </td>
                  <td className="px-3.5 py-2.5">
                    <TicketPriorityBadge priority={t.priority} />
                  </td>
                  <td className="px-3.5 py-2.5 text-[11px] text-gray-600">
                    {t.category}
                  </td>
                  <td className="px-3.5 py-2.5">
                    {t.agentName
                      ? <div className="flex items-center gap-1.5"><Avatar name={t.agentName} /><span className="text-[11px] text-gray-700">{t.agentName}</span></div>
                      : <span className="text-[10px] text-gray-400">Unassigned</span>
                    }
                  </td>
                  <td className="px-3.5 py-2.5 text-[10px] text-gray-400">
                    {timeAgo(t.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Footer — ticket count summary */}
        {!isLoading && tickets.length > 0 && (
          <div className="flex items-center justify-between px-1 text-[10px] text-gray-400">
            <span>Showing {filteredTickets.length} of {tickets.length} tickets</span>
            <span>Last refreshed: just now</span>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
