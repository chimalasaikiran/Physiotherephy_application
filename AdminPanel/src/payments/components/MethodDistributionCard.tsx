import React from 'react';

export const MethodDistributionCard: React.FC = () => {
  // SVG Donut Calculations
  const size = 180;
  const strokeWidth = 24;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  // Segments calculation: 60% UPI, 25% Card, 15% Net Banking
  const upiPercent = 0.6;
  const cardPercent = 0.25;
  const netBankPercent = 0.15;

  const upiStroke = circumference * upiPercent;
  const cardStroke = circumference * cardPercent;
  const netBankStroke = circumference * netBankPercent;

  // Offset calculations for stacking SVG strokes
  const upiOffset = 0;
  const cardOffset = -upiStroke;
  const netBankOffset = -(upiStroke + cardStroke);

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
          {/* UPI Segment (Dark Blue) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#1E40AF"
            strokeWidth={strokeWidth}
            strokeDasharray={`${upiStroke - 4} ${circumference - (upiStroke - 4)}`}
            strokeDashoffset={upiOffset}
            strokeLinecap="round"
            className="transition-all duration-500 hover:opacity-90 cursor-pointer"
          />

          {/* Card Segment (Cyan) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#06B6D4"
            strokeWidth={strokeWidth}
            strokeDasharray={`${cardStroke - 4} ${circumference - (cardStroke - 4)}`}
            strokeDashoffset={cardOffset}
            strokeLinecap="round"
            className="transition-all duration-500 hover:opacity-90 cursor-pointer"
          />

          {/* Net Banking Segment (Purple/Indigo) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#818CF8"
            strokeWidth={strokeWidth}
            strokeDasharray={`${netBankStroke - 4} ${circumference - (netBankStroke - 4)}`}
            strokeDashoffset={netBankOffset}
            strokeLinecap="round"
            className="transition-all duration-500 hover:opacity-90 cursor-pointer"
          />
        </svg>

        {/* Inner Donut Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-2xl font-extrabold text-slate-900 leading-tight">
            60%
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            UPI Dominance
          </span>
        </div>
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-around border-t border-slate-50 pt-4 text-center">
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            UPI
          </div>
          <div className="text-xs font-bold text-blue-900">60%</div>
        </div>
        <div className="h-6 w-px bg-slate-100" />
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            Card
          </div>
          <div className="text-xs font-bold text-cyan-600">25%</div>
        </div>
        <div className="h-6 w-px bg-slate-100" />
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            Net Banking
          </div>
          <div className="text-xs font-bold text-indigo-500">15%</div>
        </div>
      </div>
    </div>
  );
};
