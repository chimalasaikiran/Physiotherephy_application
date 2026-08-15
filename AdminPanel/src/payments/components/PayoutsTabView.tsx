import React, { useState } from 'react';
import { CalendarDays, CheckCircle2 } from 'lucide-react';
import type { PayoutDocument } from '../types';
import { markPayoutAsPaid } from '@/services/paymentService';

interface PayoutsTabViewProps {
  payouts?: PayoutDocument[];
}

export const PayoutsTabView: React.FC<PayoutsTabViewProps> = ({ payouts = [] }) => {
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handleMarkPaid = async (id: string) => {
    setActionLoadingId(id);
    try {
      await markPayoutAsPaid(id);
    } catch (err) {
      console.error('Error marking payout paid:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          Therapist Payout Schedule
        </h3>
        <p className="text-xs text-slate-400 font-medium">
          Detailed breakdown of clinician monthly settlements and net earnings.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              <th className="py-3 px-4">Therapist</th>
              <th className="py-3 px-4">Period</th>
              <th className="py-3 px-4">Sessions</th>
              <th className="py-3 px-4">Gross Earnings</th>
              <th className="py-3 px-4">Platform Fee</th>
              <th className="py-3 px-4">Net Payout</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
            {payouts.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 font-medium">
                  No payouts scheduled.
                </td>
              </tr>
            ) : (
              payouts.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{pay.therapistName}</div>
                    <div className="text-[11px] text-slate-400 font-normal">{pay.therapistRole || 'Physiotherapist'}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{pay.period}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{pay.sessionCount}</td>
                  <td className="py-3.5 px-4 text-slate-600">
                    ₹{pay.grossEarnings.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-rose-500 font-medium">
                    -₹{pay.platformDeduction.toLocaleString('en-IN')} ({pay.platformFeePercent}%)
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-blue-700 text-sm">
                    ₹{pay.netPayout.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-semibold">{pay.dueDate}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        pay.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      <CalendarDays className="w-3 h-3 mr-1 inline" />
                      {pay.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {pay.status !== 'Paid' ? (
                      <button
                        onClick={() => handleMarkPaid(pay.id)}
                        disabled={actionLoadingId === pay.id}
                        className="inline-flex items-center px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Settle Payout
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Settled</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

