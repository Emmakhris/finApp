import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, TrendingUp, PieChart, BarChart3 } from 'lucide-react';

const mobileNav = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/receivables', icon: TrendingUp, label: 'Receivables' },
  { to: '/investments', icon: PieChart, label: 'Investments' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

export function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 flex">
      {mobileNav.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-1 py-2.5 text-xs transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400'}`
          }
        >
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
