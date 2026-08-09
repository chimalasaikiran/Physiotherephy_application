import React from 'react';
import heroImage from '@/assets/auth-hero.jpg';
import { AUTH_CONFIG } from '../config/authConfig';

export const AuthHero: React.FC = () => {
  return (
    <div className="relative hidden lg:flex flex-col justify-between h-full min-h-screen p-8 lg:p-12 overflow-hidden bg-slate-900 select-none">
      {/* Background Image with smooth subtle overlay */}
      <img
        src={heroImage}
        alt={AUTH_CONFIG.heroImageAlt}
        className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-slate-950/20" />

      {/* Floating Status Pill Badge at Bottom Left */}
      <div className="relative z-10 mt-auto">
        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-[#0c1e3d]/85 backdrop-blur-md border border-white/15 shadow-2xl text-white text-[11px] font-bold tracking-wider uppercase">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
          </span>
          <span className="text-slate-100 font-mono tracking-widest">
            {AUTH_CONFIG.systemStatusText}
          </span>
        </div>
      </div>
    </div>
  );
};
