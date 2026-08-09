import React, { type InputHTMLAttributes } from 'react';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  containerClassName?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  id,
  checked,
  onChange,
  containerClassName = '',
  className = '',
  ...props
}) => {
  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors ${containerClassName}`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={`w-4 h-4 rounded border-slate-300 text-[#0b419c] focus:ring-[#0b419c] focus:ring-offset-0 cursor-pointer accent-[#0b419c] ${className}`}
        {...props}
      />
      {label && <span>{label}</span>}
    </label>
  );
};
