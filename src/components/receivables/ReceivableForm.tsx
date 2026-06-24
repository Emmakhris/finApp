import { useForm } from 'react-hook-form';
import { useAddReceivable, useUpdateReceivable } from '../../hooks/useReceivables';
import { toStorageAmount, fromStorageAmount } from '../../utils/currency';
import { todayISO } from '../../utils/dateHelpers';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import type { Receivable } from '../../types';

interface FormData {
  contactName: string;
  description: string;
  amount: string;
  dueDate: string;
  accountType: 'personal' | 'business';
  notes?: string;
}

interface Props { onClose: () => void; existing?: Receivable; }

export function ReceivableForm({ onClose, existing }: Props) {
  const addReceivable = useAddReceivable();
  const updateReceivable = useUpdateReceivable();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: existing ? {
      contactName: existing.contactName,
      description: existing.description,
      amount: fromStorageAmount(existing.originalAmount),
      dueDate: new Date(existing.dueDate).toISOString().slice(0, 10),
      accountType: existing.accountType,
      notes: existing.notes,
    } : { dueDate: todayISO(), accountType: 'personal' },
  });

  async function onSubmit(data: FormData) {
    const payload = {
      contactName: data.contactName,
      description: data.description,
      originalAmount: toStorageAmount(data.amount),
      dueDate: data.dueDate,
      accountType: data.accountType,
      notes: data.notes || undefined,
    };
    if (existing?.id) {
      await updateReceivable.mutateAsync({ id: existing.id, ...payload } as any);
    } else {
      await addReceivable.mutateAsync(payload as any);
    }
    onClose();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Contact Name" placeholder="Who owes you?" {...register('contactName', { required: 'Required' })} error={errors.contactName?.message} />
        <Input label="Amount (GHS)" type="number" step="0.01" min="0" prefix="GHS" {...register('amount', { required: 'Required' })} error={errors.amount?.message} />
      </div>
      <Input label="Description" placeholder="What is this for?" {...register('description', { required: 'Required' })} error={errors.description?.message} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Due Date" type="date" {...register('dueDate', { required: 'Required' })} error={errors.dueDate?.message} />
        <Select label="Account" options={[{ value: 'personal', label: 'Personal' }, { value: 'business', label: 'Business' }]} {...register('accountType')} />
      </div>
      <Input label="Notes (optional)" placeholder="Any additional notes..." {...register('notes')} />
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" loading={isSubmitting} className="flex-1">{existing ? 'Update' : 'Add'} Receivable</Button>
      </div>
    </form>
  );
}
