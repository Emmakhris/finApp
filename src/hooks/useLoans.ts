import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/apiClient';
import type { Loan, LoanRepayment } from '../types';

export function useLoans() {
  const { data } = useQuery<Loan[]>({
    queryKey: ['loans'],
    queryFn: () => apiFetch<Loan[]>('/loans'),
  });
  return data;
}

export function useLoan(id: number) {
  const { data } = useQuery<Loan>({
    queryKey: ['loans', id],
    queryFn: () => apiFetch<Loan>(`/loans/${id}`),
    enabled: id > 0,
  });
  return data;
}

export function useLoanRepayments(loanId: number) {
  const { data } = useQuery<LoanRepayment[]>({
    queryKey: ['loan-repayments', loanId],
    queryFn: () => apiFetch<LoanRepayment[]>(`/loan-repayments?loanId=${loanId}`),
    enabled: loanId > 0,
  });
  return data;
}

export function useAddLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Loan, 'id' | 'status' | 'totalRepaid' | 'createdAt' | 'updatedAt'>) =>
      apiFetch('/loans', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loans'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Loan> & { id: number }) =>
      apiFetch(`/loans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['loans'] }),
  });
}

export function useDeleteLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiFetch(`/loans/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loans'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useAddLoanRepayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { loanId: number; amount: number; date: string; notes?: string }) =>
      apiFetch('/loan-repayments', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['loan-repayments', variables.loanId] });
      qc.invalidateQueries({ queryKey: ['loans'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
