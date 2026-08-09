import React, { useState } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';

interface PendingConfirmationItem {
  id: string;
  name: string;
  details: string;
}

export const PendingConfirmations: React.FC = () => {
  const [items, setItems] = useState<PendingConfirmationItem[]>([
    {
      id: '1',
      name: 'Meera Joshi',
      details: 'Home Visit - Oct 25',
    },
    {
      id: '2',
      name: 'Rahul Verma',
      details: 'Clinic Visit - Oct 26',
    },
  ]);

  const handleConfirm = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
      {/* Widget Header */}
      <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
        PENDING CONFIRMATIONS
      </h3>

      {/* Confirmation List */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-2">
            No pending confirmations.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100/80 bg-slate-50/40 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {item.details}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleConfirm(item.id)}
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
