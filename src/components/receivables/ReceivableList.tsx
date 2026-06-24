import { useState } from 'react';
import { Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { db } from '../../db/db';
import { formatGHS } from '../../utils/currency';
import { formatDate } from '../../utils/dateHelpers';
import { Badge } from '../ui/Badge';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Modal } from '../ui/Modal';
import { ReceivableForm } from './ReceivableForm';
import { PaymentHistoryDrawer } from '../shared/PaymentHistoryDrawer';
import type { Receivable } from '../../types';

interface Props { receivables: Receivable[]; }

const statusVariant = (s: string) =>
  s === 'paid' ? 'green' : s === 'partial' ? 'yellow' : 'red';

export function ReceivableList({ receivables }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [editing, setEditing] = useState<Receivable | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  if (!receivables.length) {
    return <p className="text-center text-slate-400 py-12">No receivables found.</p>;
  }

  return (
    <>
      <div className="divide-y divide-slate-100">
        {receivables.map(r => {
          const isExp = expanded === r.id;
          const isOverdue = r.status !== 'paid' && new Date(r.dueDate) < new Date();
          return (
            <div key={r.id} className="bg-white">
              <div
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => setExpanded(isExp ? null : r.id!)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-slate-900 truncate">{r.contactName}</span>
                    <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                    {isOverdue && <Badge variant="red">Overdue</Badge>}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{r.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-slate-900">{formatGHS(r.originalAmount - r.amountPaid)}</p>
                  <p className="text-xs text-slate-400">Due {formatDate(r.dueDate)}</p>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button onClick={e => { e.stopPropagation(); setEditing(r); }} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                    <Pencil size={13} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); setDeleting(r.id!); }} className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600">
                    <Trash2 size={13} />
                  </button>
                  {isExp ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                </div>
              </div>
              {isExp && (
                <div className="px-4 pb-4 border-t border-slate-50 bg-slate-50/50">
                  <div className="pt-3">
                    <PaymentHistoryDrawer parentType="receivable" parent={r} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Receivable">
        {editing && <ReceivableForm existing={editing} onClose={() => setEditing(null)} />}
      </Modal>
      <ConfirmDialog
        open={deleting != null}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { await db.receivables.delete(deleting!); setDeleting(null); }}
        title="Delete Receivable"
        message="Delete this receivable and all its payment records?"
      />
    </>
  );
}
