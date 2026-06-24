import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: string;
}

export function Input({ label, error, prefix, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-slate-600">
          {label}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm select-none">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          {...props}
          className={`w-full border rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${error ? 'border-rose-400 bg-rose-50' : 'border-slate-300 bg-white'} ${prefix ? 'pl-10' : ''} ${className}`}
        />
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
