import React from 'react';
import { Clock, Calendar, Loader2 } from 'lucide-react';

export interface TodaysScheduleItem {
  id: string;
  patientName: string;
  patientSubtitle: string;
  therapistName: string;
  time: string;
  date: string;
  type: string;
  status: string;
  fullDate: string;
}

interface TodaysScheduleProps {
  todaysSchedule?: TodaysScheduleItem[];
  isLoading?: boolean;
  onSelectAppointment?: (item: TodaysScheduleItem) => void;
  onNavigateToSchedule?: () => void;
}

export const TodaysSchedule: React.FC<TodaysScheduleProps> = ({
  todaysSchedule = [],
  isLoading = false,
  onSelectAppointment,
  onNavigateToSchedule,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
          Today's Schedule
        </h4>
        {onNavigateToSchedule && (
          <button
            onClick={onNavigateToSchedule}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            View Schedule
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-6 text-center text-xs text-slate-400 font-medium flex items-center justify-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading today's schedule...</span>
        </div>
      ) : todaysSchedule.length > 0 ? (
        <div className="space-y-3">
          {todaysSchedule.map((item, idx) => {
            const isCompleted = item.status === 'Completed';
            const accentBg = isCompleted
              ? 'bg-emerald-50/70 border-l-4 border-l-emerald-500'
              : idx % 2 === 0
              ? 'bg-blue-50/70 border-l-4 border-l-blue-600'
              : 'bg-indigo-50/70 border-l-4 border-l-indigo-600';

            return (
              <div
                key={item.id || idx}
                onClick={() => onSelectAppointment && onSelectAppointment(item)}
                className="flex items-start space-x-3 group cursor-pointer"
              >
                <span className="text-xs font-bold text-slate-900 mt-2 min-w-[55px] text-right whitespace-nowrap">
                  {item.time}
                </span>
                <div
                  className={`flex-1 p-3 rounded-2xl ${accentBg} transition-all duration-200 group-hover:shadow-xs`}
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-blue-600 transition-colors">
                      {item.patientName}
                    </h5>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    With {item.therapistName} • {item.patientSubtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-slate-400 font-medium space-y-2">
          <Calendar className="w-6 h-6 text-slate-300 mx-auto" />
          <p>No appointments scheduled for today</p>
        </div>
      )}
    </div>
  );
};
