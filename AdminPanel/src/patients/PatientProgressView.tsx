import React, { useEffect, useState } from 'react';
import { fetchProgramDetails } from '@/services/programService';
import { CheckCircle2, Circle, Activity } from 'lucide-react';

interface PatientProgressViewProps {
  assignment: any;
}

export const PatientProgressView: React.FC<PatientProgressViewProps> = ({ assignment }) => {
  const [programDetails, setProgramDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!assignment?.programId) {
      setLoading(false);
      return;
    }

    const loadProgram = async () => {
      try {
        const details = await fetchProgramDetails(assignment.programId);
        setProgramDetails(details);
      } catch (err) {
        console.error('Failed to load program details for progress view', err);
      } finally {
        setLoading(false);
      }
    };
    loadProgram();
  }, [assignment?.programId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-slate-500 animate-pulse">
        Loading detailed progress...
      </div>
    );
  }

  if (!programDetails || !programDetails.weeks || programDetails.weeks.length === 0) {
    return (
      <div className="text-sm text-slate-500 p-4 border border-dashed border-slate-200 rounded-xl text-center">
        No detailed week-by-week program structure found for this assignment.
      </div>
    );
  }

  const completedExercises = assignment.completedExercises || [];
  const currentWeek = assignment.currentWeek || 1;

  return (
    <div className="space-y-6">
      {programDetails.weeks.map((week: any) => {
        const isCurrentWeek = week.order === currentWeek || week.weekNumber === currentWeek;
        const isPastWeek = (week.order || week.weekNumber) < currentWeek;

        const weekExercises = week.exercises || [];
        const completedInWeek = weekExercises.filter((ex: any) =>
          completedExercises.includes(ex.id) || completedExercises.includes(ex.name)
        ).length;
        const totalInWeek = weekExercises.length;
        const weekProgress = totalInWeek > 0 ? Math.round((completedInWeek / totalInWeek) * 100) : 0;

        return (
          <div
            key={week.id || week.weekNumber}
            className={`bg-white border rounded-2xl overflow-hidden transition-all shadow-sm ${
              isCurrentWeek
                ? 'border-blue-200 ring-1 ring-blue-100'
                : 'border-slate-100'
            }`}
          >
            {/* Week Header */}
            <div className={`p-4 flex items-center justify-between ${isCurrentWeek ? 'bg-blue-50/50' : 'bg-slate-50/50'}`}>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  isCurrentWeek ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 shadow-sm'
                }`}>
                  W{week.order || week.weekNumber}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{week.title || `Week ${week.order || week.weekNumber}`}</h4>
                  <p className="text-xs text-slate-500 font-medium">{week.clinicalFocus || 'General Rehabilitation'}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Completion
                </span>
                <span className={`text-sm font-extrabold ${isPastWeek || weekProgress === 100 ? 'text-emerald-600' : isCurrentWeek ? 'text-blue-600' : 'text-slate-700'}`}>
                  {weekProgress}%
                </span>
              </div>
            </div>

            {/* Exercises List */}
            {weekExercises.length > 0 ? (
              <div className="p-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white">
                {weekExercises.map((ex: any) => {
                  const isCompleted = completedExercises.includes(ex.id) || completedExercises.includes(ex.name);
                  
                  return (
                    <div
                      key={ex.id}
                      className={`flex items-start space-x-3 p-3 rounded-xl border transition-colors ${
                        isCompleted ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="mt-0.5">
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h5 className={`text-sm font-bold ${isCompleted ? 'text-slate-800' : 'text-slate-700'}`}>
                          {ex.name}
                        </h5>
                        <div className="flex items-center space-x-3 mt-1.5">
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center space-x-1">
                            <Activity className="w-3 h-3 text-slate-400" />
                            <span>{ex.duration || '5 mins'}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-xs font-medium text-slate-400 text-center bg-white">
                No specific exercises defined for this week.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
