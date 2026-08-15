import React from 'react';
import type { AppointmentItem } from './AppointmentsTable';

interface MetricItem {
  id: string;
  label: string;
  badgeText: string;
  badgeType: 'positive' | 'negative' | 'neutral';
  value: string | number;
  description: string;
}

interface ScheduleMetricsProps {
  appointments?: AppointmentItem[];
}

export const ScheduleMetrics: React.FC<ScheduleMetricsProps> = ({ appointments = [] }) => {
  const activeCount = appointments.filter((a) => a.status !== 'Cancelled').length;
  const pendingCount = appointments.filter((a) => a.status === 'Scheduled').length;
  const completedCount = appointments.filter((a) => a.status === 'Completed').length;
  const cancelledCount = appointments.filter((a) => a.status === 'Cancelled').length;

  const metrics: MetricItem[] = [
    {
      id: 'today',
      label: "ACTIVE APPOINTMENTS",
      badgeText: `${activeCount > 0 ? '+' : ''}${activeCount}`,
      badgeType: 'positive',
      value: activeCount,
      description: 'Active scheduled sessions',
    },
    {
      id: 'pending',
      label: 'PENDING CONFIRMATIONS',
      badgeText: String(pendingCount),
      badgeType: pendingCount > 0 ? 'negative' : 'neutral',
      value: pendingCount,
      description: 'Requires immediate action',
    },
    {
      id: 'completed',
      label: 'COMPLETED SESSIONS',
      badgeText: String(completedCount),
      badgeType: 'positive',
      value: completedCount,
      description: 'Successfully finished sessions',
    },
    {
      id: 'cancelled',
      label: 'CANCELLED SESSIONS',
      badgeText: String(cancelledCount),
      badgeType: 'neutral',
      value: cancelledCount,
      description: 'Cancelled appointments',
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

