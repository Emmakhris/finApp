import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatGHS } from '../../utils/currency';
import type { DashboardSummary } from '../../types';

interface Props { summary: DashboardSummary; }

export function OverdueAlerts({ summary }: Props) {
  const { overdueLoans, overdueReceivables, overduePayables } = summary;
  const total = overdueLoans.length + overdueReceivables.length + overduePayables.length;
  if (total === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
      <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-medium text-amber-800 mb-1">Action Required — {total} overdue item{total > 1 ? 's' : ''}</p>
        <ul className="text-sm text-amber-700 space-y-0.5">
          {overdueLoans.length > 0 && (
            <li><Link to="/loans" className="underline">{overdueLoans.length} overdue loan{overdueLoans.length > 1 ? 's' : ''}</Link></li>
          )}
          {overdueReceivables.length > 0 && (
            <li><Link to="/receivables" className="underline">{overdueReceivables.length} overdue receivable{overdueReceivables.length > 1 ? 's' : ''}</Link></li>
          )}
          {overduePayables.length > 0 && (
            <li><Link to="/payables" className="underline">{overduePayables.length} overdue payable{overduePayables.length > 1 ? 's' : ''}</Link></li>
          )}
        </ul>
      </div>
    </div>
  );
}
