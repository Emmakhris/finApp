import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

function toClient(inv: any) {
  return {
    id: inv.id,
    name: inv.name,
    investmentType: inv.investment_type,
    accountType: inv.account_type,
    amountInvested: inv.amount_invested,
    currentValue: inv.current_value,
    purchaseDate: inv.purchase_date,
    maturityDate: inv.maturity_date,
    description: inv.description,
    notes: inv.notes,
    status: inv.status,
    createdAt: inv.created_at,
    updatedAt: inv.updated_at,
  };
}

function updateToClient(u: any) {
  return {
    id: u.id,
    investmentId: u.investment_id,
    value: u.value,
    date: u.date,
    notes: u.notes,
    createdAt: u.created_at,
  };
}

// GET /api/investments
router.get('/', async (req, res) => {
  const { accountType, status } = req.query as Record<string, string>;
  const where: any = {};
  if (accountType && accountType !== 'all') where.account_type = accountType;
  if (status && status !== 'all') where.status = status;
  const investments = await prisma.investment.findMany({ where, orderBy: { purchase_date: 'desc' } });
  res.json(investments.map(toClient));
});

// GET /api/investments/summary
router.get('/summary', async (req, res) => {
  const { accountType } = req.query as Record<string, string>;
  const where: any = { status: 'active' };
  if (accountType && accountType !== 'all') where.account_type = accountType;
  const investments = await prisma.investment.findMany({ where });
  const totalInvested = investments.reduce((s, i) => s + i.amount_invested, 0);
  const totalCurrentValue = investments.reduce((s, i) => s + i.current_value, 0);
  const gainLoss = totalCurrentValue - totalInvested;
  res.json({ totalInvested, totalCurrentValue, gainLoss, count: investments.length });
});

// GET /api/investments/:id
router.get('/:id', async (req, res) => {
  const inv = await prisma.investment.findUnique({ where: { id: Number(req.params.id) } });
  if (!inv) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(toClient(inv));
});

// POST /api/investments
router.post('/', async (req, res) => {
  const { name, investmentType, accountType, amountInvested, currentValue, purchaseDate, maturityDate, description, notes, status } = req.body;
  const inv = await prisma.investment.create({
    data: {
      name,
      investment_type: investmentType,
      account_type: accountType,
      amount_invested: amountInvested,
      current_value: currentValue ?? amountInvested,
      purchase_date: new Date(purchaseDate),
      maturity_date: maturityDate ? new Date(maturityDate) : null,
      description: description || null,
      notes: notes || null,
      status: status || 'active',
    },
  });
  res.status(201).json(toClient(inv));
});

// PUT /api/investments/:id
router.put('/:id', async (req, res) => {
  const { name, investmentType, accountType, amountInvested, currentValue, purchaseDate, maturityDate, description, notes, status } = req.body;
  const inv = await prisma.investment.update({
    where: { id: Number(req.params.id) },
    data: {
      ...(name && { name }),
      ...(investmentType && { investment_type: investmentType }),
      ...(accountType && { account_type: accountType }),
      ...(amountInvested !== undefined && { amount_invested: amountInvested }),
      ...(currentValue !== undefined && { current_value: currentValue }),
      ...(purchaseDate && { purchase_date: new Date(purchaseDate) }),
      maturity_date: maturityDate ? new Date(maturityDate) : null,
      description: description || null,
      notes: notes || null,
      ...(status && { status }),
    },
  });
  res.json(toClient(inv));
});

// DELETE /api/investments/:id
router.delete('/:id', async (req, res) => {
  await prisma.investment.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

// GET /api/investments/:id/value-updates
router.get('/:id/value-updates', async (req, res) => {
  const updates = await prisma.investmentUpdate.findMany({
    where: { investment_id: Number(req.params.id) },
    orderBy: { date: 'desc' },
  });
  res.json(updates.map(updateToClient));
});

// POST /api/investments/:id/value-updates
router.post('/:id/value-updates', async (req, res) => {
  const investmentId = Number(req.params.id);
  const { value, date, notes } = req.body;

  const [update] = await prisma.$transaction([
    prisma.investmentUpdate.create({
      data: {
        investment_id: investmentId,
        value,
        date: new Date(date),
        notes: notes || null,
      },
    }),
    prisma.investment.update({
      where: { id: investmentId },
      data: { current_value: value },
    }),
  ]);

  res.status(201).json(updateToClient(update));
});

export default router;
