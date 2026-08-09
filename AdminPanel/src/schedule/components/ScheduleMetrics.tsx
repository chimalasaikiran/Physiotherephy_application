import React from 'react';

interface MetricItem {
  id: string;
  label: string;
  badgeText: string;
  badgeType: 'positive' | 'negative' | 'neutral';
  value: string | number;
  description: string;
}

export const ScheduleMetrics: React.FC = () => {
  const metrics: MetricItem[] = [
    {
      id: 'today',
      label: "TODAY'S APPOINTMENTS",
      badgeText: '+12%',
      badgeType: 'positive',
      value: 36,
      description: 'Scheduled for next 24 hours',
    },
    {
      id: 'pending',
      label: 'PENDING CONFIRMATIONS',
      badgeText: '-4%',
      badgeType: 'negative',
      value: 12,
      description: 'Requires immediate action',
    },
    {
      id: 'completed',
      label: 'COMPLETED SESSIONS',
      badgeText: '+24%',
      badgeType: 'positive',
      value: 842,
      description: 'Month to date performance',
    },
    {
      id: 'cancelled',
      label: 'CANCELLED SESSIONS',
      badgeText: 'Stable',
      badgeType: 'neutral',
      value: 18,
      description: 'Last 7 days average',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              {item.label}
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                item.badgeType === 'positive'
                  ? 'bg-sky-100 text-sky-700'
                  : item.badgeType === 'negative'
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {item.badgeText}
            </span>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {item.value}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
