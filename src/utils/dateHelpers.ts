import { format, startOfMonth, endOfMonth, isAfter, isBefore, parseISO } from 'date-fns';

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd MMM yyyy');
}

export function formatMonthYear(date: Date): string {
  return format(date, 'MMM yyyy');
}

export function monthStart(date: Date): Date {
  return startOfMonth(date);
}

export function monthEnd(date: Date): Date {
  return endOfMonth(date);
}

export function isOverdue(date: Date): boolean {
  return isBefore(date, new Date());
}

export function isInMonth(date: Date, month: Date): boolean {
  return isAfter(date, startOfMonth(month)) && isBefore(date, endOfMonth(month)) ||
    date >= startOfMonth(month) && date <= endOfMonth(month);
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}
