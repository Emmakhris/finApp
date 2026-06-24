import { useForm } from 'react-hook-form';
import { db } from '../../db/db';
import { toStorageAmount, fromStorageAmount } from '../../utils/currency';
import { todayISO } from '../../utils/dateHelpers';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import type { Loan } from '../../types';

interface FormData {
  borrowerName: string;
  isDrawing: string;
  principalAmount: string;
  interestRate: string;
  startDate: string;
  expectedRepaymentDate: string;
  repaymentSchedule: string;
  notes?: string;
}

interface Props { onClose: () => void; existing?: Loan; }

export function LoanForm({ onClose, existing }: Props) {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: existing ? {
      borrowerName: existing.borrowerName,
      isDrawing: String(existing.isDrawing),
      principalAmount: fromStorageAmount(existing.principalAmount),
      interestRate: String(existing.interestRate),
      startDate: new Date(existing.startDate).toISOString().slice(0, 10),
      expectedRepaymentDate: new Date(existing.expectedRepaymentDate).toISOString().slice(0, 10),
      repaymentSchedule: existing.repaymentSchedule,
      notes: existing.notes,
    } : {
      isDrawing: 'false',
      interestRate: '0',
      startDate: todayISO(),
      repaymentSchedule: 'lump_sum',
    },
  });

  const isDrawing = watch('isDrawing') === 'true';

  async function onSubmit(data: FormData) {
    const now = new Date();
    const payload = {
      borrowerName: isDrawing ? 'Self (Drawing)' : data.borrowerName,
      isDrawing: isDrawing,
      principalAmount: toStorageAmount(data.principalAmount),
      interestRate: parseFloat(data.interestRate) || 0,
      startDate: new Date(data.startDate),
      expectedRepaymentDate: new Date(data.expectedRepaymentDate),
      repaymentSchedule: data.repaymentSchedule as Loan['repaymentSchedule'],
      notes: data.notes || undefined,
      updatedAt: now,
    };
    if (existing?.id) {
      await db.loans.update(existing.id, payload);
    } else {
      await db.loans.add({ ...payload, status: 'active', totalRepaid: 0, createdAt: now });
    }
    onClose();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-medium text-slate-600 mb-1">Loan Type</p>
        <div className="flex gap-2">
          {[{ value: 'false', label: 'To a Friend / Person' }, { value: 'true', label: 'Self Drawing (from Business)' }].map(o => (
            <label key={o.value} className={`flex-1 flex items-center justify-center py-2 px-3 rounded-lg border cursor-pointer text-sm font-medium transition-colors ${watch('isDrawing') === o.value ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'border-slate-300 text-slate-500'}`}>
              <input type="radio" value={o.value} {...register('isDrawing')} className="sr-only" />
              {o.label}
            </label>
          ))}
        </div>
      </div>

      {!isDrawing && (
        <Input label="Borrower Name" placeholder="Who are you lending to?" {...register('borrowerName', { required: !isDrawing ? 'Required' : false })} error={errors.borrowerName?.message} />
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input label="Principal Amount (GHS)" type="number" step="0.01" min="0" prefix="GHS" {...register('principalAmount', { required: 'Required' })} error={errors.principalAmount?.message} />
        <Input label="Annual Interest Rate (%)" type="number" step="0.1" min="0" placeholder="0 = interest-free" {...register('interestRate')} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Start Date" type="date" {...register('startDate', { required: 'Required' })} error={errors.startDate?.message} />
        <Input label="Expected Repayment Date" type="date" {...register('expectedRepaymentDate', { required: 'Required' })} error={errors.expectedRepaymentDate?.message} />
      </div>

      <Select
        label="Repayment Schedule"
        options={[
          { value: 'lump_sum', label: 'Lump Sum (one payment)' },
          { value: 'monthly', label: 'Monthly' },
          { value: 'weekly', label: 'Weekly' },
          { value: 'custom', label: 'Custom' },
        ]}
        {...register('repaymentSchedule')}
      />

      <Input label="Notes (optional)" {...register('notes')} />

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" loading={isSubmitting} className="flex-1">{existing ? 'Update' : 'Add'} Loan</Button>
      </div>
    </form>
  );
}
