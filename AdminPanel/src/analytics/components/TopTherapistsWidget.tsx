import React from 'react';
import { mockTopTherapists } from '../mockData';

interface TopTherapistsWidgetProps {
  onViewAll?: () => void;
}

export const TopTherapistsWidget: React.FC<TopTherapistsWidgetProps> = ({ onViewAll }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between h-full min-h-[300px]">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">
          Top Performing Therapists
        </h3>
        <button
          onClick={onViewAll}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {mockTopTherapists.slice(0, 3).map((therapist) => (
          <div key={therapist.id} className="flex items-center justify-between group">
            {/* Therapist Info */}
            <div className="flex items-center space-x-3 min-w-0">
              <img
                src={therapist.avatarUrl}
                alt={therapist.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                  {therapist.name}
                </h4>
                <p className="text-[11px] font-medium text-slate-400 truncate">
                  {therapist.specialty} • {therapist.rating}/5.0
                </p>
              </div>
            </div>

            {/* Outcome Stats */}
            <div className="text-right shrink-0">
              <div className="text-xs font-extrabold text-blue-600">
                {therapist.outcomePercentage}% Outcome
              </div>
              <div className="text-[10px] font-medium text-slate-400">
                {therapist.patientsPerMonth} Patients/Mo
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
