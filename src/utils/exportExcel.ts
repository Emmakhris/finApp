import * as XLSX from 'xlsx';
import { formatGHS } from './currency';
import { formatDate } from './dateHelpers';
import type { Transaction, Receivable, Payable, Loan } from '../types';

function download(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, filename);
}

export function exportTransactionsExcel(transactions: Transaction[], categories: { id?: number; name: string }[]) {
  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));
  const data = transactions.map(t => ({
    Date: formatDate(t.date),
    Description: t.description,
    Category: catMap[t.categoryId] ?? '-',
    Account: t.accountType,
    Type: t.type,
    Amount: formatGHS(t.amount),
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
  download(wb, 'transactions.xlsx');
}

export function exportReceivablesExcel(receivables: Receivable[]) {
  const data = receivables.map(r => ({
    Contact: r.contactName,
    Description: r.description,
    Original: formatGHS(r.originalAmount),
    Paid: formatGHS(r.amountPaid),
    Outstanding: formatGHS(r.originalAmount - r.amountPaid),
    'Due Date': formatDate(r.dueDate),
    Status: r.status,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Receivables');
  download(wb, 'receivables.xlsx');
}

export function exportPayablesExcel(payables: Payable[]) {
  const data = payables.map(p => ({
    Creditor: p.creditorName,
    Description: p.description,
    Original: formatGHS(p.originalAmount),
    Paid: formatGHS(p.amountPaid),
    Outstanding: formatGHS(p.originalAmount - p.amountPaid),
    'Due Date': formatDate(p.dueDate),
    Status: p.status,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Payables');
  download(wb, 'payables.xlsx');
}

export function exportLoansExcel(loans: Loan[]) {
  const data = loans.map(l => ({
    Borrower: l.borrowerName + (l.isDrawing ? ' (Drawing)' : ''),
    Principal: formatGHS(l.principalAmount),
    Repaid: formatGHS(l.totalRepaid),
    Outstanding: formatGHS(l.principalAmount - l.totalRepaid),
    'Interest Rate': l.interestRate ? `${l.interestRate}%` : 'None',
    'Start Date': formatDate(l.startDate),
    'Due Date': formatDate(l.expectedRepaymentDate),
    Status: l.status,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Loans');
  download(wb, 'loans.xlsx');
}
