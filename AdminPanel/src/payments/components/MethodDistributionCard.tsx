import React from 'react';
import type { MethodDistributionItem } from '../types';

interface MethodDistributionCardProps {
  distribution?: MethodDistributionItem[];
}

export const MethodDistributionCard: React.FC<MethodDistributionCardProps> = ({
  distribution = [],
}) => {
  // SVG Donut Calculations
  const size = 180;
  const strokeWidth = 24;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  const defaultItems: MethodDistributionItem[] = [
    { method: 'UPI', percentage: 60, color: '#1E40AF', amount: '₹0', count: 0 },
    { method: 'Card', percentage: 25, color: '#06B6D4', amount: '₹0', count: 0 },
    { method: 'Net Banking', percentage: 15, color: '#818CF8', amount: '₹0', count: 0 },
  ];

  const items = distribution.length > 0 ? distribution : defaultItems;
  const topMethod = items[0] || defaultItems[0];

  // Compute SVG offsets
  let accumulatedPercent = 0;
  const slices = items.map((item) => {
    const strokeLen = (item.percentage / 100) * circumference;
    const offset = -(accumulatedPercent / 100) * circumference;
    accumulatedPercent += item.percentage;
    return {
      ...item,
      strokeLen,
      offset,
    };
  });

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-xs flex flex-col justify-between h-full">
      {/* Card Header */}
      <div className="mb-2">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Method Distribution
        </h3>
      </div>

      {/* Donut Chart Area */}
      <div className="relative flex items-center justify-center my-4">
        <svg width={size} height={size} className="transform -rotate-90">
          {slices.map((slice, idx) => (
            <circle
              key={idx}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${Math.max(0, slice.strokeLen - 4)} ${circumference - Math.max(0, slice.strokeLen - 4)}`}
              strokeDashoffset={slice.offset}
              strokeLinecap="round"
              className="transition-all duration-500 hover:opacity-90 cursor-pointer"
            />
          ))}
        </svg>

        {/* Inner Donut Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-2xl font-extrabold text-slate-900 leading-tight">
            {topMethod.percentage}%
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {topMethod.method} Dominance
          </span>
        </div>
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-around border-t border-slate-50 pt-4 text-center">
        {items.slice(0, 3).map((item, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <div className="h-6 w-px bg-slate-100" />}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                {item.method}
              </div>
              <div className="text-xs font-bold" style={{ color: item.color }}>
                {item.percentage}%
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

