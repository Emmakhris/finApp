import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, TrendingUp, TrendingDown,
  HandCoins, BarChart3, Settings, Landmark, PieChart,
} from 'lucide-react';
import { useLoans } from '../../hooks/useLoans';
import { useReceivables } from '../../hooks/useReceivables';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/receivables', icon: TrendingUp, label: 'Receivables' },
  { to: '/payables', icon: TrendingDown, label: 'Payables' },
  { to: '/loans', icon: HandCoins, label: 'Loans' },
  { to: '/investments', icon: PieChart, label: 'Investments' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const loans = useLoans() ?? [];
  const receivables = useReceivables() ?? [];
  const now = new Date();
  const overdueLoans = loans.filter(l => l.status === 'overdue').length;
  const overdueReceivables = receivables.filter(r => r.status !== 'paid' && new Date(r.dueDate) < now).length;

  const badges: Record<string, number> = {
    '/loans': overdueLoans,
    '/receivables': overdueReceivables,
  };

  return (
    <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-slate-200 min-h-screen fixed left-0 top-0 z-30 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 shadow-sm">
          <Landmark size={15} className="text-white" />
        </div>
        <div>
          <span className="font-bold text-slate-900 text-sm tracking-tight">FinApp</span>
          <p className="text-xs text-slate-400 leading-none">Finance Manager</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors relative ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-600 rounded-full" />
                )}
                <Icon size={16} />
                <span className="flex-1">{label}</span>
                {badges[to] > 0 && (
                  <span className="w-5 h-5 bg-amber-400 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                    {badges[to]}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-slate-100 text-xs text-slate-400">
        GHS · PostgreSQL
      </div>
    </aside>
  );
}
