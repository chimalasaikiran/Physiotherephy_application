import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import type { RefundDocument } from '../types';
import { approveRefund, rejectRefund } from '@/services/paymentService';

interface RefundsTabViewProps {
  refunds?: RefundDocument[];
  onProcessRefundClick?: () => void;
}

export const RefundsTabView: React.FC<RefundsTabViewProps> = ({
  refunds = [],
  onProcessRefundClick,
}) => {
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handleApprove = async (r: RefundDocument) => {
    setActionLoadingId(r.id);
    try {
      await approveRefund(r.id, r);
    } catch (err) {
      console.error('Error approving refund:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoadingId(id);
    try {
      await rejectRefund(id);
    } catch (err) {
      console.error('Error rejecting refund:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Refund Transactions Audit Trail
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Review, process, approve, or decline patient refund and session cancellation claims.
          </p>
        </div>

        {onProcessRefundClick && (
          <button
            onClick={onProcessRefundClick}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Process New Refund
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              <th className="py-3 px-4">Refund ID</th>
              <th className="py-3 px-4">Patient Name</th>
              <th className="py-3 px-4">Provider Txn ID</th>
              <th className="py-3 px-4">Reason</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Refund Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
            {refunds.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                  No refund transactions recorded yet.
                </td>
              </tr>
            ) : (
              refunds.map((ref) => (
                <tr key={ref.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {ref.refundId}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {ref.patientName}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                    {ref.providerRefundId || ref.transactionId || 'rfnd_rzp_mock'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                    {ref.reason || ref.refundReason || 'Cancellation'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{ref.requestDate || ref.createdAt?.split('T')[0]}</td>
                  <td className="py-3.5 px-4 font-extrabold text-rose-600">
                    ₹{ref.amount.toLocaleString('en-IN')}
                    {ref.originalAmount > ref.amount && (
                      <span className="block text-[10px] text-slate-400 font-medium">
                        Orig: ₹{ref.originalAmount.toLocaleString('en-IN')}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ref.status === 'Approved' || ref.status === 'Completed'
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
                          onClick={() => handleApprove(ref)}
                          disabled={actionLoadingId === ref.id}
                          className="inline-flex items-center px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(ref.id)}
                          disabled={actionLoadingId === ref.id}
                          className="inline-flex items-center px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg font-bold text-xs transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5 mr-1" />
                          Decline
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs italic">
                        {ref.processedBy ? `By ${ref.processedBy}` : 'Processed'}
                      </span>
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

