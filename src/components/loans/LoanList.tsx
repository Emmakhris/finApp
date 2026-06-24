import { useState } from 'react';
import { Pencil, Trash2, ChevronDown, ChevronUp, PlusCircle } from 'lucide-react';
import { db } from '../../db/db';
import { formatGHS } from '../../utils/currency';
import { formatDate } from '../../utils/dateHelpers';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Modal } from '../ui/Modal';
import { LoanForm } from './LoanForm';
import { RepaymentForm } from './RepaymentForm';
import { useLoanRepayments } from '../../hooks/useLoans';
import type { Loan } from '../../types';

const statusVariant = (s: string) =>
  s === 'repaid' ? 'green' : s === 'overdue' ? 'red' : 'blue';

function RepaymentHistory({ loan }: { loan: Loan }) {
  const repayments = useLoanRepayments(loan.id!) ?? [];
  const [showForm, setShowForm] = useState(false);
  const remaining = loan.principalAmount - loan.totalRepaid;
  const pct = Math.min(100, Math.round((loan.totalRepaid / loan.principalAmount) * 100));

  return (
    <div className="pt-3">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-slate-500">Repaid / Total</p>
          <p className="font-semibold text-slate-900">{formatGHS(loan.totalRepaid)} <span className="text-slate-400 font-normal">of</span> {formatGHS(loan.principalAmount)}</p>
        </div>
        {loan.status !== 'repaid' && (
          <Button size="sm" onClick={() => setShowForm(s => !s)}>
            <PlusCircle size={13} /> {showForm ? 'Cancel' : 'Record Repayment'}
          </Button>
        )}
      </div>

      <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
        <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>

      {showForm && (
        <div className="bg-slate-50 rounded-lg p-4 mb-3">
          <RepaymentForm loan={loan} onClose={() => setShowForm(false)} />
        </div>
      )}

      <div className="space-y-2">
        {repayments.length === 0 ? (
          <p className="text-slate-400 text-sm py-3 text-center">No repayments recorded yet.</p>
        ) : (
          repayments.map(r => (
            <div key={r.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-900">{formatGHS(r.amount)}</p>
                {r.notes && <p className="text-xs text-slate-500">{r.notes}</p>}
              </div>
              <p className="text-xs text-slate-400">{formatDate(r.date)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface Props { loans: Loan[]; }

export function LoanList({ loans }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [editing, setEditing] = useState<Loan | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  if (!loans.length) {
    return <p className="text-center text-slate-400 py-12">No loans found.</p>;
  }

  return (
    <>
      <div className="divide-y divide-slate-100">
        {loans.map(l => {
          const isExp = expanded === l.id;
          const remaining = l.principalAmount - l.totalRepaid;
          return (
            <div key={l.id} className="bg-white">
              <div
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => setExpanded(isExp ? null : l.id!)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-slate-900 truncate">
                      {l.isDrawing ? 'Self Drawing' : l.borrowerName}
                    </span>
                    <Badge variant={statusVariant(l.status)}>{l.status}</Badge>
                    {l.isDrawing && <Badge variant="indigo">Drawing</Badge>}
                  </div>
                  <p className="text-xs text-slate-500">
                    Due {formatDate(l.expectedRepaymentDate)}
                    {l.interestRate > 0 && ` · ${l.interestRate}% p.a.`}
                    {` · ${l.repaymentSchedule.replace('_', ' ')}`}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-slate-900">{formatGHS(remaining)}</p>
                  <p className="text-xs text-slate-400">outstanding</p>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button onClick={e => { e.stopPropagation(); setEditing(l); }} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                    <Pencil size={13} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); setDeleting(l.id!); }} className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600">
                    <Trash2 size={13} />
                  </button>
                  {isExp ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                </div>
              </div>
              {isExp && (
                <div className="px-4 pb-4 border-t border-slate-50 bg-slate-50/50">
                  <RepaymentHistory loan={l} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Loan">
        {editing && <LoanForm existing={editing} onClose={() => setEditing(null)} />}
      </Modal>
      <ConfirmDialog
        open={deleting != null}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { await db.loans.delete(deleting!); setDeleting(null); }}
        title="Delete Loan"
        message="Delete this loan and all its repayment records?"
      />
    </>
  );
}
