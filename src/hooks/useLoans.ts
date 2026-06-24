import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export function useLoans() {
  return useLiveQuery(() => db.loans.orderBy('startDate').reverse().toArray(), []);
}

export function useLoan(id: number) {
  return useLiveQuery(() => db.loans.get(id), [id]);
}

export function useLoanRepayments(loanId: number) {
  return useLiveQuery(() =>
    db.loanRepayments.where('loanId').equals(loanId).sortBy('date'), [loanId]);
}
