import { useState } from 'react';
import { Plus, TrendingDown } from 'lucide-react';
import { usePayables } from '../hooks/usePayables';
import { useAppContext } from '../context/AppContext';
import { PayableList } from '../components/payables/PayableList';
import { PayableForm } from '../components/payables/PayableForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { formatGHS } from '../utils/currency';
import { exportPayablesPDF } from '../utils/exportPDF';
import { exportPayablesExcel } from '../utils/exportExcel';

export function Payables() {
  const { accountFilter } = useAppContext();
  const [showAdd, setShowAdd] = useState(false);
  const payables = usePayables(accountFilter) ?? [];
  const outstanding = payables.filter(p => p.status !== 'paid').reduce((s, p) => s + (p.originalAmount - p.amountPaid), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Total Outstanding</p>
          <p className="text-xl font-bold text-slate-900">{formatGHS(outstanding)}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => exportPayablesPDF(payables)}>PDF</Button>
          <Button variant="secondary" size="sm" onClick={() => exportPayablesExcel(payables)}>Excel</Button>
          <Button size="sm" onClick={() => setShowAdd(true)}><Plus size={14} /> Add</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {payables.length === 0 ? (
          <EmptyState icon={TrendingDown} title="No payables" description="Track money you owe to others." action={<Button size="sm" onClick={() => setShowAdd(true)}><Plus size={14} /> Add Payable</Button>} />
        ) : (
          <PayableList payables={payables} />
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Payable">
        <PayableForm onClose={() => setShowAdd(false)} />
      </Modal>
    </div>
  );
}
