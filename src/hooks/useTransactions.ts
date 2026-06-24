import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { AccountType, TransactionType } from '../types';

export function useTransactions(filters?: {
  accountType?: AccountType | 'all';
  type?: TransactionType;
  from?: Date;
  to?: Date;
}) {
  return useLiveQuery(async () => {
    let query = db.transactions.orderBy('date').reverse();
    const all = await query.toArray();
    return all.filter(t => {
      if (filters?.accountType && filters.accountType !== 'all' && t.accountType !== filters.accountType) return false;
      if (filters?.type && t.type !== filters.type) return false;
      if (filters?.from && new Date(t.date) < filters.from) return false;
      if (filters?.to && new Date(t.date) > filters.to) return false;
      return true;
    });
  }, [filters?.accountType, filters?.type, filters?.from?.toISOString(), filters?.to?.toISOString()]);
}

export function useCategories() {
  return useLiveQuery(() => db.categories.toArray(), []);
}
