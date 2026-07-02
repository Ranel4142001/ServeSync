interface TopbarProps {
  title: string;
}

// Top navigation bar — search, notifications, settings
export function Topbar({ title }: TopbarProps) {
  return (
    <header className="h-[50px] border-b border-gray-200 bg-white flex items-center px-5 gap-3 shrink-0">

      {/* Page title */}
      <h1 className="text-sm font-semibold text-gray-900 flex-1">
        {title}
      </h1>

      {/* Search */}
      <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5 text-xs text-gray-400">
        <i className="ti ti-search text-[13px]" aria-hidden="true" />
        Search tickets…
      </div>

      {/* Notifications */}
      <button
        className="w-7 h-7 rounded-md border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors relative"
        aria-label="Notifications"
      >
        <i className="ti ti-bell text-[15px]" aria-hidden="true" />
        {/* Unread dot */}
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500 border-[1.5px] border-white" />
      </button>

      {/* Settings */}
      <button
        className="w-7 h-7 rounded-md border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
        aria-label="Settings"
      >
        <i className="ti ti-settings text-[15px]" aria-hidden="true" />
      </button>

    </header>
  );
}
