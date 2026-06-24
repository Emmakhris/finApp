import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

function deriveLoanStatus(principalAmount: number, totalRepaid: number, expectedDate: Date): string {
  if (totalRepaid >= principalAmount) return 'repaid';
  if (new Date(expectedDate) < new Date()) return 'overdue';
  return 'active';
}

function toClient(r: any) {
  return {
    id: r.id,
    loanId: r.loan_id,
    amount: r.amount,
    date: r.date,
    notes: r.notes,
    createdAt: r.created_at,
  };
}

router.get('/', async (req, res) => {
  const { loanId } = req.query as Record<string, string>;
  const repayments = await prisma.loanRepayment.findMany({
    where: { loan_id: Number(loanId) },
    orderBy: { date: 'asc' },
  });
  res.json(repayments.map(toClient));
});

router.post('/', async (req, res) => {
  const { loanId, amount, date, notes } = req.body;
  const lid = Number(loanId);

  const [repayment, loan] = await prisma.$transaction(async (tx) => {
    const r = await tx.loanRepayment.create({
      data: {
        loan_id: lid,
        amount,
        date: new Date(date),
        notes: notes || null,
      },
    });
    const existing = await tx.loan.findUnique({ where: { id: lid } });
    if (!existing) throw new Error('Loan not found');
    const newTotal = existing.total_repaid + amount;
    const status = deriveLoanStatus(existing.principal_amount, newTotal, existing.expected_repayment_date);
    const updatedLoan = await tx.loan.update({
      where: { id: lid },
      data: { total_repaid: newTotal, status },
    });
    return [r, updatedLoan];
  });

  res.status(201).json({
    repayment: toClient(repayment),
    loan: {
      id: loan.id,
      totalRepaid: loan.total_repaid,
      status: loan.status,
      principalAmount: loan.principal_amount,
    },
  });
});

export default router;
