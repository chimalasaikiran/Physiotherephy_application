import React from 'react';
import { OUTSTANDING_PAYMENTS_DATA } from '../mockData';

interface OutstandingPaymentsCardProps {
  onViewAll?: () => void;
}

export const OutstandingPaymentsCard: React.FC<OutstandingPaymentsCardProps> = ({
  onViewAll,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-xs flex flex-col justify-between h-full">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Outstanding Payments
        </h3>
        <button
          onClick={onViewAll}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* List Items */}
      <div className="space-y-4">
        {OUTSTANDING_PAYMENTS_DATA.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50/80 transition-colors"
          >
            {/* Patient Info */}
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                  item.initials === 'SM'
                    ? 'bg-purple-100 text-purple-700'
                    : item.initials === 'AK'
                    ? 'bg-cyan-100 text-cyan-700'
                    : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                {item.initials}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">
                  {item.patientName}
                </h4>
                <p className="text-xs text-slate-400 font-medium">
                  {item.invoiceId}
                </p>
              </div>
            </div>

            {/* Amount and Status */}
            <div className="text-right">
              <div className="text-sm font-extrabold text-slate-900">
                ₹{item.amount.toLocaleString('en-IN')}
              </div>
              <div
                className={`text-[11px] font-bold mt-0.5 ${
                  item.isOverdue ? 'text-rose-500' : 'text-slate-400'
                }`}
              >
                {item.dueDateLabel}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
