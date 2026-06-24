import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, TrendingUp, TrendingDown,
  HandCoins, BarChart3, Settings, Landmark,
} from 'lucide-react';
import { useLoans } from '../../hooks/useLoans';
import { useReceivables } from '../../hooks/useReceivables';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/receivables', icon: TrendingUp, label: 'Receivables' },
  { to: '/payables', icon: TrendingDown, label: 'Payables' },
  { to: '/loans', icon: HandCoins, label: 'Loans' },
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
    <aside className="hidden lg:flex flex-col w-56 bg-slate-900 text-white min-h-screen fixed left-0 top-0 z-30">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
          <Landmark size={16} />
        </div>
        <span className="font-semibold text-sm tracking-wide">FinApp</span>
      </div>
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`
            }
          >
            <Icon size={16} />
            <span className="flex-1">{label}</span>
            {badges[to] > 0 && (
              <span className="w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {badges[to]}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-slate-800 text-xs text-slate-500">
        GHS · PostgreSQL
      </div>
    </aside>
  );
}
