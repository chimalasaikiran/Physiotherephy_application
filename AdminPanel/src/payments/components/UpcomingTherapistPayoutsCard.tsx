import React from 'react';
import { UPCOMING_PAYOUTS_DATA } from '../mockData';

export const UpcomingTherapistPayoutsCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-xs">
      {/* Card Title */}
      <h3 className="text-base font-bold text-slate-900 tracking-tight mb-4">
        Upcoming Therapist Payouts
      </h3>

      {/* Grid of Therapist Payout Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {UPCOMING_PAYOUTS_DATA.map((therapist) => (
          <div
            key={therapist.id}
            className="bg-slate-50/60 rounded-2xl p-4 border border-slate-100 hover:border-blue-200 transition-all duration-200"
          >
            {/* Avatar & Info */}
            <div className="flex items-center space-x-3 mb-3">
              <img
                src={therapist.avatarUrl}
                alt={therapist.name}
                className="w-10 h-10 rounded-full object-cover shadow-xs border border-white"
              />
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {therapist.name}
                </h4>
                <p className="text-xs text-slate-400 font-medium truncate">
                  {therapist.role}
                </p>
              </div>
            </div>

            {/* Accumulated Value */}
            <div className="mb-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Accumulated
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-extrabold text-slate-900">
                  ₹{therapist.accumulatedAmount.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] font-extrabold text-blue-700">
                  {therapist.targetPercentage}% of Target
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${therapist.targetPercentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
