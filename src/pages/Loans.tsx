import { useState } from 'react';
import { Plus, HandCoins } from 'lucide-react';
import { useLoans } from '../hooks/useLoans';
import { LoanList } from '../components/loans/LoanList';
import { LoanForm } from '../components/loans/LoanForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';
import { formatGHS } from '../utils/currency';
import { exportLoansPDF } from '../utils/exportPDF';
import { exportLoansExcel } from '../utils/exportExcel';

export function Loans() {
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'overdue' | 'repaid'>('all');
  const loans = useLoans() ?? [];

  const counts = {
    all: loans.length,
    active: loans.filter(l => l.status === 'active').length,
    overdue: loans.filter(l => l.status === 'overdue').length,
    repaid: loans.filter(l => l.status === 'repaid').length,
  };

  const filtered = filter === 'all' ? loans : loans.filter(l => l.status === filter);
  const activeTotal = loans.filter(l => l.status !== 'repaid').reduce((s, l) => s + (l.principalAmount - l.totalRepaid), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Total Outstanding</p>
          <p className="text-xl font-bold text-slate-900">{formatGHS(activeTotal)}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => exportLoansPDF(loans)}>PDF</Button>
          <Button variant="secondary" size="sm" onClick={() => exportLoansExcel(loans)}>Excel</Button>
          <Button size="sm" onClick={() => setShowAdd(true)}><Plus size={14} /> Add</Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['all', 'active', 'overdue', 'repaid'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${filter === f ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
          >
            {f} {counts[f] > 0 && <span className={`ml-1 ${f === 'overdue' ? 'text-amber-400' : ''}`}>({counts[f]})</span>}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={HandCoins} title="No loans" description="Track loans you've given out or drawings from your business." action={<Button size="sm" onClick={() => setShowAdd(true)}><Plus size={14} /> Add Loan</Button>} />
        ) : (
          <LoanList loans={filtered} />
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Loan" size="lg">
        <LoanForm onClose={() => setShowAdd(false)} />
      </Modal>
    </div>
  );
}
