import React from 'react';
import { MOCK_PAYOUTS } from '../mockData';
import { CalendarDays, CheckCircle2 } from 'lucide-react';

export const PayoutsTabView: React.FC = () => {
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
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
            {MOCK_PAYOUTS.map((pay) => (
              <tr key={pay.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-900">{pay.therapistName}</div>
                  <div className="text-[11px] text-slate-400 font-normal">{pay.role}</div>
                </td>
                <td className="py-3.5 px-4 text-slate-500">{pay.period}</td>
                <td className="py-3.5 px-4 font-bold text-slate-900">{pay.sessionCount}</td>
                <td className="py-3.5 px-4 text-slate-600">
                  ₹{pay.grossEarnings.toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 px-4 text-rose-500 font-medium">
                  -₹{pay.platformDeduction.toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 px-4 font-extrabold text-blue-700 text-sm">
                  ₹{pay.netPayout.toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 px-4 text-slate-500 font-semibold">{pay.dueDate}</td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600">
                    <CalendarDays className="w-3 h-3 mr-1 inline" />
                    {pay.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
