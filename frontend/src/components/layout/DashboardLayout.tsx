import React from 'react';
import {
  LayoutDashboard, Users, Building2, UserCheck, Clock, Calendar,
  Banknote, Target, Briefcase, Shield, Settings, ChevronLeft,
  ChevronRight, Bell, MessageSquare, User, LogOut, ClipboardList, FileText,
  Monitor, LogOut as Exit, BarChart2, AlertTriangle, Gavel, Headphones,
  Zap, Heart, Bot, Plug, DollarSign, ShieldCheck, FileCheck, Plane,
  Cog, Layers, BookOpen, Menu,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, persistor } from '@store/index';
import { toggleSidebar } from '@store/slices/uiSlice';
import { logout } from '@store/slices/authSlice';
import { cn } from '@lib/utils';
import api from '@lib/axios';

type NavItem =
  | { type: 'section'; label: string }
  | { type?: 'link'; label: string; icon: React.ElementType; path: string }
  | { type?: 'group'; label: string; icon: React.ElementType; children: { label: string; path: string }[] };

const navigation: NavItem[] = [
  // ── Core HR ────────────────────────────────────────────────────
  { type: 'section', label: 'Core HR' },
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  {
    label: 'Organization', icon: Building2,
    children: [
      { label: 'Companies', path: '/organization/companies' },
      { label: 'Branches', path: '/organization/branches' },
      { label: 'Departments', path: '/organization/departments' },
      { label: 'Designations', path: '/organization/designations' },
      { label: 'Grades', path: '/organization/grades' },
      { label: 'Cost Centers', path: '/organization/cost-centers' },
      { label: 'Org Chart', path: '/organization/org-chart' },
    ],
  },
  {
    label: 'Employees', icon: Users,
    children: [
      { label: 'All Employees', path: '/employees' },
      { label: 'Add Employee', path: '/employees/new' },
    ],
  },

  // ── Time & Payroll ─────────────────────────────────────────────
  { type: 'section', label: 'Time & Payroll' },
  {
    label: 'Time & Attendance', icon: Clock,
    children: [
      { label: 'Attendance', path: '/attendance' },
      { label: 'Leave', path: '/leave' },
      { label: 'Shifts & Rosters', path: '/shifts' },
      { label: 'Biometric', path: '/biometric' },
    ],
  },
  { label: 'Payroll', icon: Banknote, path: '/payroll' },
  { label: 'Compensation', icon: DollarSign, path: '/compensation' },
  { label: 'Travel & Expense', icon: Plane, path: '/travel-expense' },
  { label: 'Compliance', icon: ShieldCheck, path: '/compliance' },

  // ── Talent & Growth ────────────────────────────────────────────
  { type: 'section', label: 'Talent & Growth' },
  {
    label: 'Talent', icon: Briefcase,
    children: [
      { label: 'Recruitment', path: '/recruitment' },
      { label: 'Offer & Joining', path: '/offer-joining' },
      { label: 'Onboarding', path: '/onboarding' },
      { label: 'Training', path: '/training' },
      { label: 'Contractors', path: '/contractors' },
    ],
  },
  { label: 'Performance', icon: Target, path: '/performance' },
  { label: 'Benefits', icon: Heart, path: '/benefits' },
  { label: 'Exit', icon: Exit, path: '/exit' },

  // ── Employee Services ──────────────────────────────────────────
  { type: 'section', label: 'Employee Services' },
  { label: 'ESS Portal', icon: User, path: '/ess' },
  { label: 'MSS Portal', icon: UserCheck, path: '/mss' },
  { label: 'HR Helpdesk', icon: Headphones, path: '/helpdesk' },
  { label: 'Grievance', icon: AlertTriangle, path: '/grievance' },
  { label: 'Disciplinary', icon: Gavel, path: '/disciplinary' },

  // ── Assets & Ops ───────────────────────────────────────────────
  { type: 'section', label: 'Assets & Ops' },
  { label: 'Assets', icon: Monitor, path: '/assets' },
  { label: 'Operations', icon: Cog, path: '/operations' },
  { label: 'Policies', icon: BookOpen, path: '/policies' },

  // ── Platform & Admin ───────────────────────────────────────────
  { type: 'section', label: 'Platform' },
  { label: 'Analytics', icon: BarChart2, path: '/analytics' },
  { label: 'AI Assistant', icon: Bot, path: '/ai-assistant' },
  { label: 'Automation', icon: Zap, path: '/automation' },
  { label: 'Integrations', icon: Plug, path: '/integrations' },
  {
    label: 'Form Builder', icon: ClipboardList,
    children: [
      { label: 'All Forms', path: '/forms' },
      { label: 'New Form', path: '/forms/new' },
    ],
  },
  {
    label: 'Templates', icon: FileText,
    children: [
      { label: 'All Templates', path: '/templates' },
      { label: 'New Template', path: '/templates/new' },
    ],
  },
  {
    label: 'Security', icon: Shield,
    children: [
      { label: 'System & Audit', path: '/system' },
      { label: 'NFR Dashboard', path: '/system/nfr' },
    ],
  },
  { label: 'Platform', icon: Layers, path: '/platform' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed } = useSelector((s: RootState) => s.ui);
  const { user } = useSelector((s: RootState) => s.auth);
  const [expandedMenu, setExpandedMenu] = React.useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Close mobile sidebar on route change
  React.useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch { /* ignore */ }
    dispatch(logout());
    persistor.purge();   // wipe localStorage so stale tokens never come back
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 z-40 h-full bg-primary text-white transition-all duration-300 flex flex-col',
        // Desktop: respect collapsed state. Mobile: slide in/out
        'md:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        sidebarCollapsed ? 'md:w-16' : 'md:w-64',
        'w-64', // mobile always full-width sidebar
      )}>
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-primary-light/30">
          {(!sidebarCollapsed || mobileOpen) && (
            <span className="text-xl font-bold tracking-tight">HRMS</span>
          )}
          {/* Desktop collapse toggle */}
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="ml-auto p-1 rounded hover:bg-primary-light/30 hidden md:flex"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto p-1 rounded hover:bg-primary-light/30 md:hidden"
            aria-label="Close navigation"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {navigation.map((item, idx) => {
            // Section header
            if (item.type === 'section') {
              if (sidebarCollapsed) {
                return <div key={`s-${idx}`} className="border-t border-primary-light/20 mx-2 my-2" />;
              }
              return (
                <p key={`s-${idx}`} className="px-3 pt-4 pb-1 text-[10px] font-semibold text-primary-light/60 uppercase tracking-widest">
                  {item.label}
                </p>
              );
            }

            const Icon = (item as any).icon as React.ElementType;
            const isActive = (item as any).path
              ? location.pathname.startsWith((item as any).path)
              : (item as any).children?.some((c: any) => location.pathname.startsWith(c.path));

            if ((item as any).children) {
              const isExpanded = expandedMenu === item.label || isActive;

              const navItem = item as any;

              // Collapsed: show icon-only button with a flyout submenu on hover
              if (sidebarCollapsed) {
                return (
                  <div key={item.label} className="relative group">
                    <button
                      className={cn(
                        'w-full flex items-center justify-center px-3 py-2.5 rounded-lg mb-0.5 transition-colors',
                        isActive ? 'bg-primary-light/40' : 'hover:bg-primary-light/20'
                      )}
                      title={item.label}
                      aria-label={item.label}
                    >
                      <Icon size={20} />
                    </button>
                    {/* Flyout on hover */}
                    <div className="absolute left-full top-0 ml-2 hidden group-hover:block z-50 min-w-[180px]">
                      <div className="bg-white rounded-lg shadow-lg border border-gray-100 py-1">
                        <p className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 mb-1">
                          {item.label}
                        </p>
                        {navItem.children.map((child: any) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={cn(
                              'block px-3 py-2 text-sm transition-colors',
                              location.pathname === child.path
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-gray-700 hover:bg-gray-50'
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={item.label}>
                  <button
                    onClick={() => setExpandedMenu(isExpanded ? null : item.label)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-colors',
                      isActive ? 'bg-primary-light/40' : 'hover:bg-primary-light/20'
                    )}
                  >
                    <Icon size={20} />
                    <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                    <ChevronRight size={14} className={cn('transition-transform', isExpanded && 'rotate-90')} />
                  </button>
                  {isExpanded && (
                    <div className="ml-8 mb-1">
                      {navItem.children.map((child: any) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={cn(
                            'block px-3 py-2 rounded-lg text-sm transition-colors',
                            location.pathname === child.path
                              ? 'bg-primary-light/30 text-white'
                              : 'text-gray-300 hover:text-white hover:bg-primary-light/20'
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            const navItem = item as any;

            return (
              <Link
                key={navItem.path}
                to={navItem.path}
                title={sidebarCollapsed ? item.label : undefined}
                aria-label={sidebarCollapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-colors',
                  sidebarCollapsed && 'justify-center',
                  isActive ? 'bg-primary-light/40' : 'hover:bg-primary-light/20'
                )}
              >
                <Icon size={20} />
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-primary-light/30 p-3">
          <div className={cn('flex items-center gap-3', sidebarCollapsed && 'justify-center')}>
            <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
              <User size={16} />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.fullName}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-1.5 rounded hover:bg-primary-light/30"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn(
        'flex-1 flex flex-col transition-all duration-300',
        // Desktop: shift right based on sidebar. Mobile: no margin (sidebar overlays)
        'ml-0 md:ml-64',
        sidebarCollapsed && 'md:ml-16'
      )}>
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 md:px-6 sticky top-0 z-30 gap-3">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 md:hidden"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-gray-100 relative" aria-label="Notifications">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100" aria-label="Messages">
              <MessageSquare size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
