import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  RotateCcw,
} from 'lucide-react';
import type { RecentActivityItem } from '../types';

interface RecentActivityCardProps {
  activities?: RecentActivityItem[];
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
  activities = [],
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Recent Activity
          </h3>
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500 ring-4 ring-teal-50 animate-pulse" />
        </div>

        {/* Timeline List */}
        <div className="space-y-4 relative">
          {/* Vertical connecting line */}
          <div className="absolute top-3 bottom-3 left-4 w-px bg-slate-100 -z-0" />

          {activities.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 font-medium">
              No recent payment activity
            </div>
          ) : (
            activities.map((item) => (
              <div key={item.id} className="flex items-start space-x-3.5 relative z-10">
                {/* Icon Status Badge */}
                <div className="shrink-0 mt-0.5">
                  {item.type === 'success' && (
                    <div className="w-8 h-8 rounded-full bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                  {item.type === 'failed' && (
                    <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  )}
                  {item.type === 'scheduled' && (
                    <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                      <CalendarDays className="w-4 h-4" />
                    </div>
                  )}
                  {item.type === 'refund' && (
                    <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <RotateCcw className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Text content */}
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1">
                    {item.timeAgo}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Load More Link */}
      <div className="mt-6 pt-4 border-t border-slate-50 text-center">
        <button className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer inline-flex items-center">
          Load More Activity
        </button>
      </div>
    </div>
  );
};

