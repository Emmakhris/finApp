import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatGHS } from './currency';
import { formatDate } from './dateHelpers';
import type { Transaction, Receivable, Payable, Loan } from '../types';

function header(doc: jsPDF, title: string) {
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text('FinApp', 14, 15);
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text(title, 14, 22);
  doc.setTextColor(203, 213, 225);
  doc.line(14, 25, 196, 25);
}

export function exportTransactionsPDF(transactions: Transaction[], categories: { id?: number; name: string }[]) {
  const doc = new jsPDF();
  header(doc, 'Transaction Report');
  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));
  autoTable(doc, {
    startY: 30,
    head: [['Date', 'Description', 'Category', 'Account', 'Type', 'Amount']],
    body: transactions.map(t => [
      formatDate(t.date),
      t.description,
      catMap[t.categoryId] ?? '-',
      t.accountType,
      t.type,
      formatGHS(t.amount),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [79, 70, 229] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });
  doc.save('transactions.pdf');
}

export function exportReceivablesPDF(receivables: Receivable[]) {
  const doc = new jsPDF();
  header(doc, 'Receivables Report');
  autoTable(doc, {
    startY: 30,
    head: [['Contact', 'Description', 'Original', 'Paid', 'Outstanding', 'Due Date', 'Status']],
    body: receivables.map(r => [
      r.contactName,
      r.description,
      formatGHS(r.originalAmount),
      formatGHS(r.amountPaid),
      formatGHS(r.originalAmount - r.amountPaid),
      formatDate(r.dueDate),
      r.status,
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [79, 70, 229] },
  });
  doc.save('receivables.pdf');
}

export function exportLoansPDF(loans: Loan[]) {
  const doc = new jsPDF();
  header(doc, 'Loans Report');
  autoTable(doc, {
    startY: 30,
    head: [['Borrower', 'Principal', 'Repaid', 'Outstanding', 'Rate', 'Due Date', 'Status']],
    body: loans.map(l => [
      l.borrowerName + (l.isDrawing ? ' (Drawing)' : ''),
      formatGHS(l.principalAmount),
      formatGHS(l.totalRepaid),
      formatGHS(l.principalAmount - l.totalRepaid),
      l.interestRate ? `${l.interestRate}%` : 'None',
      formatDate(l.expectedRepaymentDate),
      l.status,
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [79, 70, 229] },
  });
  doc.save('loans.pdf');
}

export function exportPayablesPDF(payables: Payable[]) {
  const doc = new jsPDF();
  header(doc, 'Payables Report');
  autoTable(doc, {
    startY: 30,
    head: [['Creditor', 'Description', 'Original', 'Paid', 'Outstanding', 'Due Date', 'Status']],
    body: payables.map(p => [
      p.creditorName,
      p.description,
      formatGHS(p.originalAmount),
      formatGHS(p.amountPaid),
      formatGHS(p.originalAmount - p.amountPaid),
      formatDate(p.dueDate),
      p.status,
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [79, 70, 229] },
  });
  doc.save('payables.pdf');
}
