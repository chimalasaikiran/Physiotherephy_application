import React, { useState, useEffect } from 'react';
import {
  X,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  User,
  Calendar,
  Clock,
  CreditCard,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { processAdminRefund } from '@/services/paymentService';

export interface ProcessRefundModalTarget {
  paymentId?: string;
  appointmentId?: string;
  bookingId?: string;
  patientId?: string;
  patientName?: string;
  therapistName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  sessionType?: string;
  originalAmount?: number;
  refundedAmount?: number;
  remainingRefundableAmount?: number;
  paymentMethod?: string;
  transactionId?: string;
  cancellationReason?: string;
}

interface ProcessRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  target?: ProcessRefundModalTarget | null;
  onSuccess?: (message: string) => void;
}

export const ProcessRefundModal: React.FC<ProcessRefundModalProps> = ({
  isOpen,
  onClose,
  target,
  onSuccess,
}) => {
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Derived financial parameters
  const originalAmount = Number(target?.originalAmount || 1000);
  const alreadyRefunded = Number(target?.refundedAmount || 0);
  const maxRefundable = Math.max(0, target?.remainingRefundableAmount ?? (originalAmount - alreadyRefunded));

  useEffect(() => {
    if (isOpen && target) {
      // Default to full remaining refundable amount
      setRefundAmount(String(maxRefundable));
      setReason(target.cancellationReason || 'Patient requested appointment cancellation');
      setErrorMessage(null);
    }
  }, [isOpen, target, maxRefundable]);

  if (!isOpen || !target) return null;

  const numericRefundAmount = parseFloat(refundAmount) || 0;
  const isExceeding = numericRefundAmount > maxRefundable;
  const isZeroOrNegative = numericRefundAmount <= 0;
  const isFullyRefunded = maxRefundable <= 0;

  const handleQuickPercent = (percent: number) => {
    const calculated = Math.round((maxRefundable * percent) / 100);
    setRefundAmount(String(calculated));
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isFullyRefunded) {
      setErrorMessage('This payment has already been fully refunded.');
      return;
    }

    if (isZeroOrNegative) {
      setErrorMessage('Please enter a valid refund amount greater than 0.');
      return;
    }

    if (isExceeding) {
      setErrorMessage(`Refund amount cannot exceed remaining refundable amount (₹${maxRefundable.toLocaleString('en-IN')}).`);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await processAdminRefund({
        paymentId: target.paymentId,
        appointmentId: target.appointmentId || target.bookingId,
        bookingId: target.bookingId || target.appointmentId,
        patientId: target.patientId,
        refundAmount: numericRefundAmount,
        refundReason: reason,
        processedBy: 'Admin Panel',
        paymentProvider: target.paymentMethod || 'UPI',
      });

      const successMsg = result?.message || `Successfully refunded ₹${numericRefundAmount.toLocaleString('en-IN')}!`;
      if (onSuccess) onSuccess(successMsg);
      onClose();
    } catch (err: any) {
      console.error('Refund processing error:', err);
      setErrorMessage(err.message || 'Failed to process refund. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center font-bold">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Process Financial Refund
              </h3>
              <p className="text-xs font-semibold text-slate-400">
                Confirm refund details before sending to payment provider.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-4 flex items-start space-x-3 text-xs font-bold text-rose-700 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Fully Refunded Warning */}
          {isFullyRefunded && (
            <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-start space-x-3 text-xs font-bold text-amber-800">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>This appointment payment has already been 100% refunded. No further refundable amount remains.</span>
            </div>
          )}

          {/* 1. Appointment & Payment Context summary */}
          <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-slate-200/60 pb-2.5">
              <span className="font-extrabold text-slate-400 uppercase tracking-wider">Patient</span>
              <span className="font-extrabold text-slate-900 flex items-center">
                <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {target.patientName || 'Patient'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Appointment ID</span>
                <span className="font-extrabold text-slate-800 font-mono">
                  {target.appointmentId || target.bookingId || 'APT-N/A'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Therapist</span>
                <span className="font-extrabold text-slate-800">
                  {target.therapistName || 'Attending Therapist'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Date & Time</span>
                <span className="font-semibold text-slate-700">
                  {target.appointmentDate || 'Today'} {target.appointmentTime ? `• ${target.appointmentTime}` : ''}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Method / Txn ID</span>
                <span className="font-semibold text-slate-700 truncate block">
                  {target.paymentMethod || 'UPI'} ({target.transactionId || 'TXN-1001'})
                </span>
              </div>
            </div>

            {target.cancellationReason && (
              <div className="pt-2 border-t border-slate-200/60 text-xs">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Cancellation Reason</span>
                <span className="font-medium text-slate-700 italic">"{target.cancellationReason}"</span>
              </div>
            )}
          </div>

          {/* 2. Financial Metrics Breakdown Cards */}
          <div className="grid grid-cols-3 gap-3">
            {/* Original Amount */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Original Amount</span>
              <span className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5 block">
                ₹{originalAmount.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Already Refunded */}
            <div className="bg-amber-50/60 rounded-2xl p-3 border border-amber-100 text-center">
              <span className="text-[10px] font-bold text-amber-700 uppercase block">Already Refunded</span>
              <span className="text-sm sm:text-base font-extrabold text-amber-800 mt-0.5 block">
                ₹{alreadyRefunded.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Refundable Amount */}
            <div className="bg-teal-50/80 rounded-2xl p-3 border border-teal-100 text-center">
              <span className="text-[10px] font-bold text-teal-700 uppercase block">Refundable</span>
              <span className="text-sm sm:text-base font-extrabold text-teal-800 mt-0.5 block">
                ₹{maxRefundable.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* 3. Refund Amount Entry & Quick Selectors */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Refund Amount (₹)
              </label>
              {!isFullyRefunded && (
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleQuickPercent(50)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-extrabold transition-colors cursor-pointer"
                  >
                    50% Partial
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPercent(100)}
                    className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-[11px] font-extrabold transition-colors cursor-pointer"
                  >
                    100% Full (₹{maxRefundable.toLocaleString('en-IN')})
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-base">
                ₹
              </span>
              <input
                type="number"
                min="1"
                max={maxRefundable}
                step="1"
                disabled={isFullyRefunded}
                value={refundAmount}
                onChange={(e) => {
                  setRefundAmount(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="Enter refund amount"
                className={`w-full pl-9 pr-4 py-3 rounded-2xl border text-base font-extrabold text-slate-900 focus:outline-none focus:ring-2 ${
                  isExceeding
                    ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/20'
                    : 'border-slate-200 focus:ring-blue-600'
                }`}
                required
              />
            </div>
            {isExceeding && (
              <p className="text-xs font-bold text-rose-600 mt-1">
                Cannot exceed maximum refundable amount of ₹{maxRefundable.toLocaleString('en-IN')}!
              </p>
            )}
          </div>

          {/* 4. Refund Reason */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Reason for Refund
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Appointment cancelled by patient in advance"
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isExceeding || isZeroOrNegative || isFullyRefunded}
              className={`px-6 py-2.5 text-xs font-extrabold text-white rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer ${
                isSubmitting || isExceeding || isZeroOrNegative || isFullyRefunded
                  ? 'bg-slate-300 text-slate-500 shadow-none cursor-not-allowed'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
              }`}
            >
              {isSubmitting ? (
                <span>Processing Refund...</span>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Confirm & Refund ₹{numericRefundAmount.toLocaleString('en-IN')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
