import React from 'react';
import { Layers, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import type { PackageDocument } from '../types';
import { togglePackageStatus, deletePackage } from '@/services/paymentService';

interface PackagesTabViewProps {
  onCreatePackage?: () => void;
  packages?: PackageDocument[];
}

export const PackagesTabView: React.FC<PackagesTabViewProps> = ({
  onCreatePackage,
  packages = [],
}) => {
  const handleToggle = async (pkg: PackageDocument) => {
    try {
      await togglePackageStatus(pkg.id, pkg.isActive);
    } catch (err) {
      console.error('Error toggling package:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this treatment package?')) return;
    try {
      await deletePackage(id);
    } catch (err) {
      console.error('Error deleting package:', err);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Treatment Package Plans
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Track bundled session packages, subscription status, and balances.
          </p>
        </div>

        {onCreatePackage && (
          <button
            onClick={onCreatePackage}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer inline-flex items-center space-x-1.5 shadow-md shadow-blue-600/20 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Treatment Package</span>
          </button>
        )}
      </div>

      {packages.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs font-medium">
          No treatment packages found. Create one to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const total = pkg.totalSessions || 1;
            const completed = pkg.completedSessions || 0;
            const progressPercent = Math.min(100, Math.round((completed / total) * 100));

            return (
              <div
                key={pkg.id}
                className="bg-slate-50/70 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between space-y-4 hover:border-blue-200 transition-all duration-200 relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          pkg.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-600'
                            : pkg.isActive
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {pkg.status}
                      </span>
                      <button
                        onClick={() => handleToggle(pkg)}
                        title={pkg.isActive ? 'Deactivate' : 'Activate'}
                        className="text-slate-400 hover:text-blue-600 transition-colors p-1 cursor-pointer"
                      >
                        {pkg.isActive ? (
                          <ToggleRight className="w-5 h-5 text-blue-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(pkg.id)}
                        title="Delete Package"
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    {pkg.packageName}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    Patient: <span className="font-bold text-slate-700">{pkg.patientName || 'Unassigned'}</span>
                  </p>
                </div>

                {/* Progress */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Sessions Used</span>
                    <span className="font-bold text-slate-900">
                      {completed} / {total} ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Financial summary */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">Total Price</div>
                    <div className="font-extrabold text-slate-900">
                      ₹{(pkg.totalAmount || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase text-slate-400">Paid</div>
                    <div className="font-extrabold text-emerald-600">
                      ₹{(pkg.paidAmount || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

