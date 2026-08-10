import React from 'react';
import { X, Download, Share2, Printer, FileText, CheckCircle2, Calendar, User, BarChart2 } from 'lucide-react';
import type { PinnedReport, RecentReport } from '../types';

interface ViewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: PinnedReport | RecentReport | null;
  onDownloadToast?: (fileName: string) => void;
}

export const ViewReportModal: React.FC<ViewReportModalProps> = ({
  isOpen,
  onClose,
  report,
  onDownloadToast,
}) => {
  if (!isOpen || !report) return null;

  const authorName =
    'author' in report && typeof report.author === 'string'
      ? report.author
      : 'author' in report && typeof report.author === 'object'
      ? report.author.name
      : 'Dr. Sarah Jenkins';

  const category = report.category || 'Clinical Analysis';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white p-6 sm:p-8 text-left align-middle shadow-2xl transition-all border border-slate-100 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                    {category}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                    Ready
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                  {report.title}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Meta Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs font-medium text-slate-600">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-slate-400" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Author</span>
                <span className="font-semibold text-slate-800">{authorName}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Generated</span>
                <span className="font-semibold text-slate-800">
                  {'date' in report ? report.date : 'Today, 10:15 AM'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 col-span-2 sm:col-span-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Status</span>
                <span className="font-semibold text-emerald-600">Verified & Approved</span>
              </div>
            </div>
          </div>

          {/* Report Summary Data Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Executive Summary Key Metrics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                <span className="text-xs text-slate-400 font-medium">Compliance Index</span>
                <div className="text-xl font-extrabold text-slate-900 mt-1">96.8%</div>
                <span className="text-[11px] text-emerald-600 font-semibold">↑ 3.2% vs target</span>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                <span className="text-xs text-slate-400 font-medium">Patient Engagement</span>
                <div className="text-xl font-extrabold text-slate-900 mt-1">842 Sessions</div>
                <span className="text-[11px] text-blue-600 font-semibold">Steady performance</span>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                <span className="text-xs text-slate-400 font-medium">Average Recovery Time</span>
                <div className="text-xl font-extrabold text-slate-900 mt-1">14.2 Days</div>
                <span className="text-[11px] text-emerald-600 font-semibold">-2.1 days faster</span>
              </div>
            </div>

            {/* Document Details Box */}
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/80 space-y-2">
              <div className="flex items-center space-x-2 text-blue-700 font-bold text-xs uppercase tracking-wide">
                <BarChart2 className="w-4 h-4" />
                <span>Scope & Clinical Observations</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                This report consolidates patient outcome assessments across all physical therapy units for Q3. Key findings indicate a 14% improvement in mobility scores among knee rehabilitation cohorts following revised home exercise compliance protocols.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  if (onDownloadToast) onDownloadToast(`${report.title}.pdf`);
                }}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={() => {
                  if (onDownloadToast) onDownloadToast(`${report.title}.xlsx`);
                }}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>Excel</span>
              </button>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => alert('Printing report...')}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors"
                title="Print Report"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={() => alert('Share link copied to clipboard!')}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors"
                title="Share Report"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
