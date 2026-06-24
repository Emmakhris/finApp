import { useState } from 'react';
import { Plus } from 'lucide-react';
import { TrendingUp } from 'lucide-react';
import { useReceivables } from '../hooks/useReceivables';
import { useAppContext } from '../context/AppContext';
import { ReceivableList } from '../components/receivables/ReceivableList';
import { ReceivableForm } from '../components/receivables/ReceivableForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { formatGHS } from '../utils/currency';
import { exportReceivablesPDF } from '../utils/exportPDF';
import { exportReceivablesExcel } from '../utils/exportExcel';

export function Receivables() {
  const { accountFilter } = useAppContext();
  const [showAdd, setShowAdd] = useState(false);
  const receivables = useReceivables(accountFilter) ?? [];
  const outstanding = receivables.filter(r => r.status !== 'paid').reduce((s, r) => s + (r.originalAmount - r.amountPaid), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Total Outstanding</p>
          <p className="text-xl font-bold text-slate-900">{formatGHS(outstanding)}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => exportReceivablesPDF(receivables)}>PDF</Button>
          <Button variant="secondary" size="sm" onClick={() => exportReceivablesExcel(receivables)}>Excel</Button>
          <Button size="sm" onClick={() => setShowAdd(true)}><Plus size={14} /> Add</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {receivables.length === 0 ? (
          <EmptyState icon={TrendingUp} title="No receivables" description="Track money others owe you." action={<Button size="sm" onClick={() => setShowAdd(true)}><Plus size={14} /> Add Receivable</Button>} />
        ) : (
          <ReceivableList receivables={receivables} />
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Receivable">
        <ReceivableForm onClose={() => setShowAdd(false)} />
      </Modal>
    </div>
  );
}
