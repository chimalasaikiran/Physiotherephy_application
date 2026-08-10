import React from 'react';
import {
  FilePlus2,
  FileSpreadsheet,
  Download,
  Landmark,
} from 'lucide-react';

interface QuickActionsCardProps {
  onCreateInvoice: () => void;
  onExportFinancials: () => void;
  onDownloadCSV: () => void;
  onReconcileAccounts: () => void;
}

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  onCreateInvoice,
  onExportFinancials,
  onDownloadCSV,
  onReconcileAccounts,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-xs">
      {/* Header */}
      <h3 className="text-base font-bold text-slate-900 tracking-tight mb-4">
        Quick Actions
      </h3>

      {/* Action Buttons List */}
      <div className="space-y-3">
        {/* Action 1: Create New Invoice (Featured Blue Card) */}
        <button
          onClick={onCreateInvoice}
          className="w-full bg-blue-900 hover:bg-blue-950 text-white rounded-2xl p-4 flex items-center space-x-3.5 transition-all duration-200 shadow-md shadow-blue-900/10 cursor-pointer text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
            <FilePlus2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold leading-tight">
              Create New Invoice
            </h4>
            <p className="text-xs text-blue-200 font-medium mt-0.5">
              Bill a patient or corporate partner
            </p>
          </div>
        </button>

        {/* Action 2: Export Financials */}
        <button
          onClick={onExportFinancials}
          className="w-full bg-slate-50/70 hover:bg-slate-100 text-slate-900 rounded-2xl p-3.5 flex items-center space-x-3.5 transition-all duration-200 border border-slate-100 cursor-pointer text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold leading-tight text-slate-900">
              Export Financials
            </h4>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Generate PDF balance sheets
            </p>
          </div>
        </button>

        {/* Action 3: Download CSV Data */}
        <button
          onClick={onDownloadCSV}
          className="w-full bg-slate-50/70 hover:bg-slate-100 text-slate-900 rounded-2xl p-3.5 flex items-center space-x-3.5 transition-all duration-200 border border-slate-100 cursor-pointer text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold leading-tight text-slate-900">
              Download CSV Data
            </h4>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Raw transaction logs for Excel
            </p>
          </div>
        </button>

        {/* Action 4: Reconcile Accounts */}
        <button
          onClick={onReconcileAccounts}
          className="w-full bg-slate-50/70 hover:bg-slate-100 text-slate-900 rounded-2xl p-3.5 flex items-center space-x-3.5 transition-all duration-200 border border-slate-100 cursor-pointer text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold leading-tight text-slate-900">
              Reconcile Accounts
            </h4>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Sync with bank statements
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
