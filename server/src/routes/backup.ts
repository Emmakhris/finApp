import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

router.get('/export', async (_req, res) => {
  const [categories, transactions, receivables, payables, payments, loans, loanRepayments] = await Promise.all([
    prisma.category.findMany(),
    prisma.transaction.findMany(),
    prisma.receivable.findMany(),
    prisma.payable.findMany(),
    prisma.payment.findMany(),
    prisma.loan.findMany(),
    prisma.loanRepayment.findMany(),
  ]);

  res.json({ categories, transactions, receivables, payables, payments, loans, loanRepayments });
});

router.post('/import', async (req, res) => {
  const { categories, transactions, receivables, payables, payments, loans, loanRepayments } = req.body;

  if (categories?.length) {
    await prisma.category.createMany({ data: categories, skipDuplicates: true });
  }
  if (transactions?.length) {
    await prisma.transaction.createMany({ data: transactions, skipDuplicates: true });
  }
  if (receivables?.length) {
    await prisma.receivable.createMany({ data: receivables, skipDuplicates: true });
  }
  if (payables?.length) {
    await prisma.payable.createMany({ data: payables, skipDuplicates: true });
  }
  if (payments?.length) {
    await prisma.payment.createMany({ data: payments, skipDuplicates: true });
  }
  if (loans?.length) {
    await prisma.loan.createMany({ data: loans, skipDuplicates: true });
  }
  if (loanRepayments?.length) {
    await prisma.loanRepayment.createMany({ data: loanRepayments, skipDuplicates: true });
  }

  // Reset sequences so new inserts don't collide with imported IDs
  const tables = ['categories', 'transactions', 'receivables', 'payables', 'payments', 'loans', 'loan_repayments'];
  for (const table of tables) {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE(MAX(id), 1)) FROM "${table}"`
    );
  }

  res.json({ success: true });
});

export default router;
