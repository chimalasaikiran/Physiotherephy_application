import React from 'react';

interface TimelineItem {
  id: string;
  name: string;
  timeAndType: string;
  statusBadge?: string;
  statusType?: 'primary' | 'secondary';
}

interface TodaysTimelineProps {
  onSelectSession?: () => void;
}

export const TodaysTimeline: React.FC<TodaysTimelineProps> = ({ onSelectSession }) => {
  const timelineItems: TimelineItem[] = [
    {
      id: '1',
      name: 'Arjun Reddy',
      timeAndType: '10:30 AM - Physio',
      statusBadge: 'Ongoing',
      statusType: 'primary',
    },
    {
      id: '2',
      name: 'Sanya Malhotra',
      timeAndType: '12:00 PM - Psych',
      statusBadge: 'In 1h',
      statusType: 'secondary',
    },
    {
      id: '3',
      name: 'Ishaan Kapoor',
      timeAndType: '02:30 PM - Follow-up',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
      {/* Widget Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
          TODAY'S TIMELINE
        </h3>
        <button
          onClick={onSelectSession}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Timeline Items */}
      <div className="relative pl-5 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
        {timelineItems.map((item) => (
          <div
            key={item.id}
            onClick={onSelectSession}
            className="relative flex items-start justify-between cursor-pointer hover:opacity-80 transition-opacity"
          >
            {/* Timeline Dot */}
            <div
              className={`absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                item.statusType === 'primary'
                  ? 'bg-blue-600 ring-blue-100'
                  : 'bg-slate-300'
              }`}
            />

            <div>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                {item.name}
              </h4>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {item.timeAndType}
              </p>
            </div>

            {item.statusBadge && (
              <span
                className={`text-xs font-bold ${
                  item.statusType === 'primary' ? 'text-blue-600' : 'text-slate-400'
                }`}
              >
                {item.statusBadge}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
