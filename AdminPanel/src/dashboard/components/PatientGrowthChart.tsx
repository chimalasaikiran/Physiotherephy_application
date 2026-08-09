import React, { useState } from 'react';

export const PatientGrowthChart: React.FC = () => {
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  const monthsData = [
    { month: 'JAN', newPts: 22, returningPts: 18 },
    { month: 'FEB', newPts: 26, returningPts: 22 },
    { month: 'MAR', newPts: 30, returningPts: 25 },
    { month: 'APR', newPts: 24, returningPts: 16 },
    { month: 'MAY', newPts: 32, returningPts: 28 },
    { month: 'JUN', newPts: 35, returningPts: 30 },
  ];

  const maxTotal = 75;
  const chartHeight = 160;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between h-full">
      {/* Header with Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
          Patient Growth
        </h4>
        <div className="flex items-center space-x-4 text-xs font-semibold">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <span className="text-slate-600">New</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
            <span className="text-slate-600">Returning</span>
          </div>
        </div>
      </div>

      {/* Stacked Bar Chart Display */}
      <div className="relative w-full flex items-end justify-between pt-6 pb-2 px-2 sm:px-4">
        {monthsData.map((item, index) => {
          const newHeight = (item.newPts / maxTotal) * chartHeight;
          const retHeight = (item.returningPts / maxTotal) * chartHeight;
          const isHovered = hoveredMonth === index;

          return (
            <div
              key={item.month}
              className="flex flex-col items-center group cursor-pointer relative"
              onMouseEnter={() => setHoveredMonth(index)}
              onMouseLeave={() => setHoveredMonth(null)}
            >
              {/* Tooltip on Hover */}
              {isHovered && (
                <div className="absolute -top-12 z-20 bg-slate-900 text-white text-[11px] py-1 px-2.5 rounded-lg shadow-lg whitespace-nowrap animate-in fade-in zoom-in-95 duration-100">
                  <p className="font-bold">{item.month}</p>
                  <p>New: {item.newPts} | Returning: {item.returningPts}</p>
                </div>
              )}

              {/* Stacked Bar */}
              <div className="w-8 sm:w-10 flex flex-col items-center justify-end rounded-t-lg overflow-hidden transition-transform duration-200 group-hover:scale-105">
                {/* Returning Patients (Top Bar - Teal) */}
                <div
                  style={{ height: `${retHeight}px` }}
                  className="w-full bg-teal-600 rounded-t-lg transition-all duration-300 group-hover:bg-teal-500"
                />

                {/* New Patients (Bottom Bar - Dark Slate/Navy) */}
                <div
                  style={{ height: `${newHeight}px` }}
                  className="w-full bg-slate-900 transition-all duration-300 group-hover:bg-slate-800"
                />
              </div>

              {/* X Axis Month Label */}
              <span className="mt-3 text-[10px] sm:text-xs font-semibold text-slate-400 group-hover:text-slate-900 transition-colors">
                {item.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
