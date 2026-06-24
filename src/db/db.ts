import Dexie, { type Table } from 'dexie';
import type {
  Category, Transaction, Receivable, Payable, Payment, Loan, LoanRepayment,
} from '../types';

export class FinAppDB extends Dexie {
  categories!: Table<Category>;
  transactions!: Table<Transaction>;
  receivables!: Table<Receivable>;
  payables!: Table<Payable>;
  payments!: Table<Payment>;
  loans!: Table<Loan>;
  loanRepayments!: Table<LoanRepayment>;

  constructor() {
    super('FinAppDB');
    this.version(1).stores({
      categories:     '++id, type, accountType',
      transactions:   '++id, date, type, accountType, categoryId',
      receivables:    '++id, dueDate, status, accountType',
      payables:       '++id, dueDate, status, accountType',
      payments:       '++id, parentType, parentId, date',
      loans:          '++id, status, startDate, expectedRepaymentDate, isDrawing',
      loanRepayments: '++id, loanId, date',
    });
  }
}

export const db = new FinAppDB();
