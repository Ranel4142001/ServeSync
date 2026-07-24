import { useState } from 'react';
import { DashboardLayout } from '@/shared/ui/layout/DashboardLayout';
import { Card } from '@/shared/ui/DashboardComponents';

export function AdminAiSettingsPage() {
  // Feature states
  const [autoTriage, setAutoTriage]           = useState(true);
  const [draftResponses, setDraftResponses]   = useState(true);
  const [autoClose, setAutoClose]             = useState(false);
  
  // API key state
  const [apiKey, setApiKey]                   = useState('••••••••••••••••••••••••••••••••••••');
  const [isTesting, setTesting]               = useState(false);
  const [testResult, setTestResult]           = useState<'CONNECTED' | 'ERROR' | null>('CONNECTED');

  // Strictness state
  const [strictness, setStrictness]           = useState<'LENIENT' | 'BALANCED' | 'STRICT'>('BALANCED');

  // Test Connection Action
  const handleTestConnection = () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      setTestResult('CONNECTED');
    }, 1500);
  };

  return (
    <DashboardLayout title="AI Settings" description="Configure AI-powered features for your support team">
      <div className="flex flex-col gap-3.5 pb-6">

        {/* ── Card 1: AI Features (Matches Screenshot) ───────────────────────────── */}
        <Card title="AI features">
          <div className="flex flex-col divide-y divide-gray-100">
            
            {/* Feature 1: Auto-triage */}
            <div className="px-4 py-3.5 flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-900">Auto-triage new tickets</span>
                <span className="text-[10px] text-gray-400">Gemini reads each ticket and assigns category and priority automatically</span>
              </div>
              <button
                type="button"
                onClick={() => setAutoTriage(!autoTriage)}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                  autoTriage ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${
                    autoTriage ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Feature 2: Draft responses */}
            <div className="px-4 py-3.5 flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-900">Enable AI draft responses</span>
                <span className="text-[10px] text-gray-400">Agents can request an AI-suggest reply on any open ticket</span>
              </div>
              <button
                type="button"
                onClick={() => setDraftResponses(!draftResponses)}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                  draftResponses ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${
                    draftResponses ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Feature 3: Auto-close */}
            <div className="px-4 py-3.5 flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-900">Auto-close resolved tickets</span>
                <span className="text-[10px] text-gray-400">Automatically close tickets 7 days after being marked resolved</span>
              </div>
              <button
                type="button"
                onClick={() => setAutoClose(!autoClose)}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                  autoClose ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${
                    autoClose ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

          </div>
        </Card>

        {/* ── Card 2: Gemini API Connection (Matches Screenshot) ─────────────────── */}
        <Card title="Gemini API connection">
          <div className="px-4 py-4 flex flex-col gap-4">
            
            {/* Input field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="api-key" className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                API key
              </label>
              <input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none rounded-md px-3 py-2 text-[11px] text-gray-800 transition-colors shadow-sm"
                placeholder="Enter Gemini API key"
              />
              <span className="text-[9px] text-gray-400">Stored securely — never shown in full after saving</span>
            </div>

            {/* Actions list */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-3.5 py-1.5 rounded-md text-[10px] font-semibold transition-colors shadow-sm flex items-center gap-1.5"
              >
                <svg className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.235" />
                </svg>
                {isTesting ? 'Testing…' : 'Test connection'}
              </button>

              {testResult === 'CONNECTED' && (
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  ✓ Connected
                </span>
              )}
            </div>

          </div>
        </Card>

        {/* ── Card 3: Triage Strictness (Matches Screenshot) ──────────────────────── */}
        <Card title="Triage strictness">
          <div className="px-4 py-4 flex flex-col gap-3">
            <span className="text-[10px] text-gray-500 leading-normal">
              Controls how aggressively the AI assigns urgent priority. Strict = only genuine outages.
            </span>

            {/* Strictness buttons bar */}
            <div className="flex border border-gray-200 rounded-lg p-0.5 bg-gray-50">
              {(['LENIENT', 'BALANCED', 'STRICT'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStrictness(s)}
                  className={`flex-1 py-1.5 text-[10px] font-semibold rounded-md transition-all ${
                    strictness === s
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 bg-transparent'
                  }`}
                >
                  {s === 'LENIENT' ? 'Lenient' : s === 'BALANCED' ? 'Balanced' : 'Strict'}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* ── Card 4: Usage This Month (Matches Screenshot) ───────────────────────── */}
        <Card title="Usage this month">
          <div className="px-4 py-4 grid grid-cols-3 divide-x divide-gray-100 text-center">
            <div className="flex flex-col gap-1">
              <span className="text-xl font-bold text-gray-900">186</span>
              <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Triaged</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xl font-bold text-gray-900">67</span>
              <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Drafts</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xl font-bold text-gray-900">~14h</span>
              <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Time Saved</span>
            </div>
          </div>
        </Card>

      </div>
    </DashboardLayout>
  );
}
