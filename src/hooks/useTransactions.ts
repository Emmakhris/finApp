import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/apiClient';
import type { AccountType, TransactionType, Transaction, Category } from '../types';

export function useTransactions(filters?: {
  accountType?: AccountType | 'all';
  type?: TransactionType;
  from?: Date;
  to?: Date;
}) {
  const params = new URLSearchParams();
  if (filters?.accountType && filters.accountType !== 'all') params.set('accountType', filters.accountType);
  if (filters?.type) params.set('type', filters.type);
  if (filters?.from) params.set('from', filters.from.toISOString());
  if (filters?.to) params.set('to', filters.to.toISOString());

  const { data } = useQuery<Transaction[]>({
    queryKey: ['transactions', filters?.accountType, filters?.type, filters?.from?.toISOString(), filters?.to?.toISOString()],
    queryFn: () => apiFetch<Transaction[]>(`/transactions?${params}`),
  });
  return data;
}

export function useCategories() {
  const { data } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => apiFetch<Category[]>('/categories'),
  });
  return data;
}

export function useAddTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiFetch('/transactions', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Transaction> & { id: number }) =>
      apiFetch(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiFetch(`/transactions/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useAddCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Category, 'id'>) =>
      apiFetch('/categories', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiFetch(`/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}
