import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useMonthlyChartData } from '../../hooks/useDashboardSummary';

export function CashFlowChart() {
  const data = useMonthlyChartData() ?? [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h2 className="font-semibold text-slate-900 mb-4">Cash Flow — Last 6 Months</h2>
      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `GHS ${Number(v).toLocaleString('en-GH')}`} />
            <Tooltip
              formatter={(value, name) => [`GHS ${Number(value).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, String(name)]}
              contentStyle={{ border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: 12 }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={false} name="Income" />
            <Line type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} dot={false} name="Expenses" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
