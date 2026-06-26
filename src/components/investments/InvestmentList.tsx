import { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { Investment } from '../../types';
import { formatGHS, fromStorageAmount } from '../../utils/currency';
import { formatDate } from '../../utils/dateHelpers';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { InvestmentForm } from './InvestmentForm';
import { ValueUpdateForm } from './ValueUpdateForm';
import { useInvestmentUpdates, useDeleteInvestment } from '../../hooks/useInvestments';

const TYPE_LABELS: Record<string, string> = {
  stock: 'Stock', bond: 'Bond', crypto: 'Crypto',
  real_estate: 'Real Estate', mutual_fund: 'Mutual Fund', other: 'Other',
};

const STATUS_VARIANT: Record<string, 'green' | 'gray' | 'blue'> = {
  active: 'green', exited: 'gray', matured: 'blue',
};

function InvestmentRow({ inv }: { inv: Investment }) {
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { data: updates } = useInvestmentUpdates(expanded ? inv.id! : 0);
  const del = useDeleteInvestment();

  const gainLoss = inv.currentValue - inv.amountInvested;
  const returnPct = inv.amountInvested > 0
    ? ((gainLoss / inv.amountInvested) * 100).toFixed(1)
    : '0.0';
  const isGain = gainLoss >= 0;

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div
          className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => setExpanded(e => !e)}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-slate-900 text-sm">{inv.name}</span>
              <Badge variant={STATUS_VARIANT[inv.status] ?? 'gray'}>{inv.status}</Badge>
              <span className="text-xs text-slate-400">{TYPE_LABELS[inv.investmentType] ?? inv.investmentType}</span>
              <span className="text-xs text-slate-400 capitalize">{inv.accountType}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Purchased {formatDate(inv.purchaseDate)}</p>
          </div>

          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-500">Invested</p>
            <p className="text-sm font-semibold text-slate-900">{formatGHS(inv.amountInvested)}</p>
          </div>

          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-500">Current</p>
            <p className="text-sm font-semibold text-slate-900">{formatGHS(inv.currentValue)}</p>
          </div>

          <div className={`text-right ${isGain ? 'text-emerald-600' : 'text-rose-600'}`}>
            <div className="flex items-center gap-1 justify-end">
              {isGain ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              <span className="text-sm font-semibold">{isGain ? '+' : ''}{returnPct}%</span>
            </div>
            <p className="text-xs">{isGain ? '+' : ''}{formatGHS(Math.abs(gainLoss))}</p>
          </div>

          <div className="flex items-center gap-1 ml-2" onClick={e => e.stopPropagation()}>
            <button onClick={() => setUpdateOpen(true)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Update value">
              <RefreshCw size={14} />
            </button>
            <button onClick={() => setEditOpen(true)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <Pencil size={14} />
            </button>
            <button onClick={() => setDeleteOpen(true)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
              <Trash2 size={14} />
            </button>
          </div>

          {expanded ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />}
        </div>

        {expanded && (
          <div className="border-t border-slate-100 px-4 py-3 bg-slate-50">
            {inv.description && <p className="text-sm text-slate-600 mb-3">{inv.description}</p>}
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Value History</p>
            {!updates || updates.length === 0 ? (
              <p className="text-sm text-slate-400">No value updates recorded yet.</p>
            ) : (
              <div className="space-y-1.5">
                {updates.map(u => (
                  <div key={u.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{formatDate(u.date)}</span>
                    <span className="font-medium text-slate-900">{formatGHS(u.value)}</span>
                    {u.notes && <span className="text-slate-400 text-xs ml-2">{u.notes}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Investment">
        <InvestmentForm investment={inv} onClose={() => setEditOpen(false)} />
      </Modal>

      <Modal open={updateOpen} onClose={() => setUpdateOpen(false)} title="Update Current Value">
        <ValueUpdateForm investmentId={inv.id!} onClose={() => setUpdateOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Investment"
        message={`Delete "${inv.name}"? This cannot be undone.`}
        onConfirm={async () => { await del.mutateAsync(inv.id!); setDeleteOpen(false); }}
      />
    </>
  );
}

export function InvestmentList({ investments }: { investments: Investment[] }) {
  return (
    <div className="space-y-2">
      {investments.map(inv => <InvestmentRow key={inv.id} inv={inv} />)}
    </div>
  );
}
