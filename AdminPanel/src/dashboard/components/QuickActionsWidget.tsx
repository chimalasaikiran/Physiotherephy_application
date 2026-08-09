import React from 'react';
import { UserPlus, CalendarPlus, UserCheck, FileEdit } from 'lucide-react';

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
      label: 'Add Patient',
      icon: UserPlus,
      onClick: onAddPatient,
    },
    {
      id: 'book-appointment',
      label: 'Book Appointment',
      icon: CalendarPlus,
      onClick: onBookAppointment,
    },
    {
      id: 'assign-therapist',
      label: 'Assign Therapist',
      icon: UserCheck,
      onClick: onAssignTherapist,
    },
    {
      id: 'create-program',
      label: 'Create Program',
      icon: FileEdit,
      onClick: onCreateProgram,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
      <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-4">
        Quick Actions
      </h4>

      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-50 hover:border-blue-100 bg-slate-50/50 hover:bg-blue-50/50 transition-all duration-200 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 transition-all duration-200 shadow-xs">
                <Icon className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-xs font-bold text-slate-700 text-center leading-tight group-hover:text-blue-600">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
