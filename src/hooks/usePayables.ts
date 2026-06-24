import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/apiClient';
import type { AccountType, Payable } from '../types';

export function usePayables(accountType?: AccountType | 'all') {
  const params = accountType && accountType !== 'all' ? `?accountType=${accountType}` : '';
  const { data } = useQuery<Payable[]>({
    queryKey: ['payables', accountType],
    queryFn: () => apiFetch<Payable[]>(`/payables${params}`),
  });
  return data;
}

export function usePayable(id: number) {
  const { data } = useQuery<Payable>({
    queryKey: ['payables', id],
    queryFn: () => apiFetch<Payable>(`/payables/${id}`),
  });
  return data;
}

export function useAddPayable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Payable, 'id' | 'amountPaid' | 'status' | 'createdAt' | 'updatedAt'>) =>
      apiFetch('/payables', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payables'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdatePayable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Payable> & { id: number }) =>
      apiFetch(`/payables/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payables'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeletePayable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiFetch(`/payables/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payables'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
