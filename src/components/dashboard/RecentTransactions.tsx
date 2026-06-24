import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatGHS } from '../../utils/currency';
import { formatDate } from '../../utils/dateHelpers';
import { useTransactions, useCategories } from '../../hooks/useTransactions';
import { Link } from 'react-router-dom';

export function RecentTransactions() {
  const allTransactions = useTransactions() ?? [];
  const transactions = allTransactions.slice(0, 8);
  const categories = useCategories() ?? [];
  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-900">Recent Transactions</h2>
        <Link to="/transactions" className="text-xs text-indigo-600 hover:underline">View all</Link>
      </div>
      {transactions.length === 0 ? (
        <p className="text-slate-400 text-sm py-8 text-center">No transactions yet. Add your first one!</p>
      ) : (
        <div className="divide-y divide-slate-50">
          {transactions.map(t => {
            const cat = catMap[t.categoryId];
            return (
              <div key={t.id} className="flex items-center gap-3 py-2.5">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {t.type === 'income' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{t.description}</p>
                  <p className="text-xs text-slate-400">{cat?.name ?? ''} · {formatDate(t.date)}</p>
                </div>
                <span className={`text-sm font-semibold whitespace-nowrap ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatGHS(t.amount)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
