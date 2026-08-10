import React from 'react';
import { X, Clock, Layers, Sparkles, Heart, CheckCircle2, User, Plus } from 'lucide-react';
import type { Exercise } from '../types';

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  onClose,
  onToggleFavorite,
}) => {
  if (!exercise) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Banner */}
        <div className="relative h-56 w-full overflow-hidden bg-slate-900">
          <img
            src={exercise.coverImage}
            alt={exercise.title}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges & Title */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full">
                {exercise.difficulty}
              </span>
              <span className="bg-slate-800/80 backdrop-blur-md text-slate-100 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full">
                {exercise.bodyArea}
              </span>
              <span className="bg-slate-800/80 backdrop-blur-md text-slate-100 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full">
                {exercise.category}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {exercise.title}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <div>
              <div className="flex items-center justify-center space-x-1 text-slate-400 text-xs font-semibold mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Duration</span>
              </div>
              <p className="text-sm font-bold text-slate-900">{exercise.durationMinutes} mins</p>
            </div>
            <div>
              <div className="flex items-center justify-center space-x-1 text-slate-400 text-xs font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Equipment</span>
              </div>
              <p className="text-sm font-bold text-slate-900">{exercise.equipment}</p>
            </div>
            <div>
              <div className="flex items-center justify-center space-x-1 text-slate-400 text-xs font-semibold mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Programs</span>
              </div>
              <p className="text-sm font-bold text-slate-900">{exercise.usedInProgramsCount} Active</p>
            </div>
          </div>

          {/* Description */}
          {exercise.description && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Overview
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {exercise.description}
              </p>
            </div>
          )}

          {/* Target Muscles */}
          {exercise.targetMuscles && exercise.targetMuscles.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Target Muscle Groups
              </h4>
              <div className="flex flex-wrap gap-2">
                {exercise.targetMuscles.map((muscle, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Step-by-Step Instructions */}
          {exercise.instructions && exercise.instructions.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Execution Steps
              </h4>
              <div className="space-y-2.5">
                {exercise.instructions.map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-3 text-sm text-slate-700 font-medium">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="flex-1 pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => onToggleFavorite(exercise.id)}
            className="flex items-center space-x-2 text-sm font-semibold text-slate-700 hover:text-rose-600 transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${
                exercise.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
              }`}
            />
            <span>{exercise.isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
