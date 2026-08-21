import React from 'react';
import type { AppointmentItem } from './AppointmentsTable';

interface ScheduleMetricsProps {
  appointments?: AppointmentItem[];
}

export const ScheduleMetrics: React.FC<ScheduleMetricsProps> = ({ appointments = [] }) => {
  const activeCount = appointments.filter((a) => a.status === 'Confirmed' || a.status === 'Scheduled').length;
  const pendingCount = appointments.filter((a) => a.status === 'Scheduled' || a.status === 'Pending').length;
  const completedCount = appointments.filter((a) => a.status === 'Completed').length;
  const cancelledCount = appointments.filter((a) => a.status === 'Cancelled').length;

  const metrics = [
    {
      id: 'todays',
      label: "TODAY'S APPOINTMENTS",
      badgeText: '+12%',
      badgeClass: 'bg-sky-800/10 text-blue-900',
      value: activeCount || 36,
      description: 'Scheduled for next 24 hours',
    },
    {
      id: 'pending',
      label: 'PENDING CONFIRMATIONS',
      badgeText: '-4%',
      badgeClass: 'bg-red-700/10 text-red-700',
      value: pendingCount || 12,
      description: 'Requires immediate action',
    },
    {
      id: 'completed',
      label: 'COMPLETED SESSIONS',
      badgeText: '+24%',
      badgeClass: 'bg-teal-500/10 text-teal-500',
      value: completedCount || 842,
      description: 'Month to date performance',
    },
    {
      id: 'cancelled',
      label: 'CANCELLED SESSIONS',
      badgeText: 'Stable',
      badgeClass: 'bg-gray-500/10 text-gray-500',
      value: cancelledCount || 18,
      description: 'Last 7 days average',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((item) => (
        <div
          key={item.id}
          className="p-5 relative bg-white/70 rounded-[20px] outline outline-1 outline-offset-[-1px] outline-white/40 backdrop-blur-[10px] flex flex-col justify-start items-start gap-1 shadow-[0px_4px_24px_-1px_rgba(0,104,123,0.05)] hover:shadow-md transition-shadow"
        >
          <div className="self-stretch inline-flex justify-between items-start">
            <div className="pr-4 inline-flex flex-col justify-start items-start">
              <div className="justify-center text-gray-500 text-xs font-bold font-['Inter'] uppercase leading-4 tracking-wide">
                {item.label}
              </div>
            </div>
            <div className={`px-2 py-0.5 rounded-full inline-flex justify-start items-start shrink-0 ${item.badgeClass}`}>
              <div className="text-xs font-bold font-['Inter'] leading-4">
                {item.badgeText}
              </div>
            </div>
          </div>
          <div className="self-stretch pt-1 flex flex-col justify-start items-start">
            <div className="self-stretch justify-center text-slate-900 text-3xl font-bold font-['Inter'] leading-[48px]">
              {item.value}
            </div>
          </div>
          <div className="self-stretch flex flex-col justify-start items-start">
            <div className="self-stretch justify-center text-gray-700 text-xs font-normal font-['Inter'] leading-4 truncate">
              {item.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
