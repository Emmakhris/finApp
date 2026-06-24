import { useForm } from 'react-hook-form';
import { toStorageAmount, fromStorageAmount } from '../../utils/currency';
import { todayISO } from '../../utils/dateHelpers';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useCategories, useAddTransaction, useUpdateTransaction } from '../../hooks/useTransactions';
import type { Transaction } from '../../types';

interface FormData {
  date: string;
  type: 'income' | 'expense';
  amount: string;
  description: string;
  categoryId: string;
  accountType: 'personal' | 'business';
  source?: string;
}

interface Props {
  onClose: () => void;
  existing?: Transaction;
}

export function TransactionForm({ onClose, existing }: Props) {
  const categories = useCategories() ?? [];
  const addTransaction = useAddTransaction();
  const updateTransaction = useUpdateTransaction();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: existing ? {
      date: new Date(existing.date).toISOString().slice(0, 10),
      type: existing.type,
      amount: fromStorageAmount(existing.amount),
      description: existing.description,
      categoryId: String(existing.categoryId),
      accountType: existing.accountType,
      source: existing.source,
    } : {
      date: todayISO(),
      type: 'income',
      accountType: 'personal',
    },
  });

  const type = watch('type');
  const accountType = watch('accountType');

  const filteredCats = categories.filter(c =>
    c.type === type && (c.accountType === accountType || c.accountType === 'both')
  );

  async function onSubmit(data: FormData) {
    const payload = {
      date: data.date,
      type: data.type,
      amount: toStorageAmount(data.amount),
      description: data.description,
      categoryId: Number(data.categoryId),
      accountType: data.accountType,
      source: data.source || undefined,
    };
    if (existing?.id) {
      await updateTransaction.mutateAsync({ id: existing.id, ...payload } as any);
    } else {
      await addTransaction.mutateAsync(payload as any);
    }
    onClose();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-medium text-slate-600 mb-1">Type</p>
          <div className="flex gap-2">
            {(['income', 'expense'] as const).map(t => (
              <label key={t} className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border cursor-pointer text-sm font-medium transition-colors ${watch('type') === t ? (t === 'income' ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-rose-50 border-rose-400 text-rose-700') : 'border-slate-300 text-slate-500'}`}>
                <input type="radio" value={t} {...register('type')} className="sr-only" />
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </label>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-600 mb-1">Account</p>
          <div className="flex gap-2">
            {(['personal', 'business'] as const).map(a => (
              <label key={a} className={`flex-1 flex items-center justify-center py-2 px-3 rounded-lg border cursor-pointer text-sm font-medium transition-colors ${watch('accountType') === a ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'border-slate-300 text-slate-500'}`}>
                <input type="radio" value={a} {...register('accountType')} className="sr-only" />
                {a.charAt(0).toUpperCase() + a.slice(1)}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Date" type="date" {...register('date', { required: 'Required' })} error={errors.date?.message} />
        <Input label="Amount (GHS)" type="number" step="0.01" min="0" placeholder="0.00" prefix="GHS" {...register('amount', { required: 'Required', min: { value: 0.01, message: 'Must be > 0' } })} error={errors.amount?.message} />
      </div>

      <Input label="Description" placeholder="What was this for?" {...register('description', { required: 'Required' })} error={errors.description?.message} />

      <Select
        label="Category"
        options={filteredCats.map(c => ({ value: c.id!, label: c.name }))}
        placeholder="Select category"
        {...register('categoryId', { required: 'Required' })}
        error={errors.categoryId?.message}
      />

      {type === 'income' && (
        <Input label="Income Source (optional)" placeholder="e.g. Salary, Client payment..." {...register('source')} />
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" loading={isSubmitting} className="flex-1">
          {existing ? 'Update' : 'Save'} Transaction
        </Button>
      </div>
    </form>
  );
}
