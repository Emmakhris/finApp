import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useTransactions, useCategories } from '../hooks/useTransactions';
import { useAppContext } from '../context/AppContext';
import { TransactionTable } from '../components/transactions/TransactionTable';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/ui/EmptyState';
import { ArrowLeftRight } from 'lucide-react';
import { exportTransactionsPDF } from '../utils/exportPDF';
import { exportTransactionsExcel } from '../utils/exportExcel';

export function Transactions() {
  const { accountFilter } = useAppContext();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const transactions = useTransactions({ accountType: accountFilter }) ?? [];
  const categories = useCategories() ?? [];

  const filtered = transactions.filter(t => {
    if (typeFilter && t.type !== typeFilter) return false;
    if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-1 min-w-0">
          <div className="flex-1 max-w-xs">
            <Input placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} prefix="🔍" />
          </div>
          <Select
            options={[{ value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' }]}
            placeholder="All types"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="w-36"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => exportTransactionsPDF(filtered, categories)}>PDF</Button>
          <Button variant="secondary" size="sm" onClick={() => exportTransactionsExcel(filtered, categories)}>Excel</Button>
          <Button size="sm" onClick={() => setShowAdd(true)}><Plus size={14} /> Add</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={ArrowLeftRight} title="No transactions found" description="Add your first transaction to get started." action={<Button onClick={() => setShowAdd(true)} size="sm"><Plus size={14} /> Add Transaction</Button>} />
        ) : (
          <TransactionTable transactions={filtered} categories={categories} />
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Transaction">
        <TransactionForm onClose={() => setShowAdd(false)} />
      </Modal>
    </div>
  );
}
