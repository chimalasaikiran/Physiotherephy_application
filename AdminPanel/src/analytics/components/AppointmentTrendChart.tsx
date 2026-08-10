import React from 'react';
import { mockAppointmentTrends } from '../mockData';

export const AppointmentTrendChart: React.FC = () => {
  const data = mockAppointmentTrends;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between h-full min-h-[280px]">
      <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">
        Appointment Trend
      </h3>

      {/* Horizontal Stacked Bars */}
      <div className="space-y-4 my-4">
        {data.map((item) => (
          <div key={item.day} className="flex items-center space-x-3 text-xs font-bold">
            <span className="w-8 text-slate-400 font-semibold">{item.day}</span>
            <div className="flex-1 h-5 bg-slate-100 rounded-md overflow-hidden flex">
              {/* Returning Patients segment */}
              <div
                className="bg-[#0C3E6D] hover:bg-blue-800 transition-all h-full relative group"
                style={{ width: `${item.returning}%` }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none transition-opacity z-20 whitespace-nowrap">
                  Returning: {item.returning}%
                </div>
              </div>
              {/* New Patients segment */}
              <div
                className="bg-cyan-400 hover:bg-cyan-500 transition-all h-full relative group"
                style={{ width: `${item.newPatients}%` }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none transition-opacity z-20 whitespace-nowrap">
                  New: {item.newPatients}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend Footer */}
      <div className="flex items-center space-x-6 text-xs font-bold text-slate-600 pt-2 border-t border-slate-50">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0C3E6D]" />
          <span>Returning (74%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span>New (26%)</span>
        </div>
      </div>
    </div>
  );
};
