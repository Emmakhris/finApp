import { useForm } from 'react-hook-form';
import { Investment, InvestmentType, AccountType } from '../../types';
import { toStorageAmount, fromStorageAmount } from '../../utils/currency';
import { todayISO } from '../../utils/dateHelpers';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useAddInvestment, useUpdateInvestment } from '../../hooks/useInvestments';

interface FormValues {
  name: string;
  investmentType: InvestmentType;
  accountType: AccountType;
  amountInvested: string;
  currentValue: string;
  purchaseDate: string;
  maturityDate: string;
  description: string;
  notes: string;
  status: string;
}

interface Props {
  investment?: Investment;
  onClose: () => void;
}

const typeOptions = [
  { value: 'stock',       label: 'Stock / Equity' },
  { value: 'bond',        label: 'Bond / Fixed Income' },
  { value: 'mutual_fund', label: 'Mutual Fund' },
  { value: 'crypto',      label: 'Cryptocurrency' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'other',       label: 'Other' },
];

const accountOptions = [
  { value: 'personal', label: 'Personal' },
  { value: 'business', label: 'Business' },
];

const statusOptions = [
  { value: 'active',  label: 'Active' },
  { value: 'exited',  label: 'Exited' },
  { value: 'matured', label: 'Matured' },
];

export function InvestmentForm({ investment, onClose }: Props) {
  const add = useAddInvestment();
  const update = useUpdateInvestment();
  const isEdit = !!investment?.id;

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: investment ? {
      name: investment.name,
      investmentType: investment.investmentType,
      accountType: investment.accountType,
      amountInvested: fromStorageAmount(investment.amountInvested),
      currentValue: fromStorageAmount(investment.currentValue),
      purchaseDate: new Date(investment.purchaseDate).toISOString().split('T')[0],
      maturityDate: investment.maturityDate ? new Date(investment.maturityDate).toISOString().split('T')[0] : '',
      description: investment.description || '',
      notes: investment.notes || '',
      status: investment.status,
    } : {
      investmentType: 'stock',
      accountType: 'personal',
      purchaseDate: todayISO(),
      status: 'active',
    },
  });

  async function onSubmit(vals: FormValues) {
    const payload: any = {
      name: vals.name,
      investmentType: vals.investmentType,
      accountType: vals.accountType,
      amountInvested: toStorageAmount(vals.amountInvested),
      currentValue: vals.currentValue ? toStorageAmount(vals.currentValue) : toStorageAmount(vals.amountInvested),
      purchaseDate: vals.purchaseDate,
      maturityDate: vals.maturityDate || undefined,
      description: vals.description || undefined,
      notes: vals.notes || undefined,
      status: vals.status,
    };

    if (isEdit) {
      await update.mutateAsync({ id: investment!.id!, ...payload });
    } else {
      await add.mutateAsync(payload);
    }
    onClose();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Investment Name"
        placeholder="e.g. MTN Ghana Shares"
        error={errors.name?.message}
        {...register('name', { required: 'Name is required' })}
      />

      <div className="grid grid-cols-2 gap-3">
        <Select label="Type" options={typeOptions} {...register('investmentType', { required: true })} />
        <Select label="Account" options={accountOptions} {...register('accountType', { required: true })} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Amount Invested (GHS)"
          type="number" step="0.01" min="0" placeholder="0.00"
          error={errors.amountInvested?.message}
          {...register('amountInvested', { required: 'Required' })}
        />
        <Input
          label="Current Value (GHS)"
          type="number" step="0.01" min="0" placeholder="0.00"
          {...register('currentValue')}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Purchase Date" type="date" {...register('purchaseDate', { required: true })} />
        <Input label="Maturity Date (optional)" type="date" {...register('maturityDate')} />
      </div>

      <Input label="Description (optional)" placeholder="Brief description" {...register('description')} />

      {isEdit && (
        <Select label="Status" options={statusOptions} {...register('status')} />
      )}

      <Input label="Notes (optional)" placeholder="Any additional notes" {...register('notes')} />

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={add.isPending || update.isPending}>
          {isEdit ? 'Save Changes' : 'Add Investment'}
        </Button>
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  );
}
