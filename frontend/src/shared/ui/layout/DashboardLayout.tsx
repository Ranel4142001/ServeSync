import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar }  from './Topbar';

interface DashboardLayoutProps {
  title:        string;
  description?: string;
  children:     React.ReactNode;
}

// Main layout wrapper used by all three dashboards
// Sidebar + Topbar + scrollable content area (fully responsive layout)
export function DashboardLayout({ title, description, children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">

      {/* Backdrop for mobile drawer */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden cursor-pointer transition-opacity"
        />
      )}

      {/* Left sidebar — fixed on desktop, slide-over drawer on mobile */}
      <div className={`
        fixed inset-y-0 left-0 z-40 lg:relative lg:flex lg:z-auto transition-transform duration-300 transform lg:transform-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar onCloseMobile={() => setIsSidebarOpen(false)} />
      </div>

      {/* Right side — topbar + scrollable content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar 
          title={title} 
          description={description} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>

    </div>
  );
}
