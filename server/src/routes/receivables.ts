import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

function deriveStatus(originalAmount: number, amountPaid: number): string {
  if (amountPaid <= 0) return 'unpaid';
  if (amountPaid >= originalAmount) return 'paid';
  return 'partial';
}

function toClient(r: any) {
  return {
    id: r.id,
    contactName: r.contact_name,
    description: r.description,
    originalAmount: r.original_amount,
    amountPaid: r.amount_paid,
    dueDate: r.due_date,
    status: r.status,
    accountType: r.account_type,
    notes: r.notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

router.get('/', async (req, res) => {
  const { accountType } = req.query as Record<string, string>;
  const where: any = {};
  if (accountType && accountType !== 'all') where.account_type = accountType;
  const items = await prisma.receivable.findMany({ where, orderBy: { due_date: 'asc' } });
  res.json(items.map(toClient));
});

router.get('/:id', async (req, res) => {
  const item = await prisma.receivable.findUnique({ where: { id: Number(req.params.id) } });
  if (!item) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(toClient(item));
});

router.post('/', async (req, res) => {
  const { contactName, description, originalAmount, dueDate, accountType, notes } = req.body;
  const item = await prisma.receivable.create({
    data: {
      contact_name: contactName,
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
  const { contactName, description, originalAmount, dueDate, accountType, notes, amountPaid } = req.body;
  const existing = await prisma.receivable.findUnique({ where: { id } });
  if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
  const newOriginal = originalAmount ?? existing.original_amount;
  const newPaid = amountPaid ?? existing.amount_paid;
  const item = await prisma.receivable.update({
    where: { id },
    data: {
      ...(contactName && { contact_name: contactName }),
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
  await prisma.payment.deleteMany({ where: { parent_type: 'receivable', parent_id: id } });
  await prisma.receivable.delete({ where: { id } });
  res.json({ success: true });
});

export default router;
