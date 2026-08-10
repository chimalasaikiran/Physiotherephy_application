import React from 'react';

interface ClinicHealthScoreChartProps {
  score?: number;
  statusLabel?: string;
}

export const ClinicHealthScoreChart: React.FC<ClinicHealthScoreChartProps> = ({
  score = 94,
  statusLabel = 'Excellence Status',
}) => {
  const strokeWidth = 14;
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex flex-col items-center justify-between h-full min-h-[300px]">
      <div className="w-full text-left">
        <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">
          Clinic Health Score
        </h3>
      </div>

      {/* Donut Score Visual */}
      <div className="relative my-4 flex items-center justify-center">
        <svg className="w-44 h-44 transform -rotate-90">
          {/* Background circle track */}
          <circle
            cx="88"
            cy="88"
            r={radius}
            className="stroke-blue-50/80"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle arc */}
          <circle
            cx="88"
            cy="88"
            r={radius}
            className="stroke-blue-600 transition-all duration-1000 ease-out"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Inner Score Value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
            {score}
          </span>
        </div>
      </div>

      {/* Excellence Status Pill Badge */}
      <div className="w-full flex justify-center mt-2">
        <span className="px-5 py-2 rounded-full bg-blue-50/90 hover:bg-blue-100/80 text-blue-600 text-xs font-bold transition-all shadow-2xs text-center border border-blue-100/50 cursor-default">
          {statusLabel}
        </span>
      </div>
    </div>
  );
};
