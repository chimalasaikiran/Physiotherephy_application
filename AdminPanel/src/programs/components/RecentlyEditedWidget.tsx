import React from 'react';
import { UserCheck, Activity, ChevronRight } from 'lucide-react';
import type { RecentlyEditedItem } from '../types';

interface RecentlyEditedWidgetProps {
  items: RecentlyEditedItem[];
  onSelectItem: (item: RecentlyEditedItem) => void;
}

export const RecentlyEditedWidget: React.FC<RecentlyEditedWidgetProps> = ({
  items,
  onSelectItem,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          RECENTLY EDITED
        </h3>
        <button className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer">
          View All
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className="flex items-center space-x-3.5 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              {item.iconType === 'shoulder' ? (
                <UserCheck className="w-5 h-5" />
              ) : (
                <Activity className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                {item.title}
              </h4>
              <p className="text-xs text-slate-400 font-medium">{item.modifiedTime}</p>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
};
