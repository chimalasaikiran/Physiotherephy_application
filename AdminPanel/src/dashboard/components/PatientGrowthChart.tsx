import React, { useState, useMemo } from 'react';
import { calculatePatientGrowthStats, type PatientGrowthBucket } from '@/utils/dateUtils';

interface PatientGrowthChartProps {
  patients?: any[];
  appointments?: any[];
  getRevenueTrend?: (timeframe: string) => any[];
}

export const PatientGrowthChart: React.FC<PatientGrowthChartProps> = ({
  patients = [],
  appointments = [],
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [grouping, setGrouping] = useState<'day' | 'month' | 'year'>('month');

  // Compute real-time growth statistics directly from Firestore data
  const growthData: PatientGrowthBucket[] = useMemo(() => {
    return calculatePatientGrowthStats(patients, appointments, grouping);
  }, [patients, appointments, grouping]);

  // Find max total count for pixel height scaling (max height ~110px)
  const maxTotal = useMemo(() => {
    const max = Math.max(1, ...growthData.map((d) => d.newPatients + d.returningPatients));
    return max;
  }, [growthData]);

  return (
    <div className="w-full flex-1 h-80 p-8 bg-white/70 rounded-[32px] shadow-[0px_8px_32px_0px_rgba(0,61,155,0.05)] outline outline-1 outline-offset-[-1px] outline-white/40 backdrop-blur-[10px] flex flex-col justify-start items-start">
      {/* Header section with title, timeline grouping selector, and dynamic legends */}
      <div className="self-stretch pb-6 flex flex-col justify-start items-start gap-2">
        <div className="self-stretch inline-flex justify-between items-center flex-wrap gap-2">
          <div className="inline-flex flex-col justify-start items-start">
            <div className="justify-center text-gray-700 text-sm font-medium font-['Inter'] uppercase leading-5 tracking-wider">
              PATIENT GROWTH
            </div>
          </div>

          {/* Timeline Grouping Buttons (Day / Month / Year) */}
          <div className="inline-flex items-center bg-slate-100/80 p-1 rounded-xl gap-1 text-[11px] font-bold">
            <button
              onClick={() => setGrouping('day')}
              className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                grouping === 'day'
                  ? 'bg-white text-blue-900 shadow-xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setGrouping('month')}
              className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                grouping === 'month'
                  ? 'bg-white text-blue-900 shadow-xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setGrouping('year')}
              className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                grouping === 'year'
                  ? 'bg-white text-blue-900 shadow-xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Year
            </button>
          </div>

          {/* Legend indicators */}
          <div className="flex justify-start items-start gap-2">
            <div className="self-stretch pb-px flex justify-start items-center gap-1">
              <div className="size-2 bg-blue-900 rounded-full" />
              <div className="justify-center text-blue-900 text-[10px] font-bold font-['Inter'] leading-4">
                New
              </div>
            </div>
            <div className="self-stretch pb-px flex justify-start items-center gap-1">
              <div className="size-2 bg-sky-800 rounded-full" />
              <div className="justify-center text-sky-800 text-[10px] font-bold font-['Inter'] leading-4">
                Returning
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Canvas Area */}
      <div className="self-stretch flex-1 pt-4 flex flex-col justify-center items-start">
        <div className="self-stretch flex-1 relative flex flex-col justify-center items-start">
          {/* Background Horizontal Gridlines */}
          <div className="w-full h-48 py-2 left-0 top-0 absolute flex flex-col justify-between items-start pointer-events-none">
            <div className="self-stretch h-px border-b border-blue-100/10" />
            <div className="self-stretch h-px border-b border-blue-100/10" />
            <div className="self-stretch h-px border-b border-blue-100/10" />
            <div className="self-stretch h-px border-b border-blue-100/10" />
          </div>

          {/* Stacked Bars Display */}
          <div className="self-stretch flex-1 px-4 pb-8 inline-flex justify-between items-end">
            {growthData.map((item, index) => {
              const isHovered = hoveredIdx === index;

              // Calculate proportional heights (max total stack ~110px)
              const maxStackPx = 110;
              const newPx =
                item.newPatients > 0
                  ? Math.max(8, Math.round((item.newPatients / maxTotal) * maxStackPx))
                  : 0;
              const returningPx =
                item.returningPatients > 0
                  ? Math.max(8, Math.round((item.returningPatients / maxTotal) * maxStackPx))
                  : 0;

              // Default fallback if no data in database yet to keep aesthetic bar preview
              const displayNewPx = newPx === 0 && returningPx === 0 ? 12 + index * 4 : newPx;
              const displayReturningPx = newPx === 0 && returningPx === 0 ? 8 + index * 3 : returningPx;

              return (
                <div
                  key={`${item.label}-${index}`}
                  className="w-7 self-stretch relative inline-flex flex-col justify-end items-start gap-1 cursor-pointer group"
                  onMouseEnter={() => setHoveredIdx(index)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Hover Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-16 z-30 bg-slate-900 text-white text-[11px] py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap pointer-events-none text-center left-1/2 -translate-x-1/2">
                      <p className="font-bold border-b border-slate-700 pb-1 mb-1">{item.label}</p>
                      <p className="text-[#60A5FA]">New Patients: {item.newPatients}</p>
                      <p className="text-[#38BDF8]">Returning Patients: {item.returningPatients}</p>
                      <p className="text-slate-400 text-[10px] mt-0.5 font-medium">Total: {item.totalPatients}</p>
                    </div>
                  )}

                  {/* Top Stack: Returning Patients (bg-sky-800) */}
                  <div
                    style={{ height: `${displayReturningPx}px` }}
                    className="self-stretch bg-sky-800 rounded-tl-[32px] rounded-tr-[32px] transition-all duration-300"
                  />
                  {/* Bottom Stack: New Patients (bg-blue-900) */}
                  <div
                    style={{ height: `${displayNewPx}px` }}
                    className="self-stretch bg-blue-900 transition-all duration-300"
                  />

                  {/* X Axis Label */}
                  <div className="w-full left-1/2 -translate-x-1/2 top-[171px] absolute flex flex-col justify-start items-center">
                    <div className="justify-center text-gray-700/70 text-[10px] font-bold font-['Inter'] leading-4 truncate max-w-full">
                      {item.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};



