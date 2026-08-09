import React from 'react';
import { Send, Calendar, Printer, FileText } from 'lucide-react';

interface QuickActionsProps {
  onSendReminder?: () => void;
  onReschedule?: () => void;
  onPrintLedger?: () => void;
  onBulkNotes?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onSendReminder,
  onReschedule,
  onPrintLedger,
  onBulkNotes,
}) => {
  const actions = [
    {
      id: 'reminder',
      label: 'Send Reminder',
      icon: Send,
      onClick: onSendReminder,
    },
    {
      id: 'reschedule',
      label: 'Reschedule',
      icon: Calendar,
      onClick: onReschedule,
    },
    {
      id: 'print',
      label: 'Print Ledger',
      icon: Printer,
      onClick: onPrintLedger,
    },
    {
      id: 'notes',
      label: 'Bulk Notes',
      icon: FileText,
      onClick: onBulkNotes,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
      <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
        QUICK ACTIONS
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100/90 bg-slate-50/40 hover:bg-blue-50/50 hover:border-blue-200 transition-all group cursor-pointer text-center"
            >
              <Icon className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform mb-2" />
              <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
