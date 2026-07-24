import { useState } from 'react';

export interface AnalyticsHeaderProps {
  selectedRange: string;
  setSelectedRange: (range: string) => void;
  selectedAgent: string;
  setSelectedAgent: (agentId: string) => void;
  agents: { id: string; fullName: string }[];
}

export function AnalyticsHeader({
  selectedRange,
  setSelectedRange,
  selectedAgent,
  setSelectedAgent,
  agents,
}: AnalyticsHeaderProps) {
  const [rangeOpen, setRangeOpen] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);

  const ranges = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'This Month', value: 'month' },
  ];

  const activeRangeLabel = ranges.find((r) => r.value === selectedRange)?.label || 'Last 30 Days';
  const activeAgentLabel =
    selectedAgent === 'all'
      ? 'All Agents'
      : selectedAgent === 'unassigned'
      ? 'Unassigned'
      : agents.find((a) => a.id === selectedAgent)?.fullName || 'All Agents';

  return (
    <div className="flex justify-end items-center gap-3 mb-2">
      {/* Date Range Dropdown */}
      <div className="relative">
        <button
          onClick={() => {
            setRangeOpen(!rangeOpen);
            setAgentOpen(false);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 cursor-pointer select-none transition-all duration-150"
        >
          <i className="ti ti-calendar text-gray-400" />
          <span>{activeRangeLabel}</span>
          <i className={`ti ti-chevron-down text-[10px] text-gray-400 transition-transform duration-200 ${rangeOpen ? 'rotate-180' : ''}`} />
        </button>

        {rangeOpen && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setRangeOpen(false)}
            />
            <div className="absolute right-0 mt-1.5 w-40 bg-white border border-gray-150 rounded-lg shadow-lg py-1 z-40 animate-slide-up">
              {ranges.map((r) => (
                <button
                  key={r.value}
                  onClick={() => {
                    setSelectedRange(r.value);
                    setRangeOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                    selectedRange === r.value
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Agent Filter Dropdown */}
      <div className="relative">
        <button
          onClick={() => {
            setAgentOpen(!agentOpen);
            setRangeOpen(false);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 cursor-pointer select-none transition-all duration-150"
        >
          <i className="ti ti-user text-gray-400" />
          <span>{activeAgentLabel}</span>
          <i className={`ti ti-chevron-down text-[10px] text-gray-400 transition-transform duration-200 ${agentOpen ? 'rotate-180' : ''}`} />
        </button>

        {agentOpen && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setAgentOpen(false)}
            />
            <div className="absolute right-0 mt-1.5 w-48 bg-white border border-gray-150 rounded-lg shadow-lg py-1 z-40 max-h-56 overflow-y-auto animate-slide-up">
              <button
                onClick={() => {
                  setSelectedAgent('all');
                  setAgentOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                  selectedAgent === 'all'
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                All Agents
              </button>
              <button
                onClick={() => {
                  setSelectedAgent('unassigned');
                  setAgentOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                  selectedAgent === 'unassigned'
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Unassigned
              </button>
              {agents.length > 0 && (
                <div className="border-t border-gray-100 my-1" />
              )}
              {agents.map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    setSelectedAgent(a.id);
                    setAgentOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer truncate ${
                    selectedAgent === a.id
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  title={a.fullName}
                >
                  {a.fullName}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
