import { Sidebar } from './Sidebar';
import { Topbar }  from './Topbar';

interface DashboardLayoutProps {
  title:    string;
  children: React.ReactNode;
}

// Main layout wrapper used by all three dashboards
// Sidebar + Topbar + scrollable content area
export function DashboardLayout({ title, children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Left sidebar — fixed width */}
      <Sidebar />

      {/* Right side — topbar + scrollable content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>

    </div>
  );
}
