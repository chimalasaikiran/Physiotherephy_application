import React, { useState, useEffect } from 'react';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';
import { subscribeToTherapists } from '@/services/therapistService';
import type { Therapist } from '@/therapists/types';
import { UPCOMING_PAYOUTS_DATA } from '../mockData';

export const UpcomingTherapistPayoutsCard: React.FC = () => {
  const [therapists, setTherapists] = useState<Therapist[]>([]);

  useEffect(() => {
    const unsub = subscribeToTherapists((data) => {
      if (data && data.length > 0) {
        setTherapists(data);
      }
    });
    return () => unsub();
  }, []);

  const displayList = therapists.length > 0 ? therapists.slice(0, 3) : null;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-xs">
      {/* Card Title */}
      <h3 className="text-base font-bold text-slate-900 tracking-tight mb-4 flex items-center justify-between">
        <span>Therapist Revenue & Payouts</span>
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
          Live Sync
        </span>
      </h3>

      {/* Grid of Therapist Payout Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {displayList
          ? displayList.map((therapist) => {
              const rev = therapist.totalRevenue || 25000;
              const targetPct = Math.min(100, Math.round((rev / 50000) * 100));
              return (
                <div
                  key={therapist.id}
                  className="bg-slate-50/60 rounded-2xl p-4 border border-slate-100 hover:border-blue-200 transition-all duration-200"
                >
                  {/* Avatar & Info */}
                  <div className="flex items-center space-x-3 mb-3">
                    <InitialsAvatar name={therapist.name} className="w-10 h-10 text-xs font-bold shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {therapist.name}
                      </h4>
                      <p className="text-xs text-slate-400 font-medium truncate">
                        {therapist.degree || 'Physiotherapist'}
                      </p>
                    </div>
                  </div>

                  {/* Accumulated Value */}
                  <div className="mb-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Total Revenue
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-extrabold text-slate-900">
                        ₹{rev.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] font-extrabold text-blue-700">
                        {targetPct}% Target
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${targetPct}%` }}
                    />
                  </div>
                </div>
              );
            })
          : UPCOMING_PAYOUTS_DATA.map((therapist: any) => (
              <div
                key={therapist.id}
                className="bg-slate-50/60 rounded-2xl p-4 border border-slate-100 hover:border-blue-200 transition-all duration-200"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <InitialsAvatar name={therapist.name} className="w-10 h-10 text-xs font-bold shrink-0" />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {therapist.name}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium truncate">
                      {therapist.role}
                    </p>
                  </div>
                </div>

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
