import React, { useState } from 'react';
import type { RevenueTrendPoint } from '../types';

interface RevenueTrendChartProps {
  data?: RevenueTrendPoint[];
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({ data = [] }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const displayData = data.length > 0 ? data : [
    { label: 'Week 1', netRevenue: 45, payouts: 30 },
    { label: 'Week 2', netRevenue: 60, payouts: 40 },
    { label: 'Week 3', netRevenue: 75, payouts: 55 },
    { label: 'Week 4', netRevenue: 90, payouts: 65 },
  ];

  const maxVal = Math.max(
    10,
    ...displayData.map((d) => Math.max(d.netRevenue, d.payouts))
  ) * 1.2;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-xs flex flex-col justify-between h-full">
      {/* Header with Title and Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Revenue Trend
          </h3>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-xs font-semibold">
          <div className="flex items-center space-x-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-900" />
            <span>Net Revenue</span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>Payouts</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative pt-6 pb-2">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
          {[100, 75, 50, 25, 0].map((val) => (
            <div key={val} className="border-b border-slate-100 w-full h-0" />
          ))}
        </div>

        {/* Bars Container */}
        <div className="relative z-10 flex items-end justify-between px-2 sm:px-6 h-56">
          {displayData.map((item, idx) => {
            const netHeightPercent = Math.min(100, (item.netRevenue / maxVal) * 100);
            const payoutHeightPercent = Math.min(100, (item.payouts / maxVal) * 100);
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={idx}
                className="flex flex-col items-center group relative cursor-pointer flex-1 max-w-[72px]"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Tooltip on Hover */}
                {isHovered && (
                  <div className="absolute -top-14 z-30 bg-slate-900 text-white text-[11px] font-medium py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap animate-fade-in pointer-events-none">
                    <div className="font-bold text-slate-200">{item.label}</div>
                    <div className="flex items-center justify-between gap-3 text-[10px]">
                      <span className="text-blue-300">Net: ₹{Math.round(item.netRevenue * 1000).toLocaleString('en-IN')}</span>
                      <span className="text-cyan-300">Payout: ₹{Math.round(item.payouts * 1000).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}

                {/* Bars group */}
                <div className="w-full flex items-end justify-center space-x-1 sm:space-x-1.5 h-44">
                  {/* Payout Bar (Cyan) */}
                  <div
                    className="w-1/2 rounded-t-sm bg-blue-100 hover:bg-blue-200 transition-all duration-300 relative"
                    style={{ height: `${Math.max(4, payoutHeightPercent)}%` }}
                  >
                    <div className="absolute inset-0 bg-cyan-400 opacity-30 rounded-t-sm" />
                  </div>

                  {/* Net Revenue Bar (Dark Blue) */}
                  <div
                    className="w-1/2 rounded-t-sm bg-blue-800 hover:bg-blue-900 transition-all duration-300 shadow-xs"
                    style={{ height: `${Math.max(4, netHeightPercent)}%` }}
                  >
                    <div className="w-full h-1 bg-blue-400 rounded-t-sm" />
                  </div>
                </div>

                {/* X-Axis Date Label */}
                <span className="mt-3 text-[10px] sm:text-xs font-bold text-slate-400 tracking-wider">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

