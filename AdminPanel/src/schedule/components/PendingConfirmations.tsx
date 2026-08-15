import React from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import type { AppointmentItem } from './AppointmentsTable';

interface PendingConfirmationsProps {
  appointments?: AppointmentItem[];
  onConfirm?: (item: AppointmentItem) => void;
}

export const PendingConfirmations: React.FC<PendingConfirmationsProps> = ({
  appointments = [],
  onConfirm,
}) => {
  const pendingItems = appointments.filter((a) => a.status === 'Scheduled');

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
      {/* Widget Header */}
      <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
        PENDING CONFIRMATIONS ({pendingItems.length})
      </h3>

      {/* Confirmation List */}
      <div className="space-y-3">
        {pendingItems.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-2 font-medium">
            No pending confirmations.
          </p>
        ) : (
          pendingItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100/80 bg-slate-50/40 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    {item.patientName}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {item.date} • {item.time}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onConfirm?.(item)}
                className="p-1 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                title="Confirm Appointment"
              >
                <CheckCircle2 className="w-5 h-5 text-slate-300 hover:text-emerald-600" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

