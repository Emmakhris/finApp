import { useState } from 'react';
import { format, startOfMonth } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTransactions, useCategories } from '../hooks/useTransactions';
import { useReceivables } from '../hooks/useReceivables';
import { formatGHS } from '../utils/currency';
import { Button } from '../components/ui/Button';
import { exportTransactionsPDF } from '../utils/exportPDF';
import { exportTransactionsExcel } from '../utils/exportExcel';
import { exportReceivablesPDF } from '../utils/exportPDF';
import { CashFlowChart } from '../components/dashboard/CashFlowChart';

export function Reports() {
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const categories = useCategories() ?? [];
  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));

  const from = new Date(month.getFullYear(), month.getMonth(), 1);
  const to = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const transactions = useTransactions({ from, to }) ?? [];
  const receivables = useReceivables() ?? [];
  const payables: any[] = [];

  const income = transactions.filter(t => t.type === 'income');
  const expenses = transactions.filter(t => t.type === 'expense');
  const totalIncome = income.reduce((s, t) => s + t.amount, 0);
  const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);

  // Group by category
  const byCategory = (txns: typeof transactions) => {
    const map: Record<number, number> = {};
    txns.forEach(t => { map[t.categoryId] = (map[t.categoryId] ?? 0) + t.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  };

  const outstandingReceivables = receivables.filter(r => r.status !== 'paid');
  const outstandingPayables = payables.filter(p => p.status !== 'paid');

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <button onClick={() => { const d = new Date(month); d.setMonth(d.getMonth() - 1); setMonth(startOfMonth(d)); }} className="p-1 rounded hover:bg-slate-200"><ChevronLeft size={16} className="text-slate-500" /></button>
        <span className="text-sm font-medium text-slate-700 w-28 text-center">{format(month, 'MMMM yyyy')}</span>
        <button onClick={() => setMonth(m => { const next = new Date(m); next.setMonth(m.getMonth() + 1); return startOfMonth(next); })} className="p-1 rounded hover:bg-slate-200"><ChevronRight size={16} className="text-slate-500" /></button>
      </div>

      {/* P&L Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Profit & Loss — {format(month, 'MMMM yyyy')}</h2>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => exportTransactionsPDF(transactions, categories)}>PDF</Button>
            <Button variant="secondary" size="sm" onClick={() => exportTransactionsExcel(transactions, categories)}>Excel</Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-5 pb-4 border-b border-slate-100">
          <div>
            <p className="text-xs text-slate-500 mb-1">Total Income</p>
            <p className="text-lg font-bold text-emerald-600">{formatGHS(totalIncome)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Total Expenses</p>
            <p className="text-lg font-bold text-rose-600">{formatGHS(totalExpenses)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Net</p>
            <p className={`text-lg font-bold ${totalIncome - totalExpenses >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatGHS(totalIncome - totalExpenses)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xs font-medium text-emerald-700 uppercase tracking-wide mb-3">Income Breakdown</h3>
            {byCategory(income).length === 0 ? (
              <p className="text-slate-400 text-sm">No income this month</p>
            ) : (
              <div className="space-y-2">
                {byCategory(income).map(([catId, amount]) => (
                  <div key={catId} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: catMap[Number(catId)]?.color ?? '#ccc' }} />
                      {catMap[Number(catId)]?.name ?? 'Unknown'}
                    </span>
                    <span className="text-sm font-medium text-emerald-600">{formatGHS(amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xs font-medium text-rose-700 uppercase tracking-wide mb-3">Expense Breakdown</h3>
            {byCategory(expenses).length === 0 ? (
              <p className="text-slate-400 text-sm">No expenses this month</p>
            ) : (
              <div className="space-y-2">
                {byCategory(expenses).map(([catId, amount]) => (
                  <div key={catId} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: catMap[Number(catId)]?.color ?? '#ccc' }} />
                      {catMap[Number(catId)]?.name ?? 'Unknown'}
                    </span>
                    <span className="text-sm font-medium text-rose-600">{formatGHS(amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CashFlowChart />

      {/* Outstanding Receivables */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Outstanding Receivables</h2>
          <Button variant="secondary" size="sm" onClick={() => exportReceivablesPDF(outstandingReceivables)}>Export</Button>
        </div>
        {outstandingReceivables.length === 0 ? (
          <p className="text-slate-400 text-sm">All receivables are settled.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 text-xs text-slate-500 font-medium">Contact</th>
                <th className="text-left py-2 text-xs text-slate-500 font-medium hidden sm:table-cell">Description</th>
                <th className="text-right py-2 text-xs text-slate-500 font-medium">Outstanding</th>
                <th className="text-right py-2 text-xs text-slate-500 font-medium hidden sm:table-cell">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {outstandingReceivables.map(r => (
                <tr key={r.id}>
                  <td className="py-2 font-medium text-slate-900">{r.contactName}</td>
                  <td className="py-2 text-slate-500 hidden sm:table-cell">{r.description}</td>
                  <td className="py-2 text-right font-semibold text-indigo-600">{formatGHS(r.originalAmount - r.amountPaid)}</td>
                  <td className="py-2 text-right text-slate-400 hidden sm:table-cell">{new Date(r.dueDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
