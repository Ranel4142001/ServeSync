import React from 'react';

interface StatusModalProps {
  isOpen:   boolean;
  type:     'success' | 'error';
  title:    string;
  message:  string;
  onClose:  () => void;
}

export function StatusModal({ isOpen, type, title, message, onClose }: StatusModalProps) {
  if (!isOpen) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Icon Indicator */}
        {isSuccess ? (
          <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-inner">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        )}

        {/* Title & Message */}
        <div className="flex flex-col gap-1.5">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
            {title}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed px-2">
            {message}
          </p>
        </div>

        {/* Close Action Button */}
        <button
          onClick={onClose}
          className={`w-full py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer ${
            isSuccess 
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100 hover:shadow' 
              : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-100 hover:shadow'
          }`}
        >
          OK
        </button>

      </div>
    </div>
  );
}
