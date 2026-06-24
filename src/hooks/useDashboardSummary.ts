import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import type { DashboardSummary, MonthlyData } from '../types';

export function useDashboardSummary(month: Date, accountFilter: 'all' | 'personal' | 'business'): DashboardSummary | undefined {
  return useLiveQuery(async () => {
    const from = startOfMonth(month);
    const to = endOfMonth(month);

    const transactions = await db.transactions.toArray();
    const filtered = transactions.filter(t => {
      const d = new Date(t.date);
      if (d < from || d > to) return false;
      if (accountFilter !== 'all' && t.accountType !== accountFilter) return false;
      return true;
    });

    const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const receivables = await db.receivables.toArray();
    const payables = await db.payables.toArray();
    const loans = await db.loans.toArray();

    const today = new Date();

    const outstandingReceivables = receivables
      .filter(r => r.status !== 'paid' && (accountFilter === 'all' || r.accountType === accountFilter))
      .reduce((s, r) => s + (r.originalAmount - r.amountPaid), 0);

    const outstandingPayables = payables
      .filter(p => p.status !== 'paid' && (accountFilter === 'all' || p.accountType === accountFilter))
      .reduce((s, p) => s + (p.originalAmount - p.amountPaid), 0);

    const activeLoanTotal = loans
      .filter(l => l.status !== 'repaid')
      .reduce((s, l) => s + (l.principalAmount - l.totalRepaid), 0);

    const overdueLoans = loans.filter(l =>
      l.status !== 'repaid' && new Date(l.expectedRepaymentDate) < today);

    const overdueReceivables = receivables.filter(r =>
      r.status !== 'paid' && new Date(r.dueDate) < today);

    const overduePayables = payables.filter(p =>
      p.status !== 'paid' && new Date(p.dueDate) < today);

    return { totalIncome, totalExpenses, netBalance: totalIncome - totalExpenses, outstandingReceivables, outstandingPayables, activeLoanTotal, overdueLoans, overdueReceivables, overduePayables };
  }, [month.toISOString(), accountFilter]);
}

export function useMonthlyChartData(): MonthlyData[] | undefined {
  return useLiveQuery(async () => {
    const months: MonthlyData[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const m = subMonths(now, i);
      const from = startOfMonth(m);
      const to = endOfMonth(m);
      const txns = await db.transactions.toArray();
      const inMonth = txns.filter(t => new Date(t.date) >= from && new Date(t.date) <= to);
      months.push({
        month: format(m, 'MMM'),
        income: inMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount / 100, 0),
        expenses: inMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount / 100, 0),
      });
    }
    return months;
  }, []);
}
