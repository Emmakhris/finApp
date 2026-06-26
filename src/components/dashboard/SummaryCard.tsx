import { LucideIcon } from 'lucide-react';
import { formatGHS } from '../../utils/currency';

interface Props {
  label: string;
  value: number;
  icon: LucideIcon;
  variant: 'income' | 'expense' | 'neutral' | 'warning' | 'indigo' | 'purple';
  subtitle?: string;
}

const variantStyles = {
  income:  { bg: 'from-emerald-500 to-emerald-600', icon: 'bg-white/20', text: 'text-white' },
  expense: { bg: 'from-rose-500 to-rose-600',       icon: 'bg-white/20', text: 'text-white' },
  neutral: { bg: 'from-slate-600 to-slate-700',     icon: 'bg-white/20', text: 'text-white' },
  warning: { bg: 'from-amber-400 to-amber-500',     icon: 'bg-white/20', text: 'text-white' },
  indigo:  { bg: 'from-indigo-500 to-indigo-600',   icon: 'bg-white/20', text: 'text-white' },
  purple:  { bg: 'from-purple-500 to-purple-600',   icon: 'bg-white/20', text: 'text-white' },
};

export function SummaryCard({ label, value, icon: Icon, variant, subtitle }: Props) {
  const s = variantStyles[variant];
  return (
    <div className={`bg-gradient-to-br ${s.bg} rounded-xl p-4 shadow-sm`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${s.icon} flex items-center justify-center`}>
          <Icon size={17} className="text-white" />
        </div>
      </div>
      <p className="text-xs text-white/70 mb-1">{label}</p>
      <p className="text-lg font-bold text-white truncate">{formatGHS(value)}</p>
      {subtitle && <p className="text-xs text-white/60 mt-0.5">{subtitle}</p>}
    </div>
  );
}
