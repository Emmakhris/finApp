import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/apiClient';
import type { AccountType, Receivable, Payment } from '../types';

export function useReceivables(accountType?: AccountType | 'all') {
  const params = accountType && accountType !== 'all' ? `?accountType=${accountType}` : '';
  const { data } = useQuery<Receivable[]>({
    queryKey: ['receivables', accountType],
    queryFn: () => apiFetch<Receivable[]>(`/receivables${params}`),
  });
  return data;
}

export function useReceivable(id: number) {
  const { data } = useQuery<Receivable>({
    queryKey: ['receivables', id],
    queryFn: () => apiFetch<Receivable>(`/receivables/${id}`),
  });
  return data;
}

export function usePaymentsFor(parentType: 'receivable' | 'payable', parentId: number) {
  const { data } = useQuery<Payment[]>({
    queryKey: ['payments', parentType, parentId],
    queryFn: () => apiFetch<Payment[]>(`/payments?parentType=${parentType}&parentId=${parentId}`),
    enabled: parentId > 0,
  });
  return data;
}

export function useAddReceivable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Receivable, 'id' | 'amountPaid' | 'status' | 'createdAt' | 'updatedAt'>) =>
      apiFetch('/receivables', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['receivables'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateReceivable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Receivable> & { id: number }) =>
      apiFetch(`/receivables/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['receivables'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteReceivable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiFetch(`/receivables/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['receivables'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useAddPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { parentType: 'receivable' | 'payable'; parentId: number; amount: number; date: string; notes?: string }) =>
      apiFetch('/payments', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['payments', variables.parentType, variables.parentId] });
      qc.invalidateQueries({ queryKey: ['receivables'] });
      qc.invalidateQueries({ queryKey: ['payables'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
