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

  const displayPatients = patients ? patients.slice(0, 3) : [];

  return (
    <div className="self-stretch p-8 bg-white/70 rounded-[32px] shadow-[0px_8px_32px_0px_rgba(0,61,155,0.05)] outline outline-1 outline-offset-[-1px] outline-white/40 backdrop-blur-[10px] flex flex-col justify-start items-start gap-4">
      <div className="self-stretch flex justify-between items-center">
        <div className="text-gray-700 text-sm font-medium font-['Inter'] uppercase leading-5 tracking-wider">
          RECENT PATIENTS
        </div>
        {onNavigateToPatients && (
          <button
            onClick={onNavigateToPatients}
            className="text-xs font-semibold text-blue-900 hover:text-blue-700 transition-colors cursor-pointer"
          >
            View All
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-6 text-center text-xs text-slate-400 font-medium flex items-center justify-center space-x-2 w-full">
          <Loader2 className="w-4 h-4 animate-spin text-blue-900" />
          <span>Loading patients...</span>
        </div>
      ) : displayPatients.length === 0 ? (
        <div className="py-6 text-center text-slate-500 text-xs w-full">
          No patients registered in the backend.
        </div>
      ) : (
        <div className="self-stretch flex flex-col justify-start items-start gap-4">
          {displayPatients.map((pt: any) => (
            <div
              key={pt.id}
              onClick={() => onSelectPatient && onSelectPatient(pt)}
              className="self-stretch inline-flex justify-start items-center gap-3 cursor-pointer group hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-full border border-blue-100 bg-blue-50 text-blue-900 flex justify-center items-center font-bold text-xs shrink-0">
                {(pt.name || 'P').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 size- inline-flex flex-col justify-start items-start">
                <div className="self-stretch flex flex-col justify-start items-start">
                  <div className="justify-center text-slate-900 text-base font-bold font-['Inter'] leading-6 group-hover:text-blue-900 transition-colors">
                    {pt.name}
                  </div>
                </div>
                <div className="self-stretch flex flex-col justify-start items-start">
                  <div className="justify-center text-gray-700 text-xs font-normal font-['Inter'] leading-4">
                    ID: {pt.patientId || pt.id}
                  </div>
                </div>
              </div>
              <div className="size- inline-flex flex-col justify-center items-center">
                <ChevronRight className="w-4 h-4 text-blue-900" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
