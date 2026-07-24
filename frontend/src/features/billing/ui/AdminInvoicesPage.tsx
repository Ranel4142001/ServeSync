import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/shared/ui/layout/DashboardLayout';
import { Card, StatusModal } from '@/shared/ui/DashboardComponents';
import { getInvoices, payInvoice, createInvoice, Invoice } from '../infrastructure/billing.api';
import { useAuthStore } from '@/features/auth';
import { formatOrgId } from '@/shared/utils/formatters';

// Simple date formatter helper
function formatInvoiceDate(dateString: string): string {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Deterministic Invoice Coding Formatter (INV-YYYYMMDDXXX)
function formatInvoiceId(id: string | number, createdAtString?: string): string {
  if (!id) return '';
  const strId = String(id);
  if (strId.startsWith('INV-')) return strId;

  let datePart = '20260715';
  const cleanId = strId.replace(/-/g, '');
  
  const timeSource = createdAtString || (cleanId.length >= 12 ? cleanId : null);
  if (timeSource) {
    let timeMs = NaN;
    if (createdAtString) {
      timeMs = new Date(createdAtString).getTime();
    } else if (cleanId.length >= 12) {
      timeMs = parseInt(cleanId.slice(0, 12), 16);
    }
    
    if (!isNaN(timeMs) && timeMs > 1500000000000 && timeMs < 2500000000000) {
      const date = new Date(timeMs);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      datePart = `${yyyy}${mm}${dd}`;
    }
  }

  const charCodeSum = Array.from(cleanId).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const suffixPart = String(charCodeSum % 1000).padStart(3, '0');

  return `INV-${datePart}${suffixPart}`;
}

export function AdminInvoicesPage() {
  const { user } = useAuthStore();
  const isClient = user?.role === 'CLIENT';

  const [invoices, setInvoices]     = useState<Invoice[]>([]);
  const [summary, setSummary]       = useState({ total: 0, totalPaid: '$0.00', totalUnpaid: '$0.00' });
  const [isLoading, setLoading]     = useState(true);
  const [error, setError]           = useState<string | null>(null);
  
  // Filtering & Modal States
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [newAmount, setNewAmount]       = useState('');
  const [newDesc, setNewDesc]           = useState('');
  const [isCreating, setCreating]       = useState(false);

  // Client Payment Checkout Modal state
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [cardName, setCardName]           = useState('');
  const [cardNumber, setCardNumber]       = useState('');
  const [cardExpiry, setCardExpiry]       = useState('');
  const [cardCvc, setCardCvc]             = useState('');
  const [isProcessingPay, setIsProcessingPay] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  // Load invoices and summaries
  const loadData = async () => {
    try {
      const data = await getInvoices();
      setInvoices(data.invoices);
      setSummary(data.summary);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter invoices list
  const filteredInvoices = invoices.filter((inv) => {
    if (activeFilter === 'PAID') return inv.isPaid;
    if (activeFilter === 'UNPAID') return !inv.isPaid;
    return true;
  });

  // Count unpaid invoices
  const unpaidCount = invoices.filter((inv) => !inv.isPaid).length;
  const hasUnpaid = unpaidCount > 0;

  // Toast trigger (now StatusModal) complying with: Account ID {id} {action} {message}
  const triggerToast = (action: string, message: string) => {
    const orgId = user?.organizationId || '019f65df-cff7-70b7-965b-06bcc4072296';
    let title = "Operation Successful";
    if (action.includes("create") || action.includes("new")) {
      title = "Created Successfully";
    } else if (action.includes("pay") || action.includes("update") || action.includes("complete") || action.includes("mark") || action.includes("download")) {
      title = "Updated Successfully";
    } else if (action.includes("delete") || action.includes("remove")) {
      title = "Deleted Successfully";
    }
    setModalTitle(title);
    setModalMessage(`Account ID ${formatOrgId(orgId)} ${action} ${message}`);
    setModalOpen(true);
    setTimeout(() => setModalOpen(false), 3000);
  };

  // Handle Mark Paid action (backend toggle)
  const handleMarkPaid = async (id: string) => {
    setError(null);
    try {
      await payInvoice(id);
      await loadData(); // Reload stats and lists
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to update invoice status');
    }
  };

  // Submit client mock checkout
  const handleClientPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;

    setIsProcessingPay(true);
    setError(null);

    // Simulate secure 1.5s authorization delay
    setTimeout(async () => {
      try {
        await payInvoice(payingInvoice.id);
        const invCode = formatInvoiceId(payingInvoice.id, payingInvoice.createdAt);
        
        // Success Action Toast Pattern compliance
        triggerToast('completed payment', `for invoice ${invCode} successfully`);
        
        // Reset modal state
        setPayingInvoice(null);
        setCardName('');
        setCardNumber('');
        setCardExpiry('');
        setCardCvc('');
        await loadData();
      } catch (err: any) {
        setError(err.response?.data?.error ?? 'Payment authorization failed');
      } finally {
        setIsProcessingPay(false);
      }
    }, 1500);
  };

  // Simulate Invoice PDF download
  const handleDownloadInvoice = (inv: Invoice) => {
    const invCode = formatInvoiceId(inv.id, inv.createdAt);
    triggerToast('downloaded invoice document', `${invCode} successfully`);
  };

  // Handle Create Invoice submit (Admin only)
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(newAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !newDesc.trim()) {
      setError('Please provide a valid amount and description');
      return;
    }

    setCreating(true);
    setError(null);
    try {
      await createInvoice(parsedAmount, newDesc);
      triggerToast('created new billing ledger item', 'successfully');
      setNewAmount('');
      setNewDesc('');
      setCreateModalOpen(false);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to create invoice');
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout
      title="Billing"
      description={isClient ? "Manage your subscription and billing history" : "Track and manage billing invoices"}
    >
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

        {/* ── Client Active Subscription Banner ─────────────────────────────────── */}
        {isClient && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">Pro Plan ($29/mo)</span>
                  <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Active</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Next Renewal Date: August 15, 2026</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => triggerToast('triggered subscription management', 'redirection successfully')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
            >
              Manage Subscription
            </button>
          </div>
        )}

        {/* ── Summary Stats Cards (Adaptive Unpaid Warning styling) ────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-blue-500 flex flex-col gap-1.5 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Invoices</span>
            <span className="text-xl font-bold text-slate-900">{isLoading ? '—' : summary.total}</span>
          </div>
          
          {/* Standing out Unpaid Balance card */}
          <div className={`p-5 rounded-xl border flex flex-col gap-1.5 shadow-sm transition-all ${
            hasUnpaid 
              ? 'bg-amber-50/50 border-amber-200 border-l-4 border-l-amber-500' 
              : 'bg-white border-slate-200 border-l-4 border-l-slate-400'
          }`}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unpaid Balance</span>
            <span className="text-xl font-bold text-slate-900">{isLoading ? '—' : summary.totalUnpaid}</span>
            <span className={`text-[9px] font-bold uppercase tracking-wide ${hasUnpaid ? 'text-amber-600' : 'text-slate-400'}`}>
              {isLoading ? '—' : `${unpaidCount} ${unpaidCount === 1 ? 'invoice' : 'invoices'} unpaid`}
            </span>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 flex flex-col gap-1.5 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Paid</span>
            <span className="text-xl font-bold text-slate-900">{isLoading ? '—' : summary.totalPaid}</span>
          </div>
        </div>

        {/* ── Filters & Action Button (Role-restricted create invoice) ───────────── */}
        <div className="flex items-center justify-between gap-3 my-1">
          <div className="flex items-center gap-1.5">
            {(['ALL', 'PAID', 'UNPAID'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                  activeFilter === f
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          
          {/* Security Fix: Admin/Agent can create invoices; clients cannot */}
          {!isClient && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              + Create invoice
            </button>
          )}
        </div>

        {/* ── Invoices List Table ───────────────────────────────────────────────── */}
        <Card className="shadow-sm border border-slate-200 rounded-xl overflow-hidden bg-white">
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400">
                <th className="text-left text-[9px] font-bold uppercase tracking-wider px-4 py-3">Number</th>
                <th className="text-left text-[9px] font-bold uppercase tracking-wider px-4 py-3">Description</th>
                <th className="text-left text-[9px] font-bold uppercase tracking-wider px-4 py-3">Amount</th>
                <th className="text-left text-[9px] font-bold uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-[9px] font-bold uppercase tracking-wider px-4 py-3">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-[10px] text-slate-400 font-medium">Loading invoices…</td></tr>
              )}
              {!isLoading && filteredInvoices.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-[10px] text-slate-400 font-medium">No invoices found</td></tr>
              )}
              {!isLoading && filteredInvoices.map((inv) => {
                const isPaid = inv.isPaid;
                return (
                  <tr key={inv.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50/50 transition-colors">
                    {/* Number coded as INV-YYYYMMDDXXX */}
                    <td className="px-4 py-3.5 font-mono text-[10.5px] text-slate-800 font-bold">
                      {formatInvoiceId(inv.id, inv.createdAt)}
                    </td>
                    {/* Description */}
                    <td className="px-4 py-3.5 text-[10.5px] text-slate-600 font-medium">
                      {inv.description}
                    </td>
                    {/* Amount */}
                    <td className="px-4 py-3.5 text-[10.5px] font-bold text-slate-900">
                      {inv.amount}
                    </td>
                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                        isPaid 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        {isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    {/* Date */}
                    <td className="px-4 py-3.5 text-[10px] text-slate-400 font-medium">
                      {formatInvoiceDate(inv.createdAt)}
                    </td>
                    
                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right flex items-center justify-end gap-3.5">
                      {/* Download PDF button (Lucide-inspired clean SVG) */}
                      <button
                        onClick={() => handleDownloadInvoice(inv)}
                        title="Download PDF Invoice"
                        className="text-slate-400 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>

                      {/* Pay Now or Mark Paid based on client permissions */}
                      {!isPaid && (
                        isClient ? (
                          <button
                            onClick={() => setPayingInvoice(inv)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] uppercase px-3 py-1.5 rounded-lg shadow-xs hover:shadow transition-all cursor-pointer"
                          >
                            Pay Now
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkPaid(inv.id)}
                            className="text-blue-600 hover:text-blue-800 font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Mark paid
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </Card>

      </div>

      {/* ── Client Checkout Payment Modal ───────────────────────────────────────── */}
      {payingInvoice && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 transition-opacity p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Secure Checkout</span>
                <span className="text-[10px] text-slate-400 font-medium">Paying {formatInvoiceId(payingInvoice.id, payingInvoice.createdAt)}</span>
              </div>
              <button
                onClick={() => setPayingInvoice(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleClientPaymentSubmit} className="flex flex-col gap-4">
              
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Amount Due:</span>
                <span className="text-base font-extrabold text-slate-900">{payingInvoice.amount}</span>
              </div>

              {/* Input: Cardholder Name */}
              <div className="flex flex-col gap-1">
                <label htmlFor="card-name" className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Cardholder Name</label>
                <input
                  id="card-name"
                  type="text"
                  required
                  disabled={isProcessingPay}
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 outline-none rounded-lg px-3 py-2 text-[11px] text-gray-800"
                  placeholder="John Doe"
                />
              </div>

              {/* Input: Card Number */}
              <div className="flex flex-col gap-1">
                <label htmlFor="card-num" className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Card Number</label>
                <div className="relative flex items-center">
                  <input
                    id="card-num"
                    type="text"
                    required
                    maxLength={19}
                    disabled={isProcessingPay}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 outline-none rounded-lg pl-3 pr-10 py-2 text-[11px] font-mono text-gray-800"
                    placeholder="4111 2222 3333 4444"
                  />
                  <span className="absolute right-3 text-slate-400">💳</span>
                </div>
              </div>

              {/* Expiry and CVC grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="card-expiry" className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Expiry Date</label>
                  <input
                    id="card-expiry"
                    type="text"
                    required
                    maxLength={5}
                    disabled={isProcessingPay}
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value.replace(/\//, '').replace(/(\d{2})/, '$1/'))}
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 outline-none rounded-lg px-3 py-2 text-[11px] font-mono text-gray-800"
                    placeholder="MM/YY"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="card-cvc" className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">CVC / CVV</label>
                  <input
                    id="card-cvc"
                    type="password"
                    required
                    maxLength={4}
                    disabled={isProcessingPay}
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value.replace(/[^\d]/g, ''))}
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 outline-none rounded-lg px-3 py-2 text-[11px] font-mono text-gray-800"
                    placeholder="•••"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  disabled={isProcessingPay}
                  onClick={() => setPayingInvoice(null)}
                  className="flex-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingPay}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isProcessingPay ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Submit Payment</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Dialog: Create Invoice (Admin only) ─────────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 transition-opacity p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-sm p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Create new invoice</span>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="inv-amount" className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Amount ($)
                </label>
                <input
                  id="inv-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  disabled={isCreating}
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 outline-none rounded-lg px-3 py-2 text-[11px] text-gray-800 shadow-sm"
                  placeholder="e.g. 29.00"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="inv-desc" className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Description
                </label>
                <input
                  id="inv-desc"
                  type="text"
                  required
                  disabled={isCreating}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 outline-none rounded-lg px-3 py-2 text-[11px] text-gray-800 shadow-sm"
                  placeholder="e.g. Monthly subscription - July 2026"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  disabled={isCreating}
                  onClick={() => setCreateModalOpen(false)}
                  className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-3.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newAmount || !newDesc.trim()}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-3.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isCreating ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
