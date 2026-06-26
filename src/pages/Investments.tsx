import { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Briefcase } from 'lucide-react';
import { useInvestments, useInvestmentSummary } from '../hooks/useInvestments';
import { useAppContext } from '../context/AppContext';
import { InvestmentList } from '../components/investments/InvestmentList';
import { InvestmentForm } from '../components/investments/InvestmentForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { formatGHS } from '../utils/currency';

type StatusFilter = 'all' | 'active' | 'exited' | 'matured';

export function Investments() {
  const { accountFilter } = useAppContext();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [addOpen, setAddOpen] = useState(false);

  const { data: investments = [], isLoading } = useInvestments(accountFilter, statusFilter);
  const { data: summary } = useInvestmentSummary(accountFilter);

  const isGain = (summary?.gainLoss ?? 0) >= 0;

  const statusTabs: StatusFilter[] = ['all', 'active', 'exited', 'matured'];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-semibold text-slate-700">
          Investments
          {investments.length > 0 && <span className="ml-2 text-slate-400 font-normal">({investments.length})</span>}
        </h1>
        <Button onClick={() => setAddOpen(true)} size="sm">
          <Plus size={14} /> Add Investment
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl p-4 text-white shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className="opacity-80" />
            <span className="text-xs font-medium opacity-80">Total Invested</span>
          </div>
          <p className="text-xl font-bold">{formatGHS(summary?.totalInvested ?? 0)}</p>
          <p className="text-xs opacity-70 mt-0.5">{summary?.count ?? 0} active investments</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-4 text-white shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase size={16} className="opacity-80" />
            <span className="text-xs font-medium opacity-80">Current Value</span>
          </div>
          <p className="text-xl font-bold">{formatGHS(summary?.totalCurrentValue ?? 0)}</p>
          <p className="text-xs opacity-70 mt-0.5">Portfolio value today</p>
        </div>

        <div className={`bg-gradient-to-br ${isGain ? 'from-emerald-500 to-emerald-700' : 'from-rose-500 to-rose-700'} rounded-xl p-4 text-white shadow-sm`}>
          <div className="flex items-center gap-2 mb-2">
            {isGain ? <TrendingUp size={16} className="opacity-80" /> : <TrendingDown size={16} className="opacity-80" />}
            <span className="text-xs font-medium opacity-80">Total Return</span>
          </div>
          <p className="text-xl font-bold">
            {isGain ? '+' : ''}{formatGHS(summary?.gainLoss ?? 0)}
          </p>
          <p className="text-xs opacity-70 mt-0.5">
            {summary && summary.totalInvested > 0
              ? `${isGain ? '+' : ''}${((summary.gainLoss / summary.totalInvested) * 100).toFixed(1)}% overall`
              : 'No data yet'}
          </p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {statusTabs.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${statusFilter === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="text-sm text-slate-400 py-8 text-center">Loading…</div>
      ) : investments.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No investments yet"
          description="Track your stocks, bonds, crypto, real estate, and more."
          action={
            <Button onClick={() => setAddOpen(true)} size="sm">
              <Plus size={14} /> Add Investment
            </Button>
          }
        />
      ) : (
        <InvestmentList investments={investments} />
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Investment">
        <InvestmentForm onClose={() => setAddOpen(false)} />
      </Modal>
    </div>
  );
}
