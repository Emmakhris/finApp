import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

router.get('/summary', async (req, res) => {
  const { month, accountType } = req.query as Record<string, string>;
  const date = month ? new Date(month) : new Date();
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);

  const accountFilter = accountType && accountType !== 'all' ? { account_type: accountType } : {};

  const [incomeAgg, expenseAgg, receivableAgg, payableAgg, overdueReceivables, overduePayables, activeLoans] =
    await Promise.all([
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'income', date: { gte: start, lt: end }, ...accountFilter },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'expense', date: { gte: start, lt: end }, ...accountFilter },
      }),
      prisma.receivable.aggregate({
        _sum: { original_amount: true, amount_paid: true },
        where: { status: { not: 'paid' }, ...accountFilter },
      }),
      prisma.payable.aggregate({
        _sum: { original_amount: true, amount_paid: true },
        where: { status: { not: 'paid' }, ...accountFilter },
      }),
      prisma.receivable.count({ where: { status: { not: 'paid' }, due_date: { lt: new Date() }, ...accountFilter } }),
      prisma.payable.count({ where: { status: { not: 'paid' }, due_date: { lt: new Date() }, ...accountFilter } }),
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

  const months: { month: string; income: number; expenses: number }[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);

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

    const label = d.toLocaleString('en-US', { month: 'short' });
    months.push({
      month: label,
      income: Math.round((inc._sum.amount ?? 0) / 100),
      expenses: Math.round((exp._sum.amount ?? 0) / 100),
    });
  }

  res.json(months);
});

export default router;
