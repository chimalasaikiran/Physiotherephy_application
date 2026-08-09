import React from 'react';
import { AUTH_CONFIG } from '../config/authConfig';

export const AuthFooter: React.FC = () => {
  return (
    <footer className="mt-auto pt-10">
      <div className="flex items-center gap-6 sm:gap-8 text-xs font-semibold text-slate-400">
        {AUTH_CONFIG.footerLinks.map((link) => (
          <a
            key={link.id}
            href={link.href}
            className="hover:text-slate-600 transition-colors focus:outline-none focus:ring-1 focus:ring-slate-300 rounded px-1"
          >
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  );
};
