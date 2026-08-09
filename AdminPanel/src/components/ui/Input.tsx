import React, { type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  rightElement?: React.ReactNode;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  id,
  type = 'text',
  error,
  rightElement,
  className = '',
  containerClassName = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-slate-700 tracking-wide"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          id={id}
          type={type}
          className={`w-full px-4 py-3 text-sm text-slate-900 bg-[#f1f5fd] border ${
            error
              ? 'border-red-500 focus:ring-red-200'
              : 'border-slate-200/80 hover:border-slate-300 focus:border-[#0b419c] focus:ring-4 focus:ring-blue-500/10'
          } rounded-xl transition-all outline-none placeholder:text-slate-400 font-medium ${
            rightElement ? 'pr-11' : ''
          } ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3.5 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 font-medium mt-0.5">{error}</p>}
    </div>
  );
};
