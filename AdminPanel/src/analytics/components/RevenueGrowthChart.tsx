import React from 'react';

export const RevenueGrowthChart: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between h-full min-h-[280px]">
      <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">
        Revenue Growth
      </h3>

      {/* SVG Smooth Area Line Chart */}
      <div className="relative my-3 h-28 w-full flex items-end">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path
            d="M 0,90 Q 60,85 120,60 T 240,40 T 300,10 L 300,100 L 0,100 Z"
            fill="url(#emeraldGradient)"
          />

          {/* Curve Line */}
          <path
            d="M 0,90 Q 60,85 120,60 T 240,40 T 300,10"
            fill="none"
            stroke="#10B981"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Highlighting End Point Dot */}
          <circle cx="300" cy="10" r="4.5" fill="#10B981" className="animate-pulse" />
        </svg>
      </div>

      {/* Footer Details */}
      <div className="flex items-end justify-between pt-2">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Projected (Q4)
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5 block">
            ₹24.5L
          </span>
        </div>

        <div className="flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg text-xs font-bold">
          <span>~14%</span>
          <svg className="w-3.5 h-3.5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        </div>
      </div>
    </div>
  );
};
