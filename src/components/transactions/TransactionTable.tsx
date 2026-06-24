import { useState } from 'react';
import { Pencil, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useDeleteTransaction } from '../../hooks/useTransactions';
import { formatGHS } from '../../utils/currency';
import { formatDate } from '../../utils/dateHelpers';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Modal } from '../ui/Modal';
import { TransactionForm } from './TransactionForm';
import type { Transaction, Category } from '../../types';

interface Props {
  transactions: Transaction[];
  categories: Category[];
}

export function TransactionTable({ transactions, categories }: Props) {
  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const deleteTransaction = useDeleteTransaction();

  async function handleDelete() {
    if (deleting != null) await deleteTransaction.mutateAsync(deleting);
    setDeleting(null);
  }

  if (!transactions.length) {
    return <p className="text-center text-slate-400 py-12">No transactions found.</p>;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Date</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Description</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide hidden md:table-cell">Category</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide hidden sm:table-cell">Account</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Amount</th>
              <th className="py-3 px-4 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transactions.map(t => {
              const cat = catMap[t.categoryId];
              return (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{formatDate(t.date)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {t.type === 'income' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      </span>
                      <span className="text-slate-900 font-medium">{t.description}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    {cat && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.name}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <Badge variant={t.accountType === 'business' ? 'indigo' : 'gray'}>{t.accountType}</Badge>
                  </td>
                  <td className={`py-3 px-4 text-right font-semibold whitespace-nowrap ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatGHS(t.amount)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditing(t)} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => setDeleting(t.id!)} className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Transaction">
        {editing && <TransactionForm existing={editing} onClose={() => setEditing(null)} />}
      </Modal>

      <ConfirmDialog
        open={deleting != null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
      />
    </>
  );
}
