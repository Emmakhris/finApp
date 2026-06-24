export type AccountType = 'personal' | 'business';
export type TransactionType = 'income' | 'expense';
export type LoanStatus = 'active' | 'overdue' | 'repaid';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';
export type RepaymentSchedule = 'lump_sum' | 'weekly' | 'monthly' | 'custom';

export interface Category {
  id?: number;
  name: string;
  type: TransactionType;
  accountType: AccountType | 'both';
  color: string;
  isCustom: boolean;
}

export interface Transaction {
  id?: number;
  date: Date;
  type: TransactionType;
  amount: number; // pesewas
  description: string;
  categoryId: number;
  accountType: AccountType;
  source?: string;
  tags?: string[];
  receivableId?: number;
  payableId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Receivable {
  id?: number;
  contactName: string;
  description: string;
  originalAmount: number; // pesewas
  amountPaid: number; // pesewas
  dueDate: Date;
  status: PaymentStatus;
  accountType: AccountType;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payable {
  id?: number;
  creditorName: string;
  description: string;
  originalAmount: number; // pesewas
  amountPaid: number; // pesewas
  dueDate: Date;
  status: PaymentStatus;
  accountType: AccountType;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id?: number;
  parentType: 'receivable' | 'payable';
  parentId: number;
  amount: number; // pesewas
  date: Date;
  notes?: string;
  createdAt: Date;
}

export interface Loan {
  id?: number;
  borrowerName: string;
  isDrawing: boolean;
  principalAmount: number; // pesewas
  interestRate: number; // annual %
  startDate: Date;
  expectedRepaymentDate: Date;
  repaymentSchedule: RepaymentSchedule;
  status: LoanStatus;
  totalRepaid: number; // pesewas
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoanRepayment {
  id?: number;
  loanId: number;
  amount: number; // pesewas
  date: Date;
  notes?: string;
  createdAt: Date;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  outstandingReceivables: number;
  outstandingPayables: number;
  activeLoanTotal: number;
  overdueLoans: Loan[];
  overdueReceivables: Receivable[];
  overduePayables: Payable[];
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}
