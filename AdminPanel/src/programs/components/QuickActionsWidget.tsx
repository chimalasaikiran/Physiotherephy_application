import React from 'react';
import { Copy, Share2, Archive, Trash2 } from 'lucide-react';

interface QuickActionsWidgetProps {
  onActionClick: (action: string) => void;
}

export const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({ onActionClick }) => {
  const actions = [
    {
      id: 'duplicate',
      label: 'DUPLICATE',
      icon: Copy,
      bgColor: 'bg-indigo-50 hover:bg-indigo-100/80',
      iconColor: 'text-indigo-600',
      textColor: 'text-indigo-900',
    },
    {
      id: 'share',
      label: 'SHARE',
      icon: Share2,
      bgColor: 'bg-blue-50 hover:bg-blue-100/80',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-900',
    },
    {
      id: 'archive',
      label: 'ARCHIVE',
      icon: Archive,
      bgColor: 'bg-purple-50 hover:bg-purple-100/80',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-900',
    },
    {
      id: 'delete',
      label: 'DELETE',
      icon: Trash2,
      bgColor: 'bg-rose-50 hover:bg-rose-100/80',
      iconColor: 'text-rose-600',
      textColor: 'text-rose-900',
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
        QUICK ACTIONS
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={() => onActionClick(act.id)}
              className={`${act.bgColor} p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 transition-all duration-200 cursor-pointer text-center group`}
            >
              <Icon className={`w-5 h-5 ${act.iconColor} group-hover:scale-110 transition-transform`} />
              <span className={`text-[11px] font-extrabold tracking-wider ${act.textColor}`}>
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
