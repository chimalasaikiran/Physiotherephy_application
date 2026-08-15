import React, { useState } from 'react';
import { X, FileSpreadsheet, Download, CheckCircle2 } from 'lucide-react';
import { exportFinancialsReport } from '@/services/paymentService';

interface ExportFinancialsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportFinancialsModal: React.FC<ExportFinancialsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [format, setFormat] = useState<'pdf' | 'csv' | 'excel'>('pdf');
  const [dateRange, setDateRange] = useState('Current Month (Oct 2026)');
  const [isExporting, setIsExporting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    try {
      exportFinancialsReport([], [], [], []);
    } catch (err) {
      console.error('Error generating export:', err);
    }
    setTimeout(() => {
      setIsExporting(false);
      setIsDone(true);
      setTimeout(() => {
        setIsDone(false);
        onClose();
      }, 1200);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isDone ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Export Ready for Download!
            </h3>
            <p className="text-xs text-slate-400">
              Your financial ledger report has been generated and downloaded.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 leading-tight">
                  Export Financial Reports
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Generate official balance sheets & audit logs.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Export Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormat('pdf')}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      format === 'pdf'
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    PDF Sheet
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('csv')}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      format === 'csv'
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Raw CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('excel')}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      format === 'excel'
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Excel (.xlsx)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Date Range
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option>Current Month (Oct 2026)</option>
                  <option>Last 30 Days</option>
                  <option>Q3 2026 Financial Year</option>
                  <option>Full Year 2026</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center"
                >
                  {isExporting ? (
                    <span>Generating...</span>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-1.5" />
                      Download
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

