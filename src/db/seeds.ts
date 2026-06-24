import { db } from './db';
import type { Category } from '../types';

const defaultCategories: Omit<Category, 'id'>[] = [
  // Personal income
  { name: 'Salary', type: 'income', accountType: 'personal', color: '#10b981', isCustom: false },
  { name: 'Rental Income', type: 'income', accountType: 'personal', color: '#06b6d4', isCustom: false },
  { name: 'Investment Returns', type: 'income', accountType: 'personal', color: '#8b5cf6', isCustom: false },
  { name: 'Gift', type: 'income', accountType: 'personal', color: '#f59e0b', isCustom: false },
  { name: 'Other Personal Income', type: 'income', accountType: 'personal', color: '#6b7280', isCustom: false },
  // Business income
  { name: 'Sales Revenue', type: 'income', accountType: 'business', color: '#10b981', isCustom: false },
  { name: 'Service Revenue', type: 'income', accountType: 'business', color: '#059669', isCustom: false },
  { name: 'Contract Payment', type: 'income', accountType: 'business', color: '#0d9488', isCustom: false },
  { name: 'Other Business Income', type: 'income', accountType: 'business', color: '#6b7280', isCustom: false },
  // Personal expenses
  { name: 'Food & Dining', type: 'expense', accountType: 'personal', color: '#f97316', isCustom: false },
  { name: 'Transport', type: 'expense', accountType: 'personal', color: '#eab308', isCustom: false },
  { name: 'Utilities', type: 'expense', accountType: 'personal', color: '#3b82f6', isCustom: false },
  { name: 'Rent / Housing', type: 'expense', accountType: 'personal', color: '#8b5cf6', isCustom: false },
  { name: 'Healthcare', type: 'expense', accountType: 'personal', color: '#ec4899', isCustom: false },
  { name: 'Education', type: 'expense', accountType: 'personal', color: '#06b6d4', isCustom: false },
  { name: 'Entertainment', type: 'expense', accountType: 'personal', color: '#f43f5e', isCustom: false },
  { name: 'Clothing', type: 'expense', accountType: 'personal', color: '#d946ef', isCustom: false },
  { name: 'Other Personal Expense', type: 'expense', accountType: 'personal', color: '#6b7280', isCustom: false },
  // Business expenses
  { name: 'Cost of Goods Sold', type: 'expense', accountType: 'business', color: '#ef4444', isCustom: false },
  { name: 'Staff Salaries', type: 'expense', accountType: 'business', color: '#f97316', isCustom: false },
  { name: 'Business Rent', type: 'expense', accountType: 'business', color: '#8b5cf6', isCustom: false },
  { name: 'Business Utilities', type: 'expense', accountType: 'business', color: '#3b82f6', isCustom: false },
  { name: 'Marketing', type: 'expense', accountType: 'business', color: '#f59e0b', isCustom: false },
  { name: 'Equipment', type: 'expense', accountType: 'business', color: '#64748b', isCustom: false },
  { name: 'Professional Fees', type: 'expense', accountType: 'business', color: '#0ea5e9', isCustom: false },
  { name: 'Travel & Transport', type: 'expense', accountType: 'business', color: '#eab308', isCustom: false },
  { name: 'Other Business Expense', type: 'expense', accountType: 'business', color: '#6b7280', isCustom: false },
];

export async function seedDatabase() {
  const count = await db.categories.count();
  if (count === 0) {
    await db.categories.bulkAdd(defaultCategories as Category[]);
  }
}
