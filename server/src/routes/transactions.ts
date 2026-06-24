import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

function toClient(t: any) {
  return {
    id: t.id,
    date: t.date,
    type: t.type,
    amount: t.amount,
    description: t.description,
    categoryId: t.category_id,
    accountType: t.account_type,
    source: t.source,
    tags: t.tags,
    receivableId: t.receivable_id,
    payableId: t.payable_id,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  };
}

router.get('/', async (req, res) => {
  const { accountType, type, from, to } = req.query as Record<string, string>;
  const where: any = {};
  if (accountType && accountType !== 'all') where.account_type = accountType;
  if (type) where.type = type;
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(to);
  }
  const txns = await prisma.transaction.findMany({ where, orderBy: { date: 'desc' } });
  res.json(txns.map(toClient));
});

router.post('/', async (req, res) => {
  const { date, type, amount, description, categoryId, accountType, source, tags } = req.body;
  const t = await prisma.transaction.create({
    data: {
      date: new Date(date),
      type,
      amount,
      description,
      category_id: categoryId,
      account_type: accountType,
      source: source || null,
      tags: tags || [],
    },
  });
  res.status(201).json(toClient(t));
});

router.put('/:id', async (req, res) => {
  const { date, type, amount, description, categoryId, accountType, source } = req.body;
  const t = await prisma.transaction.update({
    where: { id: Number(req.params.id) },
    data: {
      ...(date && { date: new Date(date) }),
      ...(type && { type }),
      ...(amount !== undefined && { amount }),
      ...(description && { description }),
      ...(categoryId && { category_id: categoryId }),
      ...(accountType && { account_type: accountType }),
      source: source || null,
    },
  });
  res.json(toClient(t));
});

router.delete('/:id', async (req, res) => {
  await prisma.transaction.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

export default router;
