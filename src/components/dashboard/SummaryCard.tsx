import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { formatGHS } from '../../utils/currency';

interface Props {
  label: string;
  value: number;
  icon: LucideIcon;
  variant: 'income' | 'expense' | 'neutral' | 'warning' | 'indigo';
  subtitle?: string;
}

const variantStyles = {
  income:  { card: 'border-emerald-100', icon: 'bg-emerald-50 text-emerald-600', value: 'text-emerald-600' },
  expense: { card: 'border-rose-100',    icon: 'bg-rose-50 text-rose-600',       value: 'text-rose-600' },
  neutral: { card: 'border-slate-200',   icon: 'bg-slate-100 text-slate-600',    value: 'text-slate-900' },
  warning: { card: 'border-amber-100',   icon: 'bg-amber-50 text-amber-600',     value: 'text-amber-700' },
  indigo:  { card: 'border-indigo-100',  icon: 'bg-indigo-50 text-indigo-600',   value: 'text-indigo-700' },
};

export function SummaryCard({ label, value, icon: Icon, variant, subtitle }: Props) {
  const s = variantStyles[variant];
  return (
    <div className={`bg-white rounded-xl border ${s.card} p-5 flex items-start gap-4`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${s.icon}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 mb-1">{label}</p>
        <p className={`text-lg font-bold truncate ${s.value}`}>{formatGHS(value)}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
