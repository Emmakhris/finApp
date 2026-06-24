import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { AccountType } from '../types';

export function useReceivables(accountType?: AccountType | 'all') {
  return useLiveQuery(async () => {
    const all = await db.receivables.orderBy('dueDate').toArray();
    if (!accountType || accountType === 'all') return all;
    return all.filter(r => r.accountType === accountType);
  }, [accountType]);
}

export function useReceivable(id: number) {
  return useLiveQuery(() => db.receivables.get(id), [id]);
}

export function usePaymentsFor(parentType: 'receivable' | 'payable', parentId: number) {
  return useLiveQuery(() =>
    db.payments.where({ parentType, parentId }).sortBy('date'), [parentType, parentId]);
}
