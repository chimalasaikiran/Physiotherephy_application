import React from 'react';
import { Heart, Clock, Layers, Sparkles, MoreVertical } from 'lucide-react';
import type { Exercise } from '../types';

interface ExerciseListViewProps {
  exercises: Exercise[];
  onToggleFavorite: (id: string) => void;
  onSelect: (exercise: Exercise) => void;
}

export const ExerciseListView: React.FC<ExerciseListViewProps> = ({
  exercises,
  onToggleFavorite,
  onSelect,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Exercise</th>
              <th className="py-3.5 px-4">Difficulty</th>
              <th className="py-3.5 px-4">Body Area</th>
              <th className="py-3.5 px-4">Equipment</th>
              <th className="py-3.5 px-4">Duration</th>
              <th className="py-3.5 px-4">Programs</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {exercises.map((exercise) => (
              <tr
                key={exercise.id}
                onClick={() => onSelect(exercise)}
                className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
              >
                <td className="py-3 px-4 sm:px-6">
                  <div className="flex items-center space-x-3">
                    <img
                      src={exercise.coverImage}
                      alt={exercise.title}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200/60 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {exercise.title}
                      </h4>
                      <p className="text-xs text-slate-400 font-medium">
                        {exercise.category}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      exercise.difficulty === 'Easy'
                        ? 'bg-blue-100 text-blue-700'
                        : exercise.difficulty === 'Medium'
                        ? 'bg-cyan-100 text-cyan-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {exercise.difficulty}
                  </span>
                </td>
                <td className="py-3 px-4 font-medium text-slate-700">
                  {exercise.bodyArea}
                </td>
                <td className="py-3 px-4 text-slate-600">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                    <span>{exercise.equipment}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{exercise.durationMinutes} mins</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-600">
                  <div className="flex items-center space-x-1">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>{exercise.usedInProgramsCount}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(exercise.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          exercise.isFavorite
                            ? 'fill-rose-500 text-rose-500'
                            : 'text-slate-400'
                        }`}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(exercise);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
