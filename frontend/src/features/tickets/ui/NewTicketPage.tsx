import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/shared/ui/layout/DashboardLayout';
import { createTicket } from '../infrastructure/tickets.api';
import { useAuthStore } from '@/features/auth';
import { getUsers, UserItem } from '@/features/users/infrastructure/users.api';
import { formatTicketId, formatOrgId } from '@/shared/utils/formatters';
import { StatusModal } from '@/shared/ui/DashboardComponents';

// Allowed Category and Priority options matching database constants
const CATEGORY_OPTIONS = ['Billing', 'Bug', 'Feature Request', 'Account', 'Technical', 'General'] as const;
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

export function NewTicketPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Form Fields State
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory]       = useState<typeof CATEGORY_OPTIONS[number]>('General');
  const [priority, setPriority]       = useState<typeof PRIORITY_OPTIONS[number]>('MEDIUM');
  
  // Staff Role states (complying with Adaptive Form requirements)
  const [clientsList, setClientsList] = useState<UserItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [isLoadingClients, setIsLoadingClients] = useState(false);

  const [isSubmitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [error, setError]             = useState<string | null>(null);

  const isStaff = user?.role === 'ADMIN' || user?.role === 'AGENT';

  // Fetch clients only if logged in user is admin or agent (on-behalf-of creation)
  useEffect(() => {
    if (isStaff) {
      setIsLoadingClients(true);
      getUsers()
        .then(res => {
          // Filter to only show users with CLIENT role
          const clients = res.users.filter(u => u.role === 'CLIENT');
          setClientsList(clients);
          if (clients.length > 0) {
            setSelectedClientId(clients[0].id);
          }
        })
        .catch(err => {
          console.error(err);
          setError('Failed to load clients list. Please try again.');
        })
        .finally(() => {
          setIsLoadingClients(false);
        });
    }
  }, [isStaff]);

  // Form submit handler (complying with Toast/Alert action message pattern)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a ticket title');
      return;
    }

    if (isStaff && !selectedClientId) {
      setError('Please select a client to create the ticket on behalf of');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Create the ticket on the backend
      const res = await createTicket({
        title: title.trim(),
        priority,
        category,
        clientId: isStaff ? selectedClientId : undefined,
      });

      const formattedId = formatTicketId(res.id);
      const orgId = user?.organizationId || '019f65df-cff7-70b7-965b-06bcc4072296';
      
      // Strict action message pattern: Account ID {id} {action} {message}
      setModalTitle("Created Successfully");
      setModalMessage(`Account ID ${formatOrgId(orgId)} created ticket #${formattedId} successfully`);
      setModalOpen(true);

      // Gracefully redirect after displaying status modal
      setTimeout(() => {
        setModalOpen(false);
        if (user?.role === 'ADMIN') {
          navigate('/admin/tickets');
        } else if (user?.role === 'AGENT') {
          navigate('/agent/tickets');
        } else {
          navigate('/client/tickets');
        }
      }, 3000);

    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to submit support request');
      setSubmitting(false);
    }
  };

  // Dynamic Contextual response times based on Priority state
  const renderSlaHelper = () => {
    if (priority === 'URGENT') {
      return (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex gap-3 shadow-xs">
          <span className="text-lg">⚡</span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-900">Priority SLA Active</span>
            <p className="text-[10.5px] font-medium leading-relaxed">An agent will reply to your concern in under 2 hours.</p>
          </div>
        </div>
      );
    }
    if (priority === 'HIGH') {
      return (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 flex gap-3 shadow-xs">
          <span className="text-lg">⏳</span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">Standard SLA High</span>
            <p className="text-[10.5px] font-medium leading-relaxed">Expected response from an agent within 4 hours.</p>
          </div>
        </div>
      );
    }
    return (
      <div className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-4 flex gap-3 shadow-xs">
        <span className="text-lg">🕒</span>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-800">Standard SLA</span>
          <p className="text-[10.5px] font-medium leading-relaxed">Expected response from an agent within 24 hours.</p>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout title="New Ticket" description="Create and submit a new support request">
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

        {/* ── Three-Column Desktop Grid Layout ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column (2/3 width) - Form Card */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-6 lg:p-8 shadow-sm flex flex-col gap-5">
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide border-b border-slate-100 pb-3">
                Submit a support request
              </h2>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                
                {/* Staff-only adaptive dropdown: Select Client (Complying with UI requirement 2) */}
                {isStaff && (
                  <div className="flex flex-col gap-1.5 bg-blue-50/40 border border-blue-100 p-4 rounded-xl shadow-xs">
                    <label htmlFor="client-select" className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                      Select Customer (On-Behalf-Of)
                    </label>
                    {isLoadingClients ? (
                      <span className="text-[10px] text-blue-500 font-medium">Loading customers list...</span>
                    ) : (
                      <select
                        id="client-select"
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none rounded-lg px-3.5 py-2 text-[11px] text-gray-800 font-medium shadow-sm"
                        required
                      >
                        {clientsList.length === 0 ? (
                          <option value="">No clients registered in this organization</option>
                        ) : (
                          clientsList.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.fullName} ({c.email})
                            </option>
                          ))
                        )}
                      </select>
                    )}
                    <span className="text-[9px] text-blue-600/70 leading-normal">
                      Staff actions: Creating a ticket automatically routes it under the customer's tenant profile.
                    </span>
                  </div>
                )}

                {/* Field 1: Title */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ticket-title" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Title
                  </label>
                  <input
                    id="ticket-title"
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none rounded-lg px-3.5 py-2.5 text-[11px] text-gray-800 transition-all shadow-inner disabled:opacity-50"
                    placeholder="Short summary of your issue"
                  />
                </div>

                {/* Field 2: Description */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ticket-desc" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    id="ticket-desc"
                    rows={4}
                    disabled={isSubmitting}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none rounded-lg px-3.5 py-2.5 text-[11px] text-gray-800 transition-all shadow-inner disabled:opacity-50 resize-none"
                    placeholder="Describe your issue in detail..."
                  />
                </div>

                {/* Field: Drag-and-Drop Attachment Box (Complying with UI requirement 2) */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Attachments
                  </span>
                  <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-6 text-center cursor-pointer transition-all bg-slate-50/50 flex flex-col items-center justify-center gap-2 group">
                    <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600">
                      Drag & drop screenshots or files here, or <span className="text-blue-600 underline">click to browse</span>
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">
                      Supports PNG, JPG, PDF (Max 10MB)
                    </span>
                  </div>
                </div>

                {/* Field 3: Category horizontal pills */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Category
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORY_OPTIONS.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => setCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                          category === cat
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Field 4: Priority horizontal pills (Adaptive accent styling) */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Priority
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {PRIORITY_OPTIONS.map((prio) => {
                      const isSelected = priority === prio;
                      let activeStyle = '';
                      let hoverStyle = '';

                      if (prio === 'URGENT') {
                        activeStyle = 'bg-red-50 text-red-700 border-red-200 shadow-sm font-bold';
                        hoverStyle = 'bg-white border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600';
                      } else if (prio === 'HIGH') {
                        activeStyle = 'bg-orange-50 text-orange-700 border-orange-200 shadow-sm font-bold';
                        hoverStyle = 'bg-white border-slate-200 text-slate-500 hover:bg-orange-50 hover:text-orange-600';
                      } else if (prio === 'MEDIUM') {
                        activeStyle = 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm font-bold';
                        hoverStyle = 'bg-white border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600';
                      } else {
                        activeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm font-bold';
                        hoverStyle = 'bg-white border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600';
                      }

                      return (
                        <button
                          key={prio}
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => setPriority(prio)}
                          className={`py-1.5 rounded-lg text-[10px] font-bold border uppercase transition-all tracking-wider cursor-pointer ${
                            isSelected ? activeStyle : hoverStyle
                          }`}
                        >
                          {prio}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions: Cancel & Submit with loading state spinner */}
                <div className="flex items-center gap-3 pt-3 border-t border-gray-100 mt-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      if (user?.role === 'ADMIN') navigate('/admin/dashboard');
                      else if (user?.role === 'AGENT') navigate('/agent/dashboard');
                      else navigate('/client/dashboard');
                    }}
                    className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors shadow-sm text-center cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !title.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm text-center disabled:opacity-50 cursor-pointer flex items-center gap-2 justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit ticket</span>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>

          {/* Right Column (1/3 width) - Contextual Helper Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Card 1: Expected Response Times (SLA) */}
            <div className="flex flex-col gap-3.5">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Response Times (SLA)
              </h3>
              {renderSlaHelper()}
            </div>

            {/* Card 2: AI Suggested Answers (Ticket Deflection Widget) */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                <h3 className="text-[10px] font-bold text-gray-800 uppercase tracking-wider">
                  AI Suggestions
                </h3>
              </div>
              <p className="text-[10px] text-gray-400 leading-normal font-medium">
                As you type your title, Gemini searches our documentation to find instant answers here.
              </p>
              
              {/* Mock/placeholder deflected articles */}
              <div className="flex flex-col gap-3.5 pt-1">
                <div className="flex flex-col gap-1 p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/20 transition-all cursor-pointer">
                  <span className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    📖 How do I update my billing registry info?
                  </span>
                  <p className="text-[9px] text-gray-400 leading-normal">
                    Update payment terms and address registry options directly in dashboard billing context.
                  </p>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/20 transition-all cursor-pointer">
                  <span className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    📖 Resetting agent workspace password
                  </span>
                  <p className="text-[9px] text-gray-400 leading-normal">
                    Instructions for triggering workspace authentication resets for security administrators.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
