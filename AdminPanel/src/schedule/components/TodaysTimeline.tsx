import React from 'react';
import type { AppointmentItem } from './AppointmentsTable';

interface TodaysTimelineProps {
  appointments?: AppointmentItem[];
  onSelectSession?: (item: AppointmentItem) => void;
}

export const TodaysTimeline: React.FC<TodaysTimelineProps> = ({ appointments = [], onSelectSession }) => {
  const activeItems = appointments.filter((a) => a.status !== 'Cancelled').slice(0, 5);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
      {/* Widget Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
          TODAY'S TIMELINE
        </h3>
        <button
          onClick={() => activeItems[0] && onSelectSession?.(activeItems[0])}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Timeline Items */}
      {activeItems.length > 0 ? (
        <div className="relative pl-5 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
          {activeItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectSession?.(item)}
              className="relative flex items-start justify-between cursor-pointer hover:opacity-80 transition-opacity"
            >
              {/* Timeline Dot */}
              <div
                className={`absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                  item.status === 'Confirmed'
                    ? 'bg-blue-600 ring-blue-100'
                    : item.status === 'Completed'
                    ? 'bg-emerald-500 ring-emerald-100'
                    : 'bg-amber-500 ring-amber-100'
                }`}
              />

              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">
                  {item.patientName}
                </h4>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {item.time} • {item.type}
                </p>
              </div>

              <span
                className={`text-xs font-bold ${
                  item.status === 'Confirmed'
                    ? 'text-blue-600'
                    : item.status === 'Completed'
                    ? 'text-emerald-600'
                    : 'text-amber-600'
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 text-center py-4 font-medium">
          No appointments scheduled for today
        </p>
      )}
    </div>
  );
};

