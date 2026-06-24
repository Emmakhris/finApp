import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

function toClient(p: any) {
  return {
    id: p.id,
    parentType: p.parent_type,
    parentId: p.parent_id,
    amount: p.amount,
    date: p.date,
    notes: p.notes,
    createdAt: p.created_at,
  };
}

function deriveStatus(originalAmount: number, amountPaid: number): string {
  if (amountPaid <= 0) return 'unpaid';
  if (amountPaid >= originalAmount) return 'paid';
  return 'partial';
}

router.get('/', async (req, res) => {
  const { parentType, parentId } = req.query as Record<string, string>;
  const payments = await prisma.payment.findMany({
    where: { parent_type: parentType, parent_id: Number(parentId) },
    orderBy: { date: 'asc' },
  });
  res.json(payments.map(toClient));
});

router.post('/', async (req, res) => {
  const { parentType, parentId, amount, date, notes } = req.body;
  const pid = Number(parentId);

  const [payment, parent] = await prisma.$transaction(async (tx) => {
    const pmt = await tx.payment.create({
      data: {
        parent_type: parentType,
        parent_id: pid,
        amount,
        date: new Date(date),
        notes: notes || null,
      },
    });

    let updatedParent: any;
    if (parentType === 'receivable') {
      const existing = await tx.receivable.findUnique({ where: { id: pid } });
      if (!existing) throw new Error('Receivable not found');
      const newPaid = existing.amount_paid + amount;
      updatedParent = await tx.receivable.update({
        where: { id: pid },
        data: {
          amount_paid: newPaid,
          status: deriveStatus(existing.original_amount, newPaid),
        },
      });
    } else {
      const existing = await tx.payable.findUnique({ where: { id: pid } });
      if (!existing) throw new Error('Payable not found');
      const newPaid = existing.amount_paid + amount;
      updatedParent = await tx.payable.update({
        where: { id: pid },
        data: {
          amount_paid: newPaid,
          status: deriveStatus(existing.original_amount, newPaid),
        },
      });
    }
    return [pmt, updatedParent];
  });

  res.status(201).json({ payment: toClient(payment), parent });
});

export default router;
