import React from 'react';
import { mockRecoveryPrograms } from '../mockData';

export const RecoveryProgramsWidget: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between h-full min-h-[300px]">
      <h3 className="text-sm font-extrabold text-slate-800 tracking-tight mb-4">
        Recovery Programs
      </h3>

      <div className="space-y-6 my-auto">
        {mockRecoveryPrograms.map((program) => (
          <div key={program.id} className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-800">{program.name}</span>
              <span className="text-slate-500 font-semibold">{program.efficiencyPercentage}% Ef.</span>
            </div>

            {/* Custom Blue Progress Bar */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0C3E6D] rounded-full transition-all duration-500"
                style={{ width: `${program.efficiencyPercentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
