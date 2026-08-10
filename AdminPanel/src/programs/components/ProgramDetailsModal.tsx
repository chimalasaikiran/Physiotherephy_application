import React from 'react';
import { X, Calendar, Layers, Users, CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import type { Program } from '../types';

interface ProgramDetailsModalProps {
  program: Program | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleStatus?: (programId: string) => void;
}

export const ProgramDetailsModal: React.FC<ProgramDetailsModalProps> = ({
  program,
  isOpen,
  onClose,
  onToggleStatus,
}) => {
  if (!isOpen || !program) return null;

  const sampleExercises = [
    { name: 'Isometric Quadriceps Set', sets: '3 sets x 10 reps', duration: '5 mins' },
    { name: 'Straight Leg Raises (SLR)', sets: '3 sets x 12 reps', duration: '8 mins' },
    { name: 'Seated Knee Extensions', sets: '2 sets x 15 reps', duration: '6 mins' },
    { name: 'Hamstring Curls with Resistance Band', sets: '3 sets x 10 reps', duration: '7 mins' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cover Image & Header Tag */}
        <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden -mx-2 -mt-2">
          <img
            src={program.coverImage}
            alt={program.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <span className="px-3 py-1 bg-blue-600 text-white text-[11px] font-bold tracking-wider uppercase rounded-md shadow-xs mb-2 inline-block">
                {program.bodyAreaTag}
              </span>
              <h2 className="text-2xl font-extrabold text-white">{program.title}</h2>
            </div>
            <span className="px-3 py-1 bg-white/90 text-slate-900 text-xs font-bold rounded-lg backdrop-blur-md">
              {program.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Duration
            </span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">{program.duration}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Difficulty
            </span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">{program.difficulty}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Active Patients
            </span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">
              {typeof program.activePatients === 'number'
                ? `${program.activePatients} Patients`
                : program.activePatients}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Avg Completion
            </span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">{program.completionRate}</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Program Protocol Description
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            {program.description}
          </p>
        </div>

        {/* Included Exercises Routine */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Prescribed Exercise Routine ({sampleExercises.length} Exercises)
            </h3>
            <span className="text-xs font-semibold text-blue-600">Total ~26 mins</span>
          </div>

          <div className="space-y-2.5">
            {sampleExercises.map((ex, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3.5 bg-white border border-slate-200/70 rounded-xl hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{ex.name}</h4>
                    <p className="text-xs text-slate-400">{ex.sets}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{ex.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {onToggleStatus && (
            <button
              onClick={() => onToggleStatus(program.id)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              {program.status === 'published' ? 'Switch to Draft' : 'Publish Program'}
            </button>
          )}

          <div className="flex items-center space-x-3 ml-auto">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md shadow-blue-500/20"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
