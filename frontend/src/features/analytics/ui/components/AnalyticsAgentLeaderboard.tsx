import { useState } from 'react';
import { Avatar } from '@/shared/ui/DashboardComponents';

export interface LeaderboardAgent {
  id: string;
  fullName: string;
  avgResponse: string;
  avgResolve: string;
  resolvedCount: number;
  csat: number; // e.g. 4.8
}

interface AnalyticsAgentLeaderboardProps {
  agents: LeaderboardAgent[];
}

export function AnalyticsAgentLeaderboard({ agents }: AnalyticsAgentLeaderboardProps) {
  const [sortBy, setSortBy] = useState<'resolved' | 'csat' | 'name'>('resolved');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: 'resolved' | 'csat' | 'name') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedAgents = [...agents].sort((a, b) => {
    let aVal: any = a.resolvedCount;
    let bVal: any = b.resolvedCount;

    if (sortBy === 'csat') {
      aVal = a.csat;
      bVal = b.csat;
    } else if (sortBy === 'name') {
      aVal = a.fullName.toLowerCase();
      bVal = b.fullName.toLowerCase();
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden h-full flex flex-col">
      {/* Card Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div>
          <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            Agent Performance
          </h2>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Key response times and customer satisfaction metrics
          </p>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-gray-50/30 border-b border-gray-150">
              <th
                onClick={() => handleSort('name')}
                className="px-4 py-2.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 select-none transition-colors"
              >
                Agent {sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className="px-4 py-2.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                Avg. Response
              </th>
              <th className="px-4 py-2.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                Avg. Resolve
              </th>
              <th
                onClick={() => handleSort('resolved')}
                className="px-4 py-2.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 select-none transition-colors text-right"
              >
                Resolved {sortBy === 'resolved' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th
                onClick={() => handleSort('csat')}
                className="px-4 py-2.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 select-none transition-colors text-right"
              >
                CSAT {sortBy === 'csat' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedAgents.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-[11px] text-gray-400 font-medium">
                  No agents found.
                </td>
              </tr>
            ) : (
              sortedAgents.map((agent) => {
                // Determine CSAT colors
                const csatColor =
                  agent.csat >= 4.5
                    ? 'text-emerald-600 bg-emerald-50'
                    : agent.csat >= 4.0
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-amber-600 bg-amber-50';

                return (
                  <tr
                    key={agent.id}
                    className="border-b border-gray-100 last:border-none hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={agent.fullName} />
                        <div>
                          <p className="text-[11px] font-bold text-gray-800 leading-tight">
                            {agent.fullName}
                          </p>
                          <p className="text-[9px] text-gray-400 mt-0.5">Support Team</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-gray-600 font-medium">
                      {agent.avgResponse}
                    </td>
                    <td className="px-4 py-3 text-[10px] text-gray-600 font-mono">
                      {agent.avgResolve}
                    </td>
                    <td className="px-4 py-3 text-[10px] text-gray-800 font-bold text-right">
                      {agent.resolvedCount}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${csatColor}`}>
                          {agent.csat.toFixed(1)} / 5.0
                        </span>
                        {/* CSS Rating Bar */}
                        <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              agent.csat >= 4.5
                                ? 'bg-emerald-500'
                                : agent.csat >= 4.0
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${(agent.csat / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
