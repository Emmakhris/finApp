import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/apiClient';
import type { DashboardSummary, MonthlyData } from '../types';

export function useDashboardSummary(accountFilter: 'all' | 'personal' | 'business'): DashboardSummary | undefined {
  const params = accountFilter !== 'all' ? `?accountType=${accountFilter}` : '';
  const { data } = useQuery<DashboardSummary>({
    queryKey: ['dashboard', 'summary', accountFilter],
    queryFn: () => apiFetch<DashboardSummary>(`/dashboard/summary${params}`),
    staleTime: 0,
  });
  return data;
}

export function useMonthlyChartData(accountFilter: 'all' | 'personal' | 'business' = 'all'): MonthlyData[] | undefined {
  const params = accountFilter !== 'all' ? `?accountType=${accountFilter}` : '';
  const { data } = useQuery<MonthlyData[]>({
    queryKey: ['dashboard', 'monthly-chart', accountFilter],
    queryFn: () => apiFetch<MonthlyData[]>(`/dashboard/monthly-chart${params}`),
    staleTime: 0,
  });
  return data;
}
