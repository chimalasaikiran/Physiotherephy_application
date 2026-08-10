import React from 'react';
import { mockRecoveryTrends } from '../mockData';

export const RecoveryTrendChart: React.FC = () => {
  const data = mockRecoveryTrends;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between h-full min-h-[300px]">
      {/* Card Header & Legend */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">
          Recovery Trend
        </h3>

        <div className="flex items-center space-x-4 text-xs font-bold text-slate-500">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0C3E6D]" />
            <span>Progress</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-300" />
            <span>Target</span>
          </div>
        </div>
      </div>

      {/* Bar Chart Area */}
      <div className="relative mt-8 mb-4 h-44 flex items-end justify-between px-2">
        {/* Dotted Target Guide Line */}
        <div className="absolute top-[35%] left-0 right-0 border-t-2 border-dashed border-slate-200 pointer-events-none z-0" />

        {/* Bars Container */}
        <div className="w-full flex items-end justify-around h-full z-10 space-x-4">
          {data.map((item) => {
            const targetHeight = `${item.target}%`;
            const progressHeight = `${item.progress}%`;

            return (
              <div
                key={item.week}
                className="flex-1 flex flex-col items-center h-full justify-end group"
              >
                {/* Dual Bars side-by-side or stacked style matching image */}
                <div className="w-full max-w-[80px] flex items-end justify-center space-x-1.5 h-full">
                  {/* Target Bar */}
                  <div
                    className="w-1/2 bg-blue-200/90 group-hover:bg-blue-300 rounded-t-md transition-all duration-300 relative"
                    style={{ height: targetHeight }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none transition-opacity">
                      {item.target}%
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div
                    className="w-1/2 bg-[#0C3E6D] group-hover:bg-blue-800 rounded-t-md transition-all duration-300 relative"
                    style={{ height: progressHeight }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none transition-opacity">
                      {item.progress}%
                    </div>
                  </div>
                </div>

                {/* Label */}
                <span className="text-[11px] font-bold text-slate-400 mt-3 uppercase tracking-wider">
                  {item.week}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
