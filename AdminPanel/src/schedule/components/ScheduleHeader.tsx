import React from 'react';
import { Download, Plus } from 'lucide-react';

interface ScheduleHeaderProps {
  onExportSchedule?: () => void;
  onCreateAppointment?: () => void;
}

export const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
  onExportSchedule,
  onCreateAppointment,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex flex-col justify-start items-start gap-1">
        <h1 className="text-slate-900 text-3xl font-semibold font-['Inter'] leading-8">
          Appointments
        </h1>
        <p className="text-gray-700 text-base font-normal font-['Inter'] leading-6">
          Manage bookings, schedules and treatment sessions.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onExportSchedule}
          className="h-11 px-5 py-2.5 rounded-[48px] outline outline-1 outline-offset-[-1px] outline-slate-300 flex justify-center items-center gap-2 hover:bg-slate-50/80 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-900" />
          <span className="text-center text-slate-900 text-sm font-bold font-['Inter'] leading-5">
            Export Schedule
          </span>
        </button>

        <button
          onClick={onCreateAppointment}
          className="h-11 px-5 py-2.5 bg-blue-900 rounded-[48px] shadow-[0px_1px_2px_0px_rgba(20,184,166,0.20)] flex justify-center items-center gap-2 hover:bg-blue-950 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" />
          <span className="text-center text-white text-sm font-bold font-['Inter'] leading-5">
            Create Appointment
          </span>
        </button>
      </div>
    </div>
  );
};
