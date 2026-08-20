import React from 'react';
import { UserPlus, CalendarPlus, UserCheck, Sliders } from 'lucide-react';

interface QuickActionsProps {
  onAddPatient: () => void;
  onBookAppointment: () => void;
  onAssignTherapist: () => void;
  onCreateProgram: () => void;
}

export const QuickActionsWidget: React.FC<QuickActionsProps> = ({
  onAddPatient,
  onBookAppointment,
  onAssignTherapist,
  onCreateProgram,
}) => {
  const actions = [
    {
      id: 'add-patient',
      line1: 'Add',
      line2: 'Patient',
      icon: UserPlus,
      onClick: onAddPatient,
    },
    {
      id: 'book-appointment',
      line1: 'Book',
      line2: 'Appointment',
      icon: CalendarPlus,
      onClick: onBookAppointment,
    },
    {
      id: 'assign-therapist',
      line1: 'Assign',
      line2: 'Therapist',
      icon: UserCheck,
      onClick: onAssignTherapist,
    },
    {
      id: 'create-program',
      line1: 'Create',
      line2: 'Program',
      icon: Sliders,
      onClick: onCreateProgram,
    },
  ];

  return (
    <div className="self-stretch p-6 sm:p-7 bg-white/70 rounded-[32px] shadow-[0px_8px_32px_0px_rgba(0,61,155,0.05)] outline outline-1 outline-offset-[-1px] outline-white/40 backdrop-blur-[10px] flex flex-col justify-start items-start gap-4">
      <div className="self-stretch flex flex-col justify-start items-start">
        <div className="self-stretch justify-center text-slate-600 text-xs font-semibold font-['Inter'] uppercase leading-5 tracking-wider">
          QUICK ACTIONS
        </div>
      </div>

      <div className="self-stretch grid grid-cols-2 gap-3.5">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className="aspect-square w-full bg-[#EEF4FF] rounded-full flex flex-col items-center justify-center p-3 group hover:bg-[#E0ECFF] transition-all duration-200 cursor-pointer border-none shadow-xs hover:scale-[1.03] active:scale-[0.97]"
            >
              <div className="mb-1 flex items-center justify-center">
                <Icon className="w-5 h-5 text-blue-700 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-center text-slate-800 text-[11px] font-bold leading-tight">
                <div>{action.line1}</div>
                <div>{action.line2}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};


