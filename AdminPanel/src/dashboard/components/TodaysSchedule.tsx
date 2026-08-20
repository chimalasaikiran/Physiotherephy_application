import React from 'react';
import { Loader2, Calendar } from 'lucide-react';

export interface TodaysScheduleItem {
  id: string;
  title?: string;
  patientName?: string;
  patientSubtitle?: string;
  therapistName?: string;
  avatarUrl?: string;
  time: string;
  date?: string;
  type?: string;
  status?: string;
  fullDate?: string;
  locationOrDetails?: string;
}

interface TodaysScheduleProps {
  todaysSchedule?: TodaysScheduleItem[];
  isLoading?: boolean;
  onSelectAppointment?: (item: TodaysScheduleItem) => void;
  onNavigateToSchedule?: () => void;
  title?: string;
}

export const TodaysSchedule: React.FC<TodaysScheduleProps> = ({
  todaysSchedule = [],
  isLoading = false,
  onSelectAppointment,
  onNavigateToSchedule,
  title = "TODAY'S SCHEDULE",
}) => {
  const displayItems = todaysSchedule.map((item) => ({
    ...item,
    title: item.title || item.patientName || item.type || 'Scheduled Appointment',
    locationOrDetails: item.patientSubtitle || (item.therapistName ? `${item.therapistName} • ${item.type || 'Consultation'}` : item.type || 'Consultation'),
  }));

  return (
    <div className="w-full p-6 sm:p-8 bg-white/70 rounded-[32px] shadow-[0px_8px_32px_0px_rgba(0,61,155,0.05)] outline outline-1 outline-offset-[-1px] outline-white/40 backdrop-blur-[10px] inline-flex flex-col justify-start items-start gap-4">
      {/* Header */}
      <div className="self-stretch flex justify-between items-center">
        <div className="text-gray-700 text-sm font-medium font-['Inter'] uppercase leading-5 tracking-wider">
          {title}
        </div>
        {onNavigateToSchedule && (
          <button
            onClick={onNavigateToSchedule}
            className="text-xs font-semibold text-blue-900 hover:text-blue-700 transition-colors cursor-pointer"
          >
            View All
          </button>
        )}
      </div>

      {/* Schedule Content */}
      {isLoading ? (
        <div className="py-8 text-center text-xs text-slate-400 font-medium flex items-center justify-center space-x-2 w-full">
          <Loader2 className="w-4 h-4 animate-spin text-blue-900" />
          <span>Loading today's schedule...</span>
        </div>
      ) : displayItems.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-xs w-full flex flex-col items-center justify-center space-y-2">
          <div className="w-10 h-10 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <p className="font-semibold text-slate-800 text-sm">No appointments today</p>
          <p className="text-slate-500 text-xs max-w-[200px]">No sessions scheduled for today in the backend system.</p>
          {onNavigateToSchedule && (
            <button
              onClick={onNavigateToSchedule}
              className="mt-2 px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-medium text-xs transition-colors cursor-pointer"
            >
              View Full Schedule
            </button>
          )}
        </div>
      ) : (
        <div className="self-stretch flex flex-col justify-start items-start gap-4">
          {displayItems.map((item, idx) => {
            // Distinct item pill styling per index to match exact design specs
            let isPrimary = idx === 0;
            let timeColor = isPrimary ? 'text-blue-900' : 'text-gray-700';
            let pillBgBorder = isPrimary
              ? 'bg-blue-900/5 border-blue-900'
              : idx === 1
              ? 'bg-indigo-50 border-sky-800/40'
              : 'bg-indigo-50 border-indigo-800/40';

            return (
              <div
                key={item.id || idx}
                onClick={() => {
                  if (onSelectAppointment) onSelectAppointment(item);
                  else if (onNavigateToSchedule) onNavigateToSchedule();
                }}
                className="self-stretch inline-flex justify-start items-start gap-4 group cursor-pointer"
              >
                {/* Timeline time label & connector */}
                <div className="inline-flex flex-col justify-start items-center shrink-0 pt-3">
                  <div className="flex flex-col justify-start items-start">
                    <div className={`justify-center ${timeColor} text-[10px] font-bold font-['Inter'] leading-4`}>
                      {item.time}
                    </div>
                  </div>
                  <div className="w-0.5 h-2 relative"></div>
                </div>

                {/* Card Pill */}
                <div
                  className={`flex-1 p-3 ${pillBgBorder} rounded-[48px] border-l-4 inline-flex flex-col justify-start items-start transition-all duration-200 group-hover:shadow-sm group-hover:translate-x-0.5`}
                >
                  <div className="self-stretch flex justify-between items-center">
                    <div className="justify-center text-slate-900 text-base font-normal font-['Inter'] leading-6">
                      {item.title}
                    </div>
                    {item.status && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === 'Expired'
                            ? 'bg-amber-200/60 text-amber-900 border border-amber-300'
                            : item.status === 'Active / Today'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : item.status === 'Completed'
                            ? 'bg-blue-100 text-blue-900 border border-blue-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    )}
                  </div>
                  <div className="self-stretch flex flex-col justify-start items-start">
                    <div className="self-stretch justify-center text-gray-700 text-xs font-normal font-['Inter'] leading-4">
                      {item.locationOrDetails}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
