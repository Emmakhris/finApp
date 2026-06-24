import prisma from './lib/prisma';

const categories = [
  // Personal income
  { name: 'Salary', type: 'income', account_type: 'personal', color: '#10b981', is_custom: false },
  { name: 'Rental Income', type: 'income', account_type: 'personal', color: '#3b82f6', is_custom: false },
  { name: 'Investment Returns', type: 'income', account_type: 'personal', color: '#8b5cf6', is_custom: false },
  { name: 'Gift', type: 'income', account_type: 'personal', color: '#f59e0b', is_custom: false },
  { name: 'Other Personal Income', type: 'income', account_type: 'personal', color: '#6b7280', is_custom: false },
  // Business income
  { name: 'Sales Revenue', type: 'income', account_type: 'business', color: '#10b981', is_custom: false },
  { name: 'Service Revenue', type: 'income', account_type: 'business', color: '#3b82f6', is_custom: false },
  { name: 'Contract Payment', type: 'income', account_type: 'business', color: '#8b5cf6', is_custom: false },
  { name: 'Other Business Income', type: 'income', account_type: 'business', color: '#6b7280', is_custom: false },
  // Personal expenses
  { name: 'Food & Dining', type: 'expense', account_type: 'personal', color: '#ef4444', is_custom: false },
  { name: 'Transport', type: 'expense', account_type: 'personal', color: '#f97316', is_custom: false },
  { name: 'Utilities', type: 'expense', account_type: 'personal', color: '#eab308', is_custom: false },
  { name: 'Rent/Housing', type: 'expense', account_type: 'personal', color: '#84cc16', is_custom: false },
  { name: 'Healthcare', type: 'expense', account_type: 'personal', color: '#06b6d4', is_custom: false },
  { name: 'Education', type: 'expense', account_type: 'personal', color: '#6366f1', is_custom: false },
  { name: 'Entertainment', type: 'expense', account_type: 'personal', color: '#ec4899', is_custom: false },
  { name: 'Clothing', type: 'expense', account_type: 'personal', color: '#f43f5e', is_custom: false },
  { name: 'Other Personal Expense', type: 'expense', account_type: 'personal', color: '#6b7280', is_custom: false },
  // Business expenses
  { name: 'Cost of Goods Sold', type: 'expense', account_type: 'business', color: '#ef4444', is_custom: false },
  { name: 'Staff Salaries', type: 'expense', account_type: 'business', color: '#f97316', is_custom: false },
  { name: 'Business Rent', type: 'expense', account_type: 'business', color: '#eab308', is_custom: false },
  { name: 'Business Utilities', type: 'expense', account_type: 'business', color: '#84cc16', is_custom: false },
  { name: 'Marketing', type: 'expense', account_type: 'business', color: '#06b6d4', is_custom: false },
  { name: 'Equipment', type: 'expense', account_type: 'business', color: '#6366f1', is_custom: false },
  { name: 'Professional Fees', type: 'expense', account_type: 'business', color: '#ec4899', is_custom: false },
  { name: 'Travel & Transport', type: 'expense', account_type: 'business', color: '#f43f5e', is_custom: false },
  { name: 'Other Business Expense', type: 'expense', account_type: 'business', color: '#6b7280', is_custom: false },
];

async function main() {
  console.log('Seeding 28 default categories...');
  await prisma.category.createMany({ data: categories, skipDuplicates: true });
  console.log('Done.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
