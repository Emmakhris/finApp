import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/apiClient';
import { Investment, InvestmentUpdate, InvestmentSummary } from '../types';

export function useInvestments(accountType?: string, status?: string) {
  const params = new URLSearchParams();
  if (accountType && accountType !== 'all') params.set('accountType', accountType);
  if (status && status !== 'all') params.set('status', status);
  const qs = params.toString();

  return useQuery<Investment[]>({
    queryKey: ['investments', accountType, status],
    queryFn: () => apiFetch(`/investments${qs ? `?${qs}` : ''}`),
  });
}

export function useInvestmentSummary(accountType?: string) {
  const params = new URLSearchParams();
  if (accountType && accountType !== 'all') params.set('accountType', accountType);
  return useQuery<InvestmentSummary>({
    queryKey: ['investments-summary', accountType],
    queryFn: () => apiFetch(`/investments/summary${params.toString() ? `?${params}` : ''}`),
  });
}

export function useInvestmentUpdates(investmentId: number) {
  return useQuery<InvestmentUpdate[]>({
    queryKey: ['investment-updates', investmentId],
    queryFn: () => apiFetch(`/investments/${investmentId}/value-updates`),
    enabled: !!investmentId,
  });
}

export function useAddInvestment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiFetch<Investment>('/investments', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['investments'] }),
  });
}

export function useUpdateInvestment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Investment> & { id: number }) =>
      apiFetch<Investment>(`/investments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['investments'] }),
  });
}

export function useDeleteInvestment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiFetch(`/investments/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['investments'] }),
  });
}

export function useAddInvestmentUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ investmentId, ...data }: { investmentId: number; value: number; date: string; notes?: string }) =>
      apiFetch<InvestmentUpdate>(`/investments/${investmentId}/value-updates`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['investment-updates', vars.investmentId] });
      qc.invalidateQueries({ queryKey: ['investments'] });
      qc.invalidateQueries({ queryKey: ['investments-summary'] });
    },
  });
}
