import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { db } from '../../db/db';
import { formatGHS, toStorageAmount } from '../../utils/currency';
import { formatDate, todayISO } from '../../utils/dateHelpers';
import { usePaymentsFor } from '../../hooks/useReceivables';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { Receivable, Payable } from '../../types';

interface Props {
  parentType: 'receivable' | 'payable';
  parent: Receivable | Payable;
}

interface PaymentForm { amount: string; date: string; notes?: string; }

export function PaymentHistoryDrawer({ parentType, parent }: Props) {
  const payments = usePaymentsFor(parentType, parent.id!) ?? [];
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<PaymentForm>({
    defaultValues: { date: todayISO() },
  });

  async function onSubmit(data: PaymentForm) {
    const amount = toStorageAmount(data.amount);
    const now = new Date();
    await db.payments.add({
      parentType,
      parentId: parent.id!,
      amount,
      date: new Date(data.date),
      notes: data.notes || undefined,
      createdAt: now,
    });
    const newPaid = parent.amountPaid + amount;
    const status = newPaid >= parent.originalAmount ? 'paid' : 'partial';
    if (parentType === 'receivable') {
      await db.receivables.update(parent.id!, { amountPaid: newPaid, status, updatedAt: now });
    } else {
      await db.payables.update(parent.id!, { amountPaid: newPaid, status, updatedAt: now });
    }
    reset({ date: todayISO() });
    setShowForm(false);
  }

  const outstanding = parent.originalAmount - parent.amountPaid;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-slate-500">Outstanding</p>
          <p className="font-semibold text-slate-900">{formatGHS(outstanding)}</p>
        </div>
        {outstanding > 0 && (
          <Button size="sm" onClick={() => setShowForm(s => !s)}>
            {showForm ? 'Cancel' : 'Record Payment'}
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-slate-50 rounded-lg p-4 mb-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Amount (GHS)" type="number" step="0.01" min="0" prefix="GHS" {...register('amount', { required: true })} />
            <Input label="Date" type="date" {...register('date', { required: true })} />
          </div>
          <Input label="Notes (optional)" {...register('notes')} />
          <Button type="submit" loading={isSubmitting} size="sm">Save Payment</Button>
        </form>
      )}

      <div className="space-y-2">
        {payments.length === 0 ? (
          <p className="text-slate-400 text-sm py-4 text-center">No payments recorded yet.</p>
        ) : (
          payments.map(p => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-900">{formatGHS(p.amount)}</p>
                {p.notes && <p className="text-xs text-slate-500">{p.notes}</p>}
              </div>
              <p className="text-xs text-slate-400">{formatDate(p.date)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
