import React from 'react';
import type { RecentlyAddedExerciseItem } from '../types';

interface RecentlyAddedWidgetProps {
  items: RecentlyAddedExerciseItem[];
  onSelect: (title: string) => void;
}

export const RecentlyAddedWidget: React.FC<RecentlyAddedWidgetProps> = ({
  items,
  onSelect,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
      <h3 className="text-base font-bold text-slate-900 mb-4">Recently Added</h3>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item.title)}
            className="flex items-start space-x-3 group cursor-pointer"
          >
            <div className="w-2 h-2 rounded-full bg-teal-400 mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                {item.title}
              </h4>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {item.addedTime} by {item.addedBy}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
