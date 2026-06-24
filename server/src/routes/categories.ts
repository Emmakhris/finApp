import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

function toClient(c: any) {
  return {
    id: c.id,
    name: c.name,
    type: c.type,
    accountType: c.account_type,
    color: c.color,
    isCustom: c.is_custom,
  };
}

router.get('/', async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { id: 'asc' } });
  res.json(categories.map(toClient));
});

router.post('/', async (req, res) => {
  const { name, type, accountType, color, isCustom } = req.body;
  const cat = await prisma.category.create({
    data: { name, type, account_type: accountType, color, is_custom: isCustom ?? true },
  });
  res.status(201).json(toClient(cat));
});

router.delete('/:id', async (req, res) => {
  await prisma.category.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

router.post('/bulk', async (req, res) => {
  const { categories } = req.body as { categories: any[] };
  await prisma.category.createMany({
    data: categories.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      account_type: c.accountType ?? c.account_type,
      color: c.color,
      is_custom: c.isCustom ?? c.is_custom ?? false,
    })),
    skipDuplicates: true,
  });
  res.json({ count: categories.length });
});

export default router;
