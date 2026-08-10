import React, { useState } from 'react';
import { X, Download, FileText, FileSpreadsheet, Check } from 'lucide-react';

interface ExportAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: string, dateRange: string) => void;
}

export const ExportAnalyticsModal: React.FC<ExportAnalyticsModalProps> = ({
  isOpen,
  onClose,
  onExport,
}) => {
  const [format, setFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      onExport(format.toUpperCase(), dateRange);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                Export Analytics Report
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Choose format & date range to export clinic data
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

        {/* Options */}
        <div className="space-y-4">
          {/* Format Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'pdf', label: 'PDF Document', icon: FileText },
                { id: 'excel', label: 'Excel (.xlsx)', icon: FileSpreadsheet },
                { id: 'csv', label: 'Raw CSV', icon: FileSpreadsheet },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = format === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setFormat(item.id as any)}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 text-blue-600 font-bold shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last Quarter (Q3)">Last Quarter (Q3)</option>
              <option value="Year to Date (YTD)">Year to Date (YTD)</option>
              <option value="Custom Range">Custom Range</option>
            </select>
          </div>

          {/* Include Visual Charts Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Include Graphical Visualizations
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Embed high-resolution charts in document
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIncludeCharts(!includeCharts)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                includeCharts ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  includeCharts ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
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
            onClick={handleConfirm}
            disabled={isExporting}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <span>Preparing Export...</span>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
