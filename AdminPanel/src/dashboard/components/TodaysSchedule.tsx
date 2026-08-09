import React from 'react';

interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  accentBg: string;
  leftBorder: string;
}

export const TodaysSchedule: React.FC = () => {
  const scheduleItems: ScheduleItem[] = [
    {
      id: 'sch-1',
      time: '09:00',
      title: 'Staff Stand-up',
      subtitle: 'Room 302 • 15 mins',
      accentBg: 'bg-blue-50/70 hover:bg-blue-50',
      leftBorder: 'border-l-4 border-blue-500',
    },
    {
      id: 'sch-2',
      time: '11:30',
      title: 'VIP Patient Arrival',
      subtitle: 'Arjun Reddy • Consultation',
      accentBg: 'bg-indigo-50/70 hover:bg-indigo-50',
      leftBorder: 'border-l-4 border-indigo-500',
    },
    {
      id: 'sch-3',
      time: '14:00',
      title: 'Monthly Billing Review',
      subtitle: 'Accounts Dept.',
      accentBg: 'bg-purple-50/70 hover:bg-purple-50',
      leftBorder: 'border-l-4 border-purple-500',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
      <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-4">
        Today's Schedule
      </h4>

      <div className="space-y-3">
        {scheduleItems.map((item) => (
          <div key={item.id} className="flex items-start space-x-3 group">
            <span className="text-xs font-bold text-slate-900 mt-2 min-w-[40px]">
              {item.time}
            </span>
            <div
              className={`flex-1 p-3.5 rounded-2xl ${item.accentBg} ${item.leftBorder} transition-all duration-200 cursor-pointer`}
            >
              <h5 className="font-bold text-slate-900 text-sm leading-tight">
                {item.title}
              </h5>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {item.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
