import React from 'react';
import { Layers, Activity, CheckCircle } from 'lucide-react';
import { mockRecoveryPrograms } from '../mockData';

export const ProgramsAnalyticsTab: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Active Programs</span>
            <Layers className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-3">14 Active</div>
          <span className="text-xs text-slate-500 font-semibold">Standardized clinical protocols</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Avg Program Efficiency</span>
            <Activity className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-3">88.3% Score</div>
          <span className="text-xs text-emerald-600 font-bold">Exceeds target metrics</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Overall Completion Rate</span>
            <CheckCircle className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-3">98% Overall</div>
          <span className="text-xs text-blue-600 font-bold">Optimal patient retention</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-extrabold text-slate-900">
          Program Efficiency & Patient Volume Breakdown
        </h3>
        <div className="space-y-4">
          {mockRecoveryPrograms.map((prog) => (
            <div key={prog.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">{prog.name}</h4>
                <p className="text-xs text-slate-500">{prog.totalPatients} enrolled patients • Avg {prog.avgDurationWeeks} weeks duration</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-48 bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div className="bg-[#0C3E6D] h-full rounded-full" style={{ width: `${prog.efficiencyPercentage}%` }} />
                </div>
                <span className="text-xs font-extrabold text-slate-900">{prog.efficiencyPercentage}% Ef.</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
