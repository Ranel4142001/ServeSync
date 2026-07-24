interface TopbarProps {
  title:            string;
  description?:     string;
  onToggleSidebar?: () => void;
}

// Top navigation bar — search, notifications, settings
export function Topbar({ title, description, onToggleSidebar }: TopbarProps) {
  return (
    <header className="h-[60px] border-b border-gray-200 bg-white flex items-center px-5 gap-3 shrink-0">

      {/* Hamburger menu for mobile layout */}
      <button 
        onClick={onToggleSidebar}
        className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors lg:hidden shrink-0 cursor-pointer"
        aria-label="Toggle Navigation"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Page title & Description */}
      <div className="flex flex-col flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-gray-900 leading-tight truncate">
          {title}
        </h1>
        {description && (
          <span className="text-[10px] text-gray-400 font-medium leading-none mt-0.5 truncate">
            {description}
          </span>
        )}
      </div>

      {/* Search (hidden on mobile to prevent overflow) */}
      <div className="hidden sm:flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5 text-xs text-gray-400">
        <i className="ti ti-search text-[13px]" aria-hidden="true" />
        Search tickets…
      </div>

      {/* Notifications */}
      <button
        className="w-7 h-7 rounded-md border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors relative shrink-0"
        aria-label="Notifications"
      >
        <i className="ti ti-bell text-[15px]" aria-hidden="true" />
        {/* Unread dot */}
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500 border-[1.5px] border-white" />
      </button>

      {/* Settings */}
      <button
        className="w-7 h-7 rounded-md border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors shrink-0"
        aria-label="Settings"
      >
        <i className="ti ti-settings text-[15px]" aria-hidden="true" />
      </button>

    </header>
  );
}
