import React, { useState } from 'react';
import { X, Mail, Send, CheckCircle } from 'lucide-react';

interface EmailReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendSuccess: (msg: string) => void;
}

export const EmailReportModal: React.FC<EmailReportModalProps> = ({
  isOpen,
  onClose,
  onSendSuccess,
}) => {
  const [recipient, setRecipient] = useState('dr.sarah@onemedical.com');
  const [frequency, setFrequency] = useState('Weekly (Every Monday)');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSendNow = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      onSendSuccess(`Weekly analytics report sent to ${recipient}`);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                Email Weekly Report
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Dispatch automated analytics snapshot
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Recipient Email Address
            </label>
            <input
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Automated Delivery Schedule
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Weekly (Every Monday)">Weekly (Every Monday 8:00 AM)</option>
              <option value="Bi-Weekly">Bi-Weekly (1st & 15th of month)</option>
              <option value="Monthly Summary">Monthly Summary (1st of month)</option>
              <option value="One-Time Immediate">One-Time Immediate Send</option>
            </select>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSendNow}
            disabled={isSending}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {isSending ? (
              <span>Sending...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Report Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
