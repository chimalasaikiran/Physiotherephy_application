import React from 'react';
import type { AppointmentItem } from './AppointmentsTable';
import { parseTimeSlot } from '@/utils/dateUtils';
import { formatAppointmentTypeLabel } from '@/utils/appointmentUtils';

interface TodaysTimelineProps {
  appointments?: AppointmentItem[];
  onSelectSession?: (item: AppointmentItem) => void;
}

export const TodaysTimeline: React.FC<TodaysTimelineProps> = ({ appointments = [], onSelectSession }) => {
  // Sort today's appointments by start time
  const sortedItems = [...appointments].sort((a, b) => {
    const tA = parseTimeSlot(a.time);
    const tB = parseTimeSlot(b.time);
    const minsA = tA.hours * 60 + tA.minutes;
    const minsB = tB.hours * 60 + tB.minutes;
    return minsA - minsB;
  }).slice(0, 6);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
      {/* Widget Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
          TODAY'S TIMELINE
        </h3>
        <button
          onClick={() => sortedItems[0] && onSelectSession?.(sortedItems[0])}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Timeline Items */}
      {sortedItems.length > 0 ? (
        <div className="relative pl-5 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
          {sortedItems.map((item) => {
            const statusColor =
              item.status === 'Completed'
                ? 'text-emerald-600'
                : item.status === 'In Progress'
                ? 'text-blue-600'
                : item.status === 'Cancelled'
                ? 'text-rose-600'
                : (item.status as any) === 'Expired'
                ? 'text-amber-700'
                : 'text-sky-600';

            const dotColor =
              item.status === 'Completed'
                ? 'bg-emerald-500 ring-emerald-100'
                : item.status === 'In Progress'
                ? 'bg-blue-600 ring-blue-100 animate-pulse'
                : item.status === 'Cancelled'
                ? 'bg-rose-500 ring-rose-100'
                : (item.status as any) === 'Expired'
                ? 'bg-amber-600 ring-amber-100'
                : 'bg-sky-500 ring-sky-100';

            return (
              <div
                key={item.id}
                onClick={() => onSelectSession?.(item)}
                className="relative flex items-start justify-between cursor-pointer hover:opacity-80 transition-opacity"
              >
                {/* Timeline Dot */}
                <div className={`absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white ${dotColor}`} />

                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    {item.time} • {item.patientName}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {formatAppointmentTypeLabel(item.type)}
                  </p>
                </div>

                <span className={`text-xs font-extrabold ${statusColor}`}>
                  {item.status}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-slate-400 text-center py-4 font-medium">
          No appointments scheduled for today
        </p>
      )}
    </div>
  );
};
