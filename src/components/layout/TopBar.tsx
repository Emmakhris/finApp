import { useLocation } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'Transactions',
  '/receivables': 'Receivables',
  '/payables': 'Payables',
  '/loans': 'Loans',
  '/investments': 'Investments',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

export function TopBar() {
  const { pathname } = useLocation();
  const { accountFilter, setAccountFilter, currentUser, logout } = useAppContext();
  const title = pageTitles[pathname] ?? 'FinApp';
  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-5 gap-4 fixed top-0 right-0 left-0 lg:left-56 z-20">
      <h1 className="font-semibold text-slate-900 flex-1">{title}</h1>

      {/* Account filter */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
        {(['all', 'personal', 'business'] as const).map(f => (
          <button
            key={f}
            onClick={() => setAccountFilter(f)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${accountFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* User avatar + logout */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
          <span className="text-xs font-medium text-slate-700 hidden sm:block">{currentUser?.name ?? 'User'}</span>
        </div>
        <button
          onClick={logout}
          title="Sign out"
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}
