import React, { useState } from 'react';
import { X, FileText, Plus, Check } from 'lucide-react';

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newReport: { title: string; category: string }) => void;
}

export const CreateReportModal: React.FC<CreateReportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Clinical Analysis');
  const [format, setFormat] = useState<'PDF' | 'Excel' | 'CSV'>('PDF');
  const [schedule, setSchedule] = useState('One-time');
  const [recipients, setRecipients] = useState('dr.chen@onemedical.com');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onSuccess({
        title: title.trim(),
        category,
      });
      setIsSubmitting(false);
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-3xl bg-white p-6 sm:p-8 text-left align-middle shadow-2xl transition-all border border-slate-100">
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Create New Report
                </h3>
                <p className="text-xs font-medium text-slate-400">
                  Generate customized clinical or financial metrics
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Report Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q4 Patient Compliance & Recovery Analysis"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* Category & Format Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                >
                  <option value="Clinical Analysis">Clinical Analysis</option>
                  <option value="Patient Care">Patient Care</option>
                  <option value="Financial">Financial</option>
                  <option value="Internal Ops">Internal Ops</option>
                  <option value="Treatment Reports">Treatment Reports</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Output Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['PDF', 'Excel', 'CSV'] as const).map((fmt) => (
                    <button
                      type="button"
                      key={fmt}
                      onClick={() => setFormat(fmt)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                        format === fmt
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Schedule & Delivery */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Run Schedule
                </label>
                <select
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                >
                  <option value="One-time">Run Once (Now)</option>
                  <option value="Daily">Daily at 08:00 AM</option>
                  <option value="Weekly">Weekly (Every Monday)</option>
                  <option value="Monthly">Monthly (1st of month)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Notes / Scope
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add optional notes, date range criteria, or target therapist metrics..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <span>Generating...</span>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Generate Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
