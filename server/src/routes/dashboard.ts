import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

function monthWindow(year: number, month: number) {
  const start = new Date(Date.UTC(year, month, 1));
  const end = new Date(Date.UTC(year, month + 1, 1));
  return { start, end };
}

router.get('/summary', async (req, res) => {
  const { accountType } = req.query as Record<string, string>;

  const accountFilter = accountType && accountType !== 'all' ? { account_type: accountType } : {};

  const [incomeAgg, expenseAgg, receivableAgg, payableAgg, overdueReceivables, overduePayables, activeLoans] =
    await Promise.all([
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'income', ...accountFilter },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'expense', ...accountFilter },
      }),
      prisma.receivable.aggregate({
        _sum: { original_amount: true, amount_paid: true },
        where: { status: { not: 'paid' }, ...accountFilter },
      }),
      prisma.payable.aggregate({
        _sum: { original_amount: true, amount_paid: true },
        where: { status: { not: 'paid' }, ...accountFilter },
      }),
      prisma.receivable.count({
        where: { status: { not: 'paid' }, due_date: { lt: new Date() }, ...accountFilter },
      }),
      prisma.payable.count({
        where: { status: { not: 'paid' }, due_date: { lt: new Date() }, ...accountFilter },
      }),
      prisma.loan.aggregate({
        _sum: { principal_amount: true, total_repaid: true },
        where: { status: { not: 'repaid' } },
      }),
    ]);

  const totalIncome = incomeAgg._sum.amount ?? 0;
  const totalExpenses = expenseAgg._sum.amount ?? 0;
  const totalReceivables = (receivableAgg._sum.original_amount ?? 0) - (receivableAgg._sum.amount_paid ?? 0);
  const totalPayables = (payableAgg._sum.original_amount ?? 0) - (payableAgg._sum.amount_paid ?? 0);
  const totalLoansOutstanding = (activeLoans._sum.principal_amount ?? 0) - (activeLoans._sum.total_repaid ?? 0);

  res.json({
    totalIncome,
    totalExpenses,
    netProfit: totalIncome - totalExpenses,
    totalReceivables,
    totalPayables,
    totalLoansOutstanding,
    overdueReceivables,
    overduePayables,
  });
});

router.get('/monthly-chart', async (req, res) => {
  const { accountType } = req.query as Record<string, string>;
  const accountFilter = accountType && accountType !== 'all' ? { account_type: accountType } : {};

  const now = new Date();
  const months: { month: string; income: number; expenses: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() - i;
    const { start, end } = monthWindow(year, month);

    const [inc, exp] = await Promise.all([
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'income', date: { gte: start, lt: end }, ...accountFilter },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'expense', date: { gte: start, lt: end }, ...accountFilter },
      }),
    ]);

    const label = start.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
    months.push({
      month: label,
      income: Math.round((inc._sum.amount ?? 0) / 100),
      expenses: Math.round((exp._sum.amount ?? 0) / 100),
    });
  }

  res.json(months);
});

export default router;
