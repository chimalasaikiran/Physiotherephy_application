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
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Appointments
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Manage bookings, schedules and treatment sessions.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onExportSchedule}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export Schedule</span>
        </button>

        <button
          onClick={onCreateAppointment}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-700/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Appointment</span>
        </button>
      </div>
    </div>
  );
};
