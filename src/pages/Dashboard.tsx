import { useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, Clock, CreditCard, HandCoins, Plus } from 'lucide-react';
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
  const { accountFilter } = useAppContext();
  const summary = useDashboardSummary(accountFilter);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-semibold text-slate-700">Overview</h1>
        <Button onClick={() => setShowAdd(true)} size="sm">
          <Plus size={14} /> Add Transaction
        </Button>
      </div>

      {summary && (summary.overdueReceivables + summary.overduePayables) > 0 && (
        <OverdueAlerts summary={summary} />
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <SummaryCard label="Total Income" value={summary?.totalIncome ?? 0} icon={TrendingUp} variant="income" subtitle="All time" />
        <SummaryCard label="Total Expenses" value={summary?.totalExpenses ?? 0} icon={TrendingDown} variant="expense" subtitle="All time" />
        <SummaryCard label="Net Balance" value={summary?.netProfit ?? 0} icon={Wallet} variant={summary && summary.netProfit >= 0 ? 'neutral' : 'expense'} subtitle="Income − Expenses" />
        <SummaryCard label="Receivables" value={summary?.totalReceivables ?? 0} icon={Clock} variant="indigo" subtitle="Outstanding" />
        <SummaryCard label="Payables" value={summary?.totalPayables ?? 0} icon={CreditCard} variant="warning" subtitle="Outstanding" />
        <SummaryCard label="Active Loans" value={summary?.totalLoansOutstanding ?? 0} icon={HandCoins} variant="neutral" subtitle="Outstanding" />
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
