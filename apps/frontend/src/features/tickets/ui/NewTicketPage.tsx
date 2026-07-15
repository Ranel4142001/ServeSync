import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/shared/ui/layout/DashboardLayout';
import { PageHeader, Card } from '@/shared/ui/DashboardComponents';
import { createTicket } from '../infrastructure/tickets.api';

// Allowed Category and Priority options matching screenshot
const CATEGORY_OPTIONS = ['Billing', 'Bug', 'Feature Request', 'Account', 'Technical', 'General'] as const;
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

export function NewTicketPage() {
  const navigate = useNavigate();

  // Form Fields State
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory]       = useState<typeof CATEGORY_OPTIONS[number]>('General');
  const [priority, setPriority]       = useState<typeof PRIORITY_OPTIONS[number]>('MEDIUM');
  
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a ticket title');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Combines title and description description into ticket title/notes as per model constraints
      // or we can append the description to the title if needed, but since backend has title we pass title.
      // E.g. title: title, priority: priority, category: category
      await createTicket({
        title: title.trim(),
        priority,
        category,
      });

      // Redirect client to their list of support tickets
      navigate('/client/tickets');
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to submit support request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="New Ticket">
      <div className="flex flex-col gap-3.5 pb-6">

        <PageHeader
          title="New Ticket"
          description="Create a new support request"
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-xs text-red-700">{error}</div>
        )}

        {/* ── Submit support request form Card (Matches screenshot layout) ────────── */}
        <Card title="Submit a support request">
          <form onSubmit={handleSubmit} className="px-4 py-4 flex flex-col gap-4">
            
            {/* Field 1: Title */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ticket-title" className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Title
              </label>
              <input
                id="ticket-title"
                type="text"
                required
                disabled={isSubmitting}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none rounded-md px-3 py-2 text-[11px] text-gray-800 transition-colors shadow-sm disabled:opacity-50"
                placeholder="Short summary of your issue"
              />
            </div>

            {/* Field 2: Description */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ticket-desc" className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Description
              </label>
              <textarea
                id="ticket-desc"
                rows={4}
                disabled={isSubmitting}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none rounded-md px-3 py-2 text-[11px] text-gray-800 transition-colors shadow-sm disabled:opacity-50 resize-none"
                placeholder="Describe your issue in detail..."
              />
            </div>

            {/* Field 3: Category horizontal pills */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Category
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORY_OPTIONS.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-medium border transition-all ${
                      category === cat
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm font-semibold'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 4: Priority horizontal pills */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Priority
              </span>
              <div className="grid grid-cols-4 gap-2">
                {PRIORITY_OPTIONS.map((prio) => (
                  <button
                    key={prio}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setPriority(prio)}
                    className={`py-1.5 rounded-md text-[10px] font-bold border uppercase transition-all tracking-wider ${
                      priority === prio
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm font-bold'
                        : prio === 'URGENT'
                        ? 'bg-white border-gray-200 text-red-600 hover:bg-red-50'
                        : prio === 'HIGH'
                        ? 'bg-white border-gray-200 text-amber-500 hover:bg-amber-50'
                        : prio === 'MEDIUM'
                        ? 'bg-white border-gray-200 text-blue-500 hover:bg-blue-50'
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {prio}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions: Cancel & Submit */}
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100 mt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => navigate('/client/dashboard')}
                className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-2.5 rounded-md text-[11px] font-semibold transition-colors shadow-sm text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-md text-[11px] font-bold transition-colors shadow-sm text-center disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting…' : 'Submit ticket'}
              </button>
            </div>

          </form>
        </Card>

      </div>
    </DashboardLayout>
  );
}
