import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth';

export function ForbiddenPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleReturn = () => {
    if (user?.role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else if (user?.role === 'AGENT') {
      navigate('/agent/dashboard');
    } else {
      navigate('/client/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all">
        {/* Subtle, modern lock SVG icon */}
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">403</h1>
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mt-2">Access Denied</h2>
        
        <p className="text-[11px] text-gray-400 mt-2.5 mb-6 leading-relaxed max-w-[280px] mx-auto">
          You do not have the required permissions to view this resource. 
          If you believe this is a mistake, please contact your workspace administrator.
        </p>

        <button
          onClick={handleReturn}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase py-3 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
