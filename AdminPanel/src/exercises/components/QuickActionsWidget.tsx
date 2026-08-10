import React from 'react';
import { SlidersHorizontal, Download } from 'lucide-react';

interface QuickActionsWidgetProps {
  onManageCategories: () => void;
  onExportLibrary: () => void;
}

export const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({
  onManageCategories,
  onExportLibrary,
}) => {
  return (
    <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100/80 shadow-2xs">
      <h3 className="text-base font-bold text-slate-900 mb-4">Quick Actions</h3>

      <div className="space-y-3">
        <button
          onClick={onManageCategories}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold rounded-full border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <span>Manage Categories</span>
        </button>

        <button
          onClick={onExportLibrary}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold rounded-full border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export Library</span>
        </button>
      </div>
    </div>
  );
};
