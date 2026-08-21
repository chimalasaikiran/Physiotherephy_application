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
  const pendingItems = appointments.filter((a) => a.status === 'Scheduled' || a.status === 'Pending');

  return (
    <div className="self-stretch p-6 bg-white/70 rounded-3xl outline outline-1 outline-offset-[-1px] outline-white/40 backdrop-blur-[10px] flex flex-col justify-start items-start gap-4 shadow-[0px_4px_24px_-1px_rgba(0,104,123,0.05)]">
      {/* Widget Header */}
      <div className="self-stretch flex flex-col justify-start items-start">
        <div className="justify-center text-gray-500 text-sm font-extrabold font-['Inter'] uppercase leading-5 tracking-wider">
          PENDING CONFIRMATIONS
        </div>
      </div>

      {/* Confirmation List */}
      <div className="self-stretch flex flex-col justify-start items-start gap-3">
        {pendingItems.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-2 font-normal font-['Inter'] w-full">
            No pending confirmations.
          </p>
        ) : (
          pendingItems.map((item) => (
            <div
              key={item.id}
              className="self-stretch p-3 bg-white/50 rounded-[48px] outline outline-1 outline-offset-[-1px] outline-slate-300/20 flex items-center justify-between gap-3"
            >
              <div className="w-10 h-10 bg-red-700/10 rounded-full flex justify-center items-center shrink-0">
                <Bell className="w-4 h-4 text-red-700" />
              </div>

              <div className="flex-1 flex flex-col justify-start items-start">
                <div className="justify-center text-slate-900 text-xs font-bold font-['Inter'] leading-4">
                  {item.patientName}
                </div>
                <div className="justify-center text-gray-500 text-[10px] font-normal font-['Inter'] leading-4">
                  {item.type} · {item.date}
                </div>
              </div>

              <button
                onClick={() => onConfirm?.(item)}
                className="p-1.5 hover:bg-emerald-50 rounded-full transition-colors text-slate-400 hover:text-emerald-600 cursor-pointer shrink-0"
                title="Confirm Appointment"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

