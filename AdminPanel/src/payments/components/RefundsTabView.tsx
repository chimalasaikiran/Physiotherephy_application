import React, { useState } from 'react';
import { MOCK_REFUNDS } from '../mockData';
import { Check, X, RotateCcw } from 'lucide-react';

export const RefundsTabView: React.FC = () => {
  const [refunds, setRefunds] = useState(MOCK_REFUNDS);

  const handleApprove = (id: string) => {
    setRefunds((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Approved' } : r))
    );
  };

  const handleReject = (id: string) => {
    setRefunds((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Rejected' } : r))
    );
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          Refund Requests Queue
        </h3>
        <p className="text-xs text-slate-400 font-medium">
          Review, approve, or decline patient refund and session cancellation claims.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              <th className="py-3 px-4">Refund ID</th>
              <th className="py-3 px-4">Patient Name</th>
              <th className="py-3 px-4">Reason</th>
              <th className="py-3 px-4">Requested Date</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
            {refunds.map((ref) => (
              <tr key={ref.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                  {ref.refundId}
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-900">
                  {ref.patientName}
                </td>
                <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                  {ref.reason}
                </td>
                <td className="py-3.5 px-4 text-slate-400">{ref.requestDate}</td>
                <td className="py-3.5 px-4 font-extrabold text-slate-900">
                  ₹{ref.amount.toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      ref.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-600'
                        : ref.status === 'Rejected'
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    {ref.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  {ref.status === 'Awaiting Approval' ? (
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleApprove(ref.id)}
                        className="inline-flex items-center px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(ref.id)}
                        className="inline-flex items-center px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg font-bold text-xs transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5 mr-1" />
                        Decline
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-xs italic">Processed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
