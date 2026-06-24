import { useForm } from 'react-hook-form';
import { useAddPayable, useUpdatePayable } from '../../hooks/usePayables';
import { toStorageAmount, fromStorageAmount } from '../../utils/currency';
import { todayISO } from '../../utils/dateHelpers';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import type { Payable } from '../../types';

interface FormData {
  creditorName: string;
  description: string;
  amount: string;
  dueDate: string;
  accountType: 'personal' | 'business';
  notes?: string;
}

interface Props { onClose: () => void; existing?: Payable; }

export function PayableForm({ onClose, existing }: Props) {
  const addPayable = useAddPayable();
  const updatePayable = useUpdatePayable();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: existing ? {
      creditorName: existing.creditorName,
      description: existing.description,
      amount: fromStorageAmount(existing.originalAmount),
      dueDate: new Date(existing.dueDate).toISOString().slice(0, 10),
      accountType: existing.accountType,
      notes: existing.notes,
    } : { dueDate: todayISO(), accountType: 'personal' },
  });

  async function onSubmit(data: FormData) {
    const payload = {
      creditorName: data.creditorName,
      description: data.description,
      originalAmount: toStorageAmount(data.amount),
      dueDate: data.dueDate,
      accountType: data.accountType,
      notes: data.notes || undefined,
    };
    if (existing?.id) {
      await updatePayable.mutateAsync({ id: existing.id, ...payload } as any);
    } else {
      await addPayable.mutateAsync(payload as any);
    }
    onClose();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Creditor Name" placeholder="Who do you owe?" {...register('creditorName', { required: 'Required' })} error={errors.creditorName?.message} />
        <Input label="Amount (GHS)" type="number" step="0.01" min="0" prefix="GHS" {...register('amount', { required: 'Required' })} error={errors.amount?.message} />
      </div>
      <Input label="Description" placeholder="What is this for?" {...register('description', { required: 'Required' })} error={errors.description?.message} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Due Date" type="date" {...register('dueDate', { required: 'Required' })} error={errors.dueDate?.message} />
        <Select label="Account" options={[{ value: 'personal', label: 'Personal' }, { value: 'business', label: 'Business' }]} {...register('accountType')} />
      </div>
      <Input label="Notes (optional)" {...register('notes')} />
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" loading={isSubmitting} className="flex-1">{existing ? 'Update' : 'Add'} Payable</Button>
      </div>
    </form>
  );
}
