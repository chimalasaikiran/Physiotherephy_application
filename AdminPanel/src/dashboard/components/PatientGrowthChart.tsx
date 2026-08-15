import React, { useState } from 'react';
import { ChevronDown, TrendingUp } from 'lucide-react';
import type { RevenueTrendPoint } from '../useDashboardData';

interface RevenueTrendGraphProps {
  getRevenueTrend?: (timeframe: string) => RevenueTrendPoint[];
}

export const PatientGrowthChart: React.FC<RevenueTrendGraphProps> = ({
  getRevenueTrend,
}) => {
  const [timeframe, setTimeframe] = useState('Last 30 Days');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const rawData = getRevenueTrend ? getRevenueTrend(timeframe) : [];

  const displayData = rawData.length > 0
    ? rawData
    : [
        { label: 'WK 1', netRevenue: 0, paymentsCount: 0 },
        { label: 'WK 2', netRevenue: 0, paymentsCount: 0 },
        { label: 'WK 3', netRevenue: 0, paymentsCount: 0 },
        { label: 'WK 4', netRevenue: 0, paymentsCount: 0 },
      ];

  const maxVal = Math.max(1000, ...displayData.map((d) => d.netRevenue));
  const chartHeight = 150;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center space-x-2">
          <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            Revenue Trend
          </h4>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100">
            <TrendingUp className="w-2.5 h-2.5 mr-1" />
            Paid Net
          </span>
        </div>

        <div className="relative">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="appearance-none bg-slate-50 border border-slate-100 text-slate-700 text-xs font-semibold py-1.5 pl-3 pr-7 rounded-lg focus:outline-none cursor-pointer"
          >
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>This Quarter</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Bar Chart Display */}
      <div className="relative w-full flex items-end justify-between pt-6 pb-2 px-2 sm:px-4">
        {displayData.map((item, index) => {
          const barHeight = Math.max(8, (item.netRevenue / maxVal) * chartHeight);
          const isHovered = hoveredIdx === index;

          return (
            <div
              key={index}
              className="flex flex-col items-center group cursor-pointer relative flex-1 max-w-[56px]"
              onMouseEnter={() => setHoveredIdx(index)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip on Hover */}
              {isHovered && (
                <div className="absolute -top-14 z-20 bg-slate-900 text-white text-[11px] py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap animate-in fade-in duration-100 pointer-events-none text-center">
                  <p className="font-bold text-slate-200">{item.label}</p>
                  <p className="text-teal-300 font-extrabold">₹{item.netRevenue.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-slate-400">{item.paymentsCount} Transactions</p>
                </div>
              )}

              {/* Bar */}
              <div className="w-7 sm:w-9 flex flex-col items-center justify-end rounded-t-lg overflow-hidden transition-transform duration-200 group-hover:scale-105">
                <div
                  style={{ height: `${barHeight}px` }}
                  className="w-full bg-gradient-to-t from-blue-700 to-indigo-500 rounded-t-lg transition-all duration-300 group-hover:from-blue-600 group-hover:to-indigo-400 shadow-xs"
                />
              </div>

              {/* X Axis Month Label */}
              <span className="mt-3 text-[10px] sm:text-xs font-semibold text-slate-400 group-hover:text-slate-900 transition-colors uppercase">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
