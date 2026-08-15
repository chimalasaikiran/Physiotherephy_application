import React from 'react';
import { ChevronRight, Users, Loader2 } from 'lucide-react';
import { usePatients } from '@/patients/usePatients';
import type { Patient } from '@/patients/types';
import { InitialsAvatar } from '@/components/ui/InitialsAvatar';

interface RecentPatientsWidgetProps {
  onSelectPatient?: (patient: Patient) => void;
  onNavigateToPatients?: () => void;
}

export const RecentPatientsWidget: React.FC<RecentPatientsWidgetProps> = ({
  onSelectPatient,
  onNavigateToPatients,
}) => {
  const { patients, isLoading } = usePatients();

  // Get top 4 most recent patients
  const recentPatients = patients.slice(0, 4);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
          Recent Patients
        </h4>
        {onNavigateToPatients && (
          <button
            onClick={onNavigateToPatients}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            View All
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-6 text-center text-xs text-slate-400 font-medium flex items-center justify-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading patients...</span>
        </div>
      ) : recentPatients.length > 0 ? (
        <div className="divide-y divide-slate-50">
          {recentPatients.map((pt) => (
            <div
              key={pt.id}
              onClick={() => onSelectPatient && onSelectPatient(pt)}
              className="py-3 first:pt-0 last:pb-0 flex items-center justify-between group cursor-pointer hover:bg-slate-50/80 px-2 -mx-2 rounded-xl transition-colors"
            >
              <div className="flex items-center space-x-3">
                <InitialsAvatar name={pt.name} className="w-10 h-10 text-xs font-bold" />
                <div>
                  <h5 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                    {pt.name}
                  </h5>
                  <p className="text-xs text-slate-400 font-medium">
                    ID: {pt.patientId} • {pt.condition}
                  </p>
                </div>
              </div>
              <button className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-slate-400 font-medium space-y-2">
          <Users className="w-6 h-6 text-slate-300 mx-auto" />
          <p>No recent patients registered in Firestore</p>
        </div>
      )}
    </div>
  );
};
