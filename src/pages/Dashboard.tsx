import { useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, Clock, CreditCard, HandCoins, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { useAppContext } from '../context/AppContext';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { CashFlowChart } from '../components/dashboard/CashFlowChart';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { OverdueAlerts } from '../components/dashboard/OverdueAlerts';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { TransactionForm } from '../components/transactions/TransactionForm';

export function Dashboard() {
  const { accountFilter, selectedMonth, setSelectedMonth } = useAppContext();
  const summary = useDashboardSummary(selectedMonth, accountFilter);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))} className="p-1 rounded hover:bg-slate-200 transition-colors">
            <ChevronLeft size={16} className="text-slate-500" />
          </button>
          <span className="text-sm font-medium text-slate-700 min-w-24 text-center">
            {format(selectedMonth, 'MMMM yyyy')}
          </span>
          <button onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))} className="p-1 rounded hover:bg-slate-200 transition-colors">
            <ChevronRight size={16} className="text-slate-500" />
          </button>
        </div>
        <Button onClick={() => setShowAdd(true)} size="sm">
          <Plus size={14} /> Add Transaction
        </Button>
      </div>

      {summary && (summary.overdueReceivables + summary.overduePayables) > 0 && (
        <OverdueAlerts summary={summary} />
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <SummaryCard label="Total Income" value={summary?.totalIncome ?? 0} icon={TrendingUp} variant="income" subtitle="This month" />
        <SummaryCard label="Total Expenses" value={summary?.totalExpenses ?? 0} icon={TrendingDown} variant="expense" subtitle="This month" />
        <SummaryCard label="Net Balance" value={summary?.netProfit ?? 0} icon={Wallet} variant={summary && summary.netProfit >= 0 ? 'neutral' : 'expense'} subtitle="Income − Expenses" />
        <SummaryCard label="Receivables" value={summary?.totalReceivables ?? 0} icon={Clock} variant="indigo" subtitle="Outstanding" />
        <SummaryCard label="Payables" value={summary?.totalPayables ?? 0} icon={CreditCard} variant="warning" subtitle="Outstanding" />
        <SummaryCard label="Active Loans" value={summary?.totalLoansOutstanding ?? 0} icon={HandCoins} variant="neutral" subtitle="Total outstanding" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <CashFlowChart />
        <RecentTransactions />
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Transaction">
        <TransactionForm onClose={() => setShowAdd(false)} />
      </Modal>
    </div>
  );
}
