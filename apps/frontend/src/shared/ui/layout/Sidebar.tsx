import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth';

// Nav item shape
interface NavItem {
  section?: string;
  icon?:    string;
  label?:   string;
  badge?:   number | string;
  path?:    string;
}

// Role-based nav config
// Each role sees only what they need — reduces cognitive load
const navConfig: Record<string, NavItem[]> = {
  ADMIN: [
    { section: 'Overview' },
    { icon: 'ti-layout-dashboard', label: 'Dashboard',     path: '/admin/dashboard' },
    { icon: 'ti-chart-bar',        label: 'Analytics',     path: '/admin/analytics' },
    { section: 'Management' },
    { icon: 'ti-ticket',           label: 'All tickets',   path: '/admin/tickets',       badge: '42' },
    { icon: 'ti-users',            label: 'Users',         path: '/admin/users' },
    { icon: 'ti-building',         label: 'Organizations', path: '/admin/organizations' },
    { section: 'Billing' },
    { icon: 'ti-file-invoice',     label: 'Invoices',      path: '/admin/billing',       badge: '1' },
    { section: 'Settings' },
    { icon: 'ti-robot',            label: 'AI settings',   path: '/admin/ai-settings' },
    { icon: 'ti-settings',         label: 'Settings',      path: '/admin/settings' },
  ],
  AGENT: [
    { section: 'Workspace' },
    { icon: 'ti-layout-dashboard', label: 'Dashboard',    path: '/agent/dashboard' },
    { section: 'Tickets' },
    { icon: 'ti-ticket',           label: 'My tickets',   path: '/agent/tickets',    badge: '14' },
    { icon: 'ti-inbox',            label: 'Unassigned',   path: '/agent/unassigned', badge: '8' },
    { icon: 'ti-list',             label: 'All tickets',  path: '/agent/all' },
    { section: 'Tools' },
    { icon: 'ti-robot',            label: 'AI assistant', path: '/agent/ai' },
    { icon: 'ti-upload',           label: 'Documents',    path: '/agent/documents' },
    { section: 'Account' },
    { icon: 'ti-settings',         label: 'Settings',     path: '/agent/settings' },
  ],
  CLIENT: [
    { section: 'Support' },
    { icon: 'ti-layout-dashboard', label: 'Overview',     path: '/client/dashboard' },
    { icon: 'ti-ticket',           label: 'My tickets',   path: '/client/tickets',   badge: '2' },
    { icon: 'ti-plus',             label: 'New ticket',   path: '/client/new-ticket' },
    { section: 'Billing' },
    { icon: 'ti-file-invoice',     label: 'Invoices',     path: '/client/billing',   badge: '1' },
    { section: 'Account' },
    { icon: 'ti-user',             label: 'My profile',   path: '/client/profile' },
    { icon: 'ti-settings',         label: 'Settings',     path: '/client/settings' },
  ],
};

export function Sidebar() {
  const { user, logoutAction } = useAuthStore();
  const location = useLocation();
  const role = user?.role ?? 'CLIENT';
  const navItems = navConfig[role] ?? navConfig.CLIENT;

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <aside className="flex flex-col w-[200px] shrink-0 bg-[#1E3A8A] h-screen">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-[18px] border-b border-white/10">
        <div className="w-7 h-7 rounded-[7px] bg-white/15 flex items-center justify-center text-white font-bold text-sm">
          S
        </div>
        <span className="text-white font-semibold text-sm tracking-tight">
          ServeSync
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2.5 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map((item, i) => {

          // Section header
          if (item.section) {
            return (
              <p
                key={i}
                className="text-white/35 text-[9px] font-semibold uppercase tracking-widest px-2 pt-2.5 pb-1"
              >
                {item.section}
              </p>
            );
          }

          // Derive active state from current route
          const isActive = item.path === location.pathname;

          // Nav item — uses Link for SPA routing
          return (
            <Link
              key={i}
              to={item.path ?? '#'}
              className={`
                flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium
                transition-all duration-100 w-full text-left no-underline
                ${isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/65 hover:bg-white/8 hover:text-white'
                }
              `}
            >
              {/* Icon */}
              <i className={`ti ${item.icon} text-[15px]`} aria-hidden="true" />

              {/* Label */}
              <span className="flex-1">{item.label}</span>

              {/* Badge */}
              {item.badge && (
                <span className="bg-red-500 text-white text-[9px] font-semibold px-1.5 py-px rounded-full min-w-[16px] text-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="px-2 py-3 border-t border-white/10">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/8 cursor-pointer transition-all">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[11px] font-medium truncate">{user?.fullName}</p>
            <p className="text-white/50 text-[10px]">{role}</p>
          </div>
          <button
            onClick={logoutAction}
            title="Sign out"
            className="text-white/40 hover:text-white/80 transition-colors"
          >
            <i className="ti ti-logout text-sm" aria-hidden="true" />
          </button>
        </div>
      </div>

    </aside>
  );
}
