import React from 'react';
import { TrendingUp } from 'lucide-react';
import type { PopularExerciseItem } from '../types';

interface PopularExercisesWidgetProps {
  items: PopularExerciseItem[];
  onSelect: (id: string) => void;
}

export const PopularExercisesWidget: React.FC<PopularExercisesWidgetProps> = ({
  items,
  onSelect,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-900">Popular Right Now</h3>
        <TrendingUp className="w-4 h-4 text-blue-600" />
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="flex items-center space-x-3.5 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
          >
            <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-slate-100">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                {item.title}
              </h4>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                {item.views.toLocaleString()} VIEWS
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
