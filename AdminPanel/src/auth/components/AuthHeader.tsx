import React from 'react';
import { Logo } from '@/components/ui/Logo';
import { AUTH_CONFIG } from '../config/authConfig';

interface AuthHeaderProps {
  title?: string;
  subtitle?: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title = AUTH_CONFIG.title,
  subtitle = AUTH_CONFIG.subtitle,
}) => {
  return (
    <div className="flex flex-col gap-8 sm:gap-10 w-full mb-8">
      {/* Brand Header */}
      <div className="flex items-center gap-3">
        <Logo size="md" />
        <div className="flex flex-col">
          <span className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">
            {AUTH_CONFIG.brandName}
          </span>
          <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-1">
            {AUTH_CONFIG.platformSubtitle}
          </span>
        </div>
      </div>

      {/* Page Title & Subtitle */}
      <div className="flex flex-col gap-2.5">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {title}
        </h1>
        <p className="text-sm sm:text-base text-slate-500 font-normal leading-relaxed max-w-md">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

