import { useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'Transactions',
  '/receivables': 'Receivables',
  '/payables': 'Payables',
  '/loans': 'Loans',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

export function TopBar() {
  const { pathname } = useLocation();
  const { accountFilter, setAccountFilter } = useAppContext();
  const title = pageTitles[pathname] ?? 'FinApp';

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-5 gap-4 fixed top-0 right-0 left-0 lg:left-56 z-20">
      <h1 className="font-semibold text-slate-900 flex-1">{title}</h1>
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
    </header>
  );
}
