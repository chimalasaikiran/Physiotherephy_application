import React, { useState } from 'react';
import { X, FilePlus2 } from 'lucide-react';
import { createInvoice, generateInvoiceNumber } from '@/services/paymentService';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [patientName, setPatientName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('2026-10-31');
  const [service, setService] = useState('Physiotherapy Session (ACL Recovery)');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !amount) return;
    setIsSubmitting(true);

    try {
      const invNum = await generateInvoiceNumber();
      const numAmount = Number(amount) || 0;

      await createInvoice({
        invoiceNumber: invNum,
        patientId: `pat-${Date.now().toString(36)}`,
        patientName,
        therapistId: '',
        therapistName: 'Clinic Specialist',
        description: service,
        amount: numAmount,
        totalAmount: numAmount,
        currency: 'INR',
        status: 'Pending',
        paymentMethod,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to create invoice:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FilePlus2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 leading-tight">
              Create New Invoice
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Generate a formal bill statement for a patient session.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Patient Name / Corporate Client
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sanya Malhotra"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Amount (₹)
              </label>
              <input
                type="number"
                required
                placeholder="14500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Service / Treatment Description
            </label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option>Physiotherapy Session (ACL Recovery)</option>
              <option>Post-Op Spine Rehabilitation</option>
              <option>Full Physical Therapy Assessment</option>
              <option>Ergonomic Counseling Package</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Preferred Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="UPI">UPI (Google Pay / PhonePe)</option>
              <option value="Credit Card">Credit / Debit Card</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Cash">Cash / Desk Payment</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-center space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center"
            >
              {isSubmitting ? 'Issuing...' : 'Issue Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

