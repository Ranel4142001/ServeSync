import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import { PageHeader, Card } from '@/shared/components/ui/DashboardComponents';

// AI settings — informational page showing available AI features
// The backend has POST /ai/triage and POST /ai/draft endpoints
// but no settings to configure — this page explains what's available
export function AdminAiSettingsPage() {
  return (
    <DashboardLayout title="AI settings">
      <div className="flex flex-col gap-3">

        <PageHeader
          title="AI settings"
          description="Configure AI-powered features for your support team"
        />

        {/* AI features */}
        <div className="grid grid-cols-2 gap-3">

          <Card title="Ticket triage">
            <div className="px-3.5 py-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <i className="ti ti-brain text-violet-700 text-base" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">Auto-categorize tickets</p>
                  <p className="text-[10px] text-gray-500">AI analyzes ticket content and assigns category + priority</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-[11px] text-gray-700">Status</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-green-50 text-green-800">Active</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                Endpoint: POST /ai/triage/:ticketId — Available to agents and admins
              </p>
            </div>
          </Card>

          <Card title="Response drafts">
            <div className="px-3.5 py-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <i className="ti ti-robot text-blue-700 text-base" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">Draft AI responses</p>
                  <p className="text-[10px] text-gray-500">AI generates response drafts for agents to review and edit</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-[11px] text-gray-700">Status</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-green-50 text-green-800">Active</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                Endpoint: POST /ai/draft/:ticketId — Available to agents and admins
              </p>
            </div>
          </Card>

        </div>

        {/* Provider info */}
        <Card title="AI provider">
          <div className="px-3.5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <i className="ti ti-sparkles text-amber-700 text-base" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">Google Gemini</p>
                <p className="text-[10px] text-gray-500">Powered by Gemini API</p>
              </div>
            </div>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-green-50 text-green-800">Connected</span>
          </div>
        </Card>

      </div>
    </DashboardLayout>
  );
}
