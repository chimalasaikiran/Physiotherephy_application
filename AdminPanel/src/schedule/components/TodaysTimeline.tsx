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
  }).slice(0, 5);

  return (
    <div className="self-stretch p-6 bg-white/70 rounded-3xl outline outline-1 outline-offset-[-1px] outline-white/40 backdrop-blur-[10px] flex flex-col justify-start items-start gap-6 shadow-[0px_4px_24px_-1px_rgba(0,104,123,0.05)]">
      {/* Widget Header */}
      <div className="self-stretch inline-flex justify-between items-center">
        <div className="justify-center text-gray-500 text-sm font-extrabold font-['Inter'] uppercase leading-5 tracking-wider">
          TODAY'S TIMELINE
        </div>
        <button
          onClick={() => sortedItems[0] && onSelectSession?.(sortedItems[0])}
          className="text-center text-blue-900 text-xs font-bold font-['Inter'] leading-4 hover:underline cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Timeline Items */}
      {sortedItems.length > 0 ? (
        <div className="self-stretch relative flex flex-col justify-start items-start gap-6">
          <div className="w-0.5 bottom-2 left-[7px] top-[8px] absolute bg-slate-300/30" />
          {sortedItems.map((item, idx) => {
            const isFirstActive = idx === 0 || item.status === 'In Progress';
            const dotBorder = isFirstActive ? 'border-blue-900' : 'border-slate-300';
            const tagColor = isFirstActive ? 'text-blue-900' : 'text-gray-500';
            const tagLabel = item.status === 'In Progress' ? 'Ongoing' : item.status === 'Completed' ? 'Done' : item.status;

            return (
              <div
                key={item.id}
                onClick={() => onSelectSession?.(item)}
                className="self-stretch pl-6 relative flex flex-col justify-start items-start cursor-pointer hover:opacity-85 transition-opacity"
              >
                <div className="self-stretch inline-flex justify-between items-start">
                  <div className="flex flex-col justify-start items-start">
                    <div className="justify-center text-slate-900 text-xs font-bold font-['Inter'] leading-5">
                      {item.patientName}
                    </div>
                    <div className="justify-center text-gray-500 text-xs font-normal font-['Inter'] leading-4">
                      {item.time} · {formatAppointmentTypeLabel(item.type)}
                    </div>
                  </div>
                  <div className={`justify-center text-[10px] font-bold font-['Inter'] leading-4 ${tagColor}`}>
                    {tagLabel}
                  </div>
                </div>
                {/* Timeline Dot */}
                <div className={`w-3.5 h-3.5 left-0 top-[4px] absolute bg-white rounded-full border-2 ${dotBorder}`} />
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-gray-500 text-center py-4 font-normal font-['Inter'] w-full">
          No appointments scheduled for today
        </p>
      )}
    </div>
  );
};
