import { useForm } from 'react-hook-form';
import { todayISO } from '../../utils/dateHelpers';
import { toStorageAmount } from '../../utils/currency';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAddInvestmentUpdate } from '../../hooks/useInvestments';

interface Props {
  investmentId: number;
  onClose: () => void;
}

interface FormValues {
  value: string;
  date: string;
  notes: string;
}

export function ValueUpdateForm({ investmentId, onClose }: Props) {
  const add = useAddInvestmentUpdate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: { date: todayISO() },
  });

  async function onSubmit(vals: FormValues) {
    await add.mutateAsync({
      investmentId,
      value: toStorageAmount(vals.value),
      date: vals.date,
      notes: vals.notes || undefined,
    });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Current Value (GHS)"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        error={errors.value?.message}
        {...register('value', { required: 'Value is required' })}
      />
      <Input label="Date" type="date" {...register('date', { required: true })} />
      <Input label="Notes (optional)" placeholder="e.g. Q2 valuation" {...register('notes')} />
      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={add.isPending}>Record Value</Button>
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  );
}
