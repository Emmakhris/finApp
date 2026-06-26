import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { useMonthlyChartData } from '../../hooks/useDashboardSummary';

export function CashFlowChart() {
  const data = useMonthlyChartData() ?? [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h2 className="font-semibold text-slate-900 mb-4">Cash Flow — Last 6 Months</h2>
      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `GHS ${Number(v).toLocaleString('en-GH')}`} />
            <Tooltip
              formatter={(value, name) => [`GHS ${Number(value).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, String(name)]}
              contentStyle={{ border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} fill="url(#incomeGrad)" name="Income" dot={false} />
            <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2.5} fill="url(#expenseGrad)" name="Expenses" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
