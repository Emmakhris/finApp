import { useForm } from 'react-hook-form';
import { db } from '../../db/db';
import { toStorageAmount } from '../../utils/currency';
import { todayISO } from '../../utils/dateHelpers';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { Loan } from '../../types';

interface FormData { amount: string; date: string; notes?: string; }
interface Props { loan: Loan; onClose: () => void; }

export function RepaymentForm({ loan, onClose }: Props) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: { date: todayISO() },
  });

  async function onSubmit(data: FormData) {
    const amount = toStorageAmount(data.amount);
    const now = new Date();
    await db.loanRepayments.add({
      loanId: loan.id!,
      amount,
      date: new Date(data.date),
      notes: data.notes || undefined,
      createdAt: now,
    });
    const newTotal = loan.totalRepaid + amount;
    const status = newTotal >= loan.principalAmount ? 'repaid' :
      new Date(loan.expectedRepaymentDate) < now ? 'overdue' : 'active';
    await db.loans.update(loan.id!, { totalRepaid: newTotal, status, updatedAt: now });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Amount (GHS)" type="number" step="0.01" min="0" prefix="GHS" {...register('amount', { required: true })} />
        <Input label="Date" type="date" {...register('date', { required: true })} />
      </div>
      <Input label="Notes (optional)" {...register('notes')} />
      <div className="flex gap-3 pt-1">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" loading={isSubmitting} className="flex-1">Record Repayment</Button>
      </div>
    </form>
  );
}
