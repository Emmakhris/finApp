import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

function toClient(l: any) {
  return {
    id: l.id,
    borrowerName: l.borrower_name,
    isDrawing: l.is_drawing,
    principalAmount: l.principal_amount,
    interestRate: l.interest_rate,
    startDate: l.start_date,
    expectedRepaymentDate: l.expected_repayment_date,
    repaymentSchedule: l.repayment_schedule,
    status: l.status,
    totalRepaid: l.total_repaid,
    notes: l.notes,
    createdAt: l.created_at,
    updatedAt: l.updated_at,
  };
}

router.get('/', async (_req, res) => {
  const loans = await prisma.loan.findMany({ orderBy: { start_date: 'desc' } });
  res.json(loans.map(toClient));
});

router.get('/:id', async (req, res) => {
  const loan = await prisma.loan.findUnique({ where: { id: Number(req.params.id) } });
  if (!loan) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(toClient(loan));
});

router.post('/', async (req, res) => {
  const { borrowerName, isDrawing, principalAmount, interestRate, startDate, expectedRepaymentDate, repaymentSchedule, notes } = req.body;
  const loan = await prisma.loan.create({
    data: {
      borrower_name: borrowerName,
      is_drawing: isDrawing ?? false,
      principal_amount: principalAmount,
      interest_rate: interestRate ?? 0,
      start_date: new Date(startDate),
      expected_repayment_date: new Date(expectedRepaymentDate),
      repayment_schedule: repaymentSchedule,
      status: 'active',
      total_repaid: 0,
      notes: notes || null,
    },
  });
  res.status(201).json(toClient(loan));
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { borrowerName, isDrawing, principalAmount, interestRate, startDate, expectedRepaymentDate, repaymentSchedule, notes } = req.body;
  const loan = await prisma.loan.update({
    where: { id },
    data: {
      ...(borrowerName && { borrower_name: borrowerName }),
      ...(isDrawing !== undefined && { is_drawing: isDrawing }),
      ...(principalAmount !== undefined && { principal_amount: principalAmount }),
      ...(interestRate !== undefined && { interest_rate: interestRate }),
      ...(startDate && { start_date: new Date(startDate) }),
      ...(expectedRepaymentDate && { expected_repayment_date: new Date(expectedRepaymentDate) }),
      ...(repaymentSchedule && { repayment_schedule: repaymentSchedule }),
      notes: notes !== undefined ? (notes || null) : undefined,
    },
  });
  res.json(toClient(loan));
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  await prisma.loanRepayment.deleteMany({ where: { loan_id: id } });
  await prisma.loan.delete({ where: { id } });
  res.json({ success: true });
});

export default router;
