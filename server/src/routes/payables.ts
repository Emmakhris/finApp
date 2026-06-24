import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

function deriveStatus(originalAmount: number, amountPaid: number): string {
  if (amountPaid <= 0) return 'unpaid';
  if (amountPaid >= originalAmount) return 'paid';
  return 'partial';
}

function toClient(p: any) {
  return {
    id: p.id,
    creditorName: p.creditor_name,
    description: p.description,
    originalAmount: p.original_amount,
    amountPaid: p.amount_paid,
    dueDate: p.due_date,
    status: p.status,
    accountType: p.account_type,
    notes: p.notes,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

router.get('/', async (req, res) => {
  const { accountType } = req.query as Record<string, string>;
  const where: any = {};
  if (accountType && accountType !== 'all') where.account_type = accountType;
  const items = await prisma.payable.findMany({ where, orderBy: { due_date: 'asc' } });
  res.json(items.map(toClient));
});

router.get('/:id', async (req, res) => {
  const item = await prisma.payable.findUnique({ where: { id: Number(req.params.id) } });
  if (!item) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(toClient(item));
});

router.post('/', async (req, res) => {
  const { creditorName, description, originalAmount, dueDate, accountType, notes } = req.body;
  const item = await prisma.payable.create({
    data: {
      creditor_name: creditorName,
      description,
      original_amount: originalAmount,
      amount_paid: 0,
      due_date: new Date(dueDate),
      status: 'unpaid',
      account_type: accountType,
      notes: notes || null,
    },
  });
  res.status(201).json(toClient(item));
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { creditorName, description, originalAmount, dueDate, accountType, notes, amountPaid } = req.body;
  const existing = await prisma.payable.findUnique({ where: { id } });
  if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
  const newOriginal = originalAmount ?? existing.original_amount;
  const newPaid = amountPaid ?? existing.amount_paid;
  const item = await prisma.payable.update({
    where: { id },
    data: {
      ...(creditorName && { creditor_name: creditorName }),
      ...(description && { description }),
      ...(originalAmount !== undefined && { original_amount: originalAmount }),
      ...(dueDate && { due_date: new Date(dueDate) }),
      ...(accountType && { account_type: accountType }),
      notes: notes !== undefined ? (notes || null) : undefined,
      ...(amountPaid !== undefined && { amount_paid: amountPaid }),
      status: deriveStatus(newOriginal, newPaid),
    },
  });
  res.json(toClient(item));
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  await prisma.payment.deleteMany({ where: { parent_type: 'payable', parent_id: id } });
  await prisma.payable.delete({ where: { id } });
  res.json({ success: true });
});

export default router;
