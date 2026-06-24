import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/apiClient';
import type { DashboardSummary, MonthlyData } from '../types';

export function useDashboardSummary(month: Date, accountFilter: 'all' | 'personal' | 'business'): DashboardSummary | undefined {
  const monthStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-01`;
  const params = new URLSearchParams({ month: monthStr });
  if (accountFilter !== 'all') params.set('accountType', accountFilter);

  const { data } = useQuery<DashboardSummary>({
    queryKey: ['dashboard', 'summary', monthStr, accountFilter],
    queryFn: () => apiFetch<DashboardSummary>(`/dashboard/summary?${params}`),
  });
  return data;
}

export function useMonthlyChartData(accountFilter: 'all' | 'personal' | 'business' = 'all'): MonthlyData[] | undefined {
  const params = accountFilter !== 'all' ? `?accountType=${accountFilter}` : '';
  const { data } = useQuery<MonthlyData[]>({
    queryKey: ['dashboard', 'monthly-chart', accountFilter],
    queryFn: () => apiFetch<MonthlyData[]>(`/dashboard/monthly-chart${params}`),
  });
  return data;
}
