import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { AccountType } from '../types';

export function usePayables(accountType?: AccountType | 'all') {
  return useLiveQuery(async () => {
    const all = await db.payables.orderBy('dueDate').toArray();
    if (!accountType || accountType === 'all') return all;
    return all.filter(p => p.accountType === accountType);
  }, [accountType]);
}

export function usePayable(id: number) {
  return useLiveQuery(() => db.payables.get(id), [id]);
}
